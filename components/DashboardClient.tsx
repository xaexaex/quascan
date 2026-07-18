"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NetworkStats, Block } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Activity, Loader2, Layers, Database, Cpu, Zap, Clock, Search,
} from "lucide-react";

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <div style={{ color: "var(--c-text-3)", marginBottom: 4, fontSize: "0.625rem" }}>{d.fullDate}</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "var(--c-text-2)" }}>Txs</span>
          <span style={{ color: "var(--c-text-1)", fontWeight: 600 }}>{d.transactions?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

// ─── TimeAgo ──────────────────────────────────────────────────────────────────
function TimeAgo({ timestamp }: { timestamp: number }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const update = () => setDiff(Math.floor(Date.now() / 1000) - timestamp);
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [timestamp]);
  if (diff < 60) return <>{diff < 0 ? 0 : diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

// ─── Signature formatter ──────────────────────────────────────────────────────
function formatSignature(sig: any): string {
  if (!sig) return "";
  let str =
    typeof sig === "string"
      ? sig
      : Array.isArray(sig)
        ? Array.from(sig).map((b: any) => b.toString(16).padStart(2, "0")).join("")
        : String(sig);
  return str.length <= 9 ? str : `${str.substring(0, 5)}…${str.substring(str.length - 4)}`;
}

// ─── Panel Section Header ─────────────────────────────────────────────────────
function PanelHeader({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: "1px solid var(--c-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={14} style={{ color: "var(--c-accent)" }} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          fontWeight: 400,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--c-text-2)",
        }}>
          {label}
        </span>
      </div>
      <Link
        href={href}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--c-text-3)",
          transition: "color var(--t)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-text-3)")}
      >
        View All »
      </Link>
    </div>
  );
}

