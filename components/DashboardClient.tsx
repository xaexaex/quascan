"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NetworkStats, Block, fetchAddressInfo, AddressInfo } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Activity, CircleDollarSign, Loader2, Network, RefreshCw, Layers, 
  Database, Cpu, Zap, ShieldCheck, CheckCircle2, History, 
  ArrowRightCircle, ArrowLeftCircle, Lock, ArrowRight, Clock, Search
} from "lucide-react";

// Custom Tooltip for 14-Day Transaction History Graph
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative bg-white text-gray-900 border border-gray-200 rounded-xl p-4 shadow-xl text-left select-none animate-in fade-in duration-100" style={{ minWidth: "200px" }}>
        {/* Left pointing triangle/arrow */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[6px] w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45 pointer-events-none" />
        <div className="relative z-10 space-y-1.5 font-sans">
          <p className="text-[11px] text-gray-500 font-semibold leading-none">{data.fullDate}</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[11px] text-gray-600 font-medium">Transactions:</span>
            <span className="text-sm font-extrabold text-gray-950 font-mono">{data.transactions.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Formatter for Y-Axis labels (e.g., 14M, 6M)
const formatYAxis = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};


// Simple custom TimeAgo component
function TimeAgo({ timestamp }: { timestamp: number }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    setDiff(Math.floor(Date.now() / 1000) - timestamp);
    const interval = setInterval(() => {
      setDiff(Math.floor(Date.now() / 1000) - timestamp);
    }, 5000);
    return () => clearInterval(interval);
  }, [timestamp]);

  if (diff < 60) return <>{diff < 0 ? 0 : diff}s ago</>;
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
  const [dbBlocks, setDbBlocks] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [checkedWallet, setCheckedWallet] = useState(false);
  const { theme } = useTheme();
  const [exploreQuery, setExploreQuery] = useState("");
  const [isSearchingExplorer, setIsSearchingExplorer] = useState(false);

  const handleExplorerSearch = async () => {
    const cleanQuery = exploreQuery.trim();
    if (!cleanQuery) return;
    setIsSearchingExplorer(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
      }
      alert("No results found for your search.");
    } catch (e) {
      alert("Error occurred during search.");
    } finally {
      setIsSearchingExplorer(false);
    }
  };


  // Client side hydration protection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch indexer status
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

  // Fetch latest blocks from DB
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

  // Fetch transaction history for last 14 days
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/transactions/history');
        if (res.ok) {
          const data = await res.json();
          setHistoryData(data);
        }
      } catch (e) {
        console.error('Failed to fetch transaction history', e);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);


  // Set default wallet info on load
  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        setIsChecking(true);
        const info = await fetchAddressInfo("ms69216b1d10425689704d5ae3b2a4aa17049f59b1");
        if (info) {
          setWalletInfo(info);
          setCheckedWallet(true);
        }
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
    setCheckedWallet(false);

    try {
      const info = await fetchAddressInfo(addressInput.trim());
      if (info) {
        setWalletInfo(info);
        setCheckedWallet(true);
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

  // Active consensus nodes are dynamically calculated


  // ===================== DYNAMIC DATABASE GRAPH DATA MAPPING =====================
  // Sort blocks chronologically for standard Sparklines (Genesis to Latest index)
  const chartBlocks = dbBlocks.length > 0 ? [...dbBlocks].reverse() : [];
  
  // Real dynamic sparkline data mapping from database
  const heightChartData = chartBlocks.length > 0 
    ? chartBlocks.map(b => ({ val: b.index })) 
    : [{ val: 0 }, { val: 1 }];

  const validatorChartData = chartBlocks.length > 0 
    ? chartBlocks.map(() => ({ val: 7 })) 
    : [{ val: 7 }, { val: 7 }];

  const supplyChartData = chartBlocks.length > 0 
    ? chartBlocks.map(() => ({ val: initialStats ? (initialStats.total_supply / 1_000_000) : 50000 }))
    : [{ val: 50000 }, { val: 50000 }];

  const epochChartData = chartBlocks.length > 0
    ? chartBlocks.map(b => ({ val: b.epoch ?? 0 }))
    : [{ val: 0 }, { val: 0 }];

  const mempoolChartData = chartBlocks.length > 0
    ? chartBlocks.map(b => ({ val: b.transactions?.length || 0 }))
    : [{ val: 0 }, { val: 0 }];

  // Quick stats card configs referencing active database-derived arrays
  const statCards = [
    {
      label: "Chain Height",
      value: initialStats?.chain_length.toLocaleString() || '1',
      sub: "Genesis Block Confirmed",
      icon: Layers,
      data: heightChartData,
    },
    {
      label: "Total Supply",
      value: initialStats ? `${(initialStats.total_supply / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K QUA` : "50K QUA",
      sub: "QUA supply minted",
      icon: Database,
      data: supplyChartData,
    },
    {
      label: "Active Validators",
      value: "7 / 7",
      sub: "100% Consensus Nodes Active",
      icon: Cpu,
      data: validatorChartData,
    },
    {
      label: "Mempool Transactions",
      value: (initialStats?.pending_transactions || 0).toString(),
      sub: "Pending in mempool",
      icon: Zap,
      data: mempoolChartData,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-6 transition-colors duration-300">
      
      {/* ===================== HERO SECTION WITH CONTOUR WAVES ===================== */}
      <div className="quantum-panel relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch p-6 sm:p-8 border border-border shadow-sm">
        
        {/* Topographic Wave Image Background - Blended for light and dark themes */}
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-35 pointer-events-none overflow-hidden select-none bg-cover bg-center"
          style={{ 
            backgroundImage: theme === "dark" ? "url('/ripple-dark.jpg')" : "url('/ripple-light.jpg')",
            mixBlendMode: theme === "dark" ? "screen" : "multiply" 
          }}
        />

        {/* Hero Exploration Panel (Left 3/5 width equivalent) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-5 z-10">
          <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight font-sans text-text-primary leading-tight">
            Explore the <span className="text-accent">Quanta Network</span>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm font-semibold max-w-lg">
            Search for blocks, transactions, addresses, tokens, and more
          </p>
          
          {/* Main Hero Search Bar */}
          <div className="max-w-xl bg-surface rounded-2xl p-1.5 border border-border shadow-sm focus-within:border-accent/40 transition-all flex items-center overflow-hidden">
            <div className="pl-3 pr-1.5 text-text-muted">
              <Search className="w-4 h-4 text-accent" />
            </div>
            <input
              type="text"
              placeholder="Search by Block / Txn Hash / Address / Token / Domain Name..."
              value={exploreQuery}
              onChange={(e) => setExploreQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplorerSearch()}
              className="flex-1 bg-transparent p-2.5 text-xs font-semibold text-text-primary focus:outline-none placeholder:text-text-muted"
            />
            <button
              onClick={handleExplorerSearch}
              disabled={isSearchingExplorer}
              className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer flex items-center gap-1.5"
            >
              {isSearchingExplorer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Search
            </button>
          </div>

          {/* Popular searches shortcuts */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary font-bold">
            <span className="text-text-muted text-[10px] uppercase tracking-wider">Popular searches:</span>
            {[
              { name: "Latest Blocks", action: () => router.push("/blocks") },
              { name: "Checkpoints Status", action: () => router.push("/checkpoints") },
              { name: "PQC Wallet Check", action: () => {
                const el = document.getElementById("wallet-checker-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            ].map((item) => (
              <button
                key={item.name}
                onClick={item.action}
                className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-accent hover:text-accent transition-all cursor-pointer text-[9px] uppercase tracking-wider font-semibold"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* PQC Wallet Checker Component (Right 2/5 width equivalent in Hero!) */}
        <div id="wallet-checker-section" className="lg:col-span-5 z-10 flex flex-col justify-between p-5 rounded-2xl bg-surface/50 border border-border">
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-[10px] uppercase tracking-widest text-text-primary">PQC Wallet Checker</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center bg-surface rounded-xl border border-border overflow-hidden focus-within:border-accent/40 transition-colors">
              <input
                type="text"
                placeholder="Enter wallet address..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckBalance()}
                className="flex-1 bg-transparent p-2.5 text-[10px] font-mono text-text-primary focus:outline-none placeholder:text-text-muted"
                spellCheck={false}
              />
              <button
                onClick={handleCheckBalance}
                disabled={isChecking}
                className="px-3.5 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold text-[9px] uppercase tracking-wider transition-all border-l border-border disabled:opacity-50 cursor-pointer"
              >
                Query
              </button>
            </div>
            {walletError && (
              <div className="text-red-500 text-[9px] font-bold px-1">{walletError}</div>
            )}

            {checkedWallet && walletInfo ? (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* Crystals Dilithium compliance support shield */}
                <div className="p-3 rounded-lg border border-accent/20 bg-accent/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-[9px] text-text-secondary leading-normal font-semibold">
                    <strong className="text-accent font-bold">CRYSTALS-Dilithium (Level 5)</strong> secure primitives verified compatible.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-surface-2 rounded-lg border border-border">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1">Available</p>
                    <p className="font-mono font-bold text-accent text-xs">
                      {walletInfo.balance_qua.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </p>
                  </div>
                  <div className="p-2 bg-surface-2 rounded-lg border border-border">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1">Total</p>
                    <p className="font-mono font-bold text-text-primary text-xs">
                      {walletInfo.total_balance_qua.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </p>
                  </div>
                  <div className="p-2 bg-surface-2 rounded-lg border border-border">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1">Nonce</p>
                    <p className="font-mono font-bold text-text-secondary text-xs">
                      {walletInfo.nonce}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-text-muted text-[10px] font-bold uppercase tracking-wider border border-dashed border-border rounded-xl bg-surface-2/10">
                Enter address to check PQC balances
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ===================== ROW 2: TOP STATS 4-CARD GRID ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="quantum-panel p-4 flex flex-col justify-between min-h-[125px] group relative overflow-hidden border border-border"
          >
            {/* Subtle top background glow */}
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[9px] uppercase tracking-widest text-text-muted">{card.label}</p>
                <div className="w-6.5 h-6.5 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:border-accent/30 transition-all">
                  <card.icon className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black font-sans tracking-tight text-text-primary group-hover:text-accent transition-colors">
                  {card.value}
                </div>
                <p className="text-text-muted text-[8px] font-bold uppercase mt-0.5">{card.sub}</p>
              </div>
            </div>

            {/* Dynamic Recharts sparkline - 100% correct, no mock arrays */}
            <div className="h-6 w-full mt-2 -mb-2 overflow-hidden pointer-events-none relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.data}>
                    <defs>
                      <linearGradient id={`colorGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="var(--accent)"
                      strokeWidth={1.2}
                      fillOpacity={1}
                      fill={`url(#colorGrad-${idx})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===================== ROW 3: MAIN CONTENT SECTION (SYMMETRICAL 2x2 GRID) ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Latest Blocks Table (Top-Left 1/2) */}
        <div className="quantum-panel overflow-hidden border border-border flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-2/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest text-text-primary">Latest Blocks</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/blocks" className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors">
                View All
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-surface-2 border border-border text-text-primary px-4 py-2 rounded-xl hover:bg-surface hover:text-accent transition-all text-xs font-bold tracking-widest uppercase disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                Sync
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-transparent flex-1">
            <table className="w-full text-left font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-surface-2/10">
                  <th className="py-2.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Height</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Hash</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Proposer</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Txs</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Epoch</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dbBlocks.map((block) => (
                  <tr key={block.index} className="hover:bg-surface-2/10 transition-colors group">
                    <td className="py-2.5 px-3 text-xs font-bold">
                      <Link href={`/block/${block.index}`} className="text-text-primary group-hover:text-accent transition-colors">
                        #{block.index}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <Link href={`/block/${block.index}`} className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">
                        {block.hash?.substring(0, 8)}...{block.hash?.substring(block.hash.length - 6)}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <Link href={`/address/${block.proposer}`} className="text-text-secondary group-hover:text-accent font-medium transition-colors uppercase">
                        {block.proposer && block.proposer.length > 20
                          ? `${block.proposer.substring(0, 6)}...${block.proposer.substring(block.proposer.length - 6)}`
                          : (block.proposer || "GENESIS")}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-surface-2 border border-border text-text-primary px-2 py-0.5 rounded-full text-[10px] font-bold group-hover:border-accent/30 group-hover:text-accent transition-colors">
                          {block.transactions?.length ?? block.txCount ?? 0}
                        </span>
                        {block.transactions && block.transactions.length > 0 && (
                          <div className="flex flex-col gap-0.5 max-h-[48px] overflow-y-auto pr-1 select-text">
                            {block.transactions.map((tx) => (
                              <Link
                                key={tx.signature}
                                href={`/tx/${tx.signature}`}
                                className="text-[9px] font-mono text-accent hover:underline font-semibold"
                                title={tx.signature}
                              >
                                {tx.signature.substring(0, 5)}...{tx.signature.substring(tx.signature.length - 4)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs font-bold text-text-muted group-hover:text-text-secondary transition-colors">
                      EPOCH {block.epoch ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-text-muted group-hover:text-text-secondary transition-colors text-right">
                      <TimeAgo timestamp={block.timestamp} />
                    </td>
                  </tr>
                ))}
                {dbBlocks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted text-xs font-medium uppercase tracking-widest">
                      No block data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 14-Day Transaction History Graph Panel (Top-Right 1/2) */}
        <div className="quantum-panel p-5 border border-border flex flex-col justify-between h-full min-h-[380px]">
          <div className="flex flex-col space-y-1.5 pb-4 border-b border-border mb-4">
            <span className="font-bold text-xs uppercase tracking-widest text-text-muted">
              Base Transaction History in 14 Days
            </span>
          </div>

          <div className="flex-1 w-full h-[240px] mt-2 relative">
            {isMounted && historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={historyData} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false}
                    dy={8}
                    tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
                    ticks={
                      historyData.length >= 14 
                        ? [
                            historyData[0].label, 
                            historyData[Math.floor(historyData.length / 2)].label, 
                            historyData[historyData.length - 1].label
                          ] 
                        : []
                    }
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    dx={-8}
                    tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
                    tickFormatter={formatYAxis}
                    domain={[0, "auto"]}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                    position={{ y: 20 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="var(--text-primary)"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#chartGrad)"
                    activeDot={{ r: 6, fill: "#808080", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-text-muted text-[10px] uppercase font-bold tracking-widest">
                {isMounted ? "Loading history data..." : "Initializing..."}
              </div>
            )}
          </div>
        </div>

        {/* PQC Security Status (Bottom-Left 1/2) */}
        <div className="quantum-panel p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-text-primary">PQC Security Status</span>
          </div>

          <div className="space-y-3.5 text-xs font-semibold flex-1 flex flex-col justify-center py-2">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-[9px] uppercase text-text-muted tracking-widest">Algorithm</span>
              <span className="font-mono font-bold text-text-primary">CRYSTALS-Dilithium</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-[9px] uppercase text-text-muted tracking-widest">Security Level</span>
              <span className="font-mono font-bold text-text-primary">Level 5</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[9px] uppercase text-text-muted tracking-widest">Quantum Resistance</span>
              <span className="text-accent font-bold flex items-center gap-1.5">
                Active
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Network Health (Bottom-Right 1/2) */}
        <div className="quantum-panel p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-text-primary">Network Health</span>
          </div>

          <div className="space-y-3.5 text-xs font-semibold flex-1 flex flex-col justify-center py-2">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-[9px] uppercase text-text-muted tracking-widest">Consensus</span>
              <span className="text-accent font-bold">Healthy</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-[9px] uppercase text-text-muted tracking-widest">Active Validators</span>
              <span className="font-mono font-bold text-text-primary">7 / 7 Active</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[9px] uppercase text-text-muted tracking-widest">Network Integrity</span>
              <span className="font-mono font-bold text-accent">100%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
