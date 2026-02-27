// [RyzenShield] Neural Sentinel Preload Hook Engine
console.log("[RyzenShield] 🛡️ Neural Sentinel: Attempting Initialization...");

// Early Handshake for SecureBrowser detection
window.__RYZEN_SENTINEL_OK = true;
window.fetch.__ryzen_hooked = true;
if (window.XMLHttpRequest) {
    window.XMLHttpRequest.prototype.send.__ryzen_hooked = true;
}

(function () {
    // 1. SAFE UI INJECTION (Wait for body)
    const injectUI = () => {
        if (document.getElementById('ryzen-shield-badge')) return;
        const badge = document.createElement('div');
        badge.id = 'ryzen-shield-badge';
        badge.innerHTML = '🛡️ RYZEN AI PROTECTED';
        badge.style = "position:fixed; top:10px; right:120px; z-index:999999; background:rgba(0,0,0,0.8); color:#00ff00; padding:5px 10px; border-radius:10px; font-family:monospace; font-size:10px; border:1px solid #00ff00; pointer-events:none; opacity:0.8; box-shadow: 0 0 10px rgba(0,255,0,0.2);";
        document.body.appendChild(badge);
        console.log("[RyzenShield] 🛡️ Neural Badge Injected");
    };

    if (document.body) injectUI();
    else window.addEventListener('DOMContentLoaded', injectUI);

    // 2. CENTRAL HOOK ENGINE (Fetch)
    const originalFetch = window.fetch;
    window.fetch = async function (resource, config) {
        let url = "";
        let method = "GET";
        let bodyText = null;
        let isRequestObject = false;

        if (resource instanceof Request) {
            url = resource.url;
            method = resource.method;
            isRequestObject = true;
        } else {
            url = resource ? resource.toString() : "";
            method = (config && config.method) || "GET";
            bodyText = config && config.body;
        }

        // Bypass loop
        if (url.includes('127.0.0.1:9000/') || url.includes('localhost:9000')) {
            return originalFetch(resource, config);
        }

        if (method.toUpperCase() === 'POST') {
            try {
                if (isRequestObject && !bodyText) {
                    const clone = resource.clone();
                    bodyText = await clone.text();
                }

                if (bodyText && typeof bodyText === 'string' && bodyText.length > 5) {
                    console.log("[RyzenShield] 🔍 Scanning Outbound Flow: " + url.substring(0, 50));

                    const scanXHR = new XMLHttpRequest();
                    scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false); // SYNC BLOCK
                    scanXHR.setRequestHeader('Content-Type', 'application/json');
                    scanXHR.send(JSON.stringify({ text: bodyText }));

                    if (scanXHR.status === 200) {
                        const result = JSON.parse(scanXHR.responseText);
                        if (result.sanitized) {
                            const mode = window.__RyzenShieldMode || 'consent';
                            let shouldSanitize = true;
                            if (mode === 'consent') {
                                shouldSanitize = window.confirm("🛡️ AMD Ryzen AI: Sensitive Info Detected!\n\nShadow this PII before it leaves your device?");
                            }

                            if (shouldSanitize) {
                                console.log("[RyzenShield] 🛡️ Shadowing active (Fetch)");

                                let headers = new Headers();
                                if (isRequestObject) {
                                    resource.headers.forEach((v, k) => headers.set(k, v));
                                } else if (config && config.headers) {
                                    new Headers(config.headers).forEach((v, k) => headers.set(k, v));
                                }

                                if (isRequestObject) {
                                    resource = new Request(resource, { body: result.text, headers: headers });
                                } else {
                                    if (!config) config = {};
                                    config.body = result.text;
                                    config.headers = headers;
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("[RyzenShield] ❌ Hook Error (Fetch):", err);
            }
        }

        const response = await originalFetch(resource, config);

        // 3. RE-HYDRATION
        if (window.__RyzenShieldRehydrate !== false && response.ok && !url.includes('9000')) {
            try {
                const clone = response.clone();
                const text = await clone.text();
                if (text.includes('[RS-')) {
                    const reXHR = new XMLHttpRequest();
                    reXHR.open('POST', 'http://127.0.0.1:9000/vault/rehydrate', false);
                    reXHR.setRequestHeader('Content-Type', 'application/json');
                    reXHR.send(JSON.stringify({ text }));

                    if (reXHR.status === 200) {
                        const res = JSON.parse(reXHR.responseText);
                        if (res.replaced > 0) {
                            console.log(`[RyzenShield] 💎 Re-hydrating Locally`);
                            const blob = new Blob([res.text], { type: response.headers.get('content-type') });
                            return new Response(blob, {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        }
                    }
                }
            } catch (e) { }
        }

        return response;
    };

    // 4. XHR HOOK
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method;
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
        if (this._method === 'POST' && body && !this._url.includes('9000/')) {
            try {
                let bodyText = body.toString();
                if (bodyText.length > 5 && !bodyText.includes('[object')) {
                    const scanXHR = new XMLHttpRequest();
                    scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false);
                    scanXHR.setRequestHeader('Content-Type', 'application/json');
                    scanXHR.send(JSON.stringify({ text: bodyText }));

                    if (scanXHR.status === 200) {
                        const result = JSON.parse(scanXHR.responseText);
                        if (result.sanitized) {
                            const mode = window.__RyzenShieldMode || 'consent';
                            let shouldSanitize = true;
                            if (mode === 'consent') {
                                shouldSanitize = window.confirm("🛡️ AMD Ryzen AI: Sensitive Info Detected!\n\nShadow this PII before it leaves your device?");
                            }
                            if (shouldSanitize) {
                                console.log("[RyzenShield] 🛡️ Shadowing active (XHR)");
                                body = result.text;
                                // Need to update arguments if we want to be 100% sure
                                arguments[0] = result.text;
                            }
                        }
                    }
                }
            } catch (e) { }
        }
        return originalSend.apply(this, arguments);
    };

    console.log("[RyzenShield] ✅ Neural Sentinel Fully Hooked");
})();
