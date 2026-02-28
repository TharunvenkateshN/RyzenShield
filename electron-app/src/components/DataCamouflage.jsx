import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Lock, Unlock, Zap, Fingerprint, Activity, Code, Download, Cpu, KeyRound } from 'lucide-react';

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

    const generateCarrier = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Draw an opaque background first so LSBs don't get destroyed by browser alpha-premultiplication saving
        ctx.fillStyle = "#0c0400"; // Very dark orange-black
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw a complex noise pattern that looks like an abstract background
        // Real steganography often works better on noisy images than flat colors
        for (let x = 0; x < canvas.width; x += 10) {
            for (let y = 0; y < canvas.height; y += 10) {
                const r = Math.floor(Math.random() * 50) + 200; // Orange-ish
                const g = Math.floor(Math.random() * 100) + 50;
                const b = Math.floor(Math.random() * 20);

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, Math.random() < 0.5 ? y : y + Math.random() * 20, 10, 10);
            }
        }

        ctx.fillStyle = "rgba(0,0,0,0.6)"; // Darken the noisy pattern
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        setMediaDataUrl(dataUrl);

        // Mock a file object so the rest of the flow works
        fetch(dataUrl).then(res => res.blob()).then(blob => {
            const file = new File([blob], "generated_carrier.png", { type: "image/png" });
            setMediaFile(file);
            setEncryptedImage(null);
            setDecryptedText(null);
        });
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
        a.download = "RyzenShield_CryptoCarrier.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="h-full bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden font-mono text-sm">

            {/* Ambient Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 blur-[120px] mix-blend-screen rounded-full animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-amber-600/10 blur-[130px] mix-blend-screen rounded-full animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-red-600/10 blur-[100px] mix-blend-screen rounded-full animate-blob animation-delay-4000" />
            </div>

            {/* Header Core */}
            <div className="relative z-10 w-full max-w-5xl flex items-center justify-between mb-8 border-b border-orange-500/20 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Hexagon size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-sans">PixelShield Forge</h1>
                        <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.2em] mt-1 font-sans">NPU LSB Cryptography Engine</p>
                    </div>
                </div>

                <div className="flex bg-[#111] border border-orange-500/20 rounded-xl p-1 shadow-2xl">
                    <button
                        onClick={() => { setMode('encrypt'); reset(); }}
                        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'encrypt' ? 'bg-orange-600 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Lock size={14} /> Embed Data
                    </button>
                    <button
                        onClick={() => { setMode('decrypt'); reset(); }}
                        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'decrypt' ? 'bg-orange-600 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Unlock size={14} /> Extract Core
                    </button>
                </div>
            </div>

            {/* Main Interface */}
            <div className="relative z-10 w-full max-w-5xl flex-1 flex flex-col md:flex-row items-center gap-12 bg-[#0a0a0a] border border-orange-500/20 rounded-[2rem] p-12 shadow-2xl">

                {/* Left: Interactive Node */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative h-full min-h-[400px]">
                    {/* Glowing Circular Dropzone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={`relative w-[300px] h-[300px] rounded-full flex items-center justify-center transition-all duration-500 group
                            ${mediaFile ? 'border-none' : 'border-2 border-dashed border-orange-500/30 hover:border-orange-400 hover:bg-orange-500/5'}`}
                    >
                        <input type="file" id="pixel-upload" onChange={handleFileSelect} accept="image/*" className="hidden" />

                        {!mediaFile ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="absolute inset-0 rounded-full border border-orange-500/10 scale-110 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-0 rounded-full border border-amber-500/20 scale-125 animate-[spin_15s_linear_infinite_reverse]" />

                                <Fingerprint size={48} className="text-orange-500/50 mb-4 group-hover:text-orange-400 transition-colors" />

                                {mode === "encrypt" ? (
                                    <>
                                        <div className="flex flex-col gap-2 relative z-20">
                                            <button onClick={() => { document.getElementById('pixel-upload').value = ''; document.getElementById('pixel-upload').click(); }} className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] border border-[#f97316] hover:bg-[#f97316]/20 px-4 py-2 rounded-full mb-1 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all">
                                                Select User Image
                                            </button>
                                            <button onClick={() => generateCarrier()} className="text-[10px] font-bold uppercase tracking-widest text-black bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-full mb-3 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">
                                                <KeyRound size={12} /> Generate Carrier
                                            </button>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-neutral-500">- OR DROP IMAGE -</span>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { document.getElementById('pixel-upload').value = ''; document.getElementById('pixel-upload').click(); }} className="relative z-20 text-[10px] font-bold uppercase tracking-widest text-black bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-full mb-3 flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">
                                            Select Stego Image
                                        </button>
                                        <span className="text-[10px] uppercase tracking-widest text-neutral-500">To decipher payload</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full h-full rounded-full p-2 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] bg-black">
                                <img src={mediaDataUrl} alt="Payload" className="w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
                                <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-xl">
                                    Clear Buffer
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right: Data Injector / Extractor Terminal */}
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                    {!mediaFile ? (
                        <div className="h-[250px] flex flex-col items-center justify-center opacity-30 border-l border-neutral-900 pl-12">
                            <Code size={48} className="text-orange-500 mb-4" />
                            <p className="text-[10px] uppercase tracking-widest text-center text-orange-500/50 leading-loose font-bold">Awaiting Media Carrier<br />Local LSB Encoding Array Idle</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {!encryptedImage && !decryptedText ? (
                                <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    {mode === 'encrypt' ? (
                                        <div className="bg-[#111] p-6 rounded-2xl border border-neutral-800 relative group overflow-hidden">
                                            {/* Decorative circuit line */}
                                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.8)] transition-all" />

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Cpu size={14} /> Embed Data Payload
                                                </label>
                                                <textarea
                                                    value={secretText}
                                                    onChange={(e) => setSecretText(e.target.value)}
                                                    placeholder="e.g. Master password...&#10;or secret seed phrase..."
                                                    className="w-full bg-black border border-neutral-800 focus:border-orange-500/50 rounded-xl p-4 text-orange-100 text-xs focus:outline-none transition-colors resize-none h-28"
                                                />
                                            </div>
                                            <button
                                                onClick={runCamouflage}
                                                disabled={!secretText || isProcessing}
                                                className={`mt-4 w-full py-3 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all duration-300
                                                    ${!secretText || isProcessing ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800' : 'bg-orange-600 hover:bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]'}`}
                                            >
                                                {isProcessing ? <><Activity size={14} className="animate-spin" /> Modifying Bits...</> : <><Zap size={14} /> Inject Payload to Pixels</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col justify-center h-[250px] space-y-6">
                                            <div className="bg-[#111] border-l-4 border-orange-500 p-6 rounded-r-2xl border-t border-b border-r border-neutral-800">
                                                <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14} /> Carrier Locked</h4>
                                                <p className="text-[11px] text-neutral-400 leading-relaxed">Engine is prepared to perform deep LSB analysis to extract securely embedded data.</p>
                                            </div>
                                            <button
                                                onClick={runCamouflage}
                                                disabled={isProcessing}
                                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                            >
                                                {isProcessing ? <><Activity size={16} className="animate-spin" /> Unpacking Bits...</> : <><Unlock size={16} /> Execute Decryption</>}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[280px] justify-center space-y-6">
                                    {encryptedImage ? (
                                        <div className="text-center space-y-6 p-6 bg-[#111] border border-green-500/30 rounded-2xl">
                                            <div className="inline-flex p-3 bg-green-500 text-black rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                                <Lock size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-green-500 tracking-tight mb-1 uppercase">Payload Embedded</h3>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Image is 100% functional.</p>
                                            </div>
                                            <button onClick={downloadImage} className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-green-500/50 text-green-400 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors">
                                                <Download size={14} /> Download Stego-Carrier
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`text-center space-y-4 p-6 rounded-2xl border ${decryptedText.includes("NO SECRETS") ? 'bg-[#111] border-red-500/30' : 'bg-[#111] border-orange-500/30'}`}>
                                            <div className="flex justify-between items-center mb-2 px-2 border-b border-neutral-800 pb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Decoded Buffer</span>
                                                {decryptedText.includes("NO SECRETS") ? <Hexagon size={14} className="text-red-500" /> : <Unlock size={14} className="text-orange-500" />}
                                            </div>
                                            <div className={`p-4 bg-black border border-neutral-800 rounded-xl max-h-32 overflow-y-auto custom-scrollbar text-left font-mono text-xs leading-relaxed ${decryptedText.includes("NO SECRETS") ? 'text-red-400' : 'text-orange-400 selection:bg-orange-500/30'}`}>
                                                {decryptedText}
                                            </div>
                                            {!decryptedText.includes("NO SECRETS") && (
                                                <p className="text-[10px] text-orange-500/50 uppercase tracking-[0.3em] font-bold">0 Latency • Offline Extracted</p>
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

// ... existing encode/decode logic (kept exactly structural)
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
                fullBinaryStr += uint8array[i].toString(2).padStart(8, '0');
            }

            if (fullBinaryStr.length > data.length * 0.75) {
                return reject("Image is too small or secret is too large.");
            }

            // Force all alpha channels to 255 to prevent browser pre-multiplication 
            // from destroying LSBs when saving/loading the canvas
            for (let i = 3; i < data.length; i += 4) {
                data[i] = 255;
            }

            let binIndex = 0;
            for (let i = 0; i < data.length && binIndex < fullBinaryStr.length; i++) {
                if ((i + 1) % 4 === 0) continue; // Skip alpha
                data[i] = (data[i] & 254) | parseInt(fullBinaryStr[binIndex]);
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

            const bytes = [];
            let currentByte = 0;
            let bitCount = 0;

            for (let i = 0; i < data.length; i++) {
                if ((i + 1) % 4 === 0) continue;

                currentByte = (currentByte << 1) | (data[i] & 1);
                bitCount++;

                if (bitCount === 8) {
                    bytes.push(currentByte);
                    currentByte = 0;
                    bitCount = 0;

                    // Check for the termination sequence '!!!RS_END!!!' (12 bytes)
                    if (bytes.length >= 12) {
                        const endStr = String.fromCharCode(...bytes.slice(-12));
                        if (endStr === '!!!RS_END!!!') {
                            const decoder = new TextDecoder('utf-8');
                            const decodedText = decoder.decode(new Uint8Array(bytes.slice(0, -12)));
                            return resolve(decodedText);
                        }
                    }
                }
            }

            // Reached the end without finding the marker
            resolve(null);
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

export default DataCamouflage;
