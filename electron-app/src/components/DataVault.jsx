import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Database, Calendar, Search, Cpu } from 'lucide-react';
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
        <div className="p-8 space-y-8 max-w-6xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-600/20 p-2 rounded-xl">
                            <Lock className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Identity Vault</h1>
                    </div>
                    <p className="text-neutral-400 max-w-md">
                        Encrypted ledger of all masked PII. Data is stored in the
                        <span className="text-orange-500 font-semibold italic ml-1 flex-inline items-center gap-1">
                            Ryzen Secure Enclave
                        </span>.
                    </p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search masked elements..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Hardware Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusToggle icon={Database} label="Storage" value="Local SQLite" />
                <StatusToggle icon={Cpu} label="Encryption" value="XDNA Enclave" />
                <StatusToggle icon={Shield} label="Access" value="Local Only" />
            </div>



            {/* Ledger Table */}
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-neutral-900/50 border-b border-neutral-800">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Timestamp</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Type</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Protected Value</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        <AnimatePresence>
                            {filteredMappings.map((m, i) => (
                                <motion.tr
                                    key={m.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-4 text-xs font-mono text-neutral-400">
                                        {formatTime(m.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold bg-orange-600/10 text-orange-500 px-2 py-0.5 rounded-md border border-orange-500/20 uppercase tracking-tighter">
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-black text-white selection:bg-orange-500/30">
                                                {revealedIds[m.id] || m.fake_val}
                                            </div>
                                            {revealedIds[m.id] && (
                                                <div className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                                                    <Shield size={10} /> DE-SANITISED VIA LOCAL NPU
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleReveal(m.id)}
                                            className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all border border-transparent hover:border-neutral-600"
                                        >
                                            {revealedIds[m.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredMappings.length === 0 && !isLoading && (
                    <div className="p-12 text-center space-y-3">
                        <Database className="w-12 h-12 text-neutral-700 mx-auto" />
                        <div className="text-neutral-500 font-medium">No leakage events detected yet.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusToggle = ({ icon: Icon, label, value }) => (
    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center gap-4 group">
        <div className="bg-black p-3 rounded-xl border border-neutral-800 group-hover:border-orange-500/30 transition-colors">
            <Icon size={18} className="text-neutral-500 group-hover:text-orange-500 transition-colors" />
        </div>
        <div>
            <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{label}</div>
            <div className="text-sm font-bold text-white tracking-tight">{value}</div>
        </div>
    </div>
);

export default DataVault;
