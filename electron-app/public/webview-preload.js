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

            const bodyText = config.body.toString();
            if (bodyText.includes('31,139,8,0') || bodyText.length > 50000) {
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
                    console.log("[RyzenShield] 🛡️ PII Detected & Sanitized via FETCH Hook!");
                    config.body = result.text; // Replace the body with sanitized version
                }
            }
        } catch (err) {
            console.error("[RyzenShield] Scan failed:", err);
        }
    }

    return originalFetch(resource, config);
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
