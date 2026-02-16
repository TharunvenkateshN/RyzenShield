import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

const SecureBrowser = () => {
    const [url, setUrl] = useState('https://example.com');
    const [isLoading, setIsLoading] = useState(false);
    const [injected, setInjected] = useState(false);
    const webviewRef = useRef(null);
    const containerRef = useRef(null);

    // Inject the interception script when webview loads
    useEffect(() => {
        // Create webview element imperatively to avoid React re-render issues
        const container = containerRef.current;
        if (!container) {
            console.error("[RyzenShield] Container ref is null");
            return;
        }

        // Create the webview element
        const webview = document.createElement('webview');
        webview.id = 'ryzen-webview';
        webview.src = url;
        webview.style.width = '100%';
        webview.style.height = '100%';
        webview.setAttribute('allowpopups', '');
        webview.setAttribute('disablewebsecurity', ''); // BYPASS CSP for demo prototype
        webview.setAttribute('webpreferences', 'contextIsolation=no');

        container.appendChild(webview);
        webviewRef.current = webview;

        console.log("[RyzenShield] Setting up webview listeners");

        const injectScript = () => {
            console.log("[RyzenShield] DOM Ready - Attempting script injection");

            const scriptCode = `
                (function() {
                    console.log("[RyzenShield] 🛡️ Injection script executing");
                    
                    // Test if we can access window
                    if (typeof window === 'undefined') {
                        console.error("[RyzenShield] Window object not available!");
                        return;
                    }
                    
                    console.log("[RyzenShield] Window object available, hooking fetch...");
                    
                    // Hook FETCH
                    const originalFetch = window.fetch;
                    window.fetch = async function(...args) {
                        console.log("[RyzenShield] FETCH INTERCEPTED!", args);
                        
                        let [resource, config] = args;
                        const url = typeof resource === 'string' ? resource : resource.url;

                        // GUARD: Don't intercept our own scan API (Infinite Loop Prevention)
                        if (url.includes('9000/process_text')) {
                            return originalFetch.apply(this, args);
                        }
                        
                        if (config && config.method === 'POST' && config.body) {
                            console.log("[RyzenShield] POST request detected, body:", config.body);
                            
                            try {
                                if (config.body instanceof Uint8Array || config.body instanceof ArrayBuffer || config.body instanceof Blob) {
                                    return originalFetch.apply(this, args); // Skip binary data
                                }

                                const bodyText = typeof config.body === 'string' ? config.body : config.body.toString();
                                
                                // SKIP if too long or looks like garbage
                                if (bodyText.length > 50000 || bodyText.includes('31,139,8,0')) {
                                     return originalFetch.apply(this, args);
                                }

                                console.log("[RyzenShield] Sending to scan API:", bodyText.substring(0, 100));
                                
                                // Use sync XHR to block the request
                                const scanXHR = new XMLHttpRequest();
                                scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false);
                                scanXHR.setRequestHeader('Content-Type', 'application/json');
                                scanXHR.send(JSON.stringify({ text: bodyText }));
                                
                                console.log("[RyzenShield] Scan response status:", scanXHR.status);
                                
                                if (scanXHR.status === 200) {
                                    const result = JSON.parse(scanXHR.responseText);
                                    console.log("[RyzenShield] Scan result:", result);
                                    
                                    if (result.sanitized) {
                                        console.log("[RyzenShield] 🛡️ PII DETECTED & SANITIZED!");
                                        config.body = result.text;
                                    }
                                }
                            } catch (err) {
                                console.error("[RyzenShield] Scan failed:", err);
                            }
                        }
                        
                        return originalFetch.apply(this, args);
                    };
                    
                    console.log("[RyzenShield] ✅ Fetch hook installed successfully");
                    
                    // Also hook XHR
                    const originalOpen = XMLHttpRequest.prototype.open;
                    const originalSend = XMLHttpRequest.prototype.send;
                    
                    XMLHttpRequest.prototype.open = function(method, url) {
                        this._method = method;
                        this._url = url;
                        // GUARD: Loop prevention
                        this._isScanRequest = url.includes('9000/process_text');
                        return originalOpen.apply(this, arguments);
                    };
                    
                    XMLHttpRequest.prototype.send = function(body) {
                        if (this._method === 'POST' && body && !this._isScanRequest) {
                            console.log("[RyzenShield] XHR POST intercepted:", body);
                            
                            try {
                                const scanXHR = new XMLHttpRequest();
                                scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false);
                                scanXHR.setRequestHeader('Content-Type', 'application/json');
                                
                                if (body instanceof Uint8Array || body instanceof ArrayBuffer || body instanceof Blob) {
                                     return originalSend.apply(this, arguments); // Skip binary
                                }

                                let textToSend = typeof body === 'string' ? body : body.toString();
                                if (typeof body === 'object' && !(body instanceof FormData)) {
                                    try { textToSend = JSON.stringify(body); } catch(e) {}
                                }
                                
                                // Skip binary/gzip markers (e.g. 31,139 is GZIP)
                                if (textToSend.includes('31,139,8,0') || textToSend.length > 50000) {
                                    return originalSend.apply(this, arguments);
                                }
                                
                                scanXHR.send(JSON.stringify({ text: textToSend }));
                                
                                if (scanXHR.status === 200) {
                                    const result = JSON.parse(scanXHR.responseText);
                                    if (result.sanitized) {
                                        console.log("[RyzenShield] 🛡️ XHR PII Sanitized!");
                                        arguments[0] = result.text;
                                    }
                                }
                            } catch (e) {
                                console.error("[RyzenShield] XHR scan failed:", e);
                            }
                        }
                        return originalSend.apply(this, arguments);
                    };
                    
                    console.log("[RyzenShield] ✅ XHR hook installed successfully");
                })();
            `;

            try {
                webview.executeJavaScript(scriptCode);
                console.log("[RyzenShield] ✅ Script injection completed");
                setInjected(true);
            } catch (error) {
                console.error("[RyzenShield] ❌ Script injection failed:", error);
            }
        };

        // Listen for various webview events
        const onDomReady = () => {
            console.log("[RyzenShield] Webview DOM ready event fired");
            injectScript();
        };

        const onDidFinishLoad = () => {
            console.log("[RyzenShield] Webview did-finish-load event fired");
            // Inject again to be safe
            setTimeout(injectScript, 100);
        };

        const onConsoleMessage = (e) => {
            console.log('[Webview Console]:', e.message);
        };

        const onDidStartLoading = () => {
            console.log('[RyzenShield] Webview started loading');
            setIsLoading(true);
        };

        const onDidStopLoading = () => {
            console.log('[RyzenShield] Webview stopped loading');
            setIsLoading(false);
        };

        const onDidFailLoad = (e) => {
            console.error('[RyzenShield] Webview failed to load:', e);
        };

        webview.addEventListener('dom-ready', onDomReady);
        webview.addEventListener('did-finish-load', onDidFinishLoad);
        webview.addEventListener('console-message', onConsoleMessage);
        webview.addEventListener('did-start-loading', onDidStartLoading);
        webview.addEventListener('did-stop-loading', onDidStopLoading);
        webview.addEventListener('did-fail-load', onDidFailLoad);

        return () => {
            webview.removeEventListener('dom-ready', onDomReady);
            webview.removeEventListener('did-finish-load', onDidFinishLoad);
            webview.removeEventListener('console-message', onConsoleMessage);
            webview.removeEventListener('did-start-loading', onDidStartLoading);
            webview.removeEventListener('did-stop-loading', onDidStopLoading);
            webview.removeEventListener('did-fail-load', onDidFailLoad);

            // Remove webview element on cleanup
            if (container.contains(webview)) {
                container.removeChild(webview);
            }
        };
    }, []);

    const handleNavigate = (e) => {
        if (e.key === 'Enter' && webviewRef.current) {
            let target = url;
            if (!target.startsWith('http')) target = 'https://' + target;
            webviewRef.current.loadURL(target);
            setInjected(false); // Reset injection status
        }
    };

    const goBack = () => webviewRef.current?.goBack();
    const goForward = () => webviewRef.current?.goForward();
    const reload = () => {
        webviewRef.current?.reload();
        setInjected(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#111] rounded-xl overflow-hidden border border-neutral-800">
            {/* Browser Toolbar */}
            <div className="flex items-center gap-3 p-3 bg-neutral-900 border-b border-neutral-800">
                <div className="flex gap-1">
                    <button onClick={goBack} className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400">
                        <ArrowLeft size={16} />
                    </button>
                    <button onClick={goForward} className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400">
                        <ArrowRight size={16} />
                    </button>
                    <button onClick={reload} className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Address Bar */}
                <div className="flex-1 flex items-center bg-black border border-neutral-700 rounded-md px-3 py-1.5 gap-2 group focus-within:border-orange-500 transition-colors">
                    <ShieldCheck size={14} className={injected ? "text-green-500" : "text-orange-500"} />
                    <span className="text-xs text-neutral-500 font-mono">
                        {injected ? "🛡️ Protection Active" : "⏳ Loading..."}
                    </span>
                    <div className="h-4 w-[1px] bg-neutral-800 mx-1"></div>
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-200 font-sans"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleNavigate}
                    />
                </div>
            </div>

            {/* The Actual Browser View */}
            <div
                ref={containerRef}
                className="flex-1 relative bg-white"
            />
        </div>
    );
};

export default SecureBrowser;
