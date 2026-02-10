import React, { useState, useEffect } from 'react';
import { Shield, Lock, Cpu, Activity, AlertTriangle, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import LatencyVsCloud from './components/LatencyVsCloud';
import RealTimeLog from './components/RealTimeLog';
import DashboardStats from './components/DashboardStats';
import ShieldToggle from './components/ShieldToggle';
import { api } from './services/api';

function App() {
    const [isActive, setIsActive] = useState(false);
    const [serverStatus, setServerStatus] = useState("Checking...");

    useEffect(() => {
        // Poll for backend status
        const interval = setInterval(async () => {
            const res = await api.getStatus();
            if (res) setServerStatus("Connected to AMD NPU");
            else setServerStatus("Backend Disconnected");
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between z-10">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-orange-600' : 'bg-neutral-800'} transition-colors duration-500`}>
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">RyzenShield</h1>
                    </div>

                    <nav className="space-y-2">
                        {['Dashboard', 'Vault', 'Settings', 'About'].map((item) => (
                            <button key={item} className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium
                ${item === 'Dashboard' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}
              `}>
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">AMD NPU Active</span>
                    </div>
                    <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: isActive ? "100%" : "5%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        />
                    </div>
                    <div className="mt-2 text-xs text-neutral-500 truncate">
                        {serverStatus}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto relative">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold">Privacy Dashboard</h2>
                        <p className="text-neutral-400">Real-time protection status</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-neutral-500'}`}>
                            {isActive ? 'SHIELD ACTIVE' : 'SHIELD DISABLED'}
                        </span>
                        <ShieldToggle isActive={isActive} toggle={() => setIsActive(!isActive)} />
                    </div>
                </header>

                {/* Stats Grid */}
                <DashboardStats />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                    {/* Left Column: Latency Demo */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Monitor size={18} className="text-neutral-400" /> Performance Metrics
                            </h3>
                            <LatencyVsCloud />
                        </section>

                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                            <h3 className="text-lg font-semibold mb-3">Protection Mode</h3>
                            <p className="text-neutral-400 text-sm mb-4">
                                RyzenShield is running in <span className="text-orange-500 font-bold">Hybrid Mode</span>.
                                Network traffic is routed through the local python proxy, and clipboard text is analyzed by the C++ watcher.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Live Logs */}
                    <div className="h-full">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Activity size={18} className="text-neutral-400" /> Live Interception Feed
                        </h3>
                        <RealTimeLog />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
