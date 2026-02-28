import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, Lock, Unlock, Eye, ShieldCheck, Zap, RefreshCw, EyeOff, UploadCloud, Hexagon } from 'lucide-react';

const DataCamouflage = () => {
    const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaDataUrl, setMediaDataUrl] = useState(null);

    // Encrypt State
    const [secretText, setSecretText] = useState('');
    const [encryptedImage, setEncryptedImage] = useState(null);

    // Decrypt State
    const [decryptedText, setDecryptedText] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setMediaDataUrl(e.target.result);
            reader.readAsDataURL(file);

            // Reset states
            setEncryptedImage(null);
            setDecryptedText(null);
        }
    };

    const runCamouflage = async () => {
        if (!mediaDataUrl) return;
        setIsProcessing(true);

        try {
            if (mode === 'encrypt' && secretText) {
                const resultUrl = await encodeTextIntoImage(mediaDataUrl, secretText);
                setEncryptedImage(resultUrl);
            } else if (mode === 'decrypt') {
                const resultText = await decodeTextFromImage(mediaDataUrl);
                setDecryptedText(resultText || "NO SECRETS FOUND: File is clean or corrupted.");
            }
        } catch (err) {
            console.error(err);
            alert("Error processing image: " + err);
        }

        setIsProcessing(false);
    };

    const downloadImage = () => {
        if (!encryptedImage) return;
        const a = document.createElement("a");
        a.href = encryptedImage;
        a.download = "RyzenShield_Camouflaged.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                            <Hexagon size={24} className="text-indigo-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Data Camouflage</h1>
                    </div>
                    <p className="text-neutral-400 font-medium">100% Offline Pixel Steganography. Hide sensitive text inside standard images.</p>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1">
                    <button
                        onClick={() => { setMode('encrypt'); setMediaFile(null); setMediaDataUrl(null); }}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${mode === 'encrypt' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Lock size={16} /> Hide Data
                    </button>
                    <button
                        onClick={() => { setMode('decrypt'); setMediaFile(null); setMediaDataUrl(null); }}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${mode === 'decrypt' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Unlock size={16} /> Extract Data
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all h-full min-h-[400px] relative overflow-hidden
                            ${mediaFile ? 'border-indigo-500/30 bg-neutral-900/50' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50'}`}
                    >
                        {!mediaFile ? (
                            <>
                                <div className="p-4 bg-neutral-800 rounded-full mb-6 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <UploadCloud size={48} className="text-neutral-400 group-hover:text-indigo-500 transition-colors relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Drop Carrier Image</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mx-auto mb-6">
                                    Upload any standard image. Your secret data will be mathematically encoded into the Least Significant Bits of the pixels.
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-full transition-colors text-sm border border-neutral-700"
                                >
                                    Browse Files
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                                <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-neutral-700 mb-6 relative">
                                    <img src={mediaDataUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>

                                {mode === 'encrypt' ? (
                                    <div className="w-full max-w-sm">
                                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Top Secret Data to Hide:</label>
                                        <textarea
                                            value={secretText}
                                            onChange={(e) => setSecretText(e.target.value)}
                                            placeholder="e.g., My Seed Phrase is: alpha tango bravo..."
                                            className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none h-24 mb-4"
                                        />
                                        <button
                                            onClick={runCamouflage}
                                            disabled={!secretText || isProcessing}
                                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                                                ${!secretText || isProcessing ? 'bg-indigo-600/50 text-white/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}
                                        >
                                            {isProcessing ? <><RefreshCw size={18} className="animate-spin" /> Encoding Pixels...</> : <><Lock size={18} /> Chemically Bind Data</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-sm">
                                        <p className="text-sm text-neutral-400 mb-6">This image might look normal, but it could contain chemically bonded secrets.</p>
                                        <button
                                            onClick={runCamouflage}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all"
                                        >
                                            {isProcessing ? <><RefreshCw size={18} className="animate-spin" /> Unpacking Bits...</> : <><Eye size={18} /> Extract Hidden Data</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Decorative Background for Active File */}
                        {mediaFile && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-0 pointer-events-none" />
                        )}
                    </div>
                </div>

                {/* Processing/Result Area */}
                <div className="flex flex-col relative h-full">
                    <AnimatePresence mode="wait">
                        {!encryptedImage && !decryptedText && !isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-[2rem] bg-neutral-900/20 text-center p-8"
                            >
                                <Hexagon size={48} className="text-neutral-700 mb-4" />
                                <h3 className="text-lg font-bold text-neutral-500 mb-2">Awaiting Computation</h3>
                                <p className="text-sm text-neutral-600 max-w-sm">
                                    The Steganography Engine performs pixel-perfect Least Significant Bit modification completely locally, requiring no network connection.
                                </p>
                            </motion.div>
                        )}

                        {encryptedImage && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-neutral-900 border border-green-500/50 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(34,197,94,0.1)] flex flex-col h-full items-center justify-center text-center"
                            >
                                <div className="p-4 bg-green-500/10 text-green-500 rounded-full mb-4">
                                    <ShieldCheck size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Data Successfully Hidden</h3>
                                <p className="text-neutral-400 text-sm max-w-xs mb-8">
                                    Your secret text has been injected into the pixels. The image below is 100% functional and looks identical to the naked eye.
                                </p>

                                <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-green-500/20 mb-8 shadow-2xl relative group">
                                    <img src={encryptedImage} alt="Camouflaged" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-green-300 font-bold uppercase tracking-widest text-xs bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Stego-Locked</span>
                                    </div>
                                </div>

                                <button
                                    onClick={downloadImage}
                                    className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                                >
                                    <Download size={18} /> Download Safe Image
                                </button>
                            </motion.div>
                        )}

                        {decryptedText && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className={`bg-neutral-900 border rounded-[2rem] p-8 flex flex-col h-full items-center justify-center text-center
                                    ${decryptedText.includes("NO SECRETS") ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]'}`}
                            >
                                <div className={`p-4 rounded-full mb-6 ${decryptedText.includes("NO SECRETS") ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                    {decryptedText.includes("NO SECRETS") ? <EyeOff size={48} /> : <Eye size={48} />}
                                </div>

                                <h3 className="text-2xl font-black text-white mb-6">
                                    {decryptedText.includes("NO SECRETS") ? "Clean Image" : "Secret Extracted!"}
                                </h3>

                                <div className="w-full bg-black border border-neutral-800 rounded-2xl p-6 text-left relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <Zap size={64} className={decryptedText.includes("NO SECRETS") ? 'text-red-500' : 'text-indigo-500'} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3 relative z-10">Raw Data Payload</h4>
                                    <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap relative z-10 ${decryptedText.includes("NO SECRETS") ? 'text-neutral-400 italic' : 'text-white'}`}>
                                        {decryptedText}
                                    </div>
                                </div>

                                {!decryptedText.includes("NO SECRETS") && (
                                    <div className="mt-8 text-xs text-indigo-400 font-black uppercase tracking-[0.2em]">
                                        Extracted 100% Offline via local LSB decoding
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// --- REAL STEGANOGRAPHY ENGINE ---

function encodeTextIntoImage(dataUrl, text) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            const textToEncode = text + '!!!RS_END!!!';

            // Let's use robust UTF-8 to Binary string conversion
            const encoder = new TextEncoder();
            const uint8array = encoder.encode(textToEncode);

            let fullBinaryStr = '';
            for (let i = 0; i < uint8array.length; i++) {
                let bin = uint8array[i].toString(2);
                fullBinaryStr += '00000000'.substring(bin.length) + bin;
            }

            if (fullBinaryStr.length > data.length * 0.75) {
                return reject("Image is too small or secret is too large.");
            }

            let binIndex = 0;
            for (let i = 0; i < data.length && binIndex < fullBinaryStr.length; i++) {
                if ((i + 1) % 4 === 0) continue; // Skip Alpha
                let bit = parseInt(fullBinaryStr[binIndex]);
                data[i] = (data[i] & 254) | bit; // Zero out LSB, then set it
                binIndex++;
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png', 1.0)); // Force highest quality PNG (No lossy compression)
        };
        img.onerror = () => reject("Failed to load image");

        // Ensure image loads safely
        img.crossOrigin = "Anonymous";
        img.src = dataUrl;
    });
}

function decodeTextFromImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            let binaryStr = '';
            for (let i = 0; i < data.length; i++) {
                if ((i + 1) % 4 === 0) continue;
                binaryStr += (data[i] & 1).toString();
            }

            // Read bytes until we hit !!!RS_END!!!
            const bytes = [];
            for (let i = 0; i < binaryStr.length; i += 8) {
                const byteStr = binaryStr.substring(i, i + 8);
                if (byteStr.length === 8) {
                    bytes.push(parseInt(byteStr, 2));
                }
            }

            try {
                const decoder = new TextDecoder();
                const decodedText = decoder.decode(new Uint8Array(bytes));
                if (decodedText.includes('!!!RS_END!!!')) {
                    return resolve(decodedText.split('!!!RS_END!!!')[0]);
                }
            } catch (e) {
                return resolve(null);
            }

            resolve(null);
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

export default DataCamouflage;
