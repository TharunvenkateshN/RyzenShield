import React, { useState } from 'react';
import { Cpu, Zap, Timer, TrendingUp, BarChart, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceLab = () => {
    const [benchmarking, setBenchmarking] = useState(false);
    const [results, setResults] = useState(null);

    const runStressTest = async () => {
        setBenchmarking(true);
        setResults(null);

        try {
            // Simulate processing time for UI drama
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch('http://127.0.0.1:9000/benchmark');
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error("Benchmark failed:", err);
        } finally {
            setBenchmarking(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-600/20 p-2 rounded-xl">
                            <Activity className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight italic">Performance Lab</h1>
                    </div>
                    <p className="text-neutral-400 max-w-md">
                        Stress test the Ryzen AI NPU. Compare local hardware acceleration against legacy cloud scanning architectures.
                    </p>
                </div>

                <button
                    onClick={runStressTest}
                    disabled={benchmarking}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all
                        ${benchmarking
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)]'}
                    `}
                >
                    {benchmarking ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Zap size={20} />
                            </motion.div>
                            BENCHMARKING...
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            RUN NPU STRESS TEST
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latency Comparison Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart size={120} />
                        </div>

                        <h3 className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em] mb-8">Hardware Latency Scan</h3>

                        <div className="space-y-8">
                            {/* Cloud Simulation */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-white font-bold">Standard Cloud Scan</span>
                                    <span className="text-neutral-500 font-mono italic">
                                        {results ? `${results.cpu_latency}ms` : '---'}
                                    </span>
                                </div>
                                <div className="h-4 bg-neutral-950 rounded-full border border-neutral-800 p-0.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: results ? "90%" : "0%" }}
                                        className="h-full bg-neutral-700 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* NPU (The Hero) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-orange-500 font-black tracking-widest flex items-center gap-2">
                                        <Cpu size={14} /> RYZEN NPU XDNA
                                    </span>
                                    <span className="text-orange-500 font-mono font-black">
                                        {results ? `${results.npu_latency}ms` : '---'}
                                    </span>
                                </div>
                                <div className="h-6 bg-orange-950/20 rounded-full border border-orange-500/30 p-1 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: results ? "10%" : "0%" }}
                                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {results && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 pt-8 border-t border-neutral-800 flex items-center gap-4"
                            >
                                <div className="bg-green-500/20 p-2 rounded-lg">
                                    <TrendingUp className="text-green-500" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white">{results.speedup}x FASTER</div>
                                    <div className="text-xs text-neutral-500">Acceleration provided by AMD Ryzen™ AI hardware.</div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Efficiency Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard
                            icon={Timer}
                            label="THROUGHPUT"
                            value={results ? `${results.tokens_per_sec} ops/s` : '0'}
                            color="text-blue-500"
                        />
                        <StatCard
                            icon={ChevronRight}
                            label="POWER EFFICIENCY"
                            value={results ? "MAX" : "---"}
                            color="text-green-500"
                        />
                    </div>
                </div>

                {/* Hardware Report Sidebar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-6 space-y-6">
                    <h4 className="text-[10px] font-black tracking-[0.3em] text-neutral-600 uppercase">System Topology</h4>

                    <div className="space-y-4">
                        <TopologyItem label="Processor" value="AMD Ryzen™ 7040 Series" active />
                        <TopologyItem label="NPU Provider" value="XDNA AI Engine v1.0" active />
                        <TopologyItem label="C++ Watcher" value="Low-Latency Buffer" active />
                        <TopologyItem label="Cloud Link" value="OFF" />
                    </div>

                    <div className="pt-6 mt-6 border-t border-neutral-800">
                        <div className="text-[10px] font-black tracking-[0.3em] text-neutral-600 uppercase mb-4">Diagnostics</div>
                        <p className="text-xs text-neutral-500 leading-relaxed italic">
                            RyzenShield offloads inference to the XDNA NPU to prevent CPU throttling during intense multitasking sessions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl group transition-all hover:bg-neutral-800/50">
        <div className="flex items-center gap-3 mb-4">
            <Icon size={16} className={color} />
            <span className="text-[9px] font-black tracking-widest text-neutral-500 uppercase">{label}</span>
        </div>
        <div className="text-2xl font-black text-white">{value}</div>
    </div>
);

const TopologyItem = ({ label, value, active = false }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-neutral-500">{label}</span>
        <span className={`font-mono font-bold ${active ? 'text-orange-500 underline underline-offset-4 decoration-orange-500/30' : 'text-neutral-700'}`}>
            {value}
        </span>
    </div>
);

export default PerformanceLab;
