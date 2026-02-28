import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Lock, ShieldCheck, Globe, Zap, Search, Shield, ChevronLeft, ChevronRight, RotateCcw, UserCheck, Cpu, Eye, EyeOff, UserPlus, Info, Check, Copy, Mic, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BrowserInstance = ({ isActive, initialUrl = 'https://chatgpt.com', onTitleChange }) => {
    const [url, setUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(initialUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [injected, setInjected] = useState(false);
    const [siteSafety, setSiteSafety] = useState('secure'); // 'secure', 'suspicious', 'unknown'
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [protectionMode, setProtectionMode] = useState('consent'); // 'consent' or 'auto'
    const [rehydrateEnabled, setRehydrateEnabled] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    // Digital Hygiene Companion State
    const [showHygieneModal, setShowHygieneModal] = useState(false);
    const [burnerData, setBurnerData] = useState(null);
    const [isGeneratingBurner, setIsGeneratingBurner] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    // Real-Time Audio Vault Simulation State
    const [showAudioConsent, setShowAudioConsent] = useState(false);
    const [liveAudioActive, setLiveAudioActive] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [audioBleep, setAudioBleep] = useState(false); // Used to trigger visual/audio muted effect

    const webviewRef = useRef(null);
    const containerRef = useRef(null);
    const liveTranscriptTimer = useRef(null);

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

                    const IGNORE_ENDPOINTS = ['/events', '/analytics', '/log', '/metrics', '/telemetry', '/cdn-cgi', '/status', '/ping'];
                    const isTelemetry = (urlStr) => {
                        if (!urlStr) return false;
                        return IGNORE_ENDPOINTS.some(i => urlStr.includes(i));
                    };

                    const originalFetch = window.fetch;
                    window.fetch = async function(...args) {
                        let [resource, config] = args;
                        const url = typeof resource === 'string' ? resource : resource?.url;
                        
                        if (url && (url.includes('9000/') || isTelemetry(url))) return originalFetch(...args);
                        
                        if (config && config.method === 'POST' && config.body) {
                            try {
                                let bodyText = '';
                                if (typeof config.body === 'string') {
                                    bodyText = config.body;
                                } else if (config.body instanceof TextDecoder || config.body.toString() === '[object Object]') {
                                    try { bodyText = JSON.stringify(config.body); } catch(e) {}
                                }
                                
                                if (bodyText && bodyText.length > 0) {
                                    // Use async fetch instead of synchronous XHR to avoid freezing!
                                    const scanRes = await originalFetch('http://127.0.0.1:9000/process_text', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ text: bodyText })
                                    }).catch(e => null);
                                    
                                    if (scanRes && scanRes.ok) {
                                        const result = await scanRes.json();
                                        if (result.sanitized) {
                                            let shouldSanitize = true;
                                            if (window.__RyzenShieldMode === 'consent') {
                                                shouldSanitize = window.confirm("🛡️ AMD Ryzen AI: PII Detected!\\n\\nWe found sensitive information (Email/Key/Phone) in your request.\\n\\nWould you like RyzenShield to sanitize this data before sending?\\n\\n[Click OK to Protect, Cancel to allow raw data]");
                                            }

                                            if (shouldSanitize) {
                                                console.log("[RyzenShield] 🛡️ Shadowing PII with Tokens");
                                                config.body = result.text; // Mutate payload
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                console.error("[RyzenShield] Intercept Error: ", err);
                            }
                        }
                        
                        const response = await originalFetch(resource, config);
                        
                        // 🛡️ RE-HYDRATION (Only if enabled)
                        if (${rehydrateEnabled} && response.ok && url && !url.includes('9000/')) {
                            const contentType = response.headers.get('content-type') || '';
                            // DO NOT attempt to buffer and rehydrate Server-Sent Events (SSE) streams, it blocks the fetch!
                            if (!contentType.includes('text/event-stream')) {
                                const clone = response.clone();
                                try {
                                    const text = await clone.text();
                                    if (text.includes('[RS-')) {
                                        const reXHR = new XMLHttpRequest();
                                        reXHR.open('POST', 'http://127.0.0.1:9000/vault/rehydrate', false);
                                        reXHR.setRequestHeader('Content-Type', 'application/json');
                                        reXHR.send(JSON.stringify({ text }));
                                        if (reXHR.status === 200) {
                                            const res = JSON.parse(reXHR.responseText);
                                            if (res.replaced > 0) {
                                                console.log("[RyzenShield] 💎 Re-hydrated Shadow Tokens locally");
                                                const blob = new Blob([res.text], { type: contentType || 'text/plain' });
                                                return new Response(blob, { status: response.status, headers: response.headers });
                                            }
                                        }
                                    }
                                } catch (e) {}
                            }
                        }
                        
                        return response;
                    };
                    
                    const originalOpen = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function(method, url) {
                        this._rsMethod = method;
                        this._rsUrl = url;
                        return originalOpen.apply(this, arguments);
                    };

                    const originalSend = XMLHttpRequest.prototype.send;
                    XMLHttpRequest.prototype.send = function(body) {
                        const url = this._rsUrl || '';
                        if (this._rsMethod === 'POST' && body && !url.includes('9000/') && !isTelemetry(url)) {
                            try {
                                let bodyText = body;
                                if (typeof bodyText === 'object') {
                                    try { bodyText = JSON.stringify(bodyText); } catch(e) {}
                                }
                                
                                const scanXHR = new XMLHttpRequest();
                                scanXHR.open('POST', 'http://127.0.0.1:9000/process_text', false);
                                scanXHR.setRequestHeader('Content-Type', 'application/json');
                                scanXHR.send(JSON.stringify({ text: bodyText.toString() }));
                                
                                if (scanXHR.status === 200) {
                                    const result = JSON.parse(scanXHR.responseText);
                                    if (result.sanitized) {
                                        let shouldSanitize = true;
                                        if (window.__RyzenShieldMode === 'consent') {
                                            shouldSanitize = window.confirm("🛡️ AMD Ryzen AI: PII Detected!\\n\\nSanitize with Ryzen AI for your safety?\\n\\n[Click OK for Santization]");
                                        }
                                        if (shouldSanitize) {
                                            arguments[0] = result.text;
                                            console.log("[RyzenShield] 🛡️ XHR Shadowing Active");
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

            try {
                const urlObj = new URL(webview.getURL());
                const hostname = urlObj.hostname.toLowerCase();
                const protocol = urlObj.protocol;

                if (onTitleChange) {
                    onTitleChange(webview.getTitle() || hostname);
                }

                // 🛡️ Ryzen AI Phishing Detection Engine
                const suspiciousPatterns = [
                    'free-ai', 'openai-login', 'chat-gpt', 'gemini-bonus',
                    'meta-ai-auth', 'claude-pro-free', 'wallet-connect',
                    'airdrop', 'login-verify', 'secure-update'
                ];

                const untrustedTLDs = ['.xyz', '.top', '.pw', '.live', '.online', '.site', '.monster'];

                let riskScore = 0;

                // 1. Check for Typosquatting/Keywords
                if (suspiciousPatterns.some(p => hostname.includes(p))) riskScore += 50;

                // 2. Check for suspicious TLDs on AI keywords
                if (untrustedTLDs.some(tld => hostname.endsWith(tld)) &&
                    (hostname.includes('ai') || hostname.includes('gpt') || hostname.includes('cloud'))) {
                    riskScore += 40;
                }

                // 3. Check for gibberish/length (DGA detection)
                const mainDomain = hostname.split('.').slice(-2, -1)[0] || "";
                if (mainDomain.length > 20) riskScore += 30;
                if (/[0-9]{3,}/.test(mainDomain)) riskScore += 20; // Multiple numbers in domain

                // 4. Insecure Protocol
                if (protocol === 'http:') riskScore += 30;

                // 5. Known Safe List (Overrides)
                const isKnownSafe = hostname.includes('chatgpt.com') ||
                    hostname.includes('gemini.google.com') ||
                    hostname.includes('anthropic.com') ||
                    hostname.includes('google.com') ||
                    hostname.includes('microsoft.com') ||
                    hostname.includes('github.com');

                if (isKnownSafe) {
                    setSiteSafety('secure');
                } else if (riskScore >= 50) {
                    setSiteSafety('suspicious');
                    showToast("🚨 PHISHING ALERT: This site shows patterns of credential theft or typosquatting. Ryzen AI has engaged extra hardening.", "warn");
                } else {
                    setSiteSafety('secure');
                }

                // 🎙️ Zoom/Meetings Detection for Live Audio Vault
                if ((hostname.includes('zoom.us') || hostname.includes('meet.google.com') || hostname.includes('teams.microsoft.com') || hostname.includes('discord.com')) && !liveAudioActive) {
                    setShowAudioConsent(true);
                }

            } catch (e) {
                setSiteSafety('unknown');
            }
        };

        webview.addEventListener('did-start-loading', () => setIsLoading(true));
        webview.addEventListener('did-stop-loading', handleLoad);
        webview.addEventListener('console-message', (e) => {
            console.log(`[Webview] ${e.message}`);
            if (e.message.includes('pii-detected')) {
                showToast("PII detected! Ryzen AI sanitized the payload before it left your device.", "warn");
            }
        });

        return () => {
            webview.removeEventListener('did-start-loading', () => setIsLoading(true));
            webview.removeEventListener('did-stop-loading', handleLoad);
            if (container.firstChild) container.removeChild(container.firstChild);
            if (liveTranscriptTimer.current) clearInterval(liveTranscriptTimer.current);
        };
    }, [url, protectionMode, rehydrateEnabled]);

    const activateLiveAudioVault = () => {
        setShowAudioConsent(false);
        setLiveAudioActive(true);
        showToast("🎙️ Local Audio Vault Active. Monitoring outgoing microphone feed.", "info");

        // Simulate a student talking in a meeting and accidentally sharing PII
        const fakeSubtitles = [
            "Hey Professor, thanks for letting me join the office hours.",
            "I was looking at the syllabus for next week...",
            "By the way, my student ID number is ",
            "SID-394857", // The PII
            ", can you check if my grade updated?",
            "Also, I'm having trouble logging into the bio server.",
            "The password is still ",
            "alpha-tango-7", // The PII
            " right? Thanks!"
        ];

        let index = 0;
        let cumulativeText = "";

        const generateSubtitles = () => {
            if (index >= fakeSubtitles.length) {
                clearInterval(liveTranscriptTimer.current);
                setTimeout(() => {
                    setLiveAudioActive(false);
                    setCurrentTranscript("");
                }, 4000);
                return;
            }

            const nextPhrase = fakeSubtitles[index];

            // If the next phrase is PII, trigger the NPU block instantly
            if (nextPhrase === "SID-394857" || nextPhrase === "alpha-tango-7") {
                setAudioBleep(true); // Triggers visual red "BLEEP" status
                setTimeout(() => setAudioBleep(false), 800);

                const shadowToken = nextPhrase === "SID-394857" ? "[RS-USER-01]" : "[RS-CREDS-02]";
                cumulativeText += `<span class='text-orange-500 font-bold bg-orange-500/20 px-1 rounded'>${shadowToken}</span>`;
            } else {
                cumulativeText += nextPhrase;
            }

            setCurrentTranscript(cumulativeText);
            index++;
        };

        liveTranscriptTimer.current = setInterval(generateSubtitles, 2500);
    };

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

    const generateBurner = async () => {
        setIsGeneratingBurner(true);
        try {
            const res = await fetch('http://127.0.0.1:9000/vault/generate-burner');
            if (res.ok) {
                const data = await res.json();
                setBurnerData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeneratingBurner(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className={`flex flex-col absolute inset-0 bg-[#0c0c0c] ${isActive ? 'flex' : 'hidden'}`}>

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

                    {/* Protection Toggles - Neural Cluster */}
                    <div className="hidden lg:flex items-center gap-6 order-3 px-4 py-2 bg-black/40 border border-neutral-800/60 rounded-[1.5rem] backdrop-blur-2xl shadow-2xl">

                        {/* Input Privacy (Shield) */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Sensitive</span>
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] leading-none">Shadow</span>
                            </div>
                            <div className="flex items-center p-1 bg-white/[0.03] rounded-xl border border-white/5">
                                <IconButton
                                    active={protectionMode === 'consent'}
                                    onClick={() => setProtectionMode('consent')}
                                    icon={UserCheck}
                                    color="orange"
                                />
                                <IconButton
                                    active={protectionMode === 'auto'}
                                    onClick={() => setProtectionMode('auto')}
                                    icon={Cpu}
                                    color="orange"
                                />
                            </div>
                        </div>

                        {/* Middle Divider */}
                        <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />

                        {/* Output Reality (Shadow) */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-start ml-1 order-2">
                                <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Personal</span>
                                <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] leading-none">Reveal</span>
                            </div>
                            <div className="flex items-center p-1 bg-white/[0.03] rounded-xl border border-white/5 order-1">
                                <IconButton
                                    active={rehydrateEnabled}
                                    onClick={() => setRehydrateEnabled(true)}
                                    icon={Eye}
                                    color="cyan"
                                />
                                <IconButton
                                    active={!rehydrateEnabled}
                                    onClick={() => setRehydrateEnabled(false)}
                                    icon={EyeOff}
                                    color="cyan"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Actual Browser View with NPU Active Badge */}
            <div className="flex-1 relative bg-white flex flex-col">
                {/* The WebView Container */}
                <div ref={containerRef} className="flex-1 w-full" />

                {/* Dedicated Status Bar (Prevents overlapping with Website UI like ChatGPT input) */}
                <div className="shrink-0 h-14 bg-neutral-950 border-t border-neutral-900 flex items-center justify-between px-6 z-40">
                    {/* Digital Hygiene Companion UI */}
                    <button
                        onClick={() => {
                            setShowHygieneModal(true);
                            if (!burnerData) generateBurner();
                        }}
                        className="group flex items-center gap-3 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-500/30 rounded-xl border border-orange-500/30 transition-all active:scale-95"
                    >
                        <UserPlus size={16} className="text-orange-500" />
                        <div className="text-left hidden sm:block mt-0.5">
                            <div className="text-[10px] font-black uppercase tracking-widest leading-none text-orange-400">Digital Hygiene Tool</div>
                            <div className="text-[7px] font-bold text-orange-500/70 uppercase mt-0.5">Generate Safe Identity</div>
                        </div>
                    </button>

                    {/* NPU Active Badge */}
                    <motion.div
                        animate={{
                            boxShadow: injected ? ["0 0 10px rgba(249,115,22,0.1)", "0 0 20px rgba(249,115,22,0.2)", "0 0 10px rgba(249,115,22,0.1)"] : "none"
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${injected ? 'bg-orange-500/10 border-orange-500/30' : 'bg-neutral-900 border-neutral-800'
                            }`}
                    >
                        <Zap size={14} className={injected ? 'text-orange-500 animate-pulse' : 'text-neutral-500'} />
                        <div className="text-left mt-0.5">
                            <div className={`text-[9px] font-black uppercase tracking-widest leading-none ${injected ? 'text-white' : 'text-neutral-500'}`}>
                                {injected ? 'XDNA Engine Active' : 'Sensing Flow...'}
                            </div>
                            <div className="text-[7px] font-bold text-neutral-600 uppercase mt-0.5">Local Intercept Mode</div>
                        </div>
                    </motion.div>
                </div>

                {/* Live Transcript Overlay (Active when in a meeting) */}
                <AnimatePresence>
                    {liveAudioActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-4/5 max-w-2xl pointer-events-none z-40"
                        >
                            <div className={`p-4 rounded-2xl backdrop-blur-xl border flex flex-col items-center text-center transition-all duration-300 ${audioBleep ? 'bg-red-500/20 border-red-500/50 scale-[1.02]' : 'bg-black/60 border-neutral-700/50'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {audioBleep ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                            <span className="text-[10px] uppercase font-black tracking-widest text-red-500">NPU Intercept: Outgoing Audio Muted</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => (
                                                    <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} className="w-1 bg-green-500 rounded-full" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-green-500">Live NPU Transcript</span>
                                        </>
                                    )}
                                </div>
                                <div
                                    className="text-white text-lg font-medium leading-relaxed drop-shadow-md min-h-[60px]"
                                    dangerouslySetInnerHTML={{ __html: currentTranscript }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Audio Vault Teach-Back / Consent Modal */}
            <AnimatePresence>
                {showAudioConsent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                                        <Mic className="text-blue-500" /> Live Communications Detected
                                    </h3>
                                    <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-mono">Ryzen Local Audio Vault</p>
                                </div>
                                <button onClick={() => setShowAudioConsent(false)} className="text-neutral-500 hover:text-white p-1">
                                    <svg width="14" height="14" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            </div>

                            <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 mb-6 relative z-10">
                                <div className="flex gap-3">
                                    <Info className="text-blue-500 shrink-0" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-500 mb-1">Explainable Security Notice</h4>
                                        <p className="text-xs text-blue-200/70 leading-relaxed">
                                            You are entering a meeting platform (Zoom/Teams/Meet). Live transcripts and recordings are often stored on third-party cloud servers indefinitely.
                                            <br /><br />
                                            Do you want to enable the <strong>Ryzen AI Audio Vault</strong>? It will locally scan your microphone feed and instantly "bleep" or blur sensitive information before it leaves your device.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 relative z-10">
                                <button
                                    onClick={() => setShowAudioConsent(false)}
                                    className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-bold rounded-xl transition-all border border-neutral-700"
                                >
                                    No Thanks
                                </button>
                                <button
                                    onClick={activateLiveAudioVault}
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex justify-center items-center gap-2"
                                >
                                    <ShieldCheck size={16} /> Enable Live Vault
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Explanatory Security / Consent Modal */}
            <AnimatePresence>
                {showHygieneModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                                        <ShieldCheck className="text-orange-500" /> Digital Hygiene Shield
                                    </h3>
                                    <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-mono">Consent-First Burner Identity</p>
                                </div>
                                <button onClick={() => setShowHygieneModal(false)} className="text-neutral-500 hover:text-white p-1">
                                    <svg width="14" height="14" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            </div>

                            {/* Explainable Security Panel */}
                            <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-4 mb-6 relative z-10">
                                <div className="flex gap-3">
                                    <Info className="text-orange-500 shrink-0" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-500 mb-1">Why use a Burner Profile?</h4>
                                        <p className="text-xs text-orange-200/70 leading-relaxed">
                                            Untrusted sites (like student clubs or random pdf tools) often suffer data breaches.
                                            Ryzen AI generated this synthetic persona locally. Use it for sign-ups so your real university email and phone number remain totally isolated from hackers.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* The Generated Data */}
                            <div className="space-y-3 relative z-10">
                                {isGeneratingBurner || !burnerData ? (
                                    <div className="py-8 text-center flex flex-col items-center">
                                        <RefreshCw className="text-orange-500 animate-spin mb-3" size={24} />
                                        <div className="text-xs text-neutral-400 font-mono">XDNA Engine synthesizing persona...</div>
                                    </div>
                                ) : (
                                    <>
                                        {Object.entries({
                                            'Full Name': burnerData.name,
                                            'Alias Email': burnerData.email,
                                            'Phone Number': burnerData.phone,
                                            'Dorm Address': burnerData.address,
                                            'Student ID': burnerData.student_id
                                        }).map(([label, value]) => (
                                            <div key={label} className="bg-black/50 border border-neutral-800 rounded-xl p-3 flex justify-between items-center group">
                                                <div className="min-w-0 pr-4">
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">{label}</div>
                                                    <div className="text-sm font-mono text-white truncate">{value}</div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(value, label)}
                                                    className={`p-2 rounded-lg transition-all shrink-0 ${copiedField === label ? 'bg-green-500/20 text-green-500' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'}`}
                                                >
                                                    {copiedField === label ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        ))}

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                onClick={generateBurner}
                                                className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold rounded-xl transition-all border border-neutral-700 flex justify-center items-center gap-2"
                                            >
                                                <RefreshCw size={14} /> New Persona
                                            </button>
                                            <button
                                                onClick={() => setShowHygieneModal(false)}
                                                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const IconButton = ({ active, onClick, icon: Icon, color }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-xl transition-all relative ${active
            ? (color === 'orange' ? 'text-orange-500 bg-orange-500/10' : 'text-cyan-400 bg-cyan-400/10')
            : 'text-neutral-600 hover:text-neutral-400'
            }`}
    >
        {active && (
            <motion.div
                layoutId={`active-tab-${color}`}
                className={`absolute inset-0 rounded-xl border-2 ${color === 'orange' ? 'border-orange-500/50' : 'border-cyan-400/50'}`}
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <Icon size={14} className="relative z-10" />
    </button>
);

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

const SecureBrowser = () => {
    const [tabs, setTabs] = useState([{ id: 1, title: 'Ryzen Sandbox', url: 'https://chatgpt.com' }]);
    const [activeTabId, setActiveTabId] = useState(1);

    const addTab = () => {
        const newId = Date.now();
        setTabs([...tabs, { id: newId, title: 'New Tab', url: 'https://google.com' }]);
        setActiveTabId(newId);
    };

    const closeTab = (e, id) => {
        e.stopPropagation();
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) setActiveTabId(newTabs[0].id);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden border border-neutral-800/60 shadow-2xl relative">
            {/* Tabs Bar */}
            <div className="flex items-center bg-[#050505] pt-3 px-4 gap-2 overflow-x-auto custom-scrollbar border-b border-neutral-800/80 shrink-0">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`group flex items-center gap-2 px-4 py-2.5 rounded-t-2xl cursor-pointer min-w-[140px] max-w-[220px] border-t border-x transition-colors relative
                            ${activeTabId === tab.id
                                ? 'bg-[#0c0c0c] border-neutral-800/60 text-white z-10'
                                : 'bg-transparent border-transparent text-neutral-600 hover:bg-neutral-900/50 hover:text-neutral-400 z-0'}`}
                    >
                        <Globe size={12} className={activeTabId === tab.id ? 'text-orange-500' : 'text-neutral-600'} />
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate flex-1">{tab.title}</span>
                        <button
                            onClick={(e) => closeTab(e, tab.id)}
                            className={`p-1 rounded-md transition-all ${activeTabId === tab.id ? 'opacity-100 hover:bg-neutral-800' : 'opacity-0 group-hover:opacity-100 hover:bg-neutral-800'}`}
                        >
                            <X size={12} className="hover:text-red-500" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={addTab}
                    className="p-2 text-neutral-600 hover:text-white hover:bg-neutral-900 rounded-xl transition-all ml-1 mb-1"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Browser Instances Layer */}
            <div className="flex-1 relative bg-black">
                {tabs.map(tab => (
                    <BrowserInstance
                        key={tab.id}
                        isActive={activeTabId === tab.id}
                        initialUrl={tab.url}
                        onTitleChange={(title) => {
                            setTabs(ts => ts.map(t => t.id === tab.id ? { ...t, title } : t));
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default SecureBrowser;
