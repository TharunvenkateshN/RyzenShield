import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

const RealTimeLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('http://127.0.0.1:9000/logs');
                if (res.ok) {
                    const data = await res.json();
                    // Maps backend DB rows to UI format if needed, or use directly
                    // Backend returns: { event_type, message, timestamp }
                    setLogs(data);
                    if (data.length > 0) {
                        console.log(`[RyzenShield] Received ${data.length} log entries`);
                    }
                }
            } catch (err) {
                // Silently handle - avoids console spam if backend is still starting
            }
        };

        fetchLogs(); // Initial call
        const interval = setInterval(fetchLogs, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    const formatTime = (ts) => {
        if (!ts) return new Date().toLocaleTimeString();
        // SQLite's CURRENT_TIMESTAMP is UTC. Append " UTC" to ensure correct conversion.
        return new Date(ts + " UTC").toLocaleTimeString();
    };

    return (
        <div className="bg-black border border-neutral-800 p-4 rounded-xl font-mono text-sm h-64 overflow-y-auto">
            <div className="flex items-center gap-2 text-neutral-500 mb-2 border-b border-neutral-800 pb-2">
                <Terminal size={14} />
                <span>System Audit Log (Live)</span>
            </div>
            <div className="space-y-1">
                {logs.length === 0 && <div className="text-neutral-500 italic">Waiting for traffic...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-neutral-600">[{formatTime(log.timestamp)}]</span>
                        <span className={`
                            ${log.event_type === 'INFO' || log.event_type === 'INTERCEPT' ? 'text-blue-400' : ''}
                            ${log.event_type === 'WARN' || log.event_type === 'PII' ? 'text-yellow-400' : ''}
                            ${log.event_type === 'SUCCESS' || log.event_type === 'RESTORE' ? 'text-green-400' : ''}
                        `}>{log.event_type}</span>
                        <span className="text-neutral-300">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RealTimeLog;
