import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ShieldCheck, Mail, Info, RefreshCw, Zap, Shield, Bug, ArrowRight, ServerCrash, Skull, CheckCircle } from 'lucide-react';

const PhishingSandbox = () => {
    const [threatText, setThreatText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleAnalyze = async () => {
        if (!threatText.trim()) return;

        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const res = await fetch('http://127.0.0.1:9000/vault/analyze-threat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: threatText })
            });

            if (res.ok) {
                const data = await res.json();
                setTimeout(() => {
                    setAnalysis(data);
                    setIsAnalyzing(false);
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            setIsAnalyzing(false);
        }
    };

    const loadSample = () => {
        setThreatText("URGENT: Your student portal access has been temporarily restricted due to a billing error. To maintain your class registration, please verify your identity immediately by clicking here: http://secure-update-ryzenshield.xyz/login. \n\nThank you,\nUniversity IT Support");
        setAnalysis(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#050200] overflow-y-auto custom-scrollbar selection:bg-orange-500/30 font-mono relative">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(249, 115, 22, 0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Standardized Header */}
            <div className="flex items-center justify-between bg-[#110500]/90 backdrop-blur-md border-b border-orange-500/20 px-6 py-3 shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <AlertTriangle size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Threat Sandbox</h1>
                        <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.2em] mt-1 font-sans">Social Engineering Forensic Engine</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center">

                {/* Top Input Module */}
                <motion.div
                    layout
                    className="bg-[#0c0400] border border-orange-500/30 p-1 relative shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden w-full max-w-4xl"
                >
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-0" />

                    <div className="bg-[#050200] p-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-orange-500">
                                <Mail size={16} />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Target Communication</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={loadSample}
                                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 uppercase tracking-widest transition-colors flex items-center gap-2 px-3 py-1 border border-orange-500/30 rounded bg-orange-500/5 hover:bg-orange-500/20"
                                >
                                    <Bug size={12} /> Inject Sample Spam
                                </button>
                                <button
                                    onClick={() => { setThreatText(''); setAnalysis(null); }}
                                    className="text-[10px] font-bold text-neutral-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                                >
                                    Clear Buffer
                                </button>
                            </div>
                        </div>

                        <div className="relative group">
                            <textarea
                                value={threatText}
                                onChange={(e) => setThreatText(e.target.value)}
                                placeholder="PASTE SUSPICIOUS EMAIL, SMS, OR LINK HERE..."
                                className={`w-full bg-[#0c0400] border p-6 text-neutral-300 font-mono text-sm resize-none focus:outline-none transition-all placeholder:text-orange-500/20 leading-relaxed shadow-inner
                                    ${analysis ? 'h-32 border-orange-500/10 focus:border-orange-500/30' : 'h-64 border-orange-500/30 focus:border-orange-500'}`}
                                spellCheck="false"
                            />
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={!threatText.trim() || isAnalyzing}
                                className={`px-8 py-3 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border
                                    ${!threatText.trim() ? 'bg-[#110500] text-orange-900 border-orange-900/50 cursor-not-allowed' :
                                        isAnalyzing ? 'bg-orange-600/20 text-orange-500 border-orange-500 cursor-wait shadow-[0_0_20px_rgba(249,115,22,0.3)]' :
                                            'bg-orange-600 hover:bg-orange-500 text-black border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)] active:scale-95'}`}
                            >
                                {isAnalyzing ? (
                                    <><RefreshCw size={14} className="animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Zap size={14} /> Trigger NPU Scan</>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Analysis State Module */}
                <AnimatePresence mode="wait">
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="bg-orange-500/5 border border-orange-500/20 p-8 flex flex-col items-center justify-center overflow-hidden w-full max-w-4xl"
                        >
                            <ServerCrash size={48} className="text-orange-500 animate-[bounce_2s_infinite] mb-6 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                            <div className="w-96 space-y-4">
                                <div className="h-1 w-full bg-black overflow-hidden relative border border-orange-500/30">
                                    <motion.div
                                        initial={{ x: "-100%" }} animate={{ x: "100%" }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="absolute inset-y-0 w-1/2 bg-orange-500 shadow-[0_0_10px_#f97316]"
                                    />
                                </div>
                                <div className="text-center text-xs font-bold text-orange-500 uppercase tracking-[0.3em] animate-pulse">
                                    Decompiling Psychological Vectors...
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {analysis && !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl relative"
                        >
                            {/* Left Column: Risk & Recommendation */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <div className={`p-6 border relative overflow-hidden flex flex-col items-center justify-center text-center
                                    ${analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH' ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' :
                                        analysis.risk_level === 'MEDIUM' ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-green-500/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]'}
                                `}>
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

                                    <div className={`mb-4 p-4 rounded-full border border-current bg-black/50 ${analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH' ? 'text-red-500' :
                                        analysis.risk_level === 'MEDIUM' ? 'text-orange-500' : 'text-green-500'
                                        }`}>
                                        {analysis.risk_level === 'LOW' ? <CheckCircle size={48} /> : <Skull size={48} />}
                                    </div>

                                    <h3 className="text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-bold mb-2">Calculated Threat Level</h3>
                                    <div className={`text-5xl font-black uppercase tracking-tighter ${analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH' ? 'text-red-500' :
                                        analysis.risk_level === 'MEDIUM' ? 'text-orange-500' : 'text-green-500'
                                        }`}>
                                        {analysis.risk_level}
                                    </div>
                                </div>

                                {analysis.risk_level !== 'LOW' && (
                                    <div className="p-6 bg-[#0c0400] border-l-4 border-l-orange-500 border-t border-r border-b border-t-orange-500/20 border-r-orange-500/20 border-b-orange-500/20 relative overflow-hidden group">
                                        <div className="absolute right-0 bottom-0 text-orange-500/5 pointer-events-none group-hover:text-orange-500/10 transition-colors">
                                            <ShieldAlert size={80} className="-mr-4 -mb-4 transform rotate-12" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                            <Shield size={14} /> Tactical Directive
                                        </h4>
                                        <p className="text-sm text-neutral-300 font-sans leading-relaxed relative z-10">
                                            Sever interaction immediately. Do not click any embedded links or download attachments. Verify the sender's identity through out-of-band communication channels if necessary.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Identified Vectors */}
                            <div className="lg:col-span-2 bg-[#0c0400] border border-orange-500/20 p-8 shadow-xl relative overflow-hidden">
                                {/* Technical decorative graph in background */}
                                <div className="absolute bottom-0 right-0 w-64 h-32 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(249, 115, 22, 0.5) 20px), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(249, 115, 22, 0.5) 20px)' }} />

                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-orange-500/20 relative z-10">
                                    <ArrowRight size={20} className="text-orange-500" />
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest font-sans">Behavioral Pattern Analysis</h4>
                                </div>

                                {analysis.flags.length > 0 ? (
                                    <div className="space-y-4 relative z-10">
                                        {analysis.flags.map((flag, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 + 0.3 }}
                                                key={idx} className="bg-black/80 border border-orange-500/10 p-5 relative group hover:border-orange-500/40 transition-colors backdrop-blur-sm"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-start gap-4 pl-3">
                                                    <div className="mt-1 text-orange-500 bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20 shadow-inner">
                                                        <Info size={16} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-white uppercase tracking-wider mb-2 font-sans">{flag.title}</h5>
                                                        <p className="text-xs text-neutral-400 leading-relaxed font-sans">{flag.explanation}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-green-500/5 border border-green-500/30 p-8 flex items-start gap-6 relative z-10">
                                        <div className="p-4 bg-green-500/10 rounded-full border border-green-500/30 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <div>
                                            <h5 className="text-base font-black text-green-400 uppercase tracking-widest mb-2 font-sans">No Malicious Heuristics</h5>
                                            <p className="text-sm text-green-500/80 leading-relaxed font-sans">The NPU text parser did not flag any obvious urgency, impersonation, or obfuscation vectors in this payload. Continue with standard operational procedures.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PhishingSandbox;
