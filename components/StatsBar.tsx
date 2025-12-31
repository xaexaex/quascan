"use client";

import { useEffect, useState } from "react";
import { Activity, Blocks, Users, Database } from "lucide-react";

interface NetworkStats {
  blockHeight: number;
  difficulty: string;
  mempoolSize: number;
  peerCount: number;
  hashrate: string;
}

export default function StatsBar() {
  const [stats, setStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    // Fetch initial stats
    fetchStats();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!stats) {
    return (
      <div className="bg-black rounded-[3rem] p-12 mx-4 md:mx-8 mb-12">
        <div className="flex items-center justify-center text-gray-400">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-[3rem] p-8 md:p-12 mx-4 md:mx-8 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#00E599]/10 rounded-xl">
            <Blocks className="w-6 h-6 text-[#00E599]" />
          </div>
          <div>
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Block Height</div>
            <div className="text-white text-3xl font-bold">{stats.blockHeight.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#00E599]/10 rounded-xl">
            <Activity className="w-6 h-6 text-[#00E599]" />
          </div>
          <div>
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Difficulty</div>
            <div className="text-white text-3xl font-bold">{stats.difficulty}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#00E599]/10 rounded-xl">
            <Database className="w-6 h-6 text-[#00E599]" />
          </div>
          <div>
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Mempool</div>
            <div className="text-white text-3xl font-bold">{stats.mempoolSize}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#00E599]/10 rounded-xl">
            <Users className="w-6 h-6 text-[#00E599]" />
          </div>
          <div>
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Peers</div>
            <div className="text-white text-3xl font-bold">{stats.peerCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
