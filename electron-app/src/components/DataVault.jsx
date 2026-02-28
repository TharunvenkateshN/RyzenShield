import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Database, Calendar, Search, Cpu, HardDrive, KeyRound, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataVault = () => {
    const [mappings, setMappings] = useState([]);
    const [revealedIds, setRevealedIds] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchMappings = async () => {
        try {
            const res = await fetch('http://127.0.0.1:9000/vault/mappings');
            if (res.ok) {
                const data = await res.json();
                setMappings(data);
            }
        } catch (err) {
            console.error("Vault fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMappings();
        const interval = setInterval(fetchMappings, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleReveal = async (id) => {
        if (revealedIds[id]) {
            const newRevealed = { ...revealedIds };
            delete newRevealed[id];
            setRevealedIds(newRevealed);
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:9000/vault/reveal/${id}`);
            if (res.ok) {
                const data = await res.json();
                setRevealedIds({ ...revealedIds, [id]: data.real_val });
            }
        } catch (err) {
            console.error("Reveal error:", err);
        }
    };

    const filteredMappings = mappings.filter(m =>
        m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fake_val.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (ts) => {
        return new Date(ts + " UTC").toLocaleString();
    };

    return (
        <div className="h-full flex flex-col bg-[#050200] overflow-hidden selection:bg-orange-500/30 font-mono relative">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Standardized Header */}
            <div className="flex items-center justify-between bg-[#110500]/90 backdrop-blur-md border-b border-orange-500/20 px-6 py-3 shrink-0 relative z-10 w-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Database size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Identity Vault</h1>
                        <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.2em] mt-1 font-sans">Ryzen Secure Enclave Ledger</p>
                    </div>
                </div>

                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/50 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="SEARCH ENCLAVE MAPPINGS..."
                        className="w-full bg-[#0c0400] border border-orange-500/30 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-orange-500 placeholder-orange-500/30 focus:outline-none focus:border-orange-500 focus:bg-orange-500/5 transition-all text-transform: uppercase"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        spellCheck="false"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-6 custom-scrollbar">

                {/* Hardware Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <StatusToggle icon={HardDrive} label="Storage Subsystem" value="Local SQLite DB" status="ONLINE" />
                    <StatusToggle icon={Cpu} label="Crypto Engine" value="NPU XDNA Enclave" status="ACTIVE" isWorking={mappings.length > 0} />
                    <StatusToggle icon={Lock} label="Access Matrix" value="Local-Host Only" status="SECURE" />
                </div>

                {/* Ledger Table Container */}
                <div className="flex-1 bg-[#0c0400]/80 backdrop-blur-md border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.05)] flex flex-col overflow-hidden relative">
                    {/* Decorative Top Bar */}
                    <div className="bg-orange-500/10 border-b border-orange-500/20 p-2 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 px-2 text-orange-500/60 font-bold tracking-[0.2em] uppercase text-[10px]">
                            <KeyRound size={12} /> Interception Log
                        </div>
                        <div className="flex gap-1.5 px-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-orange-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-orange-500/50 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#110500] z-20 shadow-md">
                                <tr className="border-b border-orange-500/30">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/60 w-1/4">Timestamp (UTC)</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/60 w-1/6">Entity Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/60 w-auto">Protected Value Mapping</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/60 w-1/12 text-right">Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-500/10">
                                <AnimatePresence>
                                    {filteredMappings.map((m, i) => (
                                        <motion.tr
                                            key={m.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(i * 0.05, 0.5) }}
                                            className="group hover:bg-orange-500/5 transition-colors relative"
                                        >
                                            <td className="px-6 py-4 text-xs font-mono text-neutral-400 group-hover:text-orange-200 transition-colors">
                                                {formatTime(m.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2 py-1 border border-orange-500/20 rounded uppercase tracking-widest shadow-inner group-hover:bg-orange-500 group-hover:text-black transition-colors">
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={`text-sm font-black tracking-wider transition-colors pt-1 ${revealedIds[m.id] ? 'text-green-400' : 'text-neutral-300 group-hover:text-white'}`}>
                                                        {revealedIds[m.id] ? revealedIds[m.id] : m.fake_val}
                                                    </div>

                                                    {!revealedIds[m.id] ? (
                                                        <div className="text-[9px] text-orange-500/40 uppercase tracking-widest flex items-center gap-1 font-bold">
                                                            <Lock size={10} className="text-orange-500/60" /> ENCRYPTED LSB PAYLOAD
                                                        </div>
                                                    ) : (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[9px] text-green-500 uppercase tracking-widest flex items-center gap-1 font-bold">
                                                            <ShieldCheck size={10} /> DE-SANITISED VIA LOCAL NPU KEY
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggleReveal(m.id)}
                                                    className={`p-2 rounded border transition-all shadow-md active:scale-95 ${revealedIds[m.id]
                                                        ? 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
                                                        : 'bg-[#110500] border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-black hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                                                        }`}
                                                    title={revealedIds[m.id] ? "Conceal Origin" : "Decrypt Origin"}
                                                >
                                                    {revealedIds[m.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {/* Empty States */}
                        {filteredMappings.length === 0 && !isLoading && searchTerm && (
                            <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                                <Search className="w-12 h-12 text-orange-500/30" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/50">Query yielded zero matches</div>
                            </div>
                        )}
                        {filteredMappings.length === 0 && !isLoading && !searchTerm && (
                            <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                                <AlertTriangle className="w-16 h-16 text-orange-500/20" />
                                <div>
                                    <div className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Enclave Empty</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500/50 mt-2">No interception events recorded yet</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusToggle = ({ icon: Icon, label, value, status, isWorking }) => (
    <div className="bg-[#0c0400] border border-orange-500/20 p-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50 group-hover:bg-orange-500 transition-colors" />
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Icon size={100} />
        </div>

        <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 p-2.5 rounded border border-orange-500/20 shadow-inner group-hover:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-shadow">
                    <Icon size={18} className={`text-orange-500 ${isWorking ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                    <div className="text-[9px] font-black text-orange-500/60 uppercase tracking-[0.2em] mb-0.5">{label}</div>
                    <div className="text-sm font-bold text-neutral-200 tracking-tight font-sans">{value}</div>
                </div>
            </div>
            <div className="text-[9px] font-black text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1.5 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {status}
            </div>
        </div>
    </div>
);

// Fallback icon for ShieldCheck if not imported above
const ShieldCheck = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);

export default DataVault;
