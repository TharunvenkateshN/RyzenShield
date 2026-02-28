import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Lock, ShieldCheck, Globe, Zap, Search, Shield, ChevronLeft, ChevronRight, RotateCcw, UserCheck, Cpu, Eye, EyeOff, UserPlus, Info, Check, Copy, Mic, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BrowserInstance = ({ isActive, initialUrl = 'https://chatgpt.com', onTitleChange }) => {
    const [url, setUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(initialUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [injected, setInjected] = useState(false);
    const [siteSafety, setSiteSafety] = useState('secure');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [protectionMode, setProtectionMode] = useState('consent'); // Set back to CONSENT for the user
    const [rehydrateEnabled, setRehydrateEnabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [domReady, setDomReady] = useState(false);

    const [showHygieneModal, setShowHygieneModal] = useState(false);
    const [burnerData, setBurnerData] = useState(null);
    const [isGeneratingBurner, setIsGeneratingBurner] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    const [showAudioConsent, setShowAudioConsent] = useState(false);
    const [liveAudioActive, setLiveAudioActive] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [audioBleep, setAudioBleep] = useState(false);

    const webviewRef = useRef(null);
    const containerRef = useRef(null);
    const liveTranscriptTimer = useRef(null);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        setInjected(false);
        if (container.firstChild) container.removeChild(container.firstChild);

        const webview = document.createElement('webview');
        webview.id = 'ryzen-webview';
        webview.src = url;
        webview.style.width = '100%';
        webview.style.height = '100%';
        webview.setAttribute('allowpopups', '');
        webview.setAttribute('disablewebsecurity', '');
        webview.setAttribute('webpreferences', 'contextIsolation=no, nodeIntegration=no');

        container.appendChild(webview);
        webviewRef.current = webview;

        const injectScript = () => {
            const scriptCode = `
                (function() {
                    if (window.__RyzenShieldHooked) return;
                    window.__RyzenShieldHooked = true;
                    
                    console.log("[RyzenShield] 🛡️ Security Stack Initializing...");

                    window.__RyzenShieldRehydrate = ${rehydrateEnabled};
                    window.__RyzenShieldMode = "${protectionMode}";
                    
                    const originalFetch = window.fetch;
                    const originalXHROpen = XMLHttpRequest.prototype.open;
                    const originalXHRSend = XMLHttpRequest.prototype.send;

                    // 💎 REVEAL ENGINE: Instant Reactive State Sync
                    window.__RS_FORCE_SYNC = function(mode, reveal) {
                        window.__RyzenShieldRehydrate = reveal;
                        window.__RyzenShieldMode = mode;
                        
                        console.log("[RyzenShield] 🧩 Hard Sync Triggered: Reveal=" + reveal);
                        
                        document.querySelectorAll('.rs-shadow-wrapper').forEach(w => {
                            const showReal = window.__RyzenShieldRehydrate;
                            if (showReal) {
                                w.textContent = w.dataset.rsRehydrated || w.textContent;
                                w.style.background = 'rgba(6, 182, 212, 0.2)';
                                w.style.borderBottom = '1.5px solid #06b6d4';
                                w.style.color = '#fff';
                                w.style.textShadow = '0 0 8px rgba(6, 182, 212, 0.4)';
                            } else {
                                w.textContent = w.dataset.rsOriginal || w.textContent;
                                w.style.background = 'rgba(249, 115, 22, 0.15)';
                                w.style.borderBottom = '1px dashed #f97316';
                                w.style.color = '#f97316';
                                w.style.textShadow = 'none';
                            }
                        });
                    };

                    async function rehydrateDOM() {
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                        let node;
                        const pending = [];
                        
                        while(node = walker.nextNode()) {
                            if (node.textContent && node.textContent.includes('[RS-')) {
                                if (node.parentElement && node.parentElement.closest('.rs-shadow-wrapper')) continue;
                                pending.push(node);
                            }
                        }

                        if (pending.length > 0) console.log("[RyzenShield] 🧩 Tokens Found: " + pending.length);

                        for (const textNode of pending) {
                            const originalText = textNode.textContent;
                            try {
                                const res = await originalFetch('http://127.0.0.1:9000/vault/rehydrate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ text: originalText })
                                });
                                if (res.ok) {
                                    const data = await res.json();
                                    if (data.replaced > 0 && textNode.parentNode) {
                                        console.log("[RyzenShield] ✅ Rehydrated: " + originalText);
                                        const span = document.createElement('span');
                                        span.className = 'rs-shadow-wrapper';
                                        span.dataset.rsOriginal = originalText;
                                        span.dataset.rsRehydrated = data.text;
                                        span.style.padding = '1px 4px';
                                        span.style.borderRadius = '6px';
                                        span.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
                                        span.style.fontWeight = 'bold';
                                        span.style.cursor = 'help';
                                        
                                        textNode.parentNode.replaceChild(span, textNode);
                                        window.__RS_FORCE_SYNC(window.__RyzenShieldMode, window.__RyzenShieldRehydrate);
                                    }
                                }
                            } catch (e) {
                                console.error("[RyzenShield] Rehydrate Error:", e);
                            }
                        }
                    }

                    setInterval(rehydrateDOM, 1000);

                    // 🖱️ Interaction Tracking to prevent popup spam
                    window.__RS_LAST_INTERACTION = window.__RS_LAST_INTERACTION || 0;
                    window.__RS_LAST_CONSENT_CHOICE = window.__RS_LAST_CONSENT_CHOICE || true;
                    
                    document.addEventListener('keydown', (e) => {
                        // Ignore Shift+Enter (newlines) in textareas, only count actual submit intent
                        if (e.key === 'Enter' && !e.shiftKey) window.__RS_LAST_INTERACTION = Date.now();
                    }, true);
                    document.addEventListener('mousedown', (e) => {
                        let el = e.target;
                        let isSubmit = false;
                        while (el && el !== document.body) {
                            if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.type === 'submit') {
                                isSubmit = true;
                                break;
                            }
                            el = el.parentElement;
                        }
                        if (isSubmit) {
                            window.__RS_LAST_INTERACTION = Date.now();
                        }
                    }, true);

                    // 🛡️ OUTGOING INTERCEPTION (FETCH)
                    window.fetch = async function(...args) {
                        let resource = args[0];
                        let config = args[1] || {};
                        
                        let url = (typeof resource === 'string') ? resource : resource.url;
                        let method = (config.method || (resource && resource.method) || 'GET').toUpperCase();

                        if (url && (url.includes('9000/') || url.includes('telemetry') || url.includes('analytics'))) {
                            return originalFetch(...args);
                        }

                        if (method !== 'GET') {
                            try {
                                let body = '';
                                if (resource instanceof Request) {
                                    body = await resource.clone().text();
                                } else if (config.body) {
                                    body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
                                }

                                if (body && (body.length > 5)) {
                                    // Ignore background typing telemetry on ChatGPT explicitly to avoid draft nags
                                    if (url.includes('/backend-api/lat/') || url.includes('/draft')) {
                                        return originalFetch(...args);
                                    }

                                    const scanRes = await originalFetch('http://127.0.0.1:9000/process_text', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ text: body })
                                    }).catch(() => null);

                                    if (scanRes && scanRes.ok) {
                                        const res = await scanRes.json();
                                        if (res.sanitized) {
                                            let proceed = true;
                                            let isInteraction = false;
                                            const timeSinceInteraction = Date.now() - window.__RS_LAST_INTERACTION;

                                            if (timeSinceInteraction < 1500) {
                                                isInteraction = true;
                                                if (window.__RyzenShieldMode === 'consent') {
                                                    proceed = confirm("🚨 RyzenShield: PII Detected!\\n\\nWe found sensitive data. Would you like to shadow it with Ryzen AI before sending?\\n\\n[OK to Protect, Cancel to Send Raw]");
                                                    window.__RS_LAST_CONSENT_CHOICE = proceed;
                                                }
                                                window.__RS_LAST_INTERACTION = 0; // Consume interaction
                                            } else if (window.__RyzenShieldMode === 'consent') {
                                                proceed = window.__RS_LAST_CONSENT_CHOICE;
                                            }
                                            
                                            if (proceed) {
                                                console.log("[RyzenShield] 🛡️ Shadowing outgoing payload");
                                                if (isInteraction) {
                                                    // Defer the toast slightly to guarantee the dialog has closed
                                                    setTimeout(() => console.warn("[RyzenShield-PII-Detected]"), 100);
                                                }
                                                if (resource instanceof Request) {
                                                    const newHeaders = new Headers(resource.headers);
                                                    resource = new Request(url, {
                                                        method: resource.method,
                                                        headers: newHeaders,
                                                        body: res.text,
                                                        mode: resource.mode,
                                                        credentials: resource.credentials,
                                                        cache: resource.cache,
                                                        redirect: resource.redirect,
                                                        referrer: resource.referrer,
                                                        integrity: resource.integrity
                                                    });
                                                    args[0] = resource;
                                                } else {
                                                    config.body = res.text;
                                                    args[1] = config;
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error("[RyzenShield] Interception Error:", e);
                            }
                        }
                        return originalFetch(...args);
                    };

                    // 🛡️ OUTGOING INTERCEPTION (XHR)
                    XMLHttpRequest.prototype.send = function(body) {
                        const url = this._rsUrl || '';
                        if (body && !url.includes('9000/')) {
                            try {
                                const scanXHR = new XMLHttpRequest();
                                scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false); // Sync for blocking
                                scanXHR.setRequestHeader('Content-Type', 'application/json');
                                scanXHR.send(JSON.stringify({ text: body.toString() }));
                                
                                if (scanXHR.status === 200) {
                                    const res = JSON.parse(scanXHR.responseText);
                                    if (res.sanitized) {
                                        let proceed = true;
                                        let isInteraction = false;
                                        const timeSinceInteraction = Date.now() - window.__RS_LAST_INTERACTION;

                                        if (timeSinceInteraction < 1500) {
                                            isInteraction = true;
                                            if (window.__RyzenShieldMode === 'consent') {
                                                proceed = confirm("🚨 RyzenShield: XHR PII Detected! Shadowing payload.");
                                                window.__RS_LAST_CONSENT_CHOICE = proceed;
                                            }
                                            window.__RS_LAST_INTERACTION = 0; // Consume
                                        } else if (window.__RyzenShieldMode === 'consent') {
                                            proceed = window.__RS_LAST_CONSENT_CHOICE;
                                        }

                                        if (proceed) {
                                            if (isInteraction) {
                                                setTimeout(() => console.warn("[RyzenShield-PII-Detected]"), 100);
                                            }
                                            arguments[0] = res.text;
                                        }
                                    }
                                }
                            } catch (e) {}
                        }
                        return originalXHRSend.apply(this, arguments);
                    };
                })();
            `;
            webview.executeJavaScript(scriptCode).then(() => {
                setInjected(true);
                console.log("[RyzenShield] Security Stack Active.");
            }).catch(err => {
                console.error("[RyzenShield] Injection Failed:", err);
            });
        };

        const handleReady = () => {
            const webview = webviewRef.current;
            if (!webview || !webview.parentElement) return;

            setDomReady(true);
            setIsLoading(false);
            injectScript();

            try {
                const webURL = webview.getURL();
                if (!webURL) return;
                const urlObj = new URL(webURL);
                const hostname = urlObj.hostname.toLowerCase();

                if (onTitleChange) onTitleChange(webview.getTitle() || hostname);

                const suspicious = ['free-ai', 'openai-login', 'chat-gpt', 'gemini-bonus', 'wallet-connect', 'secure-update'];
                if (suspicious.some(p => hostname.includes(p))) {
                    setSiteSafety('suspicious');
                    showToast("🚨 High Risk Security Alert: Phishing patterns detected!", "warn");
                } else {
                    setSiteSafety('secure');
                }

                if ((hostname.includes('zoom.us') || hostname.includes('meet.google.com') || hostname.includes('teams.microsoft.com')) && !liveAudioActive) {
                    setShowAudioConsent(true);
                }
            } catch (e) { setSiteSafety('unknown'); }
        };

        webview.addEventListener('did-start-loading', () => {
            setIsLoading(true);
            setDomReady(false);
        });
        webview.addEventListener('dom-ready', handleReady);
        webview.addEventListener('console-message', (e) => {
            if (e.message.includes('[RyzenShield]')) {
                console.log(e.message);
            }
            if (e.message.includes('[RyzenShield-PII-Detected]')) {
                showToast("PII Neutralized! Ryzen AI sanitized your data before upload.", "info");
            }
        });

        return () => {
            webview.removeEventListener('dom-ready', handleReady);
            if (container.firstChild) container.removeChild(container.firstChild);
            if (liveTranscriptTimer.current) clearInterval(liveTranscriptTimer.current);
            webviewRef.current = null;
            setInjected(false);
            setDomReady(false);
        };
    }, [url]);

    useEffect(() => {
        const webview = webviewRef.current;
        if (webview && domReady && webview.parentElement) {
            webview.executeJavaScript(`
                if (window.__RS_FORCE_SYNC) {
                    window.__RS_FORCE_SYNC("${protectionMode}", ${rehydrateEnabled});
                } else {
                    window.__RyzenShieldRehydrate = ${rehydrateEnabled};
                    window.__RyzenShieldMode = "${protectionMode}";
                }
                console.log("[RyzenShield] Dashboard Sync -> Mode=${protectionMode}, Reveal=${rehydrateEnabled}");
            `).catch(() => { });
        }
    }, [rehydrateEnabled, protectionMode, domReady]);

    const activateLiveAudioVault = () => {
        setShowAudioConsent(false);
        setLiveAudioActive(true);
        showToast("🎙️ Local Audio Vault Active.", "info");

        const phrases = ["Hey Prof.", "My Student ID is ", "SID-394857", ", and the key is ", "alpha-tango-7", "."];
        let idx = 0;
        let cumulative = "";

        liveTranscriptTimer.current = setInterval(() => {
            if (idx >= phrases.length) {
                clearInterval(liveTranscriptTimer.current);
                setTimeout(() => { setLiveAudioActive(false); setCurrentTranscript(""); }, 3000);
                return;
            }
            const p = phrases[idx];
            if (p === "SID-394857" || p === "alpha-tango-7") {
                setAudioBleep(true);
                setTimeout(() => setAudioBleep(false), 500);
                cumulative += `<span class='text-orange-500 font-bold bg-orange-500/20 px-1 rounded'>[RS-TOKEN-${idx}]</span>`;
            } else { cumulative += p; }
            setCurrentTranscript(cumulative);
            idx++;
        }, 2000);
    };

    const handleNavigate = (e) => {
        if (e.key === 'Enter') {
            let target = inputUrl;
            if (!target.startsWith('http')) target = 'https://' + target;
            setUrl(target);
        }
    };

    return (
        <div className={`flex flex-col absolute inset-0 bg-[#0c0c0c] ${isActive ? 'flex' : 'hidden'}`}>
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ y: -50, opacity: 0, x: "-50%" }} animate={{ y: 20, opacity: 1, x: "-50%" }} exit={{ y: -50, opacity: 0, x: "-50%" }} className="absolute top-0 left-1/2 z-[100]">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${toast.type === 'warn' ? 'bg-orange-600/20 border-orange-500/50 text-white' : 'bg-green-600/20 border-green-500/50 text-white'}`}>
                            <div className="p-2 rounded-xl bg-black/40 text-orange-500"><ShieldCheck size={20} /></div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">RyzenShield Intel</h4>
                                <p className="text-xs font-bold">{toast.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-[#0c0c0c] border-b border-neutral-800/60 p-4 space-y-3">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-neutral-800/60 order-1">
                        <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20"><Shield size={14} className="text-orange-500" /></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Sentinel</span>
                    </div>
                    <div className="flex gap-1.5 order-2">
                        <NavBtn icon={ChevronLeft} onClick={() => webviewRef.current?.goBack()} />
                        <NavBtn icon={ChevronRight} onClick={() => webviewRef.current?.goForward()} />
                        <NavBtn icon={RotateCcw} onClick={() => { webviewRef.current?.reload(); setInjected(false); }} />
                    </div>
                    <div className={`flex-1 flex items-center bg-black border rounded-2xl px-4 py-2 gap-3 group ${isFocused ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : siteSafety === 'suspicious' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-neutral-800/50'}`}>
                        <div className={`w-1 h-3 rounded-full ${siteSafety === 'secure' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                        <input className="flex-1 bg-transparent border-none outline-none text-xs text-neutral-200 font-medium placeholder:text-neutral-700 w-full" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} onKeyDown={handleNavigate} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} />
                        <div className="flex items-center gap-3">
                            {isLoading && <RotateCcw size={14} className="text-orange-500 animate-spin" />}
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-green-500">
                                <ShieldCheck size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{siteSafety === 'secure' ? 'Encrypted' : 'Compromised'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-6 order-3 px-4 py-2 bg-black border border-neutral-800/60 rounded-3xl backdrop-blur-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end mr-1"><span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">NPU Shield</span><span className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none">Protection</span></div>
                            <div className="flex items-center p-1 bg-white/[0.03] rounded-xl border border-white/5">
                                <IconButton active={protectionMode === 'consent'} onClick={() => setProtectionMode('consent')} icon={UserCheck} color="orange" title="Consent Mode" />
                                <IconButton active={protectionMode === 'auto'} onClick={() => setProtectionMode('auto')} icon={Cpu} color="orange" title="Auto Protection" />
                            </div>
                        </div>
                        <div className="w-[1px] h-6 bg-neutral-800" />
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-start ml-1 order-2"><span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Data Vault</span><span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest leading-none">Reveal</span></div>
                            <div className="flex items-center p-1 bg-white/[0.03] rounded-xl border border-white/5 order-1">
                                <IconButton
                                    active={rehydrateEnabled}
                                    onClick={() => {
                                        console.log("[RyzenShield-UI] Clicked Reveal Secrets (Active: " + rehydrateEnabled + ")");
                                        setRehydrateEnabled(true);
                                        if (webviewRef.current) {
                                            webviewRef.current.executeJavaScript(`
                                                if (window.__RS_FORCE_SYNC) window.__RS_FORCE_SYNC("${protectionMode}", true);
                                                window.__RyzenShieldRehydrate = true;
                                            `).catch(() => { });
                                        }
                                    }}
                                    icon={Eye}
                                    color="cyan"
                                    title="Reveal Patterns"
                                />
                                <IconButton
                                    active={!rehydrateEnabled}
                                    onClick={() => {
                                        console.log("[RyzenShield-UI] Clicked Hide (Shadow) (Active: " + rehydrateEnabled + ")");
                                        setRehydrateEnabled(false);
                                        if (webviewRef.current) {
                                            webviewRef.current.executeJavaScript(`
                                                if (window.__RS_FORCE_SYNC) window.__RS_FORCE_SYNC("${protectionMode}", false);
                                                window.__RyzenShieldRehydrate = false;
                                            `).catch(() => { });
                                        }
                                    }}
                                    icon={EyeOff}
                                    color="cyan"
                                    title="Shadow Patterns"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative bg-white flex flex-col">
                <div ref={containerRef} className="flex-1 w-full" />
                <div className="shrink-0 h-12 bg-[#050505] border-t border-neutral-900 flex items-center justify-between px-6 z-40">
                    <button onClick={() => { setShowHygieneModal(true); if (!burnerData) fetch('http://127.0.0.1:9000/vault/generate-burner').then(r => r.json()).then(setBurnerData); }} className="flex items-center gap-2 px-3 py-1 bg-orange-600/10 rounded-lg border border-orange-500/30 text-orange-500 hover:bg-orange-500/20 transition-all">
                        <UserPlus size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Digital Hygiene</span>
                    </button>
                    <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${injected ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}>
                        <Zap size={12} className={injected ? 'text-green-500 animate-pulse' : ''} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{injected ? 'NPU Protected' : 'XDNA Offline'}</span>
                    </div>
                </div>
                <AnimatePresence>
                    {liveAudioActive && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 w-4/5 max-w-xl z-50">
                            <div className={`p-4 rounded-2xl backdrop-blur-2xl border flex flex-col items-center transition-all ${audioBleep ? 'bg-red-500/30 border-red-500/50 scale-105' : 'bg-black/60 border-neutral-700/50'}`}>
                                <div className="text-[10px] uppercase font-black text-green-500 mb-2">Live Ryzen Transcript</div>
                                <div className="text-white text-lg font-medium text-center" dangerouslySetInnerHTML={{ __html: currentTranscript }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showHygieneModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-black text-white">Digital Identity Shield</h3>
                                <button onClick={() => setShowHygieneModal(false)} className="text-neutral-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="space-y-3">
                                {burnerData ? Object.entries(burnerData).map(([l, v]) => (
                                    <div key={l} className="bg-black/50 border border-neutral-800 rounded-xl p-3 flex justify-between items-center text-xs">
                                        <div className="uppercase text-neutral-500 font-bold">{l}</div>
                                        <div className="font-mono text-white">{v}</div>
                                    </div>
                                )) : <div className="text-center p-4 text-neutral-500 uppercase text-xs">Loading...</div>}
                                <button onClick={() => setShowHygieneModal(false)} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl mt-4">Close Shield</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const IconButton = ({ active, onClick, icon: Icon, color, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`p-2 rounded-xl transition-all relative z-10 ${active ? (color === 'orange' ? 'text-orange-500 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'text-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(6,182,212,0.3)]') : 'text-neutral-600 hover:text-neutral-400'}`}
    >
        <Icon size={14} />
    </button>
);

const NavBtn = ({ icon: Icon, onClick }) => (
    <button onClick={onClick} className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:text-white text-neutral-500 rounded-xl transition-all active:scale-95"><Icon size={16} /></button>
);

const SecureBrowser = () => {
    const [tabs, setTabs] = useState([{ id: 1, title: 'Ryzen Sandbox', url: 'https://chatgpt.com' }]);
    const [activeId, setActiveId] = useState(1);
    const addTab = () => { const id = Date.now(); setTabs([...tabs, { id, title: 'New Tab', url: 'https://google.com' }]); setActiveId(id); };
    const closeTab = (id) => { if (tabs.length > 1) { const nt = tabs.filter(t => t.id !== id); setTabs(nt); if (activeId === id) setActiveId(nt[0].id); } };

    return (
        <div className="flex flex-col h-full bg-black rounded-3xl overflow-hidden border border-neutral-800/60 shadow-2xl">
            <div className="flex items-center bg-black/40 pt-3 px-4 gap-2 border-b border-neutral-800/80">
                {tabs.map(t => (
                    <div key={t.id} onClick={() => setActiveId(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl cursor-pointer min-w-[120px] transition-all ${activeId === t.id ? 'bg-[#0c0c0c] text-white border-t border-x border-neutral-800/60' : 'text-neutral-600 hover:text-neutral-400'}`}>
                        <Globe size={12} /><span className="text-[10px] font-black uppercase tracking-widest truncate flex-1">{t.title}</span>
                        <X size={10} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} />
                    </div>
                ))}
                <Plus size={16} className="text-neutral-600 hover:text-white cursor-pointer ml-2 mb-2" onClick={addTab} />
            </div>
            <div className="flex-1 relative">
                {tabs.map(t => <BrowserInstance key={t.id} isActive={activeId === t.id} initialUrl={t.url} onTitleChange={(title) => setTabs(ts => ts.map(x => x.id === t.id ? { ...x, title } : x))} />)}
            </div>
        </div>
    );
};

export default SecureBrowser;
