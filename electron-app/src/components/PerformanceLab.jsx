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
        <div className="p-6 space-y-6 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
            {/* Header - Scaled Down */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                            <Activity className="w-5 h-5 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase">Performance Lab</h1>
                    </div>
                    <p className="text-neutral-500 text-[10px] font-medium tracking-tight uppercase">
                        Hardware stress testing for <span className="text-white font-bold">AMD Ryzen™ AI</span> XDNA Architecture.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={runStressTest}
                        disabled={benchmarking}
                        className={`
                            relative overflow-hidden group flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs tracking-widest transition-all
                            ${benchmarking
                                ? 'bg-neutral-800 text-neutral-600 border border-neutral-700'
                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_5px_15px_rgba(249,115,22,0.2)]'}
                        `}
                    >
                        <Zap size={14} className={benchmarking ? "animate-bounce" : ""} />
                        {benchmarking ? "BENCHMARKING..." : "START NPU STRESS TEST"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">

                {/* Visual Neural Graph Section */}
                <div className="lg:col-span-8 space-y-6">

                    <div className="bg-[#0c0c0c] border border-neutral-800/50 p-6 rounded-[2rem] relative overflow-hidden h-[300px] flex flex-col group">
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="text-[9px] font-black tracking-[0.3em] text-neutral-600 uppercase mb-1">Neural Flow</h3>
                                <div className="text-lg font-black text-white italic tracking-tighter">XDNA Core Real-time</div>
                            </div>
                            <div className="flex gap-2">
                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black border tracking-widest transition-colors ${benchmarking ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-neutral-900 border-neutral-800 text-neutral-700'}`}>
                                    SENSING
                                </div>
                            </div>
                        </div>

                        {/* Interactive Graph Area */}
                        <div className="flex-1 relative flex items-center justify-center">
                            <NeuralViz active={benchmarking} />
                        </div>

                        <div className="flex justify-between items-center text-[8px] font-bold text-neutral-700 tracking-widest relative z-10">
                            <div>RYZEN_AI_CORE_01 // ACTIVE_MAPPING</div>
                            <div>BUFFER_ALLOC_OK</div>
                        </div>
                    </div>

                    {/* Comparative Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-neutral-900/20 border border-neutral-800/40 p-5 rounded-[1.5rem] space-y-4">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-neutral-500" />
                                <span className="text-[9px] font-black tracking-widest text-neutral-600 uppercase">Latency Differential</span>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold text-neutral-500">
                                        <span>Cloud Layer</span>
                                        <span>{results ? `${results.cpu_latency}ms` : '---'}</span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: results ? "100%" : "0%" }} className="h-full bg-neutral-800" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black text-orange-500 tracking-widest">
                                        <span>RYZEN NPU</span>
                                        <span>{results ? `${results.npu_latency}ms` : '---'}</span>
                                    </div>
                                    <div className="h-1.5 bg-orange-950/20 rounded-full overflow-hidden border border-orange-500/10">
                                        <motion.div
                                            animate={{ width: results ? `${(results.npu_latency / results.cpu_latency) * 100}%` : "0%" }}
                                            className="h-full bg-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900/20 border border-neutral-800/40 p-5 rounded-[1.5rem] flex flex-col justify-center items-center text-center group">
                            <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Efficiency Multiplier</div>
                            <div className="text-4xl font-black text-white italic tracking-tighter">
                                {results ? `${results.speedup}x` : '0.0x'}
                            </div>
                            <div className="text-[9px] text-orange-500/60 font-bold uppercase tracking-tighter mt-1">NPU Acceleration</div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Diagnostics */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
                        <div className="space-y-5 relative z-10">
                            <h4 className="text-[9px] font-black tracking-[0.3em] text-neutral-600 uppercase">System Topology</h4>

                            <div className="space-y-4">
                                <DetailItem icon={Cpu} label="Hardware" value="Ryzen™ 7040" active />
                                <DetailItem icon={Shield} label="AI Engine" value="XDNA Core 1.0" active />
                                <DetailItem icon={Timer} label="Sync" value="Real-time" active />
                            </div>
                        </div>

                        <div className="pt-6 mt-2 border-t border-neutral-800/50 space-y-3 relative z-10">
                            <div className="text-[9px] font-black tracking-[0.3em] text-neutral-700 uppercase">Diagnostics</div>
                            <div className="space-y-2">
                                <StatRow label="Throughput" value={results ? `${results.tokens_per_sec}` : '---'} unit="ops/s" />
                                <StatRow label="Power State" value="ECO" color="text-green-500" />
                            </div>
                        </div>

                        <div className="bg-black/50 p-4 rounded-xl border border-neutral-800/50 mt-4">
                            <p className="text-[9px] text-neutral-600 font-medium leading-relaxed italic">
                                "XDNA offload ensures privacy scans never interfere with student gaming or study sessions."
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const NeuralViz = ({ active }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 200">
                {[...Array(3)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M -20 ${60 + i * 40} L 420 ${60 + i * 40}`}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{
                            pathLength: active ? 1 : 0,
                            x: active ? [0, 40, 0] : 0,
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                ))}
            </svg>

            <motion.div
                animate={active ? { scale: [1, 1.05, 1], rotate: 360 } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className={`w-24 h-24 rounded-full border border-dashed flex items-center justify-center transition-all ${active ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'border-neutral-800'}`}
            >
                <div className="w-16 h-16 rounded-full border border-neutral-900 bg-neutral-950 flex items-center justify-center">
                    <Cpu size={24} className={active ? 'text-orange-500' : 'text-neutral-700'} />
                </div>
            </motion.div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, active }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon size={12} className={active ? "text-orange-500" : "text-neutral-700"} />
            <span className="text-[10px] font-bold text-neutral-500">{label}</span>
        </div>
        <span className={`text-[10px] font-black ${active ? "text-white" : "text-neutral-800"}`}>{value}</span>
    </div>
);

const StatRow = ({ label, value, unit, color = "text-white" }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-[8px] font-bold text-neutral-700 uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className={`text-xs font-black ${color}`}>{value}</span>
            {unit && <span className="text-[8px] font-bold text-neutral-600 uppercase">{unit}</span>}
        </div>
    </div>
);

export default PerformanceLab;
