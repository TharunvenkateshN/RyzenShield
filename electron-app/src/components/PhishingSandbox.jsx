import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ShieldCheck, Mail, Link as LinkIcon, Info, RefreshCw, ChevronRight, Zap, Shield } from 'lucide-react';

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
                // Artificial delay to simulate deep analysis for the demo
                setTimeout(() => {
                    setAnalysis(data);
                    setIsAnalyzing(false);
                }, 1200);
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
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Threat Sandbox</h1>
                    </div>
                    <p className="text-neutral-400 font-medium">Early-warning and teach-back engine for phishing & social engineering.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Mail size={16} className="text-orange-500" />
                                Suspicious Message Text
                            </h3>
                            <button
                                onClick={loadSample}
                                className="text-xs font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 transition-all active:scale-95"
                            >
                                Load Sample Scam
                            </button>
                        </div>

                        <textarea
                            value={threatText}
                            onChange={(e) => setThreatText(e.target.value)}
                            placeholder="Paste a suspicious email, text message, or DM here..."
                            className="w-full flex-1 bg-black/50 border border-neutral-800 rounded-xl p-4 text-neutral-300 font-mono text-sm resize-none focus:outline-none focus:border-orange-500/50 transition-colors min-h-[250px]"
                        />

                        <button
                            onClick={handleAnalyze}
                            disabled={!threatText.trim() || isAnalyzing}
                            className={`mt-4 w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                                ${!threatText.trim() ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' :
                                    isAnalyzing ? 'bg-orange-600/50 text-white/50 cursor-wait' :
                                        'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20 active:scale-[0.98]'}`}
                        >
                            {isAnalyzing ? (
                                <><RefreshCw size={18} className="animate-spin" /> Analyzing Intent...</>
                            ) : (
                                <><Zap size={18} /> Deep Scan Message</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Teach-Back Analysis Section */}
                <div className="flex flex-col relative">
                    <AnimatePresence mode="wait">
                        {!analysis && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-[2rem] bg-neutral-900/20 text-center p-8"
                            >
                                <AlertTriangle size={48} className="text-neutral-700 mb-4" />
                                <h3 className="text-lg font-bold text-neutral-500 mb-2">Awaiting Threat Payload</h3>
                                <p className="text-sm text-neutral-600 max-w-sm">
                                    Paste a message to generate a plain-language teach-back analysis powered by Ryzen AI.
                                </p>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-orange-500/30 rounded-[2rem] bg-orange-500/5 text-center p-8"
                            >
                                <Zap size={48} className="text-orange-500 animate-pulse mb-6" />
                                <div className="space-y-3 w-64">
                                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ x: "-100%" }} animate={{ x: "100%" }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="h-full bg-orange-500 w-1/2 rounded-full"
                                        />
                                    </div>
                                    <p className="text-xs font-mono text-orange-500/80 uppercase tracking-widest">Running Contextual Analysis...</p>
                                </div>
                            </motion.div>
                        )}

                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex-1"
                            >
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                                    <div className={`p-2 rounded-xl ${analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-500' : analysis.risk_level === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {analysis.risk_level === 'LOW' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Threat Analysis</h3>
                                        <div className={`text-xs font-bold uppercase tracking-widest ${analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH' ? 'text-red-500' : analysis.risk_level === 'MEDIUM' ? 'text-orange-500' : 'text-green-500'}`}>
                                            Risk Level: {analysis.risk_level}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Plain-Language Teach-Back</h4>

                                    {analysis.flags.length > 0 ? (
                                        analysis.flags.map((flag, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                                key={idx} className="bg-black/40 border border-neutral-800 rounded-xl p-4 flex gap-4 items-start"
                                            >
                                                <div className="mt-0.5 text-orange-500"><Info size={16} /></div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-white mb-1">{flag.title}</h5>
                                                    <p className="text-xs text-neutral-400 leading-relaxed">{flag.explanation}</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-4 items-start">
                                            <div className="mt-0.5 text-green-500"><ShieldCheck size={16} /></div>
                                            <div>
                                                <h5 className="text-sm font-bold text-green-400 mb-1">No Obvious Threats Detected</h5>
                                                <p className="text-xs text-green-500/70 leading-relaxed">This message does not contain common phishing triggers. However, always verify the sender before clicking links.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {analysis.risk_level !== 'LOW' && (
                                    <div className="mt-6 p-4 bg-orange-950/30 border border-orange-500/20 rounded-xl">
                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Shield size={14} /> AI Recommendation
                                        </h4>
                                        <p className="text-sm text-orange-200/80">Do not click any links or provide personal info. Delete this message. If it claims to be from a university or bank, log in to their official website directly instead of using the provided link.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PhishingSandbox;
