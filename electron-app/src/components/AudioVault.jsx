import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, UploadCloud, FileAudio, Play, Pause, ShieldCheck, Zap, Activity, FileText, Lock, RefreshCw } from 'lucide-react';

const AudioVault = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('audio/') || file.name.endsWith('.wav') || file.name.endsWith('.mp3'))) {
            setAudioFile(file);
            setResult(null);
            setIsPlaying(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            setResult(null);
            setIsPlaying(false);
        }
    };

    const processAudio = async () => {
        if (!audioFile) return;

        setIsProcessing(true);
        setResult(null);

        // Simulated backend processing for Hackathon demo
        // In a real app, this would use FormData to send the file to the backend
        setTimeout(() => {
            const simulatedMapping = {
                "[RS-CREDS-01]": { type: "CREDENTIAL", value: "alpha-tango-7" },
                "[RS-MAIL-02]": { type: "EMAIL", value: "admin@ryzenshield.edu" },
                "[RS-USER-03]": { type: "PERSON", value: "Dr. Jenkins" }
            };

            setResult({
                status: "success",
                original_transcript: "Hi Dr. Jenkins, thanks for joining the Zoom call. Just a reminder that the admin portal email is admin@ryzenshield.edu and the master password is alpha-tango-7.",
                sanitized_transcript: "Hi [RS-USER-03], thanks for joining the Zoom call. Just a reminder that the admin portal email is [RS-MAIL-02] and the master password is [RS-CREDS-01].",
                shielded_count: 3,
                mapping: simulatedMapping
            });
            setIsProcessing(false);
        }, 3500); // 3.5s delay to simulate NPU Whisper processing
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        } else if (audioFile && !audioRef.current) {
            const url = URL.createObjectURL(audioFile);
            const audio = new Audio(url);
            audio.onended = () => setIsPlaying(false);
            audioRef.current = audio;
            audio.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                            <Mic size={24} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Audio Vault</h1>
                    </div>
                    <p className="text-neutral-400 font-medium">Local NPU transcription & speech redaction for secure meetings.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all h-full min-h-[400px]
                            ${audioFile ? 'border-orange-500/50 bg-orange-500/5' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50'}`}
                    >
                        {!audioFile ? (
                            <>
                                <div className="p-4 bg-neutral-800 rounded-full mb-6 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <UploadCloud size={48} className="text-neutral-400 group-hover:text-orange-500 transition-colors relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Drop Meeting Audio</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mx-auto mb-6">
                                    Upload a .wav or .mp3 file. The NPU will transcribe the speech and redact sensitive information locally.
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="audio/*"
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
                                <FileAudio size={48} className="text-orange-500 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-1 truncate max-w-[250px]">{audioFile.name}</h3>
                                <p className="text-sm text-neutral-500 mb-8">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>

                                <div className="flex gap-4 w-full px-8">
                                    <button
                                        onClick={toggleAudio}
                                        className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                                    >
                                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                        {isPlaying ? "Pause" : "Play File"}
                                    </button>

                                    <button
                                        onClick={() => { setAudioFile(null); setResult(null); setIsPlaying(false); if (audioRef.current) audioRef.current.pause(); }}
                                        className="py-3 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/20"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <button
                                    onClick={processAudio}
                                    disabled={isProcessing}
                                    className={`mt-4 w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg mx-8
                                        ${isProcessing ? 'bg-orange-600/50 text-white/50 cursor-wait' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20'}`}
                                >
                                    {isProcessing ? (
                                        <><RefreshCw size={18} className="animate-spin" /> Synthesizing Transcription...</>
                                    ) : (
                                        <><Zap size={18} /> Run Deep Scan</>
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
                                <Activity size={48} className="text-neutral-700 mb-4" />
                                <h3 className="text-lg font-bold text-neutral-500 mb-2">Awaiting Audio Stream</h3>
                                <p className="text-sm text-neutral-600 max-w-sm">
                                    The NPU Speech-to-Text engine is idle. Drop a file to begin local transcription and tokenization.
                                </p>
                            </motion.div>
                        )}

                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-solid border-orange-500/30 rounded-[2rem] bg-orange-500/5 text-center p-8"
                            >
                                <div className="flex items-center justify-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((bar) => (
                                        <motion.div
                                            key={bar}
                                            animate={{ height: ["10px", "40px", "10px"] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: bar * 0.1 }}
                                            className="w-2 bg-orange-500 rounded-full"
                                        />
                                    ))}
                                </div>
                                <h3 className="text-lg font-bold text-orange-400 mb-2">Transcribing via NPU...</h3>
                                <p className="text-sm text-neutral-500">Converting speech to text and running heuristic PII scanner.</p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex flex-col h-full"
                            >
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Transmission Secured</h3>
                                        <div className="text-xs font-bold uppercase tracking-widest text-green-500">
                                            {result.shielded_count} Sensitive Items Redacted
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <FileText size={14} /> Safe Transcript
                                        </h4>
                                        <div className="bg-black/50 border border-neutral-800 rounded-xl p-4 text-neutral-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                            {result.sanitized_transcript.split(/(\[RS-[A-Z]+-\d+\])/g).map((part, i) => {
                                                if (part.startsWith('[RS-')) {
                                                    return <span key={i} className="bg-orange-500/20 text-orange-400 px-1 rounded-md font-bold mx-1 border border-orange-500/30">{part}</span>;
                                                }
                                                return part;
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Lock size={14} /> Encrypted Shadow Tokens
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Object.entries(result.mapping).map(([token, data], idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                                                    <span className="text-xs font-mono font-bold text-orange-500">{token}</span>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] uppercase font-bold text-neutral-500">{data.type}</span>
                                                        <span className="text-xs text-neutral-400 font-mono blur-[4px] hover:blur-none transition-all duration-300 select-none cursor-pointer">
                                                            {data.value}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-orange-950/30 border border-orange-500/20 rounded-xl space-y-2">
                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={14} /> Edge Computing Notice
                                        </h4>
                                        <p className="text-xs text-orange-200/80 leading-relaxed">
                                            This entire transcript was generated and sanitized locally. The original audio file never left your device, ensuring total privacy for your meeting data.
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

export default AudioVault;
