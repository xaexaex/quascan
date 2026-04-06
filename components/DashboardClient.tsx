"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NetworkStats, Block, fetchAddressInfo, AddressInfo } from "@/lib/api";
import { Activity, CircleDollarSign, Loader2, Network, RefreshCw, Layers, Database, Cpu, Zap } from "lucide-react";
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

  // Quanta target block time is 30 seconds
  const hashrate = initialStats ? (initialStats.current_difficulty / 30) : 0;
  const formattedHashrate = hashrate > 1000000
    ? `${(hashrate / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })} MH/s`
    : hashrate > 1000
    ? `${(hashrate / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kH/s`
    : `${hashrate.toLocaleString(undefined, { maximumFractionDigits: 0 })} H/s`;

  const uniqueMiners = new Set(
    initialBlocks.map(block => block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient).filter(Boolean)
  ).size;

  useEffect(() => {
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
    }, 1000);
  };

  const statCards = [
    {
      index: 1,
      label: "Chain Height",
      icon: Layers,
      value: initialStats?.chain_length.toLocaleString() || '---',
      accent: "text-[#00E599]",
      sub: "Total blocks confirmed",
    },
    {
      index: 2,
      label: "Total Supply",
      icon: Database,
      value: initialStats ? `${(initialStats.total_supply / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` : '---',
      accent: "text-[#00E599]",
      sub: "QUA minted",
    },
    {
      index: 3,
      label: "Difficulty",
      icon: Cpu,
      value: initialStats ? `${(initialStats.current_difficulty / 1_000_000).toFixed(1)}M` : '---',
      accent: "text-[#00E599]",
      sub: `Reward: ${initialStats ? (initialStats.mining_reward / 1_000_000) : 100} QUA/block`,
    },
    {
      index: 4,
      label: "Mempool",
      icon: Zap,
      value: (initialStats?.pending_transactions || 0).toString(),
      accent: "text-[#00E599]",
      sub: "Pending transactions",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-8">

      {/* Top 4 Stats — quanta-web card style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.index}
            className="bg-white shadow-xl -translate-y-1 rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[160px] group transition-all duration-300 border border-[#00E599]/30 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div>
              <div className="w-8 h-8 rounded-full border border-teal-600/30 flex items-center justify-center mb-4 text-sm font-mono text-teal-700 font-medium">
                {card.index}
              </div>
              <div className={`text-3xl font-black font-mono tracking-tight mb-1 ${card.accent}`}>
                {card.value}
              </div>
              <p className="text-gray-800 font-semibold text-sm">{card.label}</p>
              <p className="text-gray-500 text-xs mt-1">{card.sub}</p>
            </div>
            <div className="mt-4 flex justify-end opacity-10 group-hover:opacity-30 transition-opacity duration-500">
              <card.icon className="w-10 h-10 text-teal-500" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Balance Checker */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-teal-600/30 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-bold text-sm text-gray-900 uppercase tracking-widest">Wallet Balance</span>
          </div>
          <div className="p-6 flex-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Enter Quanta address..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckBalance()}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-mono text-black focus:outline-none focus:border-[#00E599] focus:ring-2 focus:ring-[#00E599]/20 transition-all"
                spellCheck={false}
              />
              <button
                onClick={handleCheckBalance}
                disabled={isChecking}
                className="px-6 py-3 bg-[#00E599] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#00E599]/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isChecking && <Loader2 className="w-3 h-3 animate-spin" />}
                Check
              </button>
            </div>

            {walletError && (
              <div className="text-red-500 text-xs mb-4 bg-red-50 rounded-lg p-3 border border-red-100">{walletError}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Available</p>
                <p className="font-mono font-bold text-[#00E599]">{walletInfo ? walletInfo.balance_qua.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'} QUA</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Total (Inc. Locked)</p>
                <p className="font-mono font-bold text-black">{walletInfo ? walletInfo.total_balance_qua.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'} QUA</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Nonce</p>
                <p className="font-mono font-bold text-gray-800">{walletInfo ? walletInfo.nonce : '0'}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Locked Balances {walletInfo ? `(${walletInfo.locked_balances.length} Entries)` : ''}</p>
              <div className="h-36 overflow-y-auto pr-2 space-y-1">
                {walletInfo?.locked_balances.length ? (
                  walletInfo.locked_balances.map((lock, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 text-xs font-mono">
                      <span className="text-gray-700">{lock.amount_qua} QUA</span>
                      <span className="text-gray-400">unlocks at block #{lock.unlock_height}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-xs font-mono h-full flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl pt-4 pb-4">
                    No locked balances found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-teal-600/30 flex items-center justify-center">
              <Network className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-bold text-sm text-gray-900 uppercase tracking-widest">Network Info</span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
            {[
              { label: "Chain Length", value: `${initialStats?.chain_length || 0} blocks` },
              { label: "Difficulty", value: initialStats?.current_difficulty.toLocaleString() || '0' },
              { label: "Network Hashrate", value: formattedHashrate, accent: true },
              { label: `Active Miners (Last ${initialBlocks?.length || 0} Blks)`, value: uniqueMiners.toString() },
              { label: "Block Reward", value: `${initialStats ? (initialStats.mining_reward / 1_000_000).toLocaleString() : 0} QUA` },
              { label: "Total Supply", value: `${initialStats ? (initialStats.total_supply / 1_000_000).toLocaleString() : 0} QUA` },
              { label: "Pending Txs", value: (initialStats?.pending_transactions || 0).toString() },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 text-sm border-b border-gray-100">
                <span className="text-gray-500 font-medium">{row.label}</span>
                <span className={`font-bold font-mono ${row.accent ? 'text-[#00E599]' : 'text-gray-900'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Blocks Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-teal-600/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-bold text-sm text-gray-900 uppercase tracking-widest">Latest Blocks</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/blocks" className="text-sm font-semibold text-[#00E599] hover:underline transition-colors">
              View All
            </Link>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-xl hover:border-[#00E599] hover:text-[#00E599] transition-colors text-xs text-gray-500 font-bold tracking-widest uppercase disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hash</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Miner</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Txs</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nonce</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialBlocks.slice(0, 10).map((block) => {
                const miner = block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient || 'Unknown';
                return (
                  <tr key={block.index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold">
                      <Link href={`/block/${block.index}`} className="text-gray-900 hover:text-[#00E599] transition-colors">
                        {block.index}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#00E599]">
                      <Link href={`/block/${block.index}`} className="hover:underline opacity-80 hover:opacity-100 font-medium">
                        {block.hash.substring(0, 8)}...{block.hash.substring(block.hash.length - 6)}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-teal-600">
                      <Link href={`/address/${miner}`} className="hover:underline opacity-80 hover:opacity-100 font-medium">
                        {miner.length > 20 ? `${miner.substring(0, 6)}...${miner.substring(miner.length - 6)}` : miner}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <span className="text-gray-600 bg-[#00E599]/10 border border-[#00E599]/20 px-2 py-0.5 rounded-full text-xs font-bold">{block.transactions.length}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {block.nonce.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400 text-right">
                      <TimeAgo timestamp={block.timestamp} />
                    </td>
                  </tr>
                );
              })}
              {initialBlocks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-mono uppercase tracking-widest">
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
