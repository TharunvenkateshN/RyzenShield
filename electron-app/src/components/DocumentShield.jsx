import React, { useState, useEffect, useRef } from 'react';
import { Shield, FileText, CheckCircle, Download, Database, Lock, Terminal as TerminalIcon, Cpu, Copy, UploadCloud, Activity, ChevronUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentShield = () => {
    const [inputText, setInputText] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentScan, setCurrentScan] = useState(null);
    const [linesScanned, setLinesScanned] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFile = (file) => {
        setIsUploading(true);
        // Simulate file quarantine/unpacking
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                setInputText(text);
                setIsUploading(false);
                processTextLocally(text);
            };
            reader.readAsText(file);
        }, 1500); // 1.5s "unpacking" delay
    };

    const processTextLocally = (text) => {
        setIsScanning(true);
        setLinesScanned(0);

        const scanInterval = setInterval(() => {
            setLinesScanned(prev => prev > 1000 ? 1000 : prev + 45);
        }, 30);

        setTimeout(() => {
            clearInterval(scanInterval);

            let redactedCount = 0;
            let redactedItems = [];
            let sanitized = text
                .replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => { redactedCount++; redactedItems.push({ type: "Payment Card", string: match, tag: "[RS-CARD-001]" }); return "[RS-CARD-001]"; })
                .replace(/\b\d{3}-\d{2}-\d{4}\b/g, (match) => { redactedCount++; redactedItems.push({ type: "SSN", string: match, tag: "[RS-SSN-002]" }); return "[RS-SSN-002]"; })
                .replace(/(password|pwd|secret|key|token)[\s:=]+([^\s,.]+)/gi, (match, p1, p2) => { redactedCount++; redactedItems.push({ type: "Credentials", string: p2, tag: "[RS-CREDS-003]" }); return `${p1}: [RS-CREDS-003]`; })
                .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => { redactedCount++; redactedItems.push({ type: "Email Address", string: match, tag: "[RS-MAIL-004]" }); return "[RS-MAIL-004]"; })
                .replace(/AKIA[0-9A-Za-z]{16,}/g, (match) => { redactedCount++; redactedItems.push({ type: "AWS Key", string: match, tag: "[RS-AWS-005]" }); return "[RS-AWS-005]"; })
                .replace(/ghp_[a-zA-Z0-9]{30,}/g, (match) => { redactedCount++; redactedItems.push({ type: "GitHub Token", string: match, tag: "[RS-GITHUB-006]" }); return "[RS-GITHUB-006]"; });

            setCurrentScan({
                original_content: text,
                sanitized_content: sanitized,
                shielded_count: redactedCount,
                redacted_items: redactedItems
            });

            setLinesScanned(100);
            setIsScanning(false);
        }, 1200); // Slower 1.2s delay for visual impact
    };

    const handleTextChange = (e) => {
        const val = e.target.value;
        setInputText(val);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        if (!val.trim()) {
            setCurrentScan(null);
            setIsScanning(false);
            return;
        }

        typingTimeoutRef.current = setTimeout(() => {
            processTextLocally(val);
        }, 1000);
    };

    const clearAll = () => {
        setInputText("");
        setCurrentScan(null);
        setIsScanning(false);
        setShowDetails(false);
    };

    const loadSample = () => {
        const sampleText = `CONFIDENTIAL INTERNAL DOCUMENT
PROJECT: Project Avalon
DATE: February 28, 2026
AUTHOR: Sarah Jenkins

To all relevant team members,

Below is the initial credential breakdown for the new Ryzen Shield architecture testing environments. Do NOT share this file outside of the immediate engineering team.

Employee Contacts:
- Sarah Jenkins, Lead AI Engineer: sarah.j@ryzenshield.internal.com
- Michael Chang, Security Ops: m.chang+ops@ryzenshield.internal.com
- Dr. Emily Rostova, Hardware Liaison: emily.rostova@amd.com
- Support Hotline: 1-800-555-0199

Development Server Access:
- DB Admin Password: password123!Secure
- Redis Fallback Key: secret-red-99
- AWS Development Key: AKIAIOSFODNN7EXAMPLE
- Test GitHub Token: ghp_1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r

Budget Allocation:
We have secured $500k for the initial hardware procurement consisting of new Ryzen AI 9000 series chips. 

Action Items:
Michael - please ensure the firewall rules for IP 192.168.1.150 are updated to allow incoming from the Edge nodes.

Regards,
Sarah Jenkins
Lead Engineer, AMD Slingshot Team`;
        setInputText(sampleText);
        processTextLocally(sampleText);
    };

    return (
        <div className="h-full bg-[#050200] flex flex-col font-mono text-sm overflow-hidden selection:bg-orange-500/30">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#110500] border-b border-orange-500/20 px-6 py-3 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <TerminalIcon size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Document Shield</h1>
                        <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.2em] mt-1 font-sans">Live NPU Redaction Stream</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex gap-2">
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} accept=".txt,.csv,.md,.json" className="hidden" />
                        <button onClick={loadSample} className="px-3 py-1 bg-neutral-900/60 hover:bg-orange-500/20 text-neutral-400 hover:text-orange-500 border border-neutral-700 hover:border-orange-500/50 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                            <FileText size={12} /> Load Sample
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/40 text-orange-500 border border-orange-500/50 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                            <UploadCloud size={12} /> Inject File
                        </button>
                        {inputText && (
                            <button onClick={clearAll} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
                                Purge Buffer
                            </button>
                        )}
                    </div>
                    <div className="text-[10px] text-orange-500/60 uppercase tracking-[0.2em] flex items-center gap-2 font-bold font-sans">
                        <Cpu size={14} className={isScanning ? "animate-pulse text-orange-500" : ""} />
                        NPU Parsing Active
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: Interactive Live Editor */}
                <div
                    className={`w-1/2 flex flex-col border-r border-orange-500/30 relative z-10 bg-[#0c0400] transition-colors`}
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(249, 115, 22, 0.03) 0px, rgba(249, 115, 22, 0.03) 2px, transparent 2px, transparent 12px)' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                >
                    <div className="p-4 border-b border-orange-500/20 bg-orange-500/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-orange-600">
                            <Database size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600">Untrusted Input Stream</span>
                        </div>
                    </div>

                    <div className="flex-1 relative flex flex-col">
                        <textarea
                            value={inputText}
                            onChange={handleTextChange}
                            placeholder=""
                            className="absolute inset-0 w-full h-full bg-transparent text-neutral-400 font-mono text-xs p-6 resize-none focus:outline-none leading-loose z-10 selection:bg-orange-500/20 placeholder:text-orange-500/20 custom-scrollbar"
                            spellCheck="false"
                        />

                        {!inputText && !isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 text-orange-600 gap-4 pointer-events-none">
                                <UploadCloud size={48} />
                                <div className="text-center font-bold uppercase tracking-widest text-xs space-y-2">
                                    <p>Drop Unsecured File Here</p>
                                    <p className="text-[10px] opacity-70">or type directly into terminal</p>
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-orange-500 gap-4 z-20">
                                <Activity size={48} className="animate-pulse" />
                                <div className="text-center font-bold uppercase tracking-widest text-xs">
                                    <p>Intercepting File Stream...</p>
                                    <p className="text-[10px] opacity-70 mt-2">Quarantining memory buffer</p>
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-[#0c0400]/95 to-transparent pointer-events-none flex flex-col justify-end p-6 border-t border-orange-500/30 z-20"
                                >
                                    <div className="font-mono text-[10px] text-orange-500 space-y-2">
                                        <p className="opacity-70">&gt; Allocating {Math.floor(Math.random() * 100) + 50}MB VRAM...</p>
                                        <p className="opacity-80">&gt; Parsing {inputText.length} bytes through Ryzen XDNA architecture...</p>
                                        <p className="font-bold text-orange-400 animate-pulse">&gt; Executing neural heuristics. Blocks scanned: {linesScanned}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Pane: Processed Output */}
                <div className="w-1/2 flex flex-col relative bg-black" style={{ backgroundImage: 'radial-gradient(rgba(249, 115, 22, 0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    <div className="p-4 border-b border-orange-500/20 bg-orange-500/10 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Shield size={14} className="text-orange-400" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">Zero-Trust Output Stream</span>
                        </div>
                        {currentScan && (
                            <button
                                onClick={() => navigator.clipboard.writeText(currentScan.sanitized_content)}
                                className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/50 text-green-500 px-3 py-1 rounded text-[10px] font-bold uppercase transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                            >
                                <Copy size={12} /> Copy Clean Text
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
                        {!currentScan && !isScanning && !inputText && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                <Lock size={48} className="mb-4 text-orange-500" />
                                <span className="uppercase tracking-[0.3em] font-bold text-orange-500">Encrypted Buffer Empty</span>
                            </div>
                        )}

                        <AnimatePresence>
                            {currentScan && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="whitespace-pre-wrap font-mono text-xs leading-loose text-neutral-300"
                                >
                                    {currentScan.sanitized_content.split(/(\[RS-[A-Z]+-\d+\])/g).map((chunk, i) => {
                                        if (chunk.match(/\[RS-[A-Z]+-\d+\]/)) {
                                            return (
                                                <span key={i} className="inline-block bg-orange-500 text-black px-1.5 py-0 rounded-sm font-black shadow-[0_0_10px_rgba(249,115,22,0.4)] mx-1 select-all relative overflow-hidden group">
                                                    <span className="relative z-10">{chunk}</span>
                                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                                                </span>
                                            );
                                        }
                                        return chunk;
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {showDetails && currentScan?.redacted_items?.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="absolute bottom-10 left-0 right-0 bg-[#0c0400] max-h-64 overflow-y-auto custom-scrollbar z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
                            >
                                <div className="p-4 border-t border-orange-500/30">
                                    <h3 className="text-[10px] font-black uppercase text-orange-500 mb-3 tracking-widest flex items-center gap-2">
                                        <Shield size={12} /> Redaction Telemetry Log
                                    </h3>
                                    <div className="space-y-2">
                                        {currentScan.redacted_items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs p-3 bg-[#110500] border border-orange-500/10 rounded hover:border-orange-500/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded tracking-widest uppercase w-28 text-center shrink-0">
                                                        {item.type}
                                                    </span>
                                                    <span className="text-red-400 font-mono line-through opacity-70 tracking-tight">{item.string}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ArrowRight size={12} className="text-orange-500/30 shrink-0" />
                                                    <span className="text-green-500 font-mono font-bold tracking-tight bg-green-500/10 px-2 py-0.5 rounded shrink-0">{item.tag}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Status Bar */}
                    <div
                        onClick={() => currentScan?.redacted_items?.length > 0 && setShowDetails(!showDetails)}
                        className={`h-10 bg-orange-600 flex items-center px-4 text-black text-[10px] font-black uppercase tracking-widest justify-between shrink-0 shadow-[0_-5px_20px_rgba(249,115,22,0.2)] relative z-40 ${currentScan?.redacted_items?.length > 0 ? "cursor-pointer hover:bg-orange-500 transition-colors" : ""}`}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} /> {currentScan && currentScan.shielded_count > 0 ? "Threats Neutralized" : "Shield Active"}
                        </div>
                        <div className="flex items-center gap-2">
                            {currentScan ? currentScan.shielded_count : 0} Vectors Redacted
                            {currentScan?.redacted_items?.length > 0 && (
                                <ChevronUp size={14} className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentShield;
