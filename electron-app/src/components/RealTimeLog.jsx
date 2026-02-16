import React, { useEffect, useState } from 'react';
import { Terminal, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RealTimeLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('http://127.0.0.1:9000/logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (err) { }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (ts) => {
        if (!ts) return new Date().toLocaleTimeString();
        return new Date(ts + " UTC").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[400px] shadow-2xl">
            <div className="p-6 border-b border-neutral-800 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-900 rounded-lg">
                        <Terminal size={16} className="text-orange-500" />
                    </div>
                    <span className="text-xs font-black tracking-widest text-neutral-400 uppercase">Neural Audit Ledger</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Live Sync</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {logs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-2 italic"
                        >
                            <Search size={24} className="opacity-20" />
                            <span>Monitoring local traffic buffers...</span>
                        </motion.div>
                    )}
                    {logs.map((log, i) => (
                        <motion.div
                            key={log.id || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="group flex gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-neutral-800/50"
                        >
                            <div className="shrink-0 pt-0.5">
                                {log.event_type === 'INTERCEPT' && <Shield size={12} className="text-orange-500" />}
                                {log.event_type === 'WARN' && <AlertTriangle size={12} className="text-yellow-500" />}
                                {log.event_type === 'SUCCESS' && <CheckCircle size={12} className="text-green-500" />}
                                {(!['INTERCEPT', 'WARN', 'SUCCESS'].includes(log.event_type)) && <div className="w-1 h-1 bg-neutral-700 rounded-full mt-1.5" />}
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className={`font-black tracking-tighter uppercase ${log.event_type === 'INTERCEPT' ? 'text-orange-500' :
                                            log.event_type === 'WARN' ? 'text-yellow-500' :
                                                log.event_type === 'SUCCESS' ? 'text-green-500' : 'text-neutral-500'
                                        }`}>
                                        {log.event_type}
                                    </span>
                                    <span className="text-[9px] text-neutral-700 font-bold tracking-widest">{formatTime(log.timestamp)}</span>
                                </div>
                                <div className="text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed">
                                    {log.message}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RealTimeLog;
