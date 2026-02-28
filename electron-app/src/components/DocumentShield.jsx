import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, Download, Database, Lock, Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentShield = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [currentScan, setCurrentScan] = useState(null);
    const [linesScanned, setLinesScanned] = useState(0);

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        sanitizeDocument(file);
    };

    const sanitizeDocument = async (file) => {
        setIsScanning(true);
        setCurrentScan(null);
        setLinesScanned(0);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Simulated scanning animation for the IDE
            let scanInterval = setInterval(() => {
                setLinesScanned(prev => prev > 1000 ? 1000 : prev + Math.floor(Math.random() * 50));
            }, 100);

            const res = await fetch("http://127.0.0.1:9000/vault/sanitize-document", {
                method: "POST",
                body: formData
            });

            clearInterval(scanInterval);

            if (res.ok) {
                const data = await res.json();
                if (data.status === "error") {
                    alert(data.error);
                } else {
                    setLinesScanned(100);
                    setCurrentScan(data);
                }
            }
        } catch (err) {
            console.error("Doc Scan Error:", err);
        } finally {
            setIsScanning(false);
        }
    };

    const downloadSanitized = () => {
        if (!currentScan) return;
        const blob = new Blob([currentScan.sanitized_content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shielded_" + currentScan.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full bg-black flex flex-col font-mono text-sm overflow-hidden border border-neutral-900">
            {/* Header: IDE Style Tabs */}
            <div className="flex items-center bg-[#0d0d0d] border-b border-neutral-800">
                <div className="flex items-center px-4 py-2 border-r border-neutral-800 border-b-2 border-b-orange-500 bg-neutral-900 text-orange-400 gap-2">
                    <TerminalIcon size={14} />
                    <span>npu-shield-terminal.rs</span>
                </div>
                <div className="flex-1 px-4 text-[10px] text-neutral-600 uppercase tracking-widest text-right">
                    Zero-Trust Document Sanitization Protocol
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: Action & Original */}
                <div className="w-1/2 flex flex-col border-r border-neutral-800 relative z-10">
                    <div className="p-4 bg-[#111] border-b border-neutral-800 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Database size={14} />
                            <span className="text-xs uppercase font-bold tracking-widest">Input Stream</span>
                        </div>
                        <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border border-neutral-600">
                            Inject Payload
                            <input type="file" className="hidden" onChange={handleFileInput} accept=".txt,.csv,.md" />
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a] text-neutral-500 relative">
                        {!currentScan && !isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                <FileText size={48} className="mb-4" />
                                <p className="uppercase tracking-widest text-xs font-bold w-64 text-center">Awaiting file input for local lexical analysis...</p>
                            </div>
                        )}

                        {isScanning && (
                            <div className="font-mono text-xs text-orange-500/80 space-y-1">
                                <p>&gt; Initializing Ryzon XDNA Kernel...</p>
                                <p>&gt; Allocating secure local enclave...</p>
                                <p>&gt; Stream injected. Parsing binary data...</p>
                                <p>&gt; Executing heuristic regex analysis... [Lines: {linesScanned}]</p>
                                <p className="animate-pulse">&gt; Identifying PII strings...</p>
                            </div>
                        )}

                        {currentScan && (
                            <div className="whitespace-pre-wrap text-neutral-300 font-mono text-xs leading-relaxed selection:bg-orange-900 selection:text-white">
                                {currentScan.original_content}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Processed Output */}
                <div className="w-1/2 flex flex-col relative bg-[#151515]">
                    <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#111]">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Shield size={14} />
                            <span className="text-xs uppercase font-bold tracking-widest">Secure Output Stream</span>
                        </div>
                        {currentScan && (
                            <button
                                onClick={downloadSanitized}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-sm text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                            >
                                <Download size={14} /> Extract Safe File
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 relative">
                        {!currentScan && !isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                <Lock size={48} className="mb-4" />
                            </div>
                        )}

                        <AnimatePresence>
                            {currentScan && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-300"
                                >
                                    {currentScan.sanitized_content.split(/(\[RS-[A-Z]+-\d+\])/g).map((chunk, i) => {
                                        if (chunk.match(/\[RS-[A-Z]+-\d+\]/)) {
                                            return (
                                                <span key={i} className="bg-orange-500 text-black px-1 mx-0.5 font-bold animate-pulse">
                                                    {chunk}
                                                </span>
                                            );
                                        }
                                        return chunk;
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Status Bar */}
                    {currentScan && (
                        <div className="h-8 bg-orange-600 flex items-center px-4 text-black text-xs font-bold uppercase tracking-widest justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={14} /> Shield Active
                            </div>
                            <div>
                                {currentScan.shielded_count} Threat Vectors Neutralized
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentShield;
