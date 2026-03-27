"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NetworkStats, Block, fetchAddressInfo, AddressInfo } from "@/lib/api";
import { Activity, CircleDollarSign, Loader2, Network, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

export default function DashboardClient({
  initialStats,
  initialBlocks,
}: {
  initialStats: NetworkStats | null;
  initialBlocks: Block[];
}) {
  const router = useRouter();
  const [addressInput, setAddressInput] = useState("ms69216b1d10425689704d5ae3b2a4aa17049f59b1");
  const [isChecking, setIsChecking] = useState(false);
  const [walletInfo, setWalletInfo] = useState<AddressInfo | null>(null);
  const [walletError, setWalletError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Avoid creating a dependency cycle by placing the auto-fetch inside useEffect directly or making handleCheckBalance useCallback. But doing it simpler:
  useEffect(() => {
    // Auto-fetch treasury balance on mount to show users how it looks
    const fetchTreasury = async () => {
      try {
        setIsChecking(true);
        const info = await fetchAddressInfo("ms69216b1d10425689704d5ae3b2a4aa17049f59b1");
        if (info) setWalletInfo(info);
      } catch (e) {
        // ignore
      } finally {
        setIsChecking(false);
      }
    };
    fetchTreasury();
  }, []);

  const handleCheckBalance = async () => {
    if (!addressInput.trim() || addressInput.length < 32) {
      setWalletError("Please enter a valid Quanta address");
      return;
    }
    
    setIsChecking(true);
    setWalletError("");
    setWalletInfo(null);
    
    try {
      const info = await fetchAddressInfo(addressInput.trim());
      if (info) {
        setWalletInfo(info);
      } else {
        setWalletError("Wallet not found on the network");
      }
    } catch (error) {
      setWalletError("Error fetching wallet data");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000); // UI feel
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 pt-6">
      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dark-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E599] to-transparent opacity-50"></div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Chain Height</p>
          <div className="text-3xl font-black font-mono text-[#00E599] mt-2 tracking-tight">
            {initialStats?.chain_length.toLocaleString() || '---'}
          </div>
        </div>

        <div className="dark-card p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] to-transparent opacity-50"></div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Total Supply</p>
          <div className="text-3xl font-black font-mono text-[#00f0ff] mt-2 tracking-tight">
            {initialStats ? `${(initialStats.total_supply / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` : '---'}
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-2">QUA minted</p>
        </div>

        <div className="dark-card p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-50"></div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Difficulty</p>
          <div className="text-3xl font-black font-mono text-purple-400 mt-2 tracking-tight">
             {initialStats ? `${(initialStats.current_difficulty / 1_000_000).toFixed(1)}M` : '---'}
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-2">Reward: {initialStats ? (initialStats.mining_reward / 1_000_000) : 100} QUA/block</p>
        </div>

        <div className="dark-card p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-transparent opacity-50"></div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Mempool</p>
          <div className="text-3xl font-black font-mono text-yellow-400 mt-2 tracking-tight">
            {initialStats?.pending_transactions || '0'}
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-2">Pending Txs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Balance Checker */}
        <div className="dark-card flex flex-col">
          <div className="px-5 py-4 border-b border-[#1f2937] flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-xs font-bold text-[#e2e8f0] uppercase tracking-widest">Wallet Balance</span>
          </div>
          <div className="p-5 flex-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <input 
                type="text" 
                placeholder="0x..." 
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckBalance()}
                className="flex-1 bg-[#0b0e14] border border-[#1f2937] rounded p-3 text-sm font-mono text-[#e2e8f0] focus:outline-none focus:border-[#00E599] transition-colors"
                spellCheck={false}
              />
              <button 
                onClick={handleCheckBalance}
                disabled={isChecking}
                className="px-6 py-3 border border-[#00E599] text-[#00E599] font-mono text-xs font-bold uppercase tracking-widest rounded hover:bg-[#00E599]/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChecking && <Loader2 className="w-3 h-3 animate-spin"/>}
                Check
              </button>
            </div>

            {walletError && (
              <div className="text-red-400 font-mono text-xs mb-4">{walletError}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#0b0e14] p-3 rounded border border-[#1f2937]">
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Available</p>
                 <p className="font-mono font-bold text-[#00E599]">{walletInfo ? walletInfo.balance_qua.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'} QUA</p>
              </div>
              <div className="bg-[#0b0e14] p-3 rounded border border-[#1f2937]">
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Total (Inc. Locked)</p>
                 <p className="font-mono font-bold text-[#00f0ff]">{walletInfo ? walletInfo.total_balance_qua.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'} QUA</p>
              </div>
              <div className="bg-[#0b0e14] p-3 rounded border border-[#1f2937]">
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Nonce</p>
                 <p className="font-mono font-bold text-yellow-500">{walletInfo ? walletInfo.nonce : '0'}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Locked Balances {walletInfo ? `(${walletInfo.locked_balances.length} Entries)` : ''}</p>
              <div className="h-40 overflow-y-auto pr-2 space-y-1">
                {walletInfo?.locked_balances.length ? (
                  walletInfo.locked_balances.map((lock, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-[#1f2937]/50 text-xs font-mono">
                      <span className="text-gray-300">{lock.amount_qua} QUA</span>
                      <span className="text-gray-600">unlocks at block #{lock.unlock_height}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600 text-xs font-mono h-full flex flex-col items-center justify-center border border-dashed border-[#1f2937] rounded pt-4 pb-4">
                    No locked balances found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="dark-card flex flex-col">
          <div className="px-5 py-4 border-b border-[#1f2937] flex items-center gap-2">
            <Network className="w-4 h-4 text-[#00f0ff]" />
            <span className="font-mono text-xs font-bold text-[#e2e8f0] uppercase tracking-widest">Network Info</span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
             <div className="flex justify-between items-center py-2 text-sm font-mono border-b border-[#1f2937]/30">
               <span className="text-gray-500">Chain Length</span>
               <span className="text-gray-200">{initialStats?.chain_length || 0} blocks</span>
             </div>
             <div className="flex justify-between items-center py-2 text-sm font-mono border-b border-[#1f2937]/30">
               <span className="text-gray-500">Difficulty</span>
               <span className="text-gray-200">{initialStats?.current_difficulty.toLocaleString() || 0}</span>
             </div>
             <div className="flex justify-between items-center py-2 text-sm font-mono border-b border-[#1f2937]/30">
               <span className="text-gray-500">Block Reward</span>
               <span className="text-gray-200">{initialStats ? (initialStats.mining_reward / 1_000_000).toLocaleString() : 0} QUA</span>
             </div>
             <div className="flex justify-between items-center py-2 text-sm font-mono border-b border-[#1f2937]/30">
               <span className="text-gray-500">Total Supply</span>
               <span className="text-gray-200">{initialStats ? (initialStats.total_supply / 1_000_000).toLocaleString() : 0} QUA</span>
             </div>
             <div className="flex justify-between items-center py-2 text-sm font-mono border-b border-[#1f2937]/30">
               <span className="text-gray-500">Pending Txs</span>
               <span className="text-gray-200">{initialStats?.pending_transactions || 0}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Latest Blocks Table */}
      <div className="dark-card overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00E599]" />
            <span className="font-mono text-xs font-bold text-[#e2e8f0] uppercase tracking-widest">Latest Blocks</span>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 border border-[#1f2937] bg-[#0b0e14] px-3 py-1.5 rounded hover:border-[#00E599] transition-colors font-mono text-[10px] text-gray-400 hover:text-[#00E599] tracking-widest uppercase disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-[#0b0e14] border-b border-[#1f2937]">
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hash</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Miner</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Txs</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nonce</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50 bg-[#111827]">
              {initialBlocks.map((block) => {
                const miner = block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient || 'Unknown';
                return (
                  <tr key={block.index} className="hover:bg-[#1a2235]/50 transition-colors">
                    <td className="py-4 px-5 text-sm font-bold">
                      <Link href={`/block/${block.index}`} className="text-[#e2e8f0] hover:text-[#00E599] transition-colors">
                        {block.index}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-sm text-[#00E599]">
                      <Link href={`/block/${block.index}`} className="hover:underline opacity-80 hover:opacity-100 font-medium">
                        {block.hash.substring(0, 8)}...{block.hash.substring(block.hash.length - 6)}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-sm text-[#00f0ff]">
                      <Link href={`/address/${miner}`} className="hover:underline opacity-80 hover:opacity-100 font-medium">
                        {miner.length > 20 ? `${miner.substring(0, 6)}...${miner.substring(miner.length - 6)}` : miner}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-sm text-center">
                      <span className="text-gray-400 bg-[#0b0e14] px-2 py-0.5 rounded border border-[#1f2937]">{block.transactions.length}</span>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-400">
                      {block.nonce.toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-500 text-right">
                      <TimeAgo timestamp={block.timestamp} />
                    </td>
                  </tr>
                );
              })}
              {initialBlocks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    No block data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
