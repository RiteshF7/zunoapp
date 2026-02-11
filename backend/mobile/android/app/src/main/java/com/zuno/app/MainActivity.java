package com.zuno.app;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

/**
 * Main Capacitor activity.  On every resume it syncs the auth token from the
 * WebView's localStorage into SharedPreferences so that the lightweight
 * {@link ShareReceiverActivity} can make authenticated API calls without
 * needing the WebView.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        syncAuthToken();
    }

    /**
     * Copy the JWT from the WebView's localStorage into native SharedPreferences.
     * Called on every resume so the token stays fresh for ShareReceiverActivity.
     */
    private void syncAuthToken() {
        try {
            WebView webView = getBridge().getWebView();
            webView.evaluateJavascript(
                "localStorage.getItem('zuno_token')",
                value -> {
                    if (value != null && !"null".equals(value) && !"\"\"".equals(value)) {
                        // evaluateJavascript wraps strings in quotes — strip them
                        String token = value.replaceAll("^\"|\"$", "");
                        SharedPreferences prefs =
                            getSharedPreferences("zuno_prefs", MODE_PRIVATE);
                        prefs.edit().putString("auth_token", token).apply();
                    }
                }
            );
        } catch (Exception ignored) {
            // Bridge not ready yet — will sync on next resume
        }
    }
}
