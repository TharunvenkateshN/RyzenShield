import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Zap } from 'lucide-react';

const LatencyVsCloud = () => {
    return (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500" /> Latency Comparison
            </h3>

            {/* Cloud API Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-neutral-400 mb-1">
                    <span>Cloud Privacy API (Traditional)</span>
                    <span>1.2s</span>
                </div>
                <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="h-full bg-red-500/50"
                    />
                </div>
            </div>

            {/* RyzenShield NPU Bar */}
            <div>
                <div className="flex justify-between text-sm text-neutral-400 mb-1">
                    <span className="text-orange-500 font-semibold">RyzenShield NPU (Local)</span>
                    <span className="text-orange-500">0.05s</span>
                </div>
                <div className="h-4 bg-neutral-800 rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "15%" }}
                        transition={{ duration: 0.05, repeat: Infinity, repeatDelay: 1 }}
                        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(255,121,0,0.5)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default LatencyVsCloud;
