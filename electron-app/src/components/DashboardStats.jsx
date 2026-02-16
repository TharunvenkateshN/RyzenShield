import React, { useState, useEffect } from 'react';
import { Shield, Lock, Activity } from 'lucide-react';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        threats_neutralized: 0,
        pii_masked: 0,
        latency_saved: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://127.0.0.1:9000/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                // Ignore error
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    const statItems = [
        {
            label: 'Threats Neutralized',
            value: stats.threats_neutralized,
            icon: Shield,
            color: 'text-green-500'
        },
        {
            label: 'PII Elements masked',
            value: stats.pii_masked,
            icon: Lock,
            color: 'text-blue-500'
        },
        {
            label: 'Latency Saved',
            value: `${stats.latency_saved}ms`,
            icon: Activity,
            color: 'text-orange-500'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statItems.map((stat, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">Today</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