// ─── Status Tag ───────────────────────────────────────────────────────────────
function FinalizedTag() {
  return (
    <span className="tag tag-accent" style={{ fontSize: "0.5625rem" }}>
      Finalized
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardClient({
  initialStats,
  initialBlocks,
}: {
  initialStats: NetworkStats | null;
  initialBlocks: Block[];
}) {
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbBlocks, setDbBlocks] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [exploreQuery, setExploreQuery] = useState("");
  const [isSearchingExplorer, setIsSearchingExplorer] = useState(false);

  const handleExplorerSearch = async () => {
    const q = exploreQuery.trim();
    if (!q) return;
    setIsSearchingExplorer(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.redirect) { router.push(data.redirect); return; }
      }
      alert("No results found.");
    } catch { alert("Search error."); }
    finally { setIsSearchingExplorer(false); }
  };

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    // Initial load
    const loadInitial = async () => {
      try {
        const res = await fetch("/api/blocks?page=1&limit=10");
        if (res.ok) { const d = await res.json(); setDbBlocks(d.blocks || []); }
      } catch { }
    };
    loadInitial();

    // Setup SSE for real-time updates
    const eventSource = new EventSource("/api/blocks/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const newBlock = JSON.parse(event.data);
        setDbBlocks(prev => {
          // Check if block already exists to prevent duplicates
          if (prev.some(b => b.index === newBlock.index)) return prev;
          // Prepend new block and keep max 10
          return [newBlock, ...prev].slice(0, 10);
        });
      } catch (e) {
        console.error("Error parsing block from stream:", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/transactions/history");
        if (res.ok) setHistoryData(await res.json());
      } catch { }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop: 0 }}>

      {/* ── SEARCH BAR ── */}
      <section style={{ padding: "40px 0 40px", textAlign: "center" }}>

        {/* Search */}
        <div style={{ maxWidth: 640, margin: "0 auto 28px", display: "flex", height: 52, background: "var(--c-surface)", border: "1px solid var(--c-border-mid)", overflow: "hidden" }}>
          <div style={{ padding: "0 16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Search size={15} style={{ color: "var(--c-text-3)" }} />
          </div>
          <input
            type="text"
            placeholder="Search address, tx, or block..."
            value={exploreQuery}
            onChange={(e) => setExploreQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExplorerSearch()}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              color: "var(--c-text-1)",
              textOverflow: "ellipsis",
            }}
          />
          <button
            onClick={handleExplorerSearch}
            disabled={isSearchingExplorer}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 0, flexShrink: 0 }}
          >
            {isSearchingExplorer
              ? <Loader2 size={14} style={{ animation: "spin 0.65s linear infinite" }} />
              : "Search"
            }
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--c-text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 4 }}>
            Filter:
          </span>
          {[
            { name: "Blocks", icon: Layers, href: "/blocks" },
            { name: "Transactions", icon: Zap, href: "/transactions" },
            { name: "Validators", icon: Cpu, href: "/validators" },
          ].map((f) => (
            <button
              key={f.name}
              onClick={() => router.push(f.href)}
              className="tag"
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--c-accent)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent-mid)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--c-text-3)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-mid)";
              }}
            >
              <f.icon size={11} />
              {f.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="panel" style={{ borderRadius: 0, borderTop: "1px solid var(--c-border)", marginBottom: 40, borderLeft: "none", borderRight: "none" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }} className="stats-strip">
          {[
            { label: "Chain Height", value: Math.max(0, (initialStats?.chain_length || 1) - 1, dbBlocks.length > 0 ? dbBlocks[0].index : 0).toLocaleString() },
            { label: "Network TPS", value: initialStats?.tps !== undefined ? initialStats.tps.toFixed(2) : "—" },
            { label: "Validators", value: initialStats?.validator_count ? initialStats.validator_count.toString() : "—" },
            { label: "Total Staked", value: initialStats?.total_staked ? (initialStats.total_staked / 1_000_000).toLocaleString() + " QUA" : "—" },
            { label: "Circulating Supply", value: initialStats?.circulating_supply ? (initialStats.circulating_supply / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " QUA" : "—" },
            { label: "Gas Tracker", value: (() => {
                let totalFee = 0;
                let feeTxCount = 0;
                dbBlocks.forEach(b => {
                    (b.transactions || []).forEach((tx: any) => {
                        const payload = tx?.V2_Falcon512 || tx?.V1_Ed25519 || tx || {};
                        if (payload.sender !== "COINBASE" && payload.sender !== "TREASURY") {
                            totalFee += Number(payload.fee || 0);
                            feeTxCount++;
                        }
                    });
                });
                if (feeTxCount === 0) return "0.001 QUA";
                return ((totalFee / feeTxCount) / 1000000).toFixed(3) + " QUA";
            })() },
          ].map((s, i) => (
            <div
              key={i}
              style={{ padding: "20px 24px", borderRight: i < 5 ? "1px solid var(--c-border)" : "none" }}
            >
              <div className="stat-val">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABLES — 2 col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginBottom: 1 }} className="table-grid">

        {/* Latest Blocks */}
        <div className="panel" style={{ borderRadius: 0, overflow: "hidden" }}>
          <PanelHeader icon={Layers} label="Latest Blocks" href="/blocks" />
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 90px", padding: "10px 20px", borderBottom: "1px solid var(--c-border)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-text-3)" }}>
            <span>Block</span>
            <span>Details</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          <div>
            {dbBlocks.slice(0, 10).map((block) => (
              <div
                key={block.index}
                style={{ display: "grid", gridTemplateColumns: "100px 1fr 90px", padding: "12px 20px", borderBottom: "1px solid var(--c-border)", alignItems: "center" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--c-raised)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <Link href={`/block/${block.index}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 600, color: "var(--c-accent)" }}>
                    {block.index}
                  </Link>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} />
                    <TimeAgo timestamp={block.timestamp} />
                  </div>
                </div>
                <div style={{ minWidth: 0, paddingRight: 12 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {block.hash?.substring(0, 8)}…{block.hash?.substring(block.hash.length - 6)}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", marginTop: 3 }}>
                    {block.transactions?.length || 0} txs
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <FinalizedTag />
                </div>
              </div>
            ))}
            {dbBlocks.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Loading…
              </div>
            )}
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="panel" style={{ borderRadius: 0, overflow: "hidden", borderLeft: "none" }}>
          <PanelHeader icon={Zap} label="Latest Transactions" href="/transactions" />
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", padding: "10px 20px", borderBottom: "1px solid var(--c-border)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-text-3)" }}>
            <span>Tx Hash</span>
            <span>Block</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          <div>
            {(() => {
              const txList = dbBlocks
                .flatMap((b) =>
                  (b.transactions || []).map((tx: any) => {
                    const payload = tx?.V2_Falcon512 || tx?.V1_Ed25519 || tx || {};
                    const isSystem = payload.sender === "COINBASE" || payload.sender === "TREASURY";
                    // If the node API provided tx_hash (which it does now), use it! Otherwise fallback to signature formatting.
                    let hashStr = tx?.tx_hash;
                    if (!hashStr) {
                      let sig = payload.signature;
                      if (sig && sig.type === "Buffer" && Array.isArray(sig.data)) sig = sig.data;
                      hashStr = formatSignature(sig) || "";
                    }
                    
                    return {
                      hash: hashStr,
                      blockIndex: b.index,
                      timestamp: b.timestamp,
                      isSystem,
                      sender: payload.sender || "Unknown",
                      fee: payload.fee || "0",
                    };
                  })
                )
                .filter((tx) => tx.hash !== "" && tx.hash !== "[object Object]")
                .slice(0, 10);

              if (txList.length === 0) {
                return (
                  <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    No transactions
                  </div>
                );
              }

              return txList.map((tx, idx) => (
                <div
                  key={idx}
                  style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", padding: "12px 20px", borderBottom: "1px solid var(--c-border)", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--c-raised)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 600, color: "var(--c-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.isSystem ? (tx.sender === "COINBASE" ? "System (Coinbase)" : tx.sender) : (
                        <Link href={`/tx/${tx.hash}`} style={{ color: "var(--c-accent)" }}>
                          {tx.hash.substring(0, 6)}…{tx.hash.substring(tx.hash.length - 4)}
                        </Link>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} />
                      <TimeAgo timestamp={tx.timestamp} />
                    </div>
                  </div>
                  <div>
                    <Link href={`/block/${tx.blockIndex}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-accent)", fontWeight: 600 }}>
                      {tx.blockIndex}
                    </Link>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", marginTop: 3 }}>
                      Fee: {tx.fee} QUA
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <FinalizedTag />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* ── NETWORK ACTIVITY CHART ── */}
      <div className="panel" style={{ borderRadius: 0, marginTop: 40, borderLeft: "none", borderRight: "none", borderBottom: "none" }}>
        <div style={{ padding: "32px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Activity size={14} style={{ color: "var(--c-accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-text-2)" }}>
              Network Activity
            </span>
          </div>
          <div style={{ height: 240, paddingBottom: 20 }}>
            {isMounted && historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--c-accent)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--c-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "var(--c-border-mid)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="var(--c-accent)"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#txGrad)"
                    dot={false}
                    activeDot={{ r: 3, fill: "var(--c-bg)", stroke: "var(--c-accent)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Loading history…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM SPACING ── */}
      <div style={{ height: 40 }} />

      <style>{`
        @media (max-width: 860px) {
          .table-grid { grid-template-columns: 1fr !important; }
          .table-grid > div:last-child { border-left: 1px solid var(--c-border) !important; border-top: none; }
          .stats-strip { grid-template-columns: repeat(3, 1fr) !important; }
          .stats-strip > div:nth-child(3) { border-right: none !important; }
        }
        @media (max-width: 500px) {
          .stats-strip { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-strip > div:nth-child(even) { border-right: none !important; }
          .stats-strip > div { border-bottom: 1px solid var(--c-border); }
        }
      `}</style>
    </div>
  );
}
