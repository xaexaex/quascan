"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Activity, UserCircle, ChevronDown, ChevronUp, Network } from "lucide-react";
import monikers from "@/lib/monikers.json";

export default function ValidatorsClient({ data, peersData }: { data: any, peersData: any }) {
  const [sortField, setSortField] = useState<string>("stake");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showPeers, setShowPeers] = useState(false);

  const totalNodes = peersData?.peer_count ?? data?.validators.length ?? 0;
  const totalStake = data.validators.reduce((sum: number, v: any) => sum + (v.stake_microunits || 0), 0) / 1_000_000;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedValidators = [...data.validators].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === "stake") {
      aVal = a.stake_microunits;
      bVal = b.stake_microunits;
    } else if (sortField === "sign_rate") {
      aVal = a.sign_rate_pct ?? 0;
      bVal = b.sign_rate_pct ?? 0;
    } else if (sortField === "status") {
      aVal = a.active ? 1 : 0;
      bVal = b.active ? 1 : 0;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="panel-section-label">Total Nodes</span>
            <Cpu size={16} color="var(--c-accent)" />
          </div>
          <div className="stat-val">{totalNodes}</div>
        </div>
        
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="panel-section-label">BFT Active</span>
            <Activity size={16} color="var(--c-accent)" />
          </div>
          <div className="stat-val" style={{ color: "var(--c-accent)" }}>{data.active_count}</div>
        </div>

        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="panel-section-label">Total Staked</span>
            <ShieldCheck size={16} color="var(--c-accent)" />
          </div>
          <div className="stat-val" style={{ color: "var(--c-accent)" }}>{totalStake.toLocaleString(undefined, { maximumFractionDigits: 0 })} QUA</div>
        </div>
        
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="panel-section-label">Online Now</span>
            <Activity size={16} color="var(--c-accent)" />
          </div>
          <div className="stat-val" style={{ color: "var(--c-accent)" }}>{data.validators.filter((v: any) => v.is_online).length}</div>
        </div>
      </div>



      <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", cursor: "pointer" }} onClick={() => handleSort('status')}>
                <span className="panel-section-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Network</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Version</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Validator Address</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left", cursor: "pointer" }} onClick={() => handleSort('stake')}>
                <span className="panel-section-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Stake (QUA) {sortField === 'stake' && (sortOrder === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Reg. Block / Session</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Proposed</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left", cursor: "pointer" }} onClick={() => handleSort('sign_rate')}>
                <span className="panel-section-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Sign Rate {sortField === 'sign_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Slots</span></th>
            </tr>
          </thead>
          <tbody>
            {sortedValidators.map((val: any, idx: number) => (
              <tr key={val.address} style={{ borderBottom: idx === sortedValidators.length - 1 ? "none" : "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
                <td style={{ padding: "16px 24px" }}>
                  {val.active ? (
                    <span className="tag tag-accent" style={{ fontSize: "0.5625rem" }}>Active</span>
                  ) : (
                    <span className="tag" style={{ fontSize: "0.5625rem", background: "var(--c-bg)", color: "var(--c-text-3)", borderColor: "var(--c-border-mid)" }}>Inactive</span>
                  )}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  {val.is_online ? (
                    <span className="tag" style={{ fontSize: "0.5625rem", color: "#4ade80", borderColor: "#4ade8040", background: "#4ade8010" }}>Online</span>
                  ) : (
                    <span className="tag" style={{ fontSize: "0.5625rem", color: "#f87171", borderColor: "#f8717140", background: "#f8717110" }}>Offline</span>
                  )}
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                  {val.node_version ? `v${val.node_version}` : "Unknown"}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <Link href={`/validators/${val.address}`} className="hover-accent" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    <UserCircle size={14} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
                    <div>
                      {(monikers as Record<string, string>)[val.address] && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600, color: "var(--c-accent)", letterSpacing: "0.04em" }}>
                          {(monikers as Record<string, string>)[val.address]}
                        </div>
                      )}
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-2)" }}>
                        {val.address}
                      </div>
                    </div>
                  </Link>
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-accent)" }}>
                  {(val.stake_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                  Block {val.registered_epoch}
                  <span style={{ marginLeft: 6, fontSize: "0.65rem", color: "var(--c-text-3)" }}>(S{Math.floor(val.registered_epoch / 60)})</span>
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                  {val.blocks_proposed ?? "—"}
                </td>
                <td style={{ padding: "16px 24px", minWidth: 120 }}>
                  {val.sign_rate_pct != null ? (() => {
                    const rate = val.sign_rate_pct;
                    const color = rate >= 90 ? "#4ade80" : rate >= 70 ? "#facc15" : "#f87171";
                    return (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color }}>{rate.toFixed(1)}%</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--c-text-3)" }}>{val.blocks_signed}/{val.uptime_window}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: "var(--c-border-mid)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(rate, 100)}%`, background: color, borderRadius: 2, transition: "width 0.3s ease" }} />
                        </div>
                      </div>
                    );
                  })() : <span style={{ color: "var(--c-text-3)", fontSize: "0.6875rem" }}>—</span>}
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--c-text-3)", whiteSpace: "nowrap" }}>
                  {val.epoch_slots_assigned != null ? `${val.epoch_slots_produced || 0}/${val.epoch_slots_assigned}` : "—"}
                </td>
              </tr>
            ))}
            {sortedValidators.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "48px", textAlign: "center" }}>
                  <span className="panel-section-label">No validators registered.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
