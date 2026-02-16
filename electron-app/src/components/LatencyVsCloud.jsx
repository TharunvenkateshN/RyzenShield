import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Zap, Cpu, Activity } from 'lucide-react';

const LatencyVsCloud = () => {
    const [linePoints, setLinePoints] = useState("");

    // Generate a simulated live "Oscilloscope" pulse
    useEffect(() => {
        let frame = 0;
        const interval = setInterval(() => {
            frame++;
            const points = [];
            for (let x = 0; x <= 300; x += 10) {
                // Wave is smaller for NPU (Local) and erratic for Cloud
                const y = 50 + Math.sin((x + frame * 10) * 0.05) * 20;
                points.push(`${x},${y}`);
            }
            setLinePoints(points.join(" "));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0c0c0c] border border-neutral-800 p-8 rounded-[2.5rem] w-full relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <h3 className="text-xs font-black tracking-[0.2em] text-neutral-600 uppercase">Live Hardware Pulse</h3>
                    <div className="text-lg font-black text-white italic tracking-tighter">NPU vs Cloud Latency</div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-black text-red-500 uppercase tracking-widest">
                        Cloud [1.2s]
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest">
                        Ryzen NPU [0.05s]
                    </div>
                </div>
            </div>

            {/* Simulated Live Graph */}
            <div className="h-24 w-full bg-neutral-950/50 rounded-2xl border border-neutral-900 relative p-4 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    {/* Background Grid */}
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#1a1a1a" strokeWidth="1" />

                    {/* Cloud Wave (Chaotic) */}
                    <motion.polyline
                        points={linePoints}
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.2)"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                    />

                    {/* NPU Wave (Stable & Flat) */}
                    <motion.path
                        d="M 0 50 Q 75 45 150 50 T 300 50"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        animate={{ d: ["M 0 50 Q 75 45 150 50 T 300 50", "M 0 50 Q 75 55 150 50 T 300 50", "M 0 50 Q 75 45 150 50 T 300 50"] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                </svg>

                {/* Floating Scanning Line */}
                <motion.div
                    animate={{ left: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-[1px] bg-orange-500 shadow-[0_0_10px_orange] opacity-50"
                />
            </div>

            <div className="mt-6 flex justify-between items-center bg-black/40 p-4 rounded-xl border border-neutral-900 group-hover:border-neutral-800 transition-all">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                        <Cpu size={16} className="text-orange-500" />
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400">
                        PROCESSING MODE: <span className="text-orange-500">XDNA ACCELERATED</span>
                    </div>
                </div>
                <TrendingDown size={16} className="text-orange-500 animate-bounce" />
            </div>
        </div>
    );
};

export default LatencyVsCloud;
