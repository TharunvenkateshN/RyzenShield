import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Focus, Crosshair, AlertTriangle, Fingerprint, Aperture, EyeOff, ShieldAlert } from 'lucide-react';

const VisualShield = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isRedacted, setIsRedacted] = useState(false);
    const [imageUrl, setImageUrl] = useState("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDcwNzA3Ij48L3N2Zz4="); // Default dark blank
    const [isSample, setIsSample] = useState(false);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    // Bounding boxes for the sample "Student ID" image
    const sampleZones = [
        { top: '35%', left: '40%', width: '45%', height: '8%', label: 'NAME' },
        { top: '55%', left: '40%', width: '35%', height: '6%', label: 'STUDENT ID' },
        { top: '65%', left: '40%', width: '30%', height: '6%', label: 'DOB' }
    ];

    const uploadedZones = [
        { top: '69%', left: '15%', width: '70%', height: '6%', label: 'NAME' },
        { top: '74%', left: '10%', width: '80%', height: '5%', label: 'STUDENT ID' },
        { top: '88%', left: '25%', width: '30%', height: '4%', label: 'DOB' }
    ];

    const redactionZones = isSample ? sampleZones : uploadedZones;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setImageLoaded(true);
            setIsRedacted(false);
            setIsScanning(false);
            setIsSample(false);
        }
    };

    const loadSample = () => {
        const svgContent = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#0a0a0a" rx="10"/>
                <rect x="0" y="0" width="100%" height="60" fill="#00e5ff" />
                <rect x="0" y="30" width="100%" height="30" fill="#00b4d8"/>
                <text x="300" y="40" font-family="monospace" font-size="24" font-weight="bold" fill="white" text-anchor="middle">RYZEN UNIVERSITY</text>
                
                <rect x="50" y="100" width="140" height="180" fill="#111" rx="5" stroke="#00e5ff" stroke-width="2"/>
                <circle cx="120" cy="160" r="40" fill="#222"/>
                <path d="M80,240 Q120,200 160,240 Z" fill="#222"/>
                
                <text x="220" y="140" font-family="monospace" font-size="16" fill="#00e5ff">PERSONNEL_NAME:</text>
                <text x="220" y="170" font-family="monospace" font-size="28" font-weight="bold" fill="white">JOHNATHAN DOE</text>
                
                <text x="220" y="220" font-family="monospace" font-size="14" fill="#00e5ff">IDENTIFICATION UID: </text>
                <text x="220" y="245" font-family="monospace" font-size="24" fill="#00b4d8" font-weight="bold">SID-98765432</text>
                
                <text x="220" y="290" font-family="monospace" font-size="14" fill="#00e5ff">BIRTH_RECORD: </text>
                <text x="220" y="315" font-family="monospace" font-size="20" fill="white">11.24.2004</text>
            </svg>
        `;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        setImageUrl(URL.createObjectURL(blob));
        setImageLoaded(true);
        setIsRedacted(false);
        setIsScanning(false);
        setIsSample(true);
    };

    const runScan = () => {
        setIsScanning(true);
        setIsRedacted(false);
        setTimeout(() => {
            setIsScanning(false);
            setIsRedacted(true);
        }, 3000);
    };

    const downloadRedactedImage = () => {
        if (!imageRef.current || !containerRef.current) return;
        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        const imgRect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / imgRect.width;
        const scaleY = img.naturalHeight / imgRect.height;

        const boxes = containerRef.current.querySelectorAll('.redaction-box');
        boxes.forEach(box => {
            const rect = box.getBoundingClientRect();
            const x = (rect.left - imgRect.left) * scaleX;
            const y = (rect.top - imgRect.top) * scaleY;
            const w = rect.width * scaleX;
            const h = rect.height * scaleY;

            // Pixelation simulation for HUD UI download
            ctx.fillStyle = '#0ff';
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = 'black';
            ctx.font = 'bold ' + Math.max(14, 20 * scaleX) + 'px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('REDACTED', x + w / 2, y + h / 2);
        });

        const link = document.createElement('a');
        link.download = 'VisualShield_Redacted.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="h-full bg-black text-[#00e5ff] font-mono flex flex-col overflow-hidden selection:bg-[#00e5ff] selection:text-black">
            {/* Top HUD Bar */}
            <div className="flex items-center justify-between border-b border-[#00e5ff]/20 px-6 py-3 bg-[#001015]">
                <div className="flex items-center gap-4">
                    <Aperture size={20} className="animate-[spin_4s_linear_infinite] text-[#00e5ff]" />
                    <div>
                        <h1 className="text-xl font-bold tracking-[0.3em] uppercase">Visual Security Grid</h1>
                        <p className="text-[10px] text-[#00b4d8] tracking-widest uppercase">Local Vision Processing • Node Offline</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {!imageLoaded ? (
                        <>
                            <input id="hud-upload" type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />
                            <button onClick={() => document.getElementById('hud-upload').click()} className="px-4 py-1.5 border border-[#00e5ff]/50 hover:bg-[#00e5ff]/10 text-xs tracking-widest uppercase transition-colors">
                                Load Target
                            </button>
                            <button onClick={loadSample} className="px-4 py-1.5 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/40 text-[#00e5ff] border border-[#00e5ff] text-xs font-bold tracking-widest uppercase transition-colors">
                                Inject Sample ID
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { setImageLoaded(false); setImageUrl("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDcwNzA3Ij48L3N2Zz4="); setIsRedacted(false); setIsScanning(false); }} className="text-red-500 hover:text-red-400 text-xs tracking-widest uppercase border border-red-500/50 px-4 py-1 flex items-center gap-2 hover:bg-red-500/10 transition-colors">
                            <Crosshair size={14} /> Clear Buffer
                        </button>
                    )}
                </div>
            </div>

            {/* Main HUD Display */}
            <div className="flex-1 flex relative p-6">

                {/* Left Telemetry Panel */}
                <div className="w-64 flex flex-col gap-6 pr-6 border-r border-[#00e5ff]/20 shrink-0">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] text-[#00b4d8] mb-3 border-b border-[#00e5ff]/20 pb-2">Status</h3>
                        <div className="space-y-4 text-[10px] tracking-widest">
                            <div className="flex justify-between">
                                <span className="opacity-50">Core</span>
                                <span className={imageLoaded ? "text-green-400" : "text-red-500 animate-pulse"}>{imageLoaded ? "LOCKED" : "STANDBY"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-50">NPU Engine</span>
                                <span className={isScanning ? "text-[#00e5ff] animate-pulse" : isRedacted ? "text-green-500" : "text-neutral-500"}>
                                    {isScanning ? "PROCESSING" : isRedacted ? "COMPLETE" : "IDLE"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-50">Telemetry</span>
                                <span className="opacity-70">OFFLINE</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-[#00b4d8] mb-3 border-b border-[#00e5ff]/20 pb-2">Entity Logs</h3>
                        <div className="space-y-2">
                            {isScanning && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] space-y-2 opacity-70">
                                    <p>&gt; Initiating OCR sweep...</p>
                                    <p className="delay-100">&gt; Analyzing facial metrics...</p>
                                    <p className="delay-200">&gt; Calculating bounding box vectors...</p>
                                </motion.div>
                            )}
                            {isRedacted && redactionZones.map((z, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-2 text-[10px] text-red-400 bg-red-900/10 border border-red-500/20 p-2 uppercase tracking-widest">
                                    <EyeOff size={10} /> {z.label} NEUTRALIZED
                                </motion.div>
                            ))}
                            {!isScanning && !isRedacted && imageLoaded && (
                                <p className="text-[10px] opacity-40 uppercase tracking-widest">&gt; Geometry acquired. Awaiting scan execution.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#00e5ff]/20">
                        {imageLoaded && !isRedacted && (
                            <button
                                onClick={runScan}
                                disabled={isScanning}
                                className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] border transition-all flex justify-center items-center gap-2
                                    ${isScanning ? 'border-[#00e5ff]/30 text-[#00e5ff]/30 cursor-wait bg-[#00e5ff]/5' : 'bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.2)]'}`}
                            >
                                {isScanning ? <><Focus className="animate-spin" size={16} /> Isolating...</> : <><Scan size={16} /> Execute Neural Scan</>}
                            </button>
                        )}

                        {isRedacted && (
                            <button
                                onClick={downloadRedactedImage}
                                className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] bg-green-500/10 hover:bg-green-500/20 border border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all flex justify-center items-center gap-2"
                            >
                                <Lock size={16} /> Export Safe Intel
                            </button>
                        )}
                    </div>
                </div>

                {/* Central Radar Canvas */}
                <div className="flex-1 ml-6 relative bg-[#020608] border border-[#00e5ff]/30 rounded-xl overflow-hidden flex items-center justify-center">

                    {/* Corner Reticles */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#00e5ff]/50 z-20 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#00e5ff]/50 z-20 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#00e5ff]/50 z-20 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#00e5ff]/50 z-20 pointer-events-none" />

                    {/* Grid Background */}
                    <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {!imageLoaded && (
                        <div className="absolute flex flex-col items-center opacity-30 text-[#00e5ff]">
                            <Fingerprint size={64} className="mb-4 animate-pulse" />
                            <p className="uppercase tracking-[0.3em] font-bold text-sm">NO SIGNAL</p>
                        </div>
                    )}

                    {imageLoaded && (
                        <div ref={containerRef} className="relative z-10 max-w-full max-h-full flex items-center justify-center p-8">
                            <img ref={imageRef} src={imageUrl} alt="Target" className={`max-w-full max-h-[600px] object-contain transition-all duration-1000 ${isScanning ? 'contrast-125 sepia-[.3] hue-rotate-[180deg]' : ''}`} />

                            {/* Laser Scanner */}
                            {isScanning && (
                                <motion.div
                                    initial={{ top: '0%' }}
                                    animate={{ top: '100%' }}
                                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity, repeatType: 'reverse' }}
                                    className="absolute left-0 right-0 h-1 bg-[#00e5ff] shadow-[0_0_20px_10px_rgba(0,229,255,0.4)] z-20 pointer-events-none"
                                />
                            )}

                            <AnimatePresence>
                                {isRedacted && redactionZones.map((zone, idx) => (
                                    <motion.div
                                        key={idx}
                                        drag
                                        dragMomentum={false}
                                        initial={{ opacity: 0, scale: 2 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                                        className="redaction-box absolute bg-[#00e5ff] z-30 flex items-center justify-center overflow-hidden cursor-move border-2 border-black mix-blend-exclusion"
                                        style={{ top: zone.top, left: zone.left, width: zone.width, height: zone.height }}
                                    >
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] opacity-30 pointer-events-none" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualShield;
