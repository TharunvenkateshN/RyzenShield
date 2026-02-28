import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Lock, Unlock, Zap, Fingerprint, Activity, Code, Download, FileUp, ShieldCheck, AlertTriangle } from 'lucide-react';

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
        }
        setIsProcessing(false);
    };

    const reset = () => {
        setMediaFile(null);
        setMediaDataUrl(null);
        setEncryptedImage(null);
        setDecryptedText(null);
        setSecretText('');
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
        <div className="h-full bg-[#050010] flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">

            {/* Ambient Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/20 blur-[120px] mix-blend-screen rounded-full animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/30 blur-[130px] mix-blend-screen rounded-full animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-rose-600/20 blur-[100px] mix-blend-screen rounded-full animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
            </div>

            {/* Header Core */}
            <div className="relative z-10 w-full max-w-5xl flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-500/20 backdrop-blur-md">
                        <Hexagon size={28} className="text-fuchsia-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 tracking-tight">PixelShield Vault</h1>
                        <p className="text-xs text-indigo-300 font-medium uppercase tracking-[0.2em] mt-1">Cryptography Engine • Local Memory</p>
                    </div>
                </div>

                <div className="flex bg-[#0a0515]/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-1.5 shadow-2xl">
                    <button
                        onClick={() => { setMode('encrypt'); reset(); }}
                        className={`px-6 py-2 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${mode === 'encrypt' ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Lock size={16} /> Synth-Lock
                    </button>
                    <button
                        onClick={() => { setMode('decrypt'); reset(); }}
                        className={`px-6 py-2 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${mode === 'decrypt' ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Unlock size={16} /> Extract Core
                    </button>
                </div>
            </div>

            {/* Main Interface */}
            <div className="relative z-10 w-full max-w-5xl flex-1 flex flex-col md:flex-row items-center gap-12 bg-[#0a051a]/60 backdrop-blur-3xl border border-indigo-500/20 rounded-[3rem] p-12 shadow-[0_0_50px_rgba(79,70,229,0.1)]">

                {/* Left: Interactive Node */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative">
                    {/* Glowing Circular Dropzone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={`relative w-[300px] h-[300px] rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer group
                            ${mediaFile ? 'border-none' : 'border-2 border-dashed border-indigo-500/30 hover:border-fuchsia-400 hover:bg-fuchsia-500/5 hover:scale-105'}`}
                        onClick={() => !mediaFile && fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                        {!mediaFile ? (
                            <div className="flex flex-col items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                <div className="absolute inset-0 rounded-full border border-fuchsia-500/10 scale-110 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-125 animate-[spin_15s_linear_infinite_reverse]" />
                                <Fingerprint size={64} className="text-fuchsia-400 mb-4" />
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Drop Carrier Image</span>
                            </div>
                        ) : (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full h-full rounded-full p-2 border border-fuchsia-500/30 shadow-[0_0_30px_rgba(192,38,211,0.2)] bg-[#050010]">
                                <img src={mediaDataUrl} alt="Payload" className="w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
                                <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500 hover:bg-red-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Abort
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right: Data Injector / Extractor Terminal */}
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                    {!mediaFile ? (
                        <div className="h-[250px] flex flex-col items-center justify-center opacity-30">
                            <Code size={48} className="text-indigo-500 mb-4" />
                            <p className="text-xs uppercase tracking-widest text-center text-indigo-300 leading-loose">Awaiting Media Carrier<br />Local LSB Encoding Array Idle</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {!encryptedImage && !decryptedText ? (
                                <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    {mode === 'encrypt' ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.2em] flex items-center gap-2"><Lock size={12} /> Secret Data Payload</label>
                                                <textarea
                                                    value={secretText}
                                                    onChange={(e) => setSecretText(e.target.value)}
                                                    placeholder="Input mnemonic, password, or sensitive text..."
                                                    className="w-full bg-[#030008] border border-indigo-500/20 focus:border-fuchsia-500/50 rounded-2xl p-5 text-fuchsia-100 text-sm focus:outline-none transition-colors resize-none h-32 shadow-inner"
                                                />
                                            </div>
                                            <button
                                                onClick={runCamouflage}
                                                disabled={!secretText || isProcessing}
                                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group
                                                    ${!secretText || isProcessing ? 'bg-indigo-900/50 text-indigo-500 cursor-wait border border-indigo-800' : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-[0_10px_40px_rgba(192,38,211,0.4)] border border-fuchsia-400/50'}`}
                                            >
                                                {isProcessing ? <><Activity size={16} className="animate-spin" /> Binding Pixels...</> : <span className="flex items-center gap-3 relative z-10"><Zap size={16} /> Inject Payload to Media</span>}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center h-[250px] space-y-8">
                                            <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-2xl">
                                                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14} /> Image Loaded</h4>
                                                <p className="text-[11px] text-indigo-200/60 leading-relaxed">The LSB decoding algorithm is ready to extract chemically bound data hidden within the pixel matrices of this file.</p>
                                            </div>
                                            <button
                                                onClick={runCamouflage}
                                                disabled={isProcessing}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_40px_rgba(99,102,241,0.4)] rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 transition-all border border-indigo-400/50 hover:scale-105"
                                            >
                                                {isProcessing ? <><Activity size={16} className="animate-spin" /> Unpacking Bits...</> : <><Unlock size={16} /> Execute Extraction</>}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[280px] justify-center space-y-6">
                                    {encryptedImage ? (
                                        <div className="text-center space-y-6">
                                            <div className="inline-flex p-4 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                                                <ShieldCheck size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white tracking-tight mb-2">Payload Embedded</h3>
                                                <p className="text-xs text-indigo-300 font-medium">Image looks identical. LSB layer modified.</p>
                                            </div>
                                            <button onClick={downloadImage} className="w-full py-4 bg-white hover:bg-gray-100 text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-colors">
                                                <Download size={16} /> Download Stealth File
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`text-center space-y-6 p-6 rounded-3xl border ${decryptedText.includes("NO SECRETS") ? 'bg-red-500/5 border-red-500/20' : 'bg-fuchsia-500/5 border-fuchsia-500/30 shadow-[0_0_40px_rgba(192,38,211,0.1)]'}`}>
                                            <div className="flex justify-between items-center mb-2 px-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Decoded Buffer</span>
                                                {decryptedText.includes("NO SECRETS") ? <AlertTriangle size={14} className="text-red-500" /> : <Unlock size={14} className="text-fuchsia-400" />}
                                            </div>
                                            <div className={`p-6 bg-[#030008] border border-inherit rounded-2xl h-32 overflow-y-auto text-left font-mono text-sm leading-relaxed ${decryptedText.includes("NO SECRETS") ? 'text-red-400' : 'text-fuchsia-100 selection:bg-fuchsia-500/30'}`}>
                                                {decryptedText}
                                            </div>
                                            {!decryptedText.includes("NO SECRETS") && (
                                                <p className="text-[10px] text-fuchsia-500/50 uppercase tracking-[0.3em] font-bold">100% Offline Extraction</p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

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
                if ((i + 1) % 4 === 0) continue;
                let bit = parseInt(fullBinaryStr[binIndex]);
                data[i] = (data[i] & 254) | bit;
                binIndex++;
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.onerror = () => reject("Failed to load image");
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
