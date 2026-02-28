import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Globe, Bell, User, Cpu, Info, Check, Plus, Trash2, Zap, ArrowRight, HelpCircle, HardDrive, Network, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
    const [securityLevel, setSecurityLevel] = useState('High');
    const [trustedUrls, setTrustedUrls] = useState(['canvas.instructure.com', 'blackboard.com', 'piazza.com']);
    const [newUrl, setNewUrl] = useState('');
    const [hardwareOffload, setHardwareOffload] = useState(true);

    const addUrl = () => {
        if (newUrl && !trustedUrls.includes(newUrl)) {
            setTrustedUrls([...trustedUrls, newUrl]);
            setNewUrl('');
        }
    };

    const removeUrl = (url) => {
        setTrustedUrls(trustedUrls.filter(u => u !== url));
    };

    return (
        <div className="h-full flex flex-col bg-[#050200] overflow-hidden selection:bg-orange-500/30 font-mono relative">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Standardized Header */}
            <div className="flex items-center justify-between bg-[#110500]/90 backdrop-blur-md border-b border-orange-500/20 px-6 py-3 shrink-0 relative z-10 w-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 shadow-inner">
                        <SettingsIcon size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Control Center</h1>
                        <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.2em] mt-1 font-sans">Local NPU Configuration Matrix</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right flex flex-col items-end">
                        <div className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest mb-1">Engine Status</div>
                        <div className="text-[10px] bg-green-500/10 border border-green-500/30 px-3 py-1 rounded font-black text-green-500 flex items-center gap-2 justify-end uppercase tracking-widest shadow-inner">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" /> OPTIMIZED
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 custom-scrollbar scroll-smooth">

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">

                    {/* Left Column: Protection Profiles & Hardware */}
                    <div className="xl:col-span-7 flex flex-col gap-8">

                        {/* 🛡️ Protection Profiles */}
                        <div className="bg-[#0c0400] border border-orange-500/20 p-8 relative shadow-xl overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Shield size={160} className="text-orange-500 rotate-12" />
                            </div>

                            <div className="flex items-center gap-3 mb-8 border-b border-orange-500/20 pb-4 relative z-10">
                                <ShieldCheck size={18} className="text-orange-500" />
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white font-sans">Threat Protection Profiles</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4 relative z-10">
                                <SecurityTier
                                    active={securityLevel === 'Standard'}
                                    onClick={() => setSecurityLevel('Standard')}
                                    title="Standard Overwatch"
                                    lvl="v1.0"
                                    desc="Optimized for general browsing. Basic PII masking and cloud diagnostics."
                                    icon={Shield}
                                />
                                <SecurityTier
                                    active={securityLevel === 'High'}
                                    onClick={() => setSecurityLevel('High')}
                                    title="Ryzen AI Pro"
                                    lvl="v2.0"
                                    desc="Deep XDNA utilization. Real-time intercept. Zero-trust heuristic threat analysis."
                                    icon={Zap}
                                    premium
                                />
                            </div>
                        </div>

                        {/* Hardware Control Panel */}
                        <div className="bg-[#0c0400] border border-orange-500/20 flex flex-col relative overflow-hidden flex-1">
                            <div className="bg-orange-500/10 border-b border-orange-500/20 p-2 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2 px-2 text-orange-500 font-black tracking-[0.2em] uppercase text-[10px]">
                                    <Cpu size={12} /> Hardware Acceleration Link
                                </div>
                                <div className="flex gap-1 px-2 opacity-50">
                                    <div className="w-1.5 h-1.5 rounded-sm bg-orange-500 animate-pulse"></div>
                                    <div className="w-1.5 h-1.5 rounded-sm bg-orange-500 delay-75"></div>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col justify-center flex-1 z-10 space-y-8">
                                <div className="flex items-center justify-between bg-black/40 border border-orange-500/10 p-5 rounded">
                                    <div className="space-y-1">
                                        <span className="text-sm font-black text-white tracking-widest uppercase font-sans">Local NPU Offload</span>
                                        <div className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Route privacy scans through XDNA</div>
                                    </div>
                                    <button
                                        onClick={() => setHardwareOffload(!hardwareOffload)}
                                        className={`w-14 h-6 relative transition-all duration-300 border shadow-inner overflow-hidden ${hardwareOffload ? 'bg-orange-500/20 border-orange-500/50' : 'bg-neutral-900 border-neutral-800'}`}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-[length:10px_10px]" />
                                        <motion.div animate={{ x: hardwareOffload ? 32 : 4 }} className={`absolute top-1 bottom-1 w-4 bg-orange-500 shadow-[0_0_10px_#f97316]`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-orange-500/10 bg-[#050200] p-4 flex flex-col">
                                        <span className="text-neutral-500 font-bold uppercase tracking-widest text-[9px] mb-2">Base Latency</span>
                                        <span className="text-2xl font-black text-white font-sans">2.1<span className="text-sm text-neutral-500 ml-1">ms</span></span>
                                    </div>
                                    <div className="border border-green-500/20 bg-green-500/5 p-4 flex flex-col">
                                        <span className="text-green-500/70 font-bold uppercase tracking-widest text-[9px] mb-2">Data Privacy</span>
                                        <span className="text-xl font-black text-green-500 uppercase tracking-widest font-sans mt-1 flex items-center gap-2"><Lock size={16} /> Local</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Trusted Enclaves */}
                    <div className="xl:col-span-5 h-full">
                        <div className="bg-[#0c0400] border border-orange-500/20 p-8 h-full flex flex-col relative overflow-hidden shadow-xl">
                            <div className="absolute bottom-0 right-0 w-64 h-32 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(249, 115, 22, 0.5) 20px), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(249, 115, 22, 0.5) 20px)' }} />

                            <div className="flex items-center gap-3 mb-8 border-b border-orange-500/20 pb-4 relative z-10">
                                <Globe size={18} className="text-orange-500" />
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white font-sans">Zero-Trust Exclusions</h2>
                            </div>

                            <div className="bg-orange-500/5 border-l-2 border-orange-500 p-4 mb-6 relative z-10">
                                <p className="text-[10px] text-orange-200/80 uppercase tracking-wider leading-relaxed font-bold">
                                    Trusted domains bypass the active privacy proxy during exams while keeping deterministic hardware interception active.
                                </p>
                            </div>

                            <div className="relative mb-8 z-10">
                                <input
                                    type="text"
                                    placeholder="ADD TRUSTED DOMAIN..."
                                    className="w-full bg-[#050200] border border-orange-500/30 rounded p-4 pr-32 text-xs font-bold text-orange-400 placeholder-orange-500/30 focus:outline-none focus:border-orange-500 transition-all font-mono uppercase"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                                    spellCheck="false"
                                />
                                <button
                                    onClick={addUrl}
                                    className="absolute right-2 top-2 bottom-2 bg-neutral-900 border border-neutral-700 hover:bg-orange-500 hover:border-orange-400 text-neutral-400 hover:text-black px-6 text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-inner"
                                >
                                    Insert
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                                <div className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest mb-3 flex justify-between border-b border-orange-500/10 pb-2">
                                    <span>Active Platforms Matrix</span>
                                    <span>[ {trustedUrls.length} ALLOWED ]</span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {trustedUrls.map((url) => (
                                            <motion.div
                                                key={url}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="group bg-green-500/5 border border-green-500/20 p-4 flex items-center justify-between hover:bg-green-500/10 transition-colors backdrop-blur-sm relative overflow-hidden"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50 group-hover:bg-green-500 transition-colors" />
                                                <div className="flex items-center gap-3 pl-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-sm shadow-[0_0_8px_#22c55e] animate-pulse" />
                                                    <span className="text-[11px] font-bold text-green-400 font-mono tracking-widest uppercase">{url}</span>
                                                </div>
                                                <button onClick={() => removeUrl(url)} className="p-2 text-green-500/40 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🏁 Footer System Metrics */}
                <footer className="pt-6 border-t border-orange-500/10 flex flex-col md:flex-row justify-between items-baseline gap-4 mt-2 mb-4 shrink-0 px-2 relative z-10">
                    <div className="flex gap-8 text-[9px] font-black text-neutral-600 uppercase tracking-widest">
                        <span>Build: VX-v1.0.4</span>
                        <span className="text-orange-500/60">XDNA Core: SECURE INTERLOCK</span>
                    </div>
                    <div className="text-[10px] font-black text-neutral-700 uppercase tracking-[.4em] italic flex items-center gap-2">
                        <Shield size={10} /> RyzenShield Verified Build
                    </div>
                </footer>
            </div>
        </div>
    );
};

const SecurityTier = ({ active, onClick, title, desc, icon: Icon, premium = false }) => (
    <button
        onClick={onClick}
        className={`
            text-left p-6 border transition-all duration-500 relative overflow-hidden group/tier
            ${active
                ? (premium ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-neutral-800/50 border-neutral-600 shadow-md')
                : 'bg-[#050200] border-orange-500/10 hover:border-orange-500/30'}
        `}
    >
        {active && (
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl opacity-20 ${premium ? 'from-orange-500 to-transparent' : 'from-white to-transparent'}`} />
        )}
        <div className="relative z-10 flex items-start gap-5">
            <div className={`p-4 h-fit border transition-all duration-500 ${active ? (premium ? 'bg-orange-500 border-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-neutral-700 border-neutral-500 text-white') : 'bg-black/50 border-orange-500/10 text-orange-500/40 group-hover/tier:text-orange-500/70 group-hover/tier:border-orange-500/30'}`}>
                <Icon size={24} />
            </div>
            <div className="space-y-2 flex-1 pt-1">
                <div className="flex items-center justify-between">
                    <h3 className={`text-base font-black tracking-widest uppercase font-sans transition-colors ${active ? (premium ? 'text-orange-400' : 'text-neutral-200') : 'text-neutral-500'}`}>
                        {title}
                    </h3>
                    {active && <Check size={16} className={premium ? "text-orange-500" : "text-white"} strokeWidth={3} />}
                </div>
                <p className={`text-[11px] leading-relaxed uppercase tracking-wider font-bold transition-colors duration-500 ${active ? 'text-neutral-400' : 'text-neutral-700'}`}>
                    {desc}
                </p>
            </div>
        </div>
    </button>
);

export default Settings;
