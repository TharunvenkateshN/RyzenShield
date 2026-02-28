import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileAudio, Video, ShieldCheck, Zap, Activity, Waves, Info, AlertTriangle, Hexagon } from 'lucide-react';

const DeepfakeSentinel = () => {
    const [mediaFile, setMediaFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
            setMediaFile(file);
            setResult(null);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setResult(null);
        }
    };

    const processMedia = async () => {
        if (!mediaFile) return;

        setIsProcessing(true);
        setResult(null);

        // Simulate local NPU Spectral Analysis
        setTimeout(() => {
            setResult({
                status: "synthetic",
                confidence: 98.4,
                signature: "ElevenLabs Voice Clone Architecture",
                anomalies: [
                    "Unnatural Vocal Tract Resonance (300-800Hz)",
                    "Missing Phonetic Breath Artifacts",
                    "Synthesized Harmonic Overtone Continuity"
                ]
            });
            setIsProcessing(false);
        }, 4000); // 4 seconds of cool NPU calculation animations
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
                            <Waves size={24} className="text-purple-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Deepfake Sentinel</h1>
                    </div>
                    <p className="text-neutral-400 font-medium">Local NPU spectral analysis to detect AI-generated voice and video phishing.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all h-full min-h-[400px]
                            ${mediaFile ? 'border-purple-500/50 bg-purple-500/5' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50'}`}
                    >
                        {!mediaFile ? (
                            <>
                                <div className="p-4 bg-neutral-800 rounded-full mb-6 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <UploadCloud size={48} className="text-neutral-400 group-hover:text-purple-500 transition-colors relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Drop Suspicious Media</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mx-auto mb-6">
                                    Upload a voice note or video clip. The Ryzen NPU will perform offline frequency analysis to spot AI synthesis artifacts.
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="audio/*,video/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-full transition-colors text-sm border border-neutral-700"
                                >
                                    Browse Files
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                {mediaFile.type.startsWith('video/') ? (
                                    <Video size={48} className="text-purple-500 mb-4" />
                                ) : (
                                    <FileAudio size={48} className="text-purple-500 mb-4" />
                                )}
                                <h3 className="text-lg font-bold text-white mb-1 truncate max-w-[250px]">{mediaFile.name}</h3>
                                <p className="text-sm text-neutral-500 mb-8">{(mediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>

                                <div className="flex gap-4 w-full px-8 mb-4">
                                    <button
                                        onClick={() => { setMediaFile(null); setResult(null); }}
                                        className="py-3 px-6 w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/20"
                                    >
                                        Remove File
                                    </button>
                                </div>

                                <button
                                    onClick={processMedia}
                                    disabled={isProcessing}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg mx-8
                                        ${isProcessing ? 'bg-purple-600/50 text-white/50 cursor-wait' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'}`}
                                >
                                    {isProcessing ? (
                                        <><Activity size={18} className="animate-spin" /> Unpacking Frequencies...</>
                                    ) : (
                                        <><Hexagon size={18} /> NPU Spectral Scan</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Processing/Result Area */}
                <div className="flex flex-col relative h-full">
                    <AnimatePresence mode="wait">
                        {!result && !isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-[2rem] bg-neutral-900/20 text-center p-8"
                            >
                                <Waves size={48} className="text-neutral-700 mb-4" />
                                <h3 className="text-lg font-bold text-neutral-500 mb-2">Awaiting Forensic Analysis</h3>
                                <p className="text-sm text-neutral-600 max-w-sm">
                                    The NPU Deepfake detector is idle. We use zero-cloud, hardware-accelerated local models to protect your privacy.
                                </p>
                            </motion.div>
                        )}

                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-solid border-purple-500/30 rounded-[2rem] bg-purple-500/5 text-center p-8 overflow-hidden"
                            >
                                {/* Futuristic Spectrogram Animation */}
                                <div className="flex items-end justify-center gap-1 mb-8 h-32 w-full max-w-[300px] border-b border-purple-500/20 pb-1">
                                    {[...Array(40)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: [
                                                    `${Math.random() * 20 + 10}px`,
                                                    `${Math.random() * 80 + 20}px`,
                                                    `${Math.random() * 20 + 10}px`
                                                ],
                                                backgroundColor: i % 5 === 0 ? "#ef4444" : "#a855f7" // Occasional red spikes
                                            }}
                                            transition={{ duration: 0.8 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                            className="w-1.5 rounded-t-sm"
                                        />
                                    ))}
                                </div>

                                <h3 className="text-xl font-black text-purple-400 mb-2 tracking-widest uppercase">Isolating Artifacts</h3>
                                <div className="text-xs text-neutral-400 font-mono space-y-1">
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>&gt; Measuring vocal tract resonance...</motion.p>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>&gt; Calculating spectro-temporal anomalies...</motion.p>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>&gt; Running through XDNA Neural Engine...</motion.p>
                                </div>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-900/50 border border-red-500/50 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col h-full"
                            >
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-800">
                                    <div className="p-3 bg-red-500 text-white rounded-2xl animate-pulse">
                                        <AlertTriangle size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Synthetic Media Detected</h3>
                                        <div className="text-xs font-bold uppercase tracking-widest text-red-500 mt-1">
                                            High Probability Spear-Phishing Attempt
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-6">

                                    {/* Score Card */}
                                    <div className="bg-black border border-neutral-800 rounded-xl p-5 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">NPU Confidence Score</div>
                                            <div className="text-3xl font-black text-purple-500">{result.confidence}%</div>
                                        </div>
                                        <div className="h-16 w-px bg-neutral-800 mx-4" />
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">AI Generator Signature</div>
                                            <div className="text-sm font-bold text-white bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 inline-block">
                                                {result.signature}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Forensic Breakdown */}
                                    <div>
                                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Zap size={14} /> Forensic Breakdown
                                        </h4>
                                        <div className="space-y-2">
                                            {result.anomalies.map((anomaly, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    <span className="text-sm font-medium text-neutral-300">{anomaly}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Explainable AI Notice */}
                                    <div className="mt-auto p-4 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-2">
                                        <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                                            <Info size={14} /> Teach-Back: Why this is fake
                                        </h4>
                                        <p className="text-xs text-purple-200/80 leading-relaxed">
                                            Generative AI cannot perfectly mimic human breathing patterns and creates mathematically perfect harmonic overtones that do not exist in organic speech. The AMD Ryzen NPU detects these invisible spectral errors instantly.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DeepfakeSentinel;
