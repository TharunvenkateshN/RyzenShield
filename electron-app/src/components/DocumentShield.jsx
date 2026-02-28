import React, { useState } from 'react';
import { Shield, UploadCloud, FileText, CheckCircle, Download, ArrowRight, Clock, FileLock2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DocumentShield = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [currentScan, setCurrentScan] = useState(null);
    const [history, setHistory] = useState([]);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        sanitizeDocument(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        sanitizeDocument(file);
    };

    const sanitizeDocument = async (file) => {
        setIsScanning(true);
        setCurrentScan(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:9000/vault/sanitize-document", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === "error") {
                    alert(data.error);
                } else {
                    setCurrentScan(data);
                    setHistory(prev => [data, ...prev]);
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
        <div className="p-8 space-y-8 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-600/20 p-2 rounded-xl">
                            <FileLock2 className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Zero-Trust Document Shield</h1>
                    </div>
                    <p className="text-neutral-400 max-w-2xl">
                        Deep context local document sanitization.
                        Files are scrubbed locally on the Ryzen XDNA NPU without ever hitting the cloud.
                    </p>
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-700 bg-neutral-900/30'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-neutral-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                    >
                        <Shield className="w-16 h-16 text-orange-500 animate-pulse mb-6" />
                        <h3 className="text-2xl font-black text-white tracking-tight">XDNA NPU Scanning...</h3>
                        <p className="text-orange-500/80 mt-2 text-sm font-mono tracking-widest uppercase font-bold">Semantic PII Detection In Progress</p>
                    </motion.div>
                )}

                <div className="flex flex-col items-center justify-center relative z-0">
                    <div className="bg-neutral-800/50 p-5 rounded-full mb-6 border border-neutral-700 shadow-xl">
                        <UploadCloud className={`w-12 h-12 ${isDragging ? 'text-orange-500' : 'text-neutral-400'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Files Here</h3>
                    <p className="text-neutral-500 text-sm mb-6">Supports .txt, .csv, .md files for immediate edge redaction.</p>
                    <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all">
                        Select File
                        <input type="file" className="hidden" onChange={handleFileInput} accept=".txt,.csv,.md" />
                    </label>
                </div>
            </div>

            {/* Before / After Panel */}
            {currentScan && !isScanning && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-500 w-6 h-6" />
                            <h2 className="text-xl font-black text-white tracking-tight">Shielding Complete</h2>
                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                                {currentScan.shielded_count} Elements Redacted
                            </span>
                        </div>
                        <button
                            onClick={downloadSanitized}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-orange-500/20"
                        >
                            <Download size={16} /> Download Protected File
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original View */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col">
                            <div className="bg-neutral-800/50 px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                                <span className="font-bold text-sm text-neutral-300">Original Content</span>
                                <span className="text-[10px] text-red-400 font-mono uppercase bg-red-400/10 px-2 py-1 rounded">Vulnerable</span>
                            </div>
                            <div className="p-4 text-sm text-neutral-400 font-mono whitespace-pre-wrap flex-1 overflow-y-auto max-h-96">
                                {currentScan.original_content}
                            </div>
                        </div>

                        {/* Protected View */}
                        <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.1)] flex flex-col relative">
                            <div className="bg-orange-500/10 px-4 py-3 border-b border-orange-500/20 flex justify-between items-center">
                                <span className="font-bold text-sm text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">Sanitized Content</span>
                                <span className="text-[10px] text-green-400 font-mono uppercase bg-green-400/10 px-2 py-1 rounded">Protected</span>
                            </div>
                            <div className="p-4 text-sm text-white font-mono whitespace-pre-wrap flex-1 overflow-y-auto max-h-96">
                                {currentScan.sanitized_content.split(/(\[RS-[A-Z]+-\d+\])/g).map((chunk, i) => {
                                    if (chunk.match(/\[RS-[A-Z]+-\d+\]/)) {
                                        return (
                                            <span key={i} className="bg-orange-500 text-black px-1.5 py-0.5 rounded text-xs font-black mx-1 inline-block">
                                                {chunk}
                                            </span>
                                        );
                                    }
                                    return chunk;
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Scan History */}
            {history.length > 0 && (
                <div className="pt-8">
                    <h3 className="text-neutral-500 uppercase tracking-widest text-xs font-black mb-4 flex items-center gap-2">
                        <Clock size={14} /> Local Session History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {history.map((h, i) => (
                            <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center gap-4">
                                <div className="bg-neutral-800 p-2 rounded-lg">
                                    <FileText size={20} className="text-neutral-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{h.filename}</div>
                                    <div className="text-xs text-orange-500 font-mono mt-1">{h.shielded_count} items redacted</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentShield;
