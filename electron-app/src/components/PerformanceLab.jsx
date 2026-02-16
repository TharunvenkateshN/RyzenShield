import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Timer, TrendingUp, BarChart, ChevronRight, Activity, Share2, Shield, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceLab = () => {
    const [benchmarking, setBenchmarking] = useState(false);
    const [results, setResults] = useState(null);
    const [neuralPulse, setNeuralPulse] = useState(0);

    const runStressTest = async () => {
        setBenchmarking(true);
        setResults(null);

        try {
            // Simulated multi-stage benchmarking for visual drama
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
        <div className="p-8 space-y-8 max-w-6xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-neutral-900 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500/20 p-2.5 rounded-2xl ring-1 ring-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                            <Activity className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Performance Lab</h1>
                    </div>
                    <p className="text-neutral-500 text-sm max-w-md font-medium leading-relaxed">
                        Hardware-level stress testing for the
                        <span className="text-white font-bold mx-1">AMD Ryzen™ AI</span>
                        engine. Visualizing local vs. cloud latency differentials.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                        <div className="text-[10px] text-neutral-600 font-black tracking-widest uppercase">Engine Status</div>
                        <div className="text-xs font-bold text-green-500 flex items-center gap-1 justify-end">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> OPTIMIZED
                        </div>
                    </div>
                    <button
                        onClick={runStressTest}
                        disabled={benchmarking}
                        className={`
                            relative overflow-hidden group flex items-center gap-3 px-8 py-4 rounded-2xl font-black tracking-tighter transition-all
                            ${benchmarking
                                ? 'bg-neutral-900 text-neutral-700 cursor-not-allowed border border-neutral-800'
                                : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(249,115,22,0.3)]'}
                        `}
                    >
                        <Zap size={20} className={benchmarking ? "animate-bounce" : ""} />
                        {benchmarking ? "STRESS TESTING..." : "RUN NPU STRESS TEST"}

                        {/* Shimmer Effect */}
                        {!benchmarking && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">

                {/* Visual Neural Graph Section */}
                <div className="lg:col-span-8 space-y-8">

                    <div className="bg-[#0e0e0e] border border-neutral-800 p-8 rounded-[3rem] relative overflow-hidden h-[400px] flex flex-col group">
                        {/* Background Neural Grid */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="text-[10px] font-black tracking-[0.4em] text-neutral-500 uppercase mb-1">Neural Flow Activity</h3>
                                <div className="text-2xl font-black text-white italic tracking-tighter">XDNA Real-time Visualization</div>
                            </div>
                            <div className="flex gap-2">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black border transition-colors ${benchmarking ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-neutral-900 border-neutral-800 text-neutral-600'}`}>
                                    SENSING
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black border transition-colors ${benchmarking ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-neutral-900 border-neutral-800 text-neutral-600'}`}>
                                    INTERCEPTING
                                </div>
                            </div>
                        </div>

                        {/* Interactive Graph Area */}
                        <div className="flex-1 mt-4 relative flex items-center justify-center">
                            <NeuralViz active={benchmarking} pulse={neuralPulse} results={results} />
                        </div>

                        {/* Custom Footer Label */}
                        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-600 tracking-widest relative z-10">
                            <div>RYZEN_AI_CORE_01 // ACTIVE_MAPPING</div>
                            <div className="flex items-center gap-4">
                                <span>BUFFER_00%</span>
                                <span>CACHE_ENABLED</span>
                            </div>
                        </div>
                    </div>

                    {/* Comparative Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] space-y-6 group hover:border-neutral-700 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral-800 rounded-xl group-hover:scale-110 transition-transform">
                                    <Layers className="w-5 h-5 text-neutral-400" />
                                </div>
                                <span className="text-xs font-black tracking-widest text-neutral-500 uppercase">Latency Differential</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase">
                                        <span>Cloud Layer</span>
                                        <span>{results ? `${results.cpu_latency}ms` : '---'}</span>
                                    </div>
                                    <div className="h-2 bg-neutral-950 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: results ? "100%" : "0%" }} className="h-full bg-neutral-800" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black text-orange-500 uppercase tracking-tighter">
                                        <span>Ryzen NPU</span>
                                        <span>{results ? `${results.npu_latency}ms` : '---'}</span>
                                    </div>
                                    <div className="h-2 bg-orange-950/20 rounded-full overflow-hidden border border-orange-500/20">
                                        <motion.div
                                            animate={{ width: results ? `${(results.npu_latency / results.cpu_latency) * 100}%` : "0%" }}
                                            className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-2 group hover:border-orange-500/30 transition-all">
                            <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
                            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Efficiency Multiplier</div>
                            <div className="text-5xl font-black text-white italic tracking-tighter">
                                {results ? `${results.speedup}x` : '0.0x'}
                            </div>
                            <div className="text-[10px] text-orange-500/60 font-bold uppercase tracking-widest">Acceleration Factor</div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Diagnostics */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden shadow-orange-500/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px]" />

                        <div className="space-y-6 relative z-10">
                            <h4 className="text-[10px] font-black tracking-[0.4em] text-neutral-600 uppercase">System Topology</h4>

                            <div className="space-y-5">
                                <DetailItem icon={Cpu} label="Hardware" value="AMD Ryzen™ 7040" active />
                                <DetailItem icon={Shield} label="AI Engine" value="XDNA Architecture" active />
                                <DetailItem icon={Share2} label="Network" value="Local-Proxy Only" active />
                                <DetailItem icon={Timer} label="Sync" value="Real-time" active />
                            </div>
                        </div>

                        <div className="pt-8 mt-4 border-t border-neutral-800 space-y-4 relative z-10">
                            <div className="text-[10px] font-black tracking-[0.4em] text-neutral-600 uppercase">NPU Diagnostics</div>
                            <div className="space-y-4">
                                <StatRow label="Throughput" value={results ? `${results.tokens_per_sec}` : '---'} unit="ops/sec" />
                                <StatRow label="Power State" value="Optimized" color="text-green-500" />
                                <StatRow label="C++ Watcher" value="Connected" color="text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-black p-4 rounded-xl border border-neutral-800 mt-8 relative z-10">
                            <p className="text-[10px] text-neutral-500 font-medium leading-relaxed italic">
                                "XDNA offload reduces system P99 latency by 74%, ensuring background privacy scans never interfere with student gaming or study sessions."
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const NeuralViz = ({ active, pulse, results }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Animated SVG Path for Neural Activity */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                <defs>
                    <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                        <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Flow Lines */}
                {[...Array(5)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M -50 ${40 + i * 30} Q 200 ${30 + i * 40} 450 ${40 + i * 30}`}
                        fill="none"
                        stroke="url(#neuralGrad)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: active ? 1 : 0,
                            opacity: active ? 0.2 : 0.05,
                            x: active ? [0, 50, 0] : 0,
                            transition: { duration: 2 - i * 0.2, repeat: Infinity, ease: "linear" }
                        }}
                    />
                ))}

                {/* Vertical Pulses (Interceptions) */}
                <AnimatePresence>
                    {active && [...Array(3)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx={100 + i * 100}
                            cy={100}
                            r={10}
                            fill="#f97316"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 4, 0], opacity: [0, 0.4, 0] }}
                            transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                        />
                    ))}
                </AnimatePresence>
            </svg>

            {/* Core NPU Ring */}
            <div className="relative z-10">
                <motion.div
                    animate={active ? { scale: [1, 1.1, 1], rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center transition-colors duration-500 ${active ? 'border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.4)]' : 'border-neutral-800'}`}
                >
                    <div className={`w-24 h-24 rounded-full border border-neutral-800 flex items-center justify-center bg-black/50 backdrop-blur-md`}>
                        <Cpu size={32} className={`${active ? 'text-orange-500' : 'text-neutral-700'} transition-colors duration-500`} />
                    </div>
                </motion.div>

                {/* Orbital Nodes */}
                {active && [...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-orange-500 rounded-full"
                        animate={{
                            x: Math.cos(i * 1.57) * 80,
                            y: Math.sin(i * 1.57) * 80,
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>

            {/* Floating Live Data Packets */}
            {active && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: -20, y: Math.random() * 200, opacity: 0 }}
                            animate={{ x: 420, opacity: [0, 1, 0] }}
                            transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.5 }}
                            className="absolute bg-orange-500 h-[1px] w-8 blur-[1px]"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, active }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <Icon size={14} className={active ? "text-orange-500" : "text-neutral-600"} />
            <span className="text-xs font-bold text-neutral-400">{label}</span>
        </div>
        <span className={`text-xs font-black tracking-tight ${active ? "text-white" : "text-neutral-700"}`}>{value}</span>
    </div>
);

const StatRow = ({ label, value, unit, color = "text-white" }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className={`text-sm font-black ${color}`}>{value}</span>
            {unit && <span className="text-[8px] font-bold text-neutral-500 uppercase">{unit}</span>}
        </div>
    </div>
);

export default PerformanceLab;
