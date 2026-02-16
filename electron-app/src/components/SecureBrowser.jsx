import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

const SecureBrowser = () => {
    const [url, setUrl] = useState('https://chatgpt.com');
    const [isLoading, setIsLoading] = useState(false);
    const [injected, setInjected] = useState(false);
    const [siteSafety, setSiteSafety] = useState('secure'); // 'secure', 'suspicious', 'unknown'
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [protectionMode, setProtectionMode] = useState('consent'); // 'consent' or 'auto'
    const webviewRef = useRef(null);
    const containerRef = useRef(null);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
    };

    // Inject the interception script when webview loads
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const webview = document.createElement('webview');
        webview.id = 'ryzen-webview';
        webview.src = url;
        webview.style.width = '100%';
        webview.style.height = '100%';
        webview.setAttribute('allowpopups', '');
        webview.setAttribute('disablewebsecurity', '');
        webview.setAttribute('webpreferences', 'contextIsolation=no');

        container.appendChild(webview);
        webviewRef.current = webview;

        const injectScript = () => {
            const scriptCode = `
                (function() {
                    if (window.__RyzenShieldHooked) return;
                    window.__RyzenShieldHooked = true;
                    
                    window.__RyzenShieldMode = "${protectionMode}";

                    const originalFetch = window.fetch;
                    window.fetch = async function(...args) {
                        let [resource, config] = args;
                        const url = typeof resource === 'string' ? resource : resource.url;
                        if (url.includes('9000/process_text')) return originalFetch.apply(this, args);
                        
                        if (config && config.method === 'POST' && config.body) {
                            try {
                                if (config.body instanceof Uint8Array || config.body instanceof ArrayBuffer || config.body instanceof Blob) {
                                    return originalFetch.apply(this, args);
                                }
                                const bodyText = typeof config.body === 'string' ? config.body : config.body.toString();
                                
                                const scanXHR = new XMLHttpRequest();
                                scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false);
                                scanXHR.setRequestHeader('Content-Type', 'application/json');
                                scanXHR.send(JSON.stringify({ text: bodyText }));
                                
                                if (scanXHR.status === 200) {
                                    const result = JSON.parse(scanXHR.responseText);
                                    if (result.sanitized) {
                                        let shouldSanitize = true;
                                        if (window.__RyzenShieldMode === 'consent') {
                                            shouldSanitize = window.confirm("🛡️ AMD Ryzen AI: PII Detected!\\n\\nWe found sensitive information (Email/Key/Phone) in your request.\\n\\nWould you like RyzenShield to sanitize this data before sending?\\n\\n[Click OK to Protect, Cancel to allow raw data]");
                                        }

                                        if (shouldSanitize) {
                                            config.body = result.text;
                                            window.console.log("[RyzenShield-Event]:pii-detected");
                                        } else {
                                            window.console.log("[RyzenShield-Event]:pii-allowed-by-user");
                                        }
                                    }
                                }
                            } catch (err) {}
                        }
                        return originalFetch.apply(this, args);
                    };
                    
                    const originalSend = XMLHttpRequest.prototype.send;
                    XMLHttpRequest.prototype.send = function(body) {
                        if (this._method === 'POST' && body && !this._isScanRequest) {
                            try {
                                const scanXHR = new XMLHttpRequest();
                                scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false);
                                scanXHR.setRequestHeader('Content-Type', 'application/json');
                                
                                let textToSend = typeof body === 'string' ? body : body.toString();
                                scanXHR.send(JSON.stringify({ text: textToSend }));
                                
                                if (scanXHR.status === 200) {
                                    const result = JSON.parse(scanXHR.responseText);
                                    if (result.sanitized) {
                                        let shouldSanitize = true;
                                        if (window.__RyzenShieldMode === 'consent') {
                                            shouldSanitize = window.confirm("🛡️ AMD Ryzen AI: PII Detected!\\n\\nWe found sensitive information in this XHR request.\\n\\nSanitize with Ryzen AI for your safety?\\n\\n[Click OK for Santization]");
                                        }
                                        
                                        if (shouldSanitize) {
                                            arguments[0] = result.text;
                                            window.console.log("[RyzenShield-Event]:pii-detected");
                                        }
                                    }
                                }
                            } catch (e) {}
                        }
                        return originalSend.apply(this, arguments);
                    };

                    const originalOpen = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function(method, url) {
                        this._method = method;
                        this._isScanRequest = url.includes('9000/process_text');
                        return originalOpen.apply(this, arguments);
                    };
                })();
            `;
            try {
                webview.executeJavaScript(scriptCode);
                setInjected(true);
            } catch (error) { }
        };

        const onDomReady = () => injectScript();
        const onDidFinishLoad = () => setTimeout(injectScript, 500);

        const onConsoleMessage = (e) => {
            if (e.message.includes("[RyzenShield-Event]:pii-detected")) {
                showToast("AMD Ryzen AI: Sanitization Successful! Your real data was never sent.", "success");
            }
            if (e.message.includes("[RyzenShield-Event]:pii-allowed-by-user")) {
                showToast("AMD Ryzen AI Warning: PII was sent based on your consent. Be careful!", "warn");
            }
            console.log('[Webview Console]:', e.message);
        };

        const onDidStartLoading = () => setIsLoading(true);
        const onDidStopLoading = () => setIsLoading(false);

        webview.addEventListener('dom-ready', onDomReady);
        webview.addEventListener('did-finish-load', onDidFinishLoad);
        webview.addEventListener('console-message', onConsoleMessage);
        webview.addEventListener('did-start-loading', onDidStartLoading);
        webview.addEventListener('did-stop-loading', onDidStopLoading);

        return () => {
            webview.removeEventListener('dom-ready', onDomReady);
            webview.removeEventListener('did-finish-load', onDidFinishLoad);
            webview.removeEventListener('console-message', onConsoleMessage);
            webview.removeEventListener('did-start-loading', onDidStartLoading);
            webview.removeEventListener('did-stop-loading', onDidStopLoading);
            if (container.contains(webview)) container.removeChild(webview);
        };
    }, [protectionMode]);

    const checkUrlSafety = (targetUrl) => {
        try {
            const domain = new URL(targetUrl).hostname.toLowerCase();
            const suspiciousPatterns = ['0', '1', 'v', 'w', 'x', '-login', 'verify', 'secure-chat'];
            const trustedDomains = ['openai.com', 'chatgpt.com', 'google.com', 'github.com', 'microsoft.com', 'canvas.edu', 'blackboard.com'];

            // 1. Check if it's explicitly trusted
            const isTrusted = trustedDomains.some(d => domain.endsWith(d));
            if (isTrusted) {
                setSiteSafety('secure');
                return;
            }

            // 2. Check for Lookalike (Homograph) characters or suspicious keywords
            const hasSuspiciousChar = domain.includes('0') || domain.includes('1') || domain.includes('vv');
            const hasUrgency = domain.includes('login') || domain.includes('security') || domain.includes('update');

            if (hasSuspiciousChar || hasUrgency) {
                setSiteSafety('suspicious');
                showToast("AMD Early Warning: This URL looks suspicious (possible phish). Your school credentials might be at risk.", "warn");
                return;
            }

            setSiteSafety('unknown');
        } catch (e) {
            setSiteSafety('unknown');
        }
    };

    const handleNavigate = (e) => {
        if (e.key === 'Enter' && webviewRef.current) {
            let target = url;
            if (!target.startsWith('http')) target = 'https://' + target;
            checkUrlSafety(target);
            webviewRef.current.loadURL(target);
            setInjected(false);
        }
    };

    const goBack = () => webviewRef.current?.goBack();
    const goForward = () => webviewRef.current?.goForward();
    const reload = () => {
        webviewRef.current?.reload();
        setInjected(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#111] rounded-xl overflow-hidden border border-neutral-800 relative">
            {/* Privacy Education Toast */}
            {toast.show && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`${toast.type === 'warn' ? 'bg-red-600/90 border-red-400' : 'bg-orange-600/90 border-orange-400'} backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border flex items-start gap-4 max-w-md`}>
                        <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">
                                {toast.type === 'warn' ? 'Privacy Warning' : 'Digital Hygiene Alert'}
                            </h4>
                            <p className="text-xs text-orange-50 leading-relaxed font-medium">
                                {toast.message}
                            </p>
                        </div>
                        <button onClick={() => setToast({ ...toast, show: false })} className="hover:bg-white/10 p-1 rounded">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>
            )}

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
                <div className={`flex-1 flex items-center bg-black border rounded-md px-3 py-1.5 gap-2 group transition-all duration-300 ${siteSafety === 'suspicious' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                        siteSafety === 'secure' ? 'border-green-800' : 'border-neutral-700'
                    } focus-within:border-orange-500`}>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                        <ShieldCheck size={14} className={
                            siteSafety === 'suspicious' ? "text-red-500 animate-pulse" :
                                siteSafety === 'secure' ? "text-green-500" : "text-orange-500"
                        } />
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${siteSafety === 'suspicious' ? "text-red-500" :
                                siteSafety === 'secure' ? "text-green-500" : "text-orange-500"
                            }`}>
                            {siteSafety === 'suspicious' ? "Suspicious" :
                                siteSafety === 'secure' ? "Safe Site" : "Verifying"}
                        </span>
                    </div>

                    <div className="h-4 w-[1px] bg-neutral-800 mx-1"></div>
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-200 font-sans"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleNavigate}
                    />

                    <div className="flex gap-2 items-center">
                        <div className={`w-2 h-2 rounded-full ${injected ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-neutral-600'}`}></div>
                        <span className="text-[10px] text-neutral-500 font-mono hidden md:inline">Ryzen NPU Active</span>
                    </div>
                </div>

                {/* Consent Mode Toggle */}
                <div className="flex items-center gap-2 bg-neutral-800/50 p-1 rounded-lg border border-neutral-700">
                    <button
                        onClick={() => setProtectionMode('consent')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${protectionMode === 'consent' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        CONSENT-FIRST
                    </button>
                    <button
                        onClick={() => setProtectionMode('auto')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${protectionMode === 'auto' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        AUTO-SHIELD
                    </button>
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
