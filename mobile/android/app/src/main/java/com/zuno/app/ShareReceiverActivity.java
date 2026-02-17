package com.zuno.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Transparent (invisible) activity that receives share intents from other apps.
 * Makes a direct HTTP call to the backend, shows a native Android Toast, and
 * finishes immediately — the user never sees the Zuno app open.
 */
public class ShareReceiverActivity extends Activity {

    private static final String TAG = "ZunoShare";

    // Android emulator → host-machine localhost.
    // For a real device on the same Wi-Fi, replace with the machine's LAN IP.
    // For production, replace with the deployed backend URL.
    private static final String API_BASE = "http://10.0.2.2:8000";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleShareIntent();
    }

    // ── Entry point ───────────────────────────────────────────────────────────

    private void handleShareIntent() {
        Intent intent = getIntent();
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            finish();
            return;
        }

        // Read auth token (synced by MainActivity on every resume)
        SharedPreferences prefs = getSharedPreferences("zuno_prefs", MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);
        if (token == null || token.isEmpty()) {
            Toast.makeText(this, "Please log in to Zuno first", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        String type = intent.getType();
        if (type == null) { finish(); return; }

        if ("text/plain".equals(type)) {
            String text = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (text != null && !text.isEmpty()) {
                saveTextInBackground(text, token);
            } else {
                finish();
            }
        } else if (type.startsWith("image/")) {
            Uri imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (imageUri != null) {
                saveImageInBackground(imageUri, type, token);
            } else {
                finish();
            }
        } else {
            finish();
        }
    }

    // ── Text / URL ────────────────────────────────────────────────────────────

    private void saveTextInBackground(String text, String token) {
        new Thread(() -> {
            try {
                boolean hasUrl = text.matches("(?s).*https?://\\S+.*");

                JSONObject body = new JSONObject();
                String endpoint;

                if (hasUrl) {
                    // Extract the first URL
                    String url = text.replaceAll("(?s).*?(https?://\\S+).*", "$1");
                    body.put("url", url);
                    endpoint = API_BASE + "/api/v1/content";
                } else {
                    String title = text.length() > 80 ? text.substring(0, 77) + "..." : text;
                    body.put("title", title);
                    body.put("source_text", text);
                    endpoint = API_BASE + "/api/v1/content/text";
                }

                JSONObject result = postJson(endpoint, body.toString(), token);

                if (result != null && result.has("id")) {
                    showToast("Saved to Zuno!");
                    // Fire-and-forget AI processing
                    triggerAiProcessing(result.getString("id"), token);
                } else {
                    showToast("Failed to save to Zuno");
                }
            } catch (Exception e) {
                Log.e(TAG, "Text share failed", e);
                showToast("Failed to save to Zuno");
            } finally {
                runOnUiThread(this::finish);
            }
        }).start();
    }

    // ── Image ─────────────────────────────────────────────────────────────────

    private void saveImageInBackground(Uri imageUri, String mimeType, String token) {
        new Thread(() -> {
            try {
                byte[] imageData = readUri(imageUri);
                if (imageData == null) {
                    showToast("Failed to read image");
                    runOnUiThread(this::finish);
                    return;
                }

                String ext = mimeType.contains("png") ? "png"
                           : mimeType.contains("gif") ? "gif"
                           : mimeType.contains("webp") ? "webp" : "jpg";
                String fileName = "shared_" + System.currentTimeMillis() + "." + ext;

                JSONObject result = uploadMultipart(
                    API_BASE + "/api/v1/content/upload",
                    imageData, fileName, mimeType, token
                );

                if (result != null && result.has("id")) {
                    showToast("Image saved to Zuno!");
                    triggerAiProcessing(result.getString("id"), token);
                } else {
                    showToast("Failed to save image");
                }
            } catch (Exception e) {
                Log.e(TAG, "Image share failed", e);
                showToast("Failed to save image");
            } finally {
                runOnUiThread(this::finish);
            }
        }).start();
    }

    // ── Background AI processing (fire-and-forget) ────────────────────────────

    private void triggerAiProcessing(String contentId, String token) {
        try {
            JSONObject body = new JSONObject();
            body.put("content_id", contentId);
            postJson(API_BASE + "/api/v1/ai/process-content", body.toString(), token);
        } catch (Exception ignored) {
            // Non-critical — don't bother the user
        }
    }

    // ── HTTP helpers ──────────────────────────────────────────────────────────

    private JSONObject postJson(String urlStr, String jsonBody, String token) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(10_000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes("UTF-8"));
        }

        int code = conn.getResponseCode();
        InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String response = streamToString(is);
        conn.disconnect();

        if (code >= 200 && code < 300) {
            return new JSONObject(response);
        }
        Log.w(TAG, "API " + code + ": " + response);
        return null;
    }

    private JSONObject uploadMultipart(String urlStr, byte[] fileData,
                                       String fileName, String mimeType,
                                       String token) throws Exception {
        String boundary = "----ZunoUpload" + System.currentTimeMillis();
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        conn.setConnectTimeout(15_000);
        conn.setReadTimeout(15_000);

        try (DataOutputStream dos = new DataOutputStream(conn.getOutputStream())) {
            dos.writeBytes("--" + boundary + "\r\n");
            dos.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n");
            dos.writeBytes("Content-Type: " + mimeType + "\r\n\r\n");
            dos.write(fileData);
            dos.writeBytes("\r\n--" + boundary + "--\r\n");
        }

        int code = conn.getResponseCode();
        InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String response = streamToString(is);
        conn.disconnect();

        if (code >= 200 && code < 300) {
            return new JSONObject(response);
        }
        Log.w(TAG, "Upload API " + code + ": " + response);
        return null;
    }

    // ── I/O helpers ───────────────────────────────────────────────────────────

    private byte[] readUri(Uri uri) {
        try (InputStream is = getContentResolver().openInputStream(uri)) {
            if (is == null) return null;
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            byte[] chunk = new byte[8192];
            int len;
            while ((len = is.read(chunk)) != -1) buf.write(chunk, 0, len);
            return buf.toByteArray();
        } catch (Exception e) {
            Log.e(TAG, "Failed to read URI", e);
            return null;
        }
    }

    private String streamToString(InputStream is) throws Exception {
        if (is == null) return "";
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] chunk = new byte[4096];
        int len;
        while ((len = is.read(chunk)) != -1) buf.write(chunk, 0, len);
        return buf.toString("UTF-8");
    }

    // ── UI helper ─────────────────────────────────────────────────────────────

    private void showToast(String msg) {
        runOnUiThread(() -> Toast.makeText(this, msg, Toast.LENGTH_SHORT).show());
    }
}
