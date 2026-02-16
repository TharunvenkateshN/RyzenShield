const { ipcRenderer } = require('electron');

console.log("[RyzenShield] 🛡️ Sentinel Active in Browser Context");

// Hook FETCH for Chat Messages
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;

    // GUARD: Loop prevention
    if (url.includes('9000/process_text')) {
        return originalFetch(...args);
    }

    // Check if it's a POST request (likely sending a message)
    if (config && config.method === 'POST' && config.body) {
        try {
            if (config.body instanceof Uint8Array || config.body instanceof ArrayBuffer || config.body instanceof Blob) {
                return originalFetch(...args);
            }

            let bodyText = config.body;
            if (typeof bodyText === 'object') {
                try { bodyText = JSON.stringify(bodyText); } catch (e) { }
            }
            bodyText = bodyText.toString();

            if (bodyText.includes('31,139,8,0') || bodyText.length > 500000) {
                return originalFetch(...args);
            }

            // Process PII via Sync XHR to block the fetch
            const scanXHR = new XMLHttpRequest();
            scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false); // SYNC Request
            scanXHR.setRequestHeader('Content-Type', 'application/json');

            scanXHR.send(JSON.stringify({ text: bodyText }));

            if (scanXHR.status === 200) {
                const result = JSON.parse(scanXHR.responseText);
                if (result.sanitized) {
                    console.log("[RyzenShield] 🛡️ Shadowing PII with Tokens");
                    config.body = result.text; // Replace the body with shadow tokens
                }
            }
        } catch (err) {
            console.error("[RyzenShield] Shadowing failed:", err);
        }
    }

    const response = await originalFetch(resource, config);

    // 🛡️ RE-HYDRATION: Handle Response
    if (response.ok && !url.includes('9000/')) {
        const clone = response.clone();
        try {
            const text = await clone.text();
            if (text.includes('[RS-')) {
                // Request local re-hydration
                const rehydrateXHR = new XMLHttpRequest();
                rehydrateXHR.open('POST', 'http://127.0.0.1:9000/vault/rehydrate', false);
                rehydrateXHR.setRequestHeader('Content-Type', 'application/json');
                rehydrateXHR.send(JSON.stringify({ text }));

                if (rehydrateXHR.status === 200) {
                    const result = JSON.parse(rehydrateXHR.responseText);
                    if (result.replaced > 0) {
                        console.log(`[RyzenShield] 💎 Re-hydrated ${result.replaced} Shadow Tokens locally!`);

                        // We must return a new response with the re-hydrated text
                        const blob = new Blob([result.text], { type: response.headers.get('content-type') });
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

// Hook XMLHttpRequest (XHR) for legacy/other calls
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method, url) {
    this._method = method;
    this._url = url;
    this._isScanRequest = url.includes('9000/process_text');
    return originalOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function (body) {
    if (this._method === 'POST' && body && !this._isScanRequest) {
        try {
            if (body instanceof Uint8Array || body instanceof ArrayBuffer || body instanceof Blob) {
                return originalSend.apply(this, arguments);
            }

            let textToSend = body.toString();
            if (typeof body === 'object') {
                try { textToSend = JSON.stringify(body); } catch (e) { }
            }

            if (textToSend.includes('31,139,8,0') || textToSend.length > 50000) {
                return originalSend.apply(this, arguments);
            }

            const scanXHR = new XMLHttpRequest();
            scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false); // SYNC Request
            scanXHR.setRequestHeader('Content-Type', 'application/json');

            scanXHR.send(JSON.stringify({ text: textToSend }));

            if (scanXHR.status === 200) {
                const result = JSON.parse(scanXHR.responseText);
                if (result.sanitized) {
                    console.log("[RyzenShield] 🛡️ PII Sanitized via XHR Hook!");
                    arguments[0] = result.text; // Replace body
                }
            }
        } catch (e) {
            console.error("Scan failed", e);
        }
    }
    return originalSend.apply(this, arguments);
};
