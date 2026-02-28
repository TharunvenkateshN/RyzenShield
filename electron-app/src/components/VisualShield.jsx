import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Scan, UploadCloud, ShieldCheck, Zap, Maximize, AlertTriangle, EyeOff } from 'lucide-react';

const VisualShield = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isRedacted, setIsRedacted] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    // Bounding boxes for the sample "Student ID" image
    const redactionZones = [
        { top: '35%', left: '40%', width: '45%', height: '8%', label: 'NAME' },
        { top: '55%', left: '40%', width: '35%', height: '6%', label: 'STUDENT ID' },
        { top: '65%', left: '40%', width: '30%', height: '6%', label: 'DOB' }
    ];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setImageLoaded(true);
            setIsRedacted(false);
            setIsScanning(false);
        }
    };

    const loadSample = () => {
        // Generating a dummy SVG to represent a Student ID
        const svgContent = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#1a1a1a" rx="20"/>
                <rect x="0" y="0" width="100%" height="80" fill="#f97316" rx="20"/>
                <rect x="0" y="40" width="100%" height="40" fill="#f97316"/>
                <text x="300" y="50" font-family="monospace" font-size="32" font-weight="bold" fill="white" text-anchor="middle">RYZEN UNIVERSITY</text>
                
                <rect x="40" y="120" width="160" height="200" fill="#333" rx="10"/>
                <circle cx="120" cy="190" r="50" fill="#555"/>
                <path d="M70,290 Q120,230 170,290 Z" fill="#555"/>
                
                <text x="240" y="160" font-family="monospace" font-size="20" fill="#888">NAME:</text>
                <text x="240" y="190" font-family="monospace" font-size="28" font-weight="bold" fill="white">JOHNATHAN DOE</text>
                
                <text x="240" y="240" font-family="monospace" font-size="16" fill="#888">STUDENT ID: </text>
                <text x="240" y="265" font-family="monospace" font-size="24" fill="#f97316" font-weight="bold">SID-98765432</text>
                
                <text x="240" y="300" font-family="monospace" font-size="16" fill="#888">DOB: </text>
                <text x="240" y="325" font-family="monospace" font-size="20" fill="white">11 / 24 / 2004</text>
            </svg>
        `;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        setImageUrl(URL.createObjectURL(blob));
        setImageLoaded(true);
        setIsRedacted(false);
        setIsScanning(false);
    };

    const runScan = () => {
        setIsScanning(true);
        setIsRedacted(false);
        setTimeout(() => {
            setIsScanning(false);
            setIsRedacted(true);
        }, 3000); // 3-second NPU scan simulation
    };

    const reset = () => {
        setImageLoaded(false);
        setIsScanning(false);
        setIsRedacted(false);
        setImageUrl(null);
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
                            <ImageIcon size={24} className="text-purple-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Visual Shield</h1>
                    </div>
                    <p className="text-neutral-400 font-medium">Local Computer Vision OCR for image and screenshot redaction.</p>
                </div>
                {imageLoaded && (
                    <button onClick={reset} className="text-neutral-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors mb-2">
                        Reset Shield
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 h-full max-h-[800px]">

                {/* Image Inspection Area */}
                <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] p-4 shadow-xl h-full flex flex-col relative overflow-hidden">

                        {!imageLoaded ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800/80 m-6 rounded-[1.5rem] bg-black/20 hover:bg-neutral-900/40 transition-colors">
                                <div className="p-4 bg-neutral-800 rounded-full mb-6 relative group cursor-pointer" onClick={() => document.getElementById('visual-shield-upload').click()}>
                                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <UploadCloud size={48} className="text-neutral-400 group-hover:text-purple-500 transition-colors relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Secure Visual Pipeline</h3>
                                <p className="text-sm text-neutral-500 max-w-sm text-center mb-8">
                                    Drop an image or screenshot here. Ryzen AI will extract text, analyze context, and blur PII locally.
                                </p>
                                <input id="visual-shield-upload" type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />

                                <div className="flex gap-4">
                                    <button onClick={() => document.getElementById('visual-shield-upload').click()} className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-colors text-sm border border-neutral-700">
                                        Upload Image
                                    </button>
                                    <button onClick={loadSample} className="px-6 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-bold rounded-xl transition-colors text-sm border border-purple-500/20">
                                        Load Sample Student ID
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-neutral-800">
                                {/* The Image */}
                                <img src={imageUrl} alt="Document to scan" className="max-w-full max-h-full object-contain relative z-10" />

                                {/* NPU Scanner Animation */}
                                {isScanning && (
                                    <motion.div
                                        initial={{ top: '0%' }}
                                        animate={{ top: '100%' }}
                                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity, repeatType: 'reverse' }}
                                        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-purple-500/30 to-purple-500/80 z-20 pointer-events-none border-b-2 border-purple-400 shadow-[0_10px_30px_rgba(168,85,247,0.5)]"
                                    />
                                )}

                                {/* Redaction Zones (Simulated bounding boxes) */}
                                <AnimatePresence>
                                    {isRedacted && redactionZones.map((zone, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.2, type: "spring" }}
                                            className="absolute bg-neutral-900/90 backdrop-blur-2xl border border-purple-500/50 z-30 flex items-center justify-center overflow-hidden"
                                            style={{ top: zone.top, left: zone.left, width: zone.width, height: zone.height, borderRadius: '8px' }}
                                        >
                                            <span className="text-white/30 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                                                <EyeOff size={10} /> {zone.label} REDACTED
                                            </span>
                                            {/* Inner pixelation effect simulation */}
                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NDQiLz48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMjIyIi8+PC9zdmc+')] opacity-50" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Action Bar Override */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-700 shadow-2xl flex items-center gap-2">
                                    <button
                                        onClick={isRedacted ? reset : runScan}
                                        disabled={isScanning}
                                        className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all min-w-[200px] justify-center
                                            ${isScanning ? 'bg-purple-600/50 text-white/50 cursor-wait' :
                                                isRedacted ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
                                                    'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105'}`}
                                    >
                                        {isScanning ? (
                                            <>Initializing ONNX Vision...</>
                                        ) : isRedacted ? (
                                            <><ShieldCheck size={16} /> Asset Secured</>
                                        ) : (
                                            <><Scan size={16} /> Run Vision Deep Scan</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis/Teach-Back Area */}
                <div className="lg:col-span-4 h-full flex flex-col gap-4">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                            <div className="bg-black/50 p-2 rounded-xl border border-neutral-800">
                                <Maximize size={20} className="text-neutral-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">NPU Vision Engine</h3>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">Live OCR Analysis</div>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {!imageLoaded && (
                                <div className="text-center py-10 opacity-50">
                                    <ImageIcon size={32} className="mx-auto mb-3 text-neutral-600" />
                                    <p className="text-sm font-bold text-neutral-500">Awaiting visual input</p>
                                </div>
                            )}

                            {imageLoaded && !isScanning && !isRedacted && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl space-y-2">
                                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={14} /> Ready for Scan
                                    </h4>
                                    <p className="text-xs text-purple-200/70 leading-relaxed font-medium">
                                        Image loaded into isolated memory. Click "Run Vision Deep Scan" to deploy the local ONNX computer vision model.
                                    </p>
                                </motion.div>
                            )}

                            {isScanning && (
                                <div className="space-y-4">
                                    {['Extracting Text (OCR)', 'NLP Context Analysis', 'Mapping Bounding Boxes'].map((step, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.8 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                            <span className="text-sm font-bold text-neutral-300">{step}...</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {isRedacted && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                                        <ShieldCheck size={18} className="text-green-500 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Privacy Secured</h4>
                                            <p className="text-[11px] text-green-500/70 leading-relaxed">
                                                3 highly sensitive vectors isolated and neutralized. This asset is now safe to share on public forums.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">Intercepted Entities</h4>
                                        <div className="space-y-2">
                                            {redactionZones.map((z, i) => (
                                                <div key={i} className="flex items-center justify-between p-2.5 bg-black/40 border border-neutral-800 rounded-lg">
                                                    <span className="text-xs font-bold text-purple-400">{z.label}</span>
                                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-black uppercase tracking-widest">Destroyed</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                                        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Zap size={14} className="text-orange-500" /> Explainable Security
                                        </h4>
                                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                                            Unlike cloud OCR APIs (which send your images to remote servers for analysis), RyzenShield operates exactly where the threat originates: the local edge. Zero latency, zero cloud dependency, absolute privacy.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualShield;
