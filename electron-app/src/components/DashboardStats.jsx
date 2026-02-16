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
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0c0c0c] border border-neutral-800 p-10 rounded-[3rem] overflow-hidden relative group shadow-2xl shadow-orange-500/5"
                >
                    {/* Neural Background Mesh */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="0.5" fill="orange" />
                            </pattern>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-16 relative z-10">

                        {/* Centerpiece: The Score Gauge */}
                        <div className="flex flex-col items-center gap-8 group/score">
                            <div className="relative">
                                {/* Glowing outer ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-4 border border-dashed border-orange-500/20 rounded-full"
                                />

                                {/* The Main Circular Gauge */}
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neutral-900" />
                                    <motion.circle
                                        cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray="527.7"
                                        animate={{ strokeDashoffset: 527.7 - (527.7 * stats.hygiene_score) / 1000 }}
                                        transition={{ duration: 2.5, ease: "circOut" }}
                                        strokeLinecap="round"
                                        className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-1">Protection</div>
                                    <motion.span
                                        key={stats.hygiene_score}
                                        className="text-5xl font-black text-white italic tracking-tighter"
                                    >
                                        {stats.hygiene_score}
                                    </motion.span>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-6xl font-black text-white italic tracking-tighter">{stats.hygiene_grade}</span>
                                    {stats.hygiene_grade === 'S' && <Award className="text-yellow-500 w-12 h-12 animate-bounce shadow-yellow-500/20" />}
                                </div>
                                <div className="bg-orange-600/10 border border-orange-500/20 text-orange-500 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                    Global Rank Level
                                </div>
                            </div>
                        </div>

                        {/* Feature Stats Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

                            <VisualStatCard
                                label="Threats Logged"
                                value={stats.threats_neutralized}
                                icon={Shield}
                                color="text-green-500"
                                desc="Local intercept events"
                            />

                            <VisualStatCard
                                label="Elements Masked"
                                value={stats.pii_masked}
                                icon={Lock}
                                color="text-blue-500"
                                desc="Secure vault mappings"
                            />

                            <VisualStatCard
                                label="NPU Latency"
                                value={`${stats.latency_saved}ms`}
                                icon={Cpu}
                                color="text-orange-500"
                                desc="AMD Ryzen™ AI Savings"
                            />

                            <VisualStatCard
                                label="Session XP"
                                value={`+${stats.pii_masked * 5 + stats.threats_neutralized * 10}`}
                                icon={Zap}
                                color="text-yellow-500"
                                desc="Privacy reputation gain"
                            />

                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const VisualStatCard = ({ label, value, icon: Icon, color, desc }) => (
    <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-neutral-900/80 hover:border-neutral-700 transition-all cursor-default">
        <div>
            <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-3xl font-black text-white tracking-tighter italic mb-1">{value}</div>
            <div className="text-[9px] font-bold text-neutral-700 uppercase italic">{desc}</div>
        </div>
        <div className={`p-4 rounded-2xl bg-black border border-neutral-800 transition-all group-hover:scale-110`}>
            <Icon size={24} className={color} />
        </div>
    </div>
);

export default DashboardStats;
