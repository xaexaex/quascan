"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Box } from "lucide-react";

interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactions: number;
  miner: string;
}

export default function RecentBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBlocks();
    const interval = setInterval(fetchRecentBlocks, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecentBlocks = async () => {
    try {
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data
      const mockBlocks: Block[] = Array.from({ length: 10 }, (_, i) => ({
        height: 12345 - i,
        hash: `0x${Math.random().toString(16).substring(2, 18)}...`,
        timestamp: Date.now() - i * 10000,
        transactions: Math.floor(Math.random() * 50),
        miner: `0x${Math.random().toString(16).substring(2, 10)}...`
      }));
      setBlocks(mockBlocks);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[3rem] p-12 mx-4 md:mx-8 mb-12 border border-gray-100">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 mx-4 md:mx-8 mb-12 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-black flex items-center gap-3">
          <Box className="w-8 h-8 text-[#00E599]" />
          Recent Blocks
        </h2>
        <Link href="/blocks" className="text-[#00E599] hover:underline font-medium">
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {blocks.map((block) => (
          <Link
            key={block.height}
            href={`/block/${block.height}`}
            className="flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group border border-gray-100 hover:border-[#00E599]/30"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-14 h-14 bg-[#00E599]/10 rounded-xl group-hover:scale-110 transition-transform">
                <span className="text-[#00E599] font-bold text-lg">{block.height}</span>
              </div>
              <div>
                <div className="font-mono text-black font-semibold mb-1">{block.hash}</div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(block.timestamp)}
                  </span>
                  <span>{block.transactions} txns</span>
                  <span className="font-mono">{block.miner}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
