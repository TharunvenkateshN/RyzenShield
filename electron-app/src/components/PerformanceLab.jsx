import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Timer, TrendingUp, BarChart, ChevronRight, Activity, Share2, Shield, Layers, HardDrive, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceLab = () => {
    const [benchmarking, setBenchmarking] = useState(false);
    const [results, setResults] = useState(null);
    const [neuralPulse, setNeuralPulse] = useState(0);

    const runStressTest = async () => {
        setBenchmarking(true);
        setResults(null);

        try {
            for (let i = 1; i <= 5; i++) {
                setNeuralPulse(i);
                await new Promise(r => setTimeout(r, 600));
            }

            const res = await fetch('http://127.0.0.1:9000/benchmark');
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error("Benchmark failed:", err);
        } finally {
            setBenchmarking(false);
            setNeuralPulse(0);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050200] overflow-hidden selection:bg-orange-500/30 font-mono relative">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(249, 115, 22, 0.2) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Standardized Header */}
            <div className="flex items-center justify-between bg-[#110500]/90 backdrop-blur-md border-b border-orange-500/20 px-6 py-3 shrink-0 relative z-10 w-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Activity size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Performance Lab</h1>
                        <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.2em] mt-1 font-sans">Hardware NPU Stress Testing</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={runStressTest}
                        disabled={benchmarking}
                        className={`
                            relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-3 font-black text-xs uppercase tracking-[0.2em] transition-all border
                            ${benchmarking
                                ? 'bg-orange-600/20 text-orange-500 border-orange-500 cursor-wait shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                                : 'bg-orange-600 hover:bg-orange-500 text-black border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)] active:scale-95'}
                        `}
                    >
                        {benchmarking ? (
                            <><RefreshCw size={14} className="animate-spin" /> BENCHMARKING...</>
                        ) : (
                            <><Zap size={14} /> TRIGGER NPU STRESS TEST</>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-6 custom-scrollbar">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                    {/* Left Panel: Visual Neural Graph & Efficiency */}
                    <div className="lg:col-span-8 flex flex-col gap-6 h-full">

                        {/* Telemetry Visualizer */}
                        <div className="bg-[#0c0400] border border-orange-500/20 p-1 relative shadow-[0_0_30px_rgba(0,0,0,0.8)] flex-1 overflow-hidden min-h-[350px]">
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-0" />

                            <div className="bg-[#110500] p-6 relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4 border-b border-orange-500/20 pb-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-orange-500" />
                                        <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase font-sans">Neural Flow Telemetry</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-black border tracking-widest uppercase transition-colors flex items-center gap-1 ${benchmarking ? 'bg-orange-500/20 border-orange-500/50 text-orange-500 animate-pulse' : 'bg-[#050200] border-orange-500/20 text-orange-500/50'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${benchmarking ? 'bg-orange-500' : 'bg-orange-500/30'}`}></div> SENSING
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Graph Area */}
                                <div className="flex-1 relative flex items-center justify-center bg-black/40 border border-orange-500/10 rounded overflow-hidden">
                                    {/* Background grid for chart */}
                                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundPosition: 'center center' }} />

                                    <NeuralViz active={benchmarking} results={results} />

                                    {/* Scanline overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-20"></div>
                                </div>

                                <div className="flex justify-between items-center text-[9px] font-bold text-orange-500/50 tracking-widest uppercase mt-4">
                                    <div className="flex items-center gap-1"><Cpu size={10} /> RYZEN_AI_CORE_01 // ACTIVE_MAPPING</div>
                                    <div>BUFFER_ALLOC_OK</div>
                                </div>
                            </div>
                        </div>

                        {/* Comparative Analytics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-48 shrink-0">

                            {/* Latency Comparison Card */}
                            <div className="bg-[#0c0400] border border-orange-500/20 p-6 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Layers size={80} className="text-orange-500" />
                                </div>
                                <h4 className="text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase flex items-center gap-2 mb-6 relative z-10">
                                    <Timer size={14} /> Latency Differential
                                </h4>

                                <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                            <span>Cloud Layer (CPU Route)</span>
                                            <span className="text-sm font-sans text-neutral-300">{results ? `${results.cpu_latency}ms` : '---'}</span>
                                        </div>
                                        <div className="h-2 bg-black border border-neutral-800 rounded-sm overflow-hidden">
                                            <motion.div animate={{ width: results ? "100%" : "0%" }} className="h-full bg-neutral-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                            <span>Ryzen NPU (Local)</span>
                                            <span className="text-xl font-sans">{results ? `${results.npu_latency}ms` : '---'}</span>
                                        </div>
                                        <div className="h-2 bg-orange-950/30 border border-orange-500/20 rounded-sm overflow-hidden shadow-inner">
                                            <motion.div
                                                animate={{ width: results ? `${(results.npu_latency / results.cpu_latency) * 100}%` : "0%" }}
                                                className="h-full bg-orange-500 shadow-[0_0_10px_#f97316]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Efficiency Multiplier Card */}
                            <div className="bg-[#0c0400] border border-orange-500/20 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute -left-4 -top-4 opacity-5 pointer-events-none">
                                    <Zap size={120} className="text-orange-500 rotate-12" />
                                </div>

                                <h4 className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em] mb-4 relative z-10">
                                    Efficiency Multiplier
                                </h4>

                                <div className="relative z-10">
                                    <span className={`text-6xl font-black italic tracking-tighter ${results ? 'text-white' : 'text-neutral-700'}`}>
                                        {results ? `${results.speedup}` : '0.0'}
                                    </span>
                                    <span className="text-3xl font-bold text-orange-500 ml-1">x</span>
                                </div>

                                <div className="text-[10px] text-orange-500 font-bold uppercase tracking-[0.2em] border border-orange-500/30 bg-orange-500/10 px-3 py-1 mt-4 relative z-10 shadow-inner">
                                    NPU Acceleration Factor
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Panel: Side Diagnostics */}
                    <div className="lg:col-span-4 h-full flex flex-col">
                        <div className="bg-[#0c0400] border-l border-t border-b border-r border-orange-500/20 p-6 relative flex-1 flex flex-col overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.05)]">
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-0" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-8 border-b border-orange-500/20 pb-4">
                                    <BarChart size={16} className="text-orange-500" />
                                    <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase font-sans">System Topology</h3>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <DetailItem icon={HardDrive} label="Hardware Subsystem" value="Ryzen™ 7040 Series" active />
                                    <DetailItem icon={Cpu} label="AI Engine Context" value="XDNA Core 1.0" active />
                                    <DetailItem icon={Shield} label="Security Perimeter" value="On-Device Enclave" active />
                                    <DetailItem icon={Timer} label="Sync Protocol" value="Real-time Intercept" active />
                                </div>

                                <div className="mt-8 pt-6 border-t border-orange-500/20 space-y-4">
                                    <h4 className="text-[10px] font-black tracking-[0.3em] text-orange-500/60 uppercase">Runtime Diagnostics</h4>

                                    <div className="bg-black/50 border border-orange-500/10 p-4 space-y-3">
                                        <StatRow label="Throughput" value={results ? `${results.tokens_per_sec}` : '---'} unit="ops/s" />
                                        <div className="w-full h-px bg-orange-500/10" />
                                        <StatRow label="Power State" value="ECO" color="text-green-500" />
                                        <div className="w-full h-px bg-orange-500/10" />
                                        <StatRow label="Thermal" value="NOMINAL" color="text-green-500" />
                                    </div>
                                </div>

                                <div className="mt-6 bg-orange-500/5 border-l-2 border-orange-500 p-4 relative overflow-hidden">
                                    {/* Background icon */}
                                    <Shield size={60} className="absolute -right-4 -bottom-4 text-orange-500/10" />

                                    <p className="text-[10px] text-orange-200/80 font-medium leading-relaxed uppercase tracking-wider relative z-10">
                                        "XDNA offload ensures privacy scans & threat detection never interfere with standard user payloads."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const NeuralViz = ({ active, results }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            {/* Horizontal tracking lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30 z-0" viewBox="0 0 400 200">
                {[...Array(5)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M -20 ${40 + i * 30} L 420 ${40 + i * 30}`}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="1"
                        initial={{ opacity: 0.1 }}
                        animate={active ? {
                            opacity: [0.1, 0.8, 0.1],
                            strokeWidth: [1, 2, 1]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </svg>

            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    >
                        <div className="w-full h-1 bg-orange-500/40 shadow-[0_0_20px_#f97316]">
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="w-1/3 h-full bg-white shadow-[0_0_15px_#ffffff]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                animate={active ? { scale: [1, 1.1, 1], rotate: 180 } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className={`relative z-20 w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center transition-all bg-[#050200] ${active ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]' : 'border-orange-500/20'}`}
            >
                {/* Inner Spinners */}
                {active && (
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border border-t-orange-400 border-r-transparent border-b-orange-600 border-l-transparent"
                    />
                )}

                <div className={`w-20 h-20 rounded-full border flex items-center justify-center transition-colors ${active ? 'border-orange-400 bg-orange-500/20' : 'border-orange-500/10 bg-black/50'}`}>
                    <Cpu size={32} className={active ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-orange-500/50'} />
                </div>
            </motion.div>

            {/* Text Overlay Status */}
            {results && !active && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-6 bg-green-500/10 border border-green-500/30 px-4 py-1.5 rounded text-[10px] font-black tracking-[0.2em] text-green-500 uppercase z-30"
                >
                    BENCHMARK COMPLETE
                </motion.div>
            )}
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, active }) => (
    <div className="flex flex-col gap-1 border-b border-orange-500/10 pb-4 last:border-0 last:pb-0 group">
        <div className="flex items-center gap-2">
            <Icon size={12} className={active ? "text-orange-500" : "text-neutral-700"} />
            <span className="text-[9px] font-bold text-orange-500/50 uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-[12px] font-black pl-5 font-sans ${active ? "text-white" : "text-neutral-800"}`}>{value}</span>
    </div>
);

const StatRow = ({ label, value, unit, color = "text-white" }) => (
    <div className="flex justify-between items-baseline group">
        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-orange-300 transition-colors">{label}</span>
        <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-black font-sans ${color}`}>{value}</span>
            {unit && <span className="text-[9px] font-bold text-orange-500/50 uppercase">{unit}</span>}
        </div>
    </div>
);

export default PerformanceLab;
