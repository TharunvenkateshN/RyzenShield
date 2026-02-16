import React, { useState, useEffect } from 'react';
import { Shield, Lock, Activity, Cpu, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        threats_neutralized: 0,
        pii_masked: 0,
        latency_saved: 0,
        hygiene_score: 500,
        hygiene_grade: 'B'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://127.0.0.1:9000/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) { }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 mb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black border border-neutral-800 p-8 rounded-[2.5rem] overflow-hidden relative group"
                >
                    {/* Background Hardware Waveform Pattern */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
                        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <motion.path
                                d="M0 100 Q 100 50 200 100 T 400 100 T 600 100 T 800 100"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="4"
                                animate={{
                                    d: [
                                        "M0 100 Q 100 50 200 100 T 400 100 T 600 100 T 800 100",
                                        "M0 100 Q 100 150 200 100 T 400 100 T 600 100 T 800 100",
                                        "M0 100 Q 100 50 200 100 T 400 100 T 600 100 T 800 100"
                                    ]
                                }}
                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            />
                        </svg>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                        {/* Score Section */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500/20 p-2 rounded-xl ring-1 ring-orange-500/30">
                                    <Activity className="w-5 h-5 text-orange-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Digital Hygiene Score</h2>
                            </div>

                            <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                                Your real-time privacy reputation. Every neutralized leak increases your
                                <span className="text-white font-semibold italic ml-1">Ryzen AI Protection Level</span>.
                            </p>

                            <div className="flex items-center gap-8 pt-4">
                                <div className="relative">
                                    {/* Circular Progress Gauge */}
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-neutral-900" />
                                        <motion.circle
                                            cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent"
                                            strokeDasharray="351.8"
                                            animate={{ strokeDashoffset: 351.8 - (351.8 * stats.hygiene_score) / 1000 }}
                                            transition={{ duration: 2, ease: "circOut" }}
                                            strokeLinecap="round"
                                            className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Score</span>
                                        <motion.span
                                            key={stats.hygiene_score}
                                            initial={{ scale: 1.2, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-3xl font-black text-white"
                                        >
                                            {stats.hygiene_score}
                                        </motion.span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-baseline gap-2">
                                        <motion.span
                                            key={stats.hygiene_grade}
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="text-6xl font-black text-white"
                                        >
                                            {stats.hygiene_grade}
                                        </motion.span>
                                        {stats.hygiene_grade === 'S' && (
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                <Award className="text-yellow-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="text-[10px] bg-orange-600/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-md font-black tracking-[0.2em] uppercase inline-block">
                                        Current Rank
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4 min-w-[200px]">
                            <StatCard label="XP EARNED" value={`+${stats.pii_masked * 5}`} icon={Zap} color="text-yellow-400" />
                            <StatCard label="NPU SAVINGS" value={`${stats.latency_saved}ms`} icon={Cpu} color="text-orange-400" />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatusCard label="Threats Logged" value={stats.threats_neutralized} icon={Shield} glow="group-hover:text-green-400" color="bg-green-500" delay={0.1} />
                <StatusCard label="Elements Masked" value={stats.pii_masked} icon={Lock} glow="group-hover:text-blue-400" color="bg-blue-500" delay={0.2} />
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-5 rounded-[2rem] flex flex-col items-start min-w-[180px] shadow-2xl">
        <div className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="flex items-center gap-2">
            <Icon size={16} className={color} />
            <div className={`text-2xl font-black text-white ${color}`}>{value}</div>
        </div>
    </div>
);

const StatusCard = ({ label, value, icon: Icon, color, delay, glow }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-[2rem] flex items-center justify-between group cursor-default transition-all duration-500 hover:bg-neutral-900/60 hover:border-neutral-700 hover:scale-[1.02]"
    >
        <div className="space-y-1">
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{label}</div>
            <div className="text-4xl font-black text-white group-hover:scale-110 origin-left transition-transform duration-500">{value}</div>
        </div>
        <div className={`p-5 rounded-[1.5rem] bg-black border border-neutral-800 transition-all duration-500 shadow-inner`}>
            <Icon className={`w-7 h-7 text-neutral-600 transition-all duration-500 ${glow}`} />
        </div>
    </motion.div>
);

export default DashboardStats;
