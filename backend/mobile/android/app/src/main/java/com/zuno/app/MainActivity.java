package com.zuno.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "ZunoShare";

    // Pending share data for cold-start (WebView not yet ready)
    private String pendingShareJs = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent(), true);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShareIntent(intent, false);
    }

    /**
     * Extract shared data from an ACTION_SEND intent and pass it to the WebView.
     *
     * @param intent    the incoming intent
     * @param coldStart true when called from onCreate (WebView may not be ready)
     */
    private void handleShareIntent(Intent intent, boolean coldStart) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            return;
        }

        String type = intent.getType();
        if (type == null) return;

        String jsCall = null;

        if (type.equals("text/plain")) {
            String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (sharedText != null && !sharedText.isEmpty()) {
                // Escape for safe JS injection
                String escaped = escapeForJs(sharedText);
                jsCall = "window.handleSharedContent({type:'text',content:'" + escaped + "'});";
            }
        } else if (type.startsWith("image/")) {
            Uri imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (imageUri != null) {
                String base64 = uriToBase64(imageUri);
                if (base64 != null) {
                    String mimeType = type;
                    jsCall = "window.handleSharedContent({type:'image',content:'" + base64 + "',mimeType:'" + mimeType + "'});";
                }
            }
        }

        if (jsCall == null) return;

        if (coldStart) {
            // Store for later — the WebView hasn't loaded our JS yet
            pendingShareJs = jsCall;
            // Poll until the WebView and our handler are ready
            pollAndInjectShare();
        } else {
            // App is already running, WebView is loaded — inject directly
            evaluateJs(jsCall);
        }
    }

    /**
     * Poll the WebView until window.handleSharedContent is defined,
     * then inject the pending share call. Gives up after ~10 seconds.
     */
    private void pollAndInjectShare() {
        final WebView webView = getBridge().getWebView();
        final int maxAttempts = 40; // 40 × 250ms = 10s
        final int[] attempt = {0};

        final Runnable poller = new Runnable() {
            @Override
            public void run() {
                if (pendingShareJs == null) return;
                attempt[0]++;

                webView.evaluateJavascript(
                    "(typeof window.handleSharedContent === 'function')",
                    value -> {
                        if ("true".equals(value)) {
                            // Handler is ready — inject the share
                            evaluateJs(pendingShareJs);
                            pendingShareJs = null;
                        } else if (attempt[0] < maxAttempts) {
                            // Try again in 250ms
                            webView.postDelayed(this, 250);
                        } else {
                            Log.w(TAG, "Timed out waiting for handleSharedContent to become available");
                            pendingShareJs = null;
                        }
                    }
                );
            }
        };

        // Start polling after a short initial delay to let the bridge initialise
        webView.postDelayed(poller, 500);
    }

    /**
     * Evaluate a JavaScript string on the WebView (UI thread).
     */
    private void evaluateJs(String js) {
        WebView webView = getBridge().getWebView();
        webView.post(() -> webView.evaluateJavascript(js, null));
    }

    /**
     * Read a content:// URI into a Base64-encoded string.
     */
    private String uriToBase64(Uri uri) {
        try (InputStream is = getContentResolver().openInputStream(uri)) {
            if (is == null) return null;
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] chunk = new byte[8192];
            int len;
            while ((len = is.read(chunk)) != -1) {
                buffer.write(chunk, 0, len);
            }
            return Base64.encodeToString(buffer.toByteArray(), Base64.NO_WRAP);
        } catch (Exception e) {
            Log.e(TAG, "Failed to read shared image", e);
            return null;
        }
    }

    /**
     * Escape a string for safe embedding inside a JS single-quoted string literal.
     */
    private static String escapeForJs(String s) {
        return s
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}
