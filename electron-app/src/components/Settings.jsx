import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Globe, Bell, User, Cpu, Info, Check, Plus, Trash2, Zap, ArrowRight, HelpCircle, HardDrive, Network } from 'lucide-react';
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
        <div className="p-6 pb-12 space-y-8 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar scroll-smooth">

            {/* 🎥 Scaled Header */}
            <div className="relative isolate group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 border-b border-neutral-900 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-2 rounded-xl">
                                <SettingsIcon className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Control Center</h1>
                        </div>
                        <p className="text-neutral-500 text-[10px] font-medium tracking-tight uppercase">
                            Configure your local <span className="text-white font-bold">AMD Ryzen™ AI</span> engine.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Engine Status</div>
                            <div className="text-xs font-black text-green-500 flex items-center gap-1.5 justify-end">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> OPTIMIZED
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* 🛡️ Protection Profiles Section */}
                <div className="xl:col-span-12">
                    <div className="bg-[#0c0c0c] border border-neutral-800/60 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Security Level Selection */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-orange-500" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Protection Profiles</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SecurityTier
                                        active={securityLevel === 'Standard'}
                                        onClick={() => setSecurityLevel('Standard')}
                                        title="Standard"
                                        lvl="v1.0"
                                        desc="Optimized for general browsing. Basic PII masking."
                                        icon={Shield}
                                    />
                                    <SecurityTier
                                        active={securityLevel === 'High'}
                                        onClick={() => setSecurityLevel('High')}
                                        title="Ryzen AI Pro"
                                        lvl="v2.0"
                                        desc="Deep XDNA utilization. Real-time threat interception."
                                        icon={Zap}
                                        premium
                                    />
                                </div>
                            </div>

                            {/* Hardware Mini-Panel */}
                            <div className="w-full xl:w-72 bg-neutral-900/30 border border-neutral-800 rounded-[2rem] p-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-600">Hardware</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-neutral-400">NPU Offload</span>
                                        <button
                                            onClick={() => setHardwareOffload(!hardwareOffload)}
                                            className={`w-10 h-5 rounded-full relative transition-all duration-500 ${hardwareOffload ? 'bg-orange-500' : 'bg-neutral-800'}`}
                                        >
                                            <motion.div animate={{ x: hardwareOffload ? 20 : 4 }} className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                                        </button>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-800 flex justify-between text-[9px]">
                                        <span className="text-neutral-600 font-bold uppercase tracking-widest">Latency</span>
                                        <span className="text-orange-500 font-mono font-bold">2.1ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🌐 Trusted Enclaves Section */}
                <div className="xl:col-span-12">
                    <div className="bg-[#0c0c0c] border border-neutral-800/60 rounded-[2.5rem] p-8 flex flex-col xl:flex-row gap-8 relative overflow-hidden">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-neutral-500" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Trusted Safe List</h2>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex gap-3">
                                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                                    Trusted domains bypass the privacy proxy during exams while keeping hardware interception active.
                                </p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Add school domain..."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3.5 px-5 text-xs focus:outline-none focus:border-orange-500 transition-all font-medium placeholder:text-neutral-700"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                                />
                                <button
                                    onClick={addUrl}
                                    className="absolute right-2 top-2 bottom-2 bg-neutral-800 hover:bg-orange-500 text-white px-5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    Add Enclave
                                </button>
                            </div>
                        </div>

                        <div className="w-full xl:w-[350px] space-y-3">
                            <div className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1 flex justify-between">
                                <span>Active Platforms</span>
                                <span>{trustedUrls.length} Count</span>
                            </div>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {trustedUrls.map((url) => (
                                        <motion.div
                                            key={url}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group bg-neutral-900/30 border border-neutral-800 p-3 rounded-xl flex items-center justify-between hover:border-neutral-700 transition-all shadow-xl"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_green]" />
                                                <span className="text-[11px] font-bold text-neutral-400 font-mono tracking-tight">{url}</span>
                                            </div>
                                            <button onClick={() => removeUrl(url)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-700 hover:text-red-500 transition-all">
                                                <Trash2 size={12} />
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
            <footer className="pt-8 border-t border-neutral-900/50 flex flex-col md:flex-row justify-between items-baseline gap-4">
                <div className="flex gap-6 text-[9px] font-black text-neutral-700 uppercase tracking-widest">
                    <span>V1.0.4-Beta</span>
                    <span>XDNA Core 2.1 Active</span>
                </div>
                <div className="text-[10px] font-black text-neutral-800 uppercase tracking-[.4em] italic">
                    RyzenShield Verified
                </div>
            </footer>
        </div>
    );
};

const SecurityTier = ({ active, onClick, title, desc, icon: Icon, lvl, premium = false }) => (
    <button
        onClick={onClick}
        className={`
            text-left p-5 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/tier
            ${active
                ? (premium ? 'bg-orange-500/5 border-orange-500/40 shadow-xl' : 'bg-white/5 border-white/20 shadow-md')
                : 'bg-black/20 border-neutral-900 hover:border-neutral-800'}
        `}
    >
        <div className="relative z-10 flex gap-4">
            <div className={`p-3 h-fit rounded-2xl transition-all duration-500 ${active ? (premium ? 'bg-orange-500 text-white' : 'bg-white text-black') : 'bg-neutral-900 text-neutral-700'}`}>
                <Icon size={18} />
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-black italic tracking-tighter transition-colors ${active ? 'text-white' : 'text-neutral-500'}`}>{title}</h3>
                    {active && <Check size={14} className={premium ? "text-orange-500" : "text-white"} strokeWidth={3} />}
                </div>
                <p className={`text-[10px] leading-relaxed transition-colors duration-500 ${active ? 'text-neutral-400 font-medium' : 'text-neutral-800'}`}>
                    {desc}
                </p>
            </div>
        </div>
    </button>
);

export default Settings;
