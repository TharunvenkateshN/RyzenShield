import React from 'react';
import { Terminal } from 'lucide-react';

const RealTimeLog = () => {
    // Placeholder for log data
    const logs = [
        { time: "10:42:01", type: "INFO", msg: "Interceptor attached to port 8000" },
        { time: "10:42:05", type: "WARN", msg: "PII Detected: Credit Card Number" },
        { time: "10:42:05", type: "SUCCESS", msg: "Sanitized using Phi-3 Quantized" },
    ];

    return (
        <div className="bg-black border border-neutral-800 p-4 rounded-xl font-mono text-sm h-64 overflow-y-auto">
            <div className="flex items-center gap-2 text-neutral-500 mb-2 border-b border-neutral-800 pb-2">
                <Terminal size={14} />
                <span>System Audit Log</span>
            </div>
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-neutral-600">[{log.time}]</span>
                        <span className={`
                            ${log.type === 'INFO' ? 'text-blue-400' : ''}
                            ${log.type === 'WARN' ? 'text-yellow-400' : ''}
                            ${log.type === 'SUCCESS' ? 'text-green-400' : ''}
                        `}>{log.type}</span>
                        <span className="text-neutral-300">{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RealTimeLog;
