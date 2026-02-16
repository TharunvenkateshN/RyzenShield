import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Lock, ShieldCheck, Globe, Zap, Search, Shield, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecureBrowser = () => {
    const [url, setUrl] = useState('https://chatgpt.com');
    const [inputUrl, setInputUrl] = useState('https://chatgpt.com');
    const [isLoading, setIsLoading] = useState(false);
    const [injected, setInjected] = useState(false);
    const [siteSafety, setSiteSafety] = useState('secure'); // 'secure', 'suspicious', 'unknown'
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [protectionMode, setProtectionMode] = useState('consent'); // 'consent' or 'auto'
    const [isFocused, setIsFocused] = useState(false);
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

        // Clean up old webview if it exists
        if (container.firstChild) {
            container.removeChild(container.firstChild);
        }

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
                            } catch (err) {}
                        }
                        return originalSend.apply(this, arguments);
                    };
                })();
            `;
            webview.executeJavaScript(scriptCode);
            setInjected(true);
        };

        const handleLoad = () => {
            setIsLoading(false);
            injectScript();

            // Analyze site safety based on hostname
            const hostname = new URL(webview.getURL()).hostname;
            if (hostname.includes('chatgpt.com') || hostname.includes('gemini.google.com')) {
                setSiteSafety('secure');
            } else if (hostname.length > 25 || hostname.includes('free-ai')) {
                setSiteSafety('suspicious');
            } else {
                setSiteSafety('secure');
            }
        };

        webview.addEventListener('did-start-loading', () => setIsLoading(true));
        webview.addEventListener('did-stop-loading', handleLoad);
        webview.addEventListener('console-message', (e) => {
            if (e.message.includes('pii-detected')) {
                showToast("PII detected! Ryzen AI sanitized the payload before it left your device.", "warn");
            }
        });

        return () => {
            webview.removeEventListener('did-start-loading', () => setIsLoading(true));
            webview.removeEventListener('did-stop-loading', handleLoad);
            if (container.firstChild) container.removeChild(container.firstChild);
        };
    }, [url, protectionMode]);

    const handleNavigate = (e) => {
        if (e.key === 'Enter') {
            let targetUrl = inputUrl;
            if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
            setUrl(targetUrl);
        }
    };

    const goBack = () => webviewRef.current?.canGoBack() && webviewRef.current.goBack();
    const goForward = () => webviewRef.current?.canGoForward() && webviewRef.current.goForward();
    const reload = () => {
        webviewRef.current?.reload();
        setInjected(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden border border-neutral-800/60 shadow-2xl relative">

            {/* Cinematic Toast Notifications */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ y: -50, opacity: 0, x: "-50%" }}
                        animate={{ y: 20, opacity: 1, x: "-50%" }}
                        exit={{ y: -50, opacity: 0, x: "-50%" }}
                        className="absolute top-0 left-1/2 z-[100]"
                    >
                        <div className={`px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border backdrop-blur-xl flex items-center gap-4 ${toast.type === 'warn' ? 'bg-orange-600/20 border-orange-500/50 text-white' : 'bg-green-600/20 border-green-500/50 text-white'
                            }`}>
                            <div className={`p-2 rounded-xl bg-black/40 ${toast.type === 'warn' ? 'text-orange-500' : 'text-green-500'}`}>
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">RyzenShield Intel</h4>
                                <p className="text-xs font-bold leading-tight">{toast.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Browser Header */}
            <div className="bg-[#0c0c0c] border-b border-neutral-800/60 p-4 space-y-3">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-neutral-800/60 order-1">
                        <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
                            <Shield size={14} className="text-orange-500" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Sentinel</span>
                    </div>

                    <div className="flex gap-1.5 order-2">
                        <NavBtn icon={ChevronLeft} onClick={goBack} />
                        <NavBtn icon={ChevronRight} onClick={goForward} />
                        <NavBtn icon={RotateCcw} onClick={reload} />
                    </div>

                    {/* Address Bar - Cinematic Style */}
                    <div className={`flex-1 flex items-center bg-black border rounded-2xl px-4 py-2 gap-3 transition-all duration-700 relative group ${isFocused ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' :
                        siteSafety === 'suspicious' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                            siteSafety === 'secure' ? 'border-green-500/30' : 'border-neutral-800/50'
                        }`}>
                        <div className={`absolute top-2.5 left-1.5 bottom-2.5 w-1 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)] ${siteSafety === 'suspicious' ? 'bg-red-500' :
                            siteSafety === 'secure' ? 'bg-green-500' : 'bg-neutral-800'
                            }`} />

                        <div className="pl-2 pr-1 flex items-center">
                            <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl group-focus-within:border-orange-500/50 transition-colors">
                                <Shield size={12} className={siteSafety === 'secure' ? 'text-orange-500' : 'text-neutral-500'} />
                            </div>
                        </div>

                        <input
                            className="flex-1 bg-transparent border-none outline-none text-xs text-neutral-200 font-medium placeholder:text-neutral-700 w-full"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={handleNavigate}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Search or enter secure URL..."
                        />

                        <div className="flex items-center gap-3">
                            {isLoading && (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                    <RotateCcw size={14} className="text-orange-500" />
                                </motion.div>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full">
                                <ShieldCheck size={12} className={siteSafety === 'secure' ? 'text-green-500' : 'text-red-500'} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${siteSafety === 'secure' ? 'text-green-500' : 'text-red-500'}`}>
                                    {siteSafety === 'secure' ? 'Encrypted' : 'Untrusted'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Protection Toggles - Cinematic */}
                    <div className="hidden lg:flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-neutral-800/60 order-3">
                        <ModeBtn active={protectionMode === 'consent'} onClick={() => setProtectionMode('consent')} label="CONSENT" />
                        <ModeBtn active={protectionMode === 'auto'} onClick={() => setProtectionMode('auto')} label="AUTO" />
                    </div>
                </div>
            </div>

            {/* The Actual Browser View with NPU Active Badge */}
            <div className="flex-1 relative bg-white">
                <div ref={containerRef} className="w-full h-full" />

                {/* Fixed NPU Active Floating Badge */}
                <div className="absolute bottom-6 right-6 pointer-events-none group">
                    <motion.div
                        animate={{
                            boxShadow: injected ? ["0 0 10px rgba(249,115,22,0.2)", "0 0 30px rgba(249,115,22,0.4)", "0 0 10px rgba(249,115,22,0.2)"] : "none"
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`px-4 py-2 rounded-2xl border flex items-center gap-3 backdrop-blur-xl ${injected ? 'bg-orange-500/10 border-orange-500/30' : 'bg-neutral-900/80 border-neutral-800'
                            }`}
                    >
                        <Zap size={16} className={injected ? 'text-orange-500 animate-pulse' : 'text-neutral-500'} />
                        <div className="text-left">
                            <div className={`text-[10px] font-black uppercase tracking-widest leading-none ${injected ? 'text-white' : 'text-neutral-500'}`}>
                                {injected ? 'XDNA Engine Active' : 'Sensing Flow...'}
                            </div>
                            <div className="text-[8px] font-bold text-neutral-600 uppercase mt-1">Local Intercept Mode</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const NavBtn = ({ icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className="p-2.5 bg-black border border-neutral-800 hover:border-neutral-700 hover:text-white text-neutral-500 rounded-xl transition-all active:scale-95 shadow-lg"
    >
        <Icon size={16} />
    </button>
);

const ModeBtn = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${active ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-neutral-600 hover:text-neutral-300'
            }`}
    >
        {label}
    </button>
);

export default SecureBrowser;
