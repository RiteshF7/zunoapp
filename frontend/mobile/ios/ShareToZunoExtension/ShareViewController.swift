import UIKit
import Social
import UniformTypeIdentifiers

/// Share Extension: receives shared URLs, text, or images from other apps.
/// Reads auth token and API base from App Group (synced by main app).
/// POSTs to backend, triggers AI processing, then completes.
@objc(ShareViewController)
final class ShareViewController: SLComposeServiceViewController {

    private static let appGroupId = "group.com.zuno.app"
    private static let authTokenKey = "auth_token"
    private static let apiBaseKey = "api_base"
    private static let defaultApiBase = "http://localhost:8000"

    private var sharedInput: SharedInput?
    private var loadingTask: Task<Void, Never>?

    override func viewDidLoad() {
        super.viewDidLoad()
        placeholder = "Save to Zuno"
    }

    override func isContentValid() -> Bool {
        return true
    }

    override func didSelectPost() {
        guard let context = extensionContext else {
            extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
            return
        }
        let items = context.inputItems as? [NSExtensionItem] ?? []
        let token = UserDefaults(suiteName: Self.appGroupId)?.string(forKey: Self.authTokenKey)
        let apiBase = UserDefaults(suiteName: Self.appGroupId)?.string(forKey: Self.apiBaseKey)
            ?? Self.defaultApiBase

        if token == nil || token?.isEmpty == true {
            showError("Please log in to Zuno first")
            context.completeRequest(returningItems: nil, completionHandler: nil)
            return
        }

        Task {
            do {
                let input = try await extractSharedInput(from: items)
                if let input = input {
                    await saveToBackend(input: input, token: token!, apiBase: apiBase)
                }
            } catch {
                showError("Failed to get shared content")
            }
            await MainActor.run {
                context.completeRequest(returningItems: nil, completionHandler: nil)
            }
        }
    }

    override func didSelectCancel() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }

    // MARK: - Extract shared content

    private enum SharedInput {
        case url(String)
        case text(String)
        case image(Data, String) // data, mimeType
    }

    private func extractSharedInput(from items: [NSExtensionItem]) async throws -> SharedInput? {
        for item in items {
            guard let attachments = item.attachments else { continue }
            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    if let url = try? await provider.loadItem(forTypeIdentifier: UTType.url.identifier) as? URL {
                        return .url(url.absoluteString)
                    }
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    if let text = try? await provider.loadItem(forTypeIdentifier: UTType.plainText.identifier) as? String, !text.isEmpty {
                        return .text(text)
                    }
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
                    if let data = try? await provider.loadItem(forTypeIdentifier: UTType.image.identifier) as? Data {
                        return .image(data, "image/jpeg")
                    }
                    if let url = try? await provider.loadItem(forTypeIdentifier: UTType.image.identifier) as? URL,
                       let data = try? Data(contentsOf: url) {
                        let mime = url.pathExtension.lowercased() == "png" ? "image/png" : "image/jpeg"
                        return .image(data, mime)
                    }
                }
            }
        }
        // Fallback: use contentText from compose sheet
        if let text = contentText, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return .text(text)
        }
        return nil
    }

    // MARK: - Backend API

    private func saveToBackend(input: SharedInput, token: String, apiBase: String) async {
        let base = apiBase.hasSuffix("/") ? String(apiBase.dropLast()) : apiBase
        let prefix = base.hasSuffix("/api/v1") ? base : (base + "/api/v1")

        do {
            let contentId: String?
            switch input {
            case .url(let url):
                contentId = try await postContent(prefix: prefix, token: token, url: url)
            case .text(let text):
                contentId = try await postText(prefix: prefix, token: token, text: text)
            case .image(let data, let mime):
                contentId = try await postImage(prefix: prefix, token: token, data: data, mime: mime)
            }
            if let id = contentId {
                _ = try? await triggerProcessContent(prefix: prefix, token: token, contentId: id)
                showSuccess("Saved to Zuno!")
            } else {
                showError("Failed to save")
            }
        } catch {
            showError("Failed to save to Zuno")
        }
    }

    private func postContent(prefix: String, token: String, url urlString: String) async throws -> String? {
        let endpoint = URL(string: prefix + "/content")!
        var req = URLRequest(url: endpoint)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["url": urlString])
        let (data, _) = try await URLSession.shared.data(for: req)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return json?["id"] as? String
    }

    private func postText(prefix: String, token: String, text: String) async throws -> String? {
        let hasUrl = text.range(of: #"https?://\S+"#, options: .regularExpression) != nil
        if hasUrl {
            let urlPattern = #"https?://[^\s]+"#
            if let range = text.range(of: urlPattern, options: .regularExpression) {
                let urlStr = String(text[range])
                return try await postContent(prefix: prefix, token: token, url: urlStr)
            }
        }
        let url = URL(string: prefix + "/content/text")!
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let title = text.count > 80 ? String(text.prefix(77)) + "..." : text
        req.httpBody = try JSONSerialization.data(withJSONObject: ["title": title, "source_text": text])
        let (data, _) = try await URLSession.shared.data(for: req)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return json?["id"] as? String
    }

    private func postImage(prefix: String, token: String, data: Data, mime: String) async throws -> String? {
        let url = URL(string: prefix + "/content/upload")!
        let boundary = "----ZunoUpload\(Int(Date().timeIntervalSince1970))"
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"shared_\(Int(Date().timeIntervalSince1970)).jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mime)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        req.httpBody = body
        let (respData, _) = try await URLSession.shared.data(for: req)
        let json = try JSONSerialization.jsonObject(with: respData) as? [String: Any]
        return json?["id"] as? String
    }

    private func triggerProcessContent(prefix: String, token: String, contentId: String) async throws {
        let url = URL(string: prefix + "/ai/process-content")!
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["content_id": contentId])
        _ = try await URLSession.shared.data(for: req)
    }

    // MARK: - UI feedback (optional; extension may dismiss before user sees)

    private func showSuccess(_ message: String) {
        DispatchQueue.main.async {
            // Extension often dismisses immediately; user may see briefly or not
        }
    }

    private func showError(_ message: String) {
        DispatchQueue.main.async {
            // Could show alert; for minimal UX we just complete
        }
    }
}
