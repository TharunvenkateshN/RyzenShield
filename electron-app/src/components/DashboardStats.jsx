import React, { useState, useEffect } from 'react';
import { Shield, Lock, Activity, Cpu, Zap, Award, Info, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        threats_neutralized: 0,
        pii_masked: 0,
        latency_saved: 0,
        hygiene_score: 500,
        hygiene_grade: 'B'
    });
    const [showTooltip, setShowTooltip] = useState(false);

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

    // Tooltip logic for gamification explanation
    const getRankExplanation = (grade) => {
        const ranks = {
            'S': { title: 'ELITE PROTECTOR', xp: '1000+', desc: 'Incredible! You have achieved total digital hygiene.' },
            'A': { title: 'SENTINEL', xp: '800-999', desc: 'Superior protection. Almost untouchable.' },
            'B': { title: 'GUARDIAN', xp: '600-799', desc: 'Secure and stable. Keep optimizing!' },
            'C': { title: 'INITIATE', xp: '400-599', desc: 'Basic defense active. More NPU scans needed.' },
            'F': { title: 'VULNERABLE', xp: '0-399', desc: 'Critical risk. Enable Ryzen AI protection immediately.' }
        };
        return ranks[grade] || ranks['B'];
    };

    const rankInfo = getRankExplanation(stats.hygiene_grade);

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0a0a0a] border border-neutral-800/80 p-8 rounded-[2.5rem] overflow-hidden relative group shadow-2xl"
                >
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <pattern id="grid-medium" width="8" height="8" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="0.4" fill="orange" />
                            </pattern>
                            <rect width="100" height="100" fill="url(#grid-medium)" />
                        </svg>
                    </div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-12 relative z-10">

                        {/* Centerpiece Gauge */}
                        <div className="flex flex-col items-center gap-6 min-w-[200px]">
                            <div className="relative cursor-help"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}>

                                <svg className="w-36 h-36 transform -rotate-90">
                                    <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-900" />
                                    <motion.circle
                                        cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray="389.5"
                                        animate={{ strokeDashoffset: 389.5 - (389.5 * stats.hygiene_score) / 1000 }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        strokeLinecap="round"
                                        className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] mb-1 leading-none">Security XP</span>
                                    <motion.span className="text-4xl font-black text-white italic tracking-tighter">
                                        {stats.hygiene_score}
                                    </motion.span>
                                </div>

                                {/* Sparkle Badge near S/Gauge */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1.5 shadow-[0_0_15px_rgba(249,115,22,0.8)] border border-white/20"
                                >
                                    <Sparkles size={14} className="text-white" />
                                </motion.div>

                                {/* Interactive Rank Breakdown Tooltip */}
                                <AnimatePresence>
                                    {showTooltip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute -bottom-2 translate-y-full left-1/2 -translate-x-1/2 w-48 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-2xl z-50 pointer-events-none"
                                        >
                                            <div className="flex flex-col items-center text-center space-y-2">
                                                <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{rankInfo.title}</div>
                                                <div className="h-[1px] w-8 bg-neutral-800" />
                                                <p className="text-[9px] text-neutral-400 leading-relaxed font-medium">
                                                    {rankInfo.desc}
                                                </p>
                                                <div className="text-[8px] font-black text-neutral-600 uppercase pt-1 italic">XP Range: {rankInfo.xp}</div>
                                            </div>
                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 border-t border-l border-neutral-800 rotate-45" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="text-center group/grade flex flex-col items-center">
                                <div className="relative">
                                    <span className="text-6xl font-black text-white italic tracking-tighter transition-all group-hover/grade:scale-110 block drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        {stats.hygiene_grade}
                                    </span>
                                    {/* The Badge near the Grade */}
                                    <div className="absolute -top-2 -right-6">
                                        <motion.div
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="px-2 py-0.5 bg-neutral-900 border border-orange-500/50 rounded flex items-center gap-1 shadow-lg"
                                        >
                                            <Award size={10} className="text-orange-500" />
                                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">LVL {Math.floor(stats.hygiene_score / 100)}</span>
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 mt-2">
                                    <div className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em] italic">Current Rank</div>
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-[8px] font-bold text-neutral-700 uppercase tracking-widest flex items-center gap-1 cursor-default"
                                    >
                                        <Info size={10} /> Hover gauge for Intel
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Stats Grid */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">

                            <VisualStatCard
                                label="Threats Logged"
                                value={stats.threats_neutralized}
                                icon={Shield}
                                color="text-green-500"
                                desc="Local Intercept"
                                progress={Math.min((stats.threats_neutralized / 20) * 100, 100)}
                            />

                            <VisualStatCard
                                label="Elements Masked"
                                value={stats.pii_masked}
                                icon={Lock}
                                color="text-blue-500"
                                desc="Secure Vault"
                                progress={Math.min((stats.pii_masked / 50) * 100, 100)}
                            />

                            <VisualStatCard
                                label="NPU Latency"
                                value={`${stats.latency_saved}ms`}
                                icon={Cpu}
                                color="text-orange-500"
                                desc="XDNA Savings"
                                isNPU
                            />

                            <VisualStatCard
                                label="Impact XP"
                                value={`+${stats.pii_masked * 5 + stats.threats_neutralized * 10}`}
                                icon={TrendingUp}
                                color="text-yellow-500"
                                desc="Rank Gain"
                            />

                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const VisualStatCard = ({ label, value, icon: Icon, color, desc, progress, isNPU }) => (
    <div className="bg-[#0c0c0c] border border-neutral-800/60 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-neutral-900/60 transition-all cursor-default relative overflow-hidden">

        <div className={`p-3 rounded-2xl bg-black border border-neutral-800 mb-3 transition-all group-hover:scale-110 group-hover:border-neutral-700 relative z-10 shadow-xl`}>
            <Icon size={20} className={color} />
        </div>
        <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1 relative z-10">{label}</div>
        <div className="text-2xl font-black text-white tracking-tighter italic mb-1 relative z-10">{value}</div>
        <div className="text-[8px] font-bold text-neutral-800 uppercase tracking-tighter relative z-10">{desc}</div>
    </div>
);

export default DashboardStats;
