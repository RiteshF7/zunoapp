package com.zuno.app;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inject debug JWT from local.properties (BuildConfig) into localStorage.
        // Uses postDelayed to ensure the WebView and page are fully loaded before
        // injecting. After setting the token, re-triggers the router so the app
        // navigates from the auth screen to the feed.
        String jwt = BuildConfig.ZUNO_DEBUG_JWT;
        if (jwt != null && !jwt.isEmpty()) {
            getBridge().getWebView().postDelayed(() -> {
                String escaped = jwt.replace("\\", "\\\\").replace("'", "\\'");
                getBridge().getWebView().evaluateJavascript(
                    "localStorage.setItem('zuno_token', '" + escaped + "');" +
                    "if(!window.location.hash || window.location.hash === '#auth') {" +
                    "  window.location.hash = '#feed';" +
                    "}",
                    null
                );
            }, 1500);
        }
    }
}
