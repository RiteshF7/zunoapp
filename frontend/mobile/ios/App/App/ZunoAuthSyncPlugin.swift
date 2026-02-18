import Foundation
import Capacitor

/// Syncs auth token and API base to App Group so the Share Extension can use them.
@objc(ZunoAuthSyncPlugin)
public class ZunoAuthSyncPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "ZunoAuthSyncPlugin"
    public let jsName = "ZunoAuthSync"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "syncToken", returnType: CAPPluginReturnPromise)
    ]

    private static let appGroupId = "group.com.zuno.app"
    private static let authTokenKey = "auth_token"
    private static let apiBaseKey = "api_base"

    @objc func syncToken(_ call: CAPPluginCall) {
        let token = call.getString("token") ?? ""
        let apiBase = call.getString("apiBase")
        guard let suite = UserDefaults(suiteName: Self.appGroupId) else {
            call.reject("App Group not configured")
            return
        }
        suite.set(token, forKey: Self.authTokenKey)
        if let apiBase = apiBase, !apiBase.isEmpty {
            suite.set(apiBase, forKey: Self.apiBaseKey)
        }
        call.resolve()
    }
}
