import React, { useState } from 'react';
import ShieldToggle from './components/ShieldToggle';
import LatencyVsCloud from './components/LatencyVsCloud';
import RealTimeLog from './components/RealTimeLog';
import DashboardStats from './components/DashboardStats';
import SecureBrowser from './components/SecureBrowser'; // Import Browser
import DataVault from './components/DataVault';
import PerformanceLab from './components/PerformanceLab';
import { LayoutDashboard, Globe, Cpu, Settings, Lock, Activity, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isShieldActive, setIsShieldActive] = useState(true); // Default ON

    console.log("[RyzenShield] App component rendering, activeTab:", activeTab);

    React.useEffect(() => {
        const checkBackend = () => {
            fetch('http://127.0.0.1:9000/')
                .then(res => res.json())
                .then(data => console.log("[RyzenShield] ✅ Backend Reachable on 9000:", data))
                .catch(err => {
                    console.log("[RyzenShield] ⏳ Waiting for backend on 9000...");
                });
        };
        checkBackend();
        const interval = setInterval(checkBackend, 5000);
        return () => clearInterval(interval);
    }, []);

    // Custom Title Bar Dragging Logic
    const handleDrag = (e) => {
        // ipcRenderer.send('window-moving', { mouseX: e.clientX, mouseY: e.clientY });
    };

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left
        ${activeTab === id
                    ? 'bg-orange-500/10 text-orange-500 border-l-2 border-orange-500'
                    : 'text-neutral-400 hover:bg-neutral-800'
                }
      `}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="bg-[#0a0a0a] w-screen h-screen text-white flex overflow-hidden font-sans select-none">

            {/* Sidebar */}
            <div className="w-64 bg-black border-r border-neutral-800 flex flex-col p-4">

                {/* Logo Area (The only draggable part of the sidebar) */}
                <div className="flex items-center gap-3 mb-8 px-2 drag-region">
                    {/* The Logo Icon & Text */}
                    <div className="flex items-center gap-2">
                        <ShieldCheck
                            className={`w-8 h-8 transition-colors ${isShieldActive ? 'text-orange-500' : 'text-neutral-600'}`}
                            strokeWidth={2.5}
                        />
                        <span className={`font-bold text-lg tracking-tight transition-colors ${isShieldActive ? 'text-orange-500' : 'text-white'}`}>
                            RyzenShield
                        </span>
                    </div>

                    {/* Keeping the Toggle Here? Or Move it? 
               User mentioned "toggle button which was there at the top right before".
               Maybe they prefer toggle separate.
               But for now, I'll keep the toggle next to it or below it?
               Let's put the toggle ON THE RIGHT of the header?
            */}
                </div>

                {/* Toggle Switch - moved slightly down or right */}
                <div className="mb-6 px-2 flex justify-between items-center bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                    <span className="text-xs text-neutral-400 font-mono">PROTECTION</span>
                    <ShieldToggle isActive={isShieldActive} toggle={() => setIsShieldActive(!isShieldActive)} />
                </div>

                <nav className="flex-1 space-y-1">
                    <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem id="browser" icon={Globe} label="Secure Browser" />
                    <NavItem id="vault" icon={Lock} label="Data Vault" />
                    <NavItem id="performance" icon={Zap} label="Performance Lab" />
                    <NavItem id="settings" icon={Settings} label="Settings" />
                </nav>

                <div className="mt-auto pt-6 border-t border-neutral-900 space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-orange-500/10 blur-[20px] rounded-full group-hover:bg-orange-500/20 transition-all" />
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/50 rounded-2xl border border-neutral-800 relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-1">
                                <motion.div
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1 h-1 bg-orange-500 rounded-full"
                                />
                            </div>
                            <Cpu size={20} className="text-orange-500" />
                            <div>
                                <div className="text-[10px] font-black text-white uppercase tracking-widest italic leading-none">AMD Ryzen™ AI</div>
                                <div className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-1">XDNA Core v1.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Custom Window Title Bar & Controls */}
                <div className="h-10 bg-black border-b border-neutral-900 flex items-center justify-between px-4 drag-region shrink-0">
                    <div className="text-[10px] font-black tracking-[0.3em] text-neutral-700 uppercase">
                        {activeTab === 'browser' ? 'Browser Session' : 'Secured Environment'}
                    </div>

                    <div className="flex items-center no-drag">
                        <button
                            onClick={() => window.electron.ipcRenderer.send('window-minimize')}
                            className="p-2 hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
                        >
                            <div className="w-3 h-[1px] bg-current" />
                        </button>
                        <button
                            onClick={() => window.electron.ipcRenderer.send('window-maximize')}
                            className="p-2 hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
                        >
                            <div className="w-3 h-3 border border-current" />
                        </button>
                        <button
                            onClick={() => window.electron.ipcRenderer.send('window-close')}
                            className="p-2 hover:bg-red-600 text-neutral-500 hover:text-white transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
                        </button>
                    </div>
                </div>

                <div className={`flex-1 overflow-y-auto bg-[#0a0a0a] ${activeTab === 'browser' ? 'p-0' : 'p-4'}`}>
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 max-w-5xl mx-auto">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">Privacy Dashboard</h1>
                                <p className="text-neutral-500 text-sm">Real-time protection status</p>
                            </div>

                            <DashboardStats />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                        <Cpu size={14} /> Performance Metrics
                                    </h2>
                                    <LatencyVsCloud />

                                    <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl mt-4">
                                        <h3 className="font-bold text-sm mb-2">Protection Mode</h3>
                                        <p className="text-xs text-neutral-400 leading-relaxed">
                                            RyzenShield is running in <span className="text-orange-500 font-bold">Hybrid Mode</span>.
                                            Network traffic is routed through the local python proxy, and clipboard text is analyzed by the C++ watcher.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                        <Activity size={14} /> Live Interception Feed
                                    </h2>
                                    <RealTimeLog />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ALWAYS mount SecureBrowser to keep session alive, use tailwind to hide when not active */}
                    <div className={`h-full ${activeTab === 'browser' ? 'block' : 'hidden'}`}>
                        <SecureBrowser />
                    </div>

                    {/* Data Vault Tab */}
                    {activeTab === 'vault' && (
                        <DataVault />
                    )}

                    {/* Performance Lab Tab */}
                    {activeTab === 'performance' && (
                        <PerformanceLab />
                    )}
                    {activeTab === 'settings' && (
                        <div className="flex items-center justify-center h-full text-neutral-500">Settings UI Coming Soon</div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default App;
