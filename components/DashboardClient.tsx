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
  const [indexerStatus, setIndexerStatus] = useState<any>(null);
  // Latest blocks from MongoDB (same source as /blocks page — keeps both in sync)
  const [dbBlocks, setDbBlocks] = useState<any[]>([]);

  useEffect(() => {
    const fetchIndexerStatus = async () => {
      try {
        const res = await fetch('/api/indexer/status');
        if (res.ok) {
          const data = await res.json();
          setIndexerStatus(data);
        }
      } catch (e) {
        console.error('Failed to fetch indexer status', e);
      }
    };
    fetchIndexerStatus();
    const interval = setInterval(() => {
      if (!indexerStatus?.isSynced) {
        fetchIndexerStatus();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [indexerStatus?.isSynced]);

  // Fetch latest blocks from MongoDB so dashboard matches the /blocks page exactly
  useEffect(() => {
    const loadDbBlocks = async () => {
      try {
        const res = await fetch('/api/blocks?page=1&limit=10');
        if (res.ok) {
          const data = await res.json();
          setDbBlocks(data.blocks || []);
        }
      } catch (e) {
        console.error('Failed to fetch blocks from DB', e);
      }
    };
    loadDbBlocks();
    const interval = setInterval(loadDbBlocks, 15000);
    return () => clearInterval(interval);
  }, []);


  // Number of unique proposers in the latest block window
  const uniqueProposers = new Set(
    initialBlocks.map(block => block.proposer).filter(Boolean)
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
      label: "Active Validators",
      icon: Cpu,
      value: "7",
      accent: "text-[#00E599]",
      sub: `BFT Epoch ${initialStats?.current_epoch ?? 0}`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-24">

      {/* Top 4 Stats — Quantum Glass Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.index}
            className="quantum-panel p-6 flex flex-col justify-between min-h-[160px] group relative overflow-hidden"
          >
            {/* Subtle background glow effect */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00E599]/5 rounded-full blur-2xl group-hover:bg-[#00E599]/10 transition-colors pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-xs uppercase tracking-widest text-gray-400">{card.label}</p>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-[#00E599] group-hover:border-[#00E599]/30 transition-all">
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black font-sans tracking-tight mb-1 text-white quantum-glow-text group-hover:text-[#00E599] transition-colors">
                {card.value}
              </div>
              <p className="text-gray-500 text-xs font-medium">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Balance Checker */}
        <div className="quantum-panel flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-[#00E599]/10 flex items-center justify-center text-[#00E599]">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-white">Wallet Checker</span>
          </div>
          <div className="p-6 flex-1 bg-transparent">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 mb-6 bg-black rounded-xl border border-white/10 overflow-hidden focus-within:border-[#00E599]/50 transition-colors">
              <input
                type="text"
                placeholder="Enter Quanta address..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckBalance()}
                className="flex-1 bg-transparent p-4 text-sm font-mono text-white focus:outline-none placeholder-gray-600"
                spellCheck={false}
              />
              <button
                onClick={handleCheckBalance}
                disabled={isChecking}
                className="px-6 py-4 bg-white/5 text-white hover:bg-white/10 hover:text-[#00E599] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-l border-white/10 disabled:opacity-50"
              >
                {isChecking && <Loader2 className="w-3 h-3 animate-spin" />}
                Query
              </button>
            </div>

            {walletError && (
              <div className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 font-medium">{walletError}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Available</p>
                <p className="font-mono font-bold text-[#00E599] text-lg">{walletInfo ? walletInfo.balance_qua.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">QUA</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total</p>
                <p className="font-mono font-bold text-white text-lg">{walletInfo ? walletInfo.total_balance_qua.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">QUA</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nonce</p>
                <p className="font-mono font-bold text-gray-400 text-lg">{walletInfo ? walletInfo.nonce : '0'}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex justify-between">
                <span>Locked Balances</span>
                {walletInfo ? <span className="bg-[#00E599]/20 text-[#00E599] px-2 py-0.5 rounded-full">{walletInfo.locked_balances.length}</span> : null}
              </p>
              <div className="h-32 overflow-y-auto pr-2 space-y-2 rounded-xl bg-black border border-white/5 p-2">
                {walletInfo?.locked_balances.length ? (
                  walletInfo.locked_balances.map((lock, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg text-xs font-mono">
                      <span className="text-[#00E599] font-bold">{lock.amount_qua} QUA</span>
                      <span className="text-gray-500">unlocks @ {lock.unlock_height}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600 text-xs font-medium h-full flex flex-col items-center justify-center uppercase tracking-widest">
                    No locked balances
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="quantum-panel flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-[#00E599]/10 flex items-center justify-center text-[#00E599]">
              <Network className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-white">Network Info</span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-2 bg-transparent">
            {[
              { label: "Chain Length", value: `${initialStats?.chain_length || 0}` },
              { label: "BFT Epoch", value: (initialStats?.current_epoch ?? 0).toString() },
              { label: "Active Validators", value: "7 / 7" },
              { label: `Unique Proposers (Last ${initialBlocks?.length || 0})`, value: uniqueProposers.toString() },
              { label: "Block Reward", value: `${initialStats ? (initialStats.mining_reward / 1_000_000).toLocaleString() : 0} QUA` },
              { label: "Total Supply", value: `${initialStats ? (initialStats.total_supply / 1_000_000).toLocaleString() : 0} QUA` },
              { label: "Pending Txs", value: (initialStats?.pending_transactions || 0).toString() },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-3 px-4 rounded-xl text-sm border border-transparent hover:border-white/5 hover:bg-white/5 transition-all">
                <span className="font-medium text-gray-400 text-xs uppercase tracking-widest">{row.label}</span>
                <span className="font-bold text-white font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Blocks Table */}
      <div className="quantum-panel overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00E599]/10 flex items-center justify-center text-[#00E599]">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-white">Latest Blocks</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blocks" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              View All
            </Link>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 hover:text-[#00E599] transition-all text-xs font-bold tracking-widest uppercase disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-transparent">
          <table className="w-full text-left font-mono whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hash</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Proposer</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Txs</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Epoch</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dbBlocks.map((block) => (
                <tr key={block.index} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6 text-sm font-bold">
                    <Link href={`/block/${block.index}`} className="text-white group-hover:text-[#00E599] transition-colors">
                      {block.index}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <Link href={`/block/${block.index}`} className="text-gray-400 font-medium group-hover:text-white transition-colors">
                      {block.hash?.substring(0, 8)}...{block.hash?.substring(block.hash.length - 6)}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <Link href={`/address/${block.proposer}`} className="text-gray-400 group-hover:text-[#00E599] font-medium transition-colors">
                      {block.proposer && block.proposer.length > 20
                        ? `${block.proposer.substring(0, 6)}...${block.proposer.substring(block.proposer.length - 6)}`
                        : (block.proposer || 'GENESIS')}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-center">
                    <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-full text-xs font-bold border border-white/5 group-hover:border-[#00E599]/30 group-hover:text-[#00E599] transition-colors">{block.transactions?.length ?? block.txCount ?? block.tx_count ?? 0}</span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
                    EPOCH {block.epoch ?? 0}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 group-hover:text-gray-300 transition-colors text-right">
                    <TimeAgo timestamp={block.timestamp} />
                  </td>
                </tr>
              ))}
              {dbBlocks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs font-medium uppercase tracking-widest">
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
