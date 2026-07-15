"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { ValidatorInfo } from "@/lib/api";
import monikers from "@/lib/monikers.json";

export default function ValidatorsClientTable({ initialValidators }: { initialValidators: ValidatorInfo[] }) {
  const [sortCol, setSortCol] = useState<"stake" | "signRate" | "status" | null>("stake");
  const [sortDesc, setSortDesc] = useState(true);

  const validators = [...initialValidators].sort((a, b) => {
    let diff = 0;
    if (sortCol === "stake") {
      diff = a.stake_microunits - b.stake_microunits;
    } else if (sortCol === "signRate") {
      diff = (a.sign_rate_pct ?? 0) - (b.sign_rate_pct ?? 0);
    } else if (sortCol === "status") {
      if (a.active !== b.active) diff = a.active ? 1 : -1;
      else if (a.is_online !== b.is_online) diff = a.is_online ? 1 : -1;
      else diff = 0;
    }
    return sortDesc ? -diff : diff;
  });

  const handleSort = (col: "stake" | "signRate" | "status") => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  return (
    <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
            <th style={{ padding: "16px 24px", textAlign: "left", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("status")}>
              <span className="panel-section-label hover-accent">Status {sortCol === "status" ? (sortDesc ? "↓" : "↑") : ""}</span>
            </th>
            <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Network</span></th>
            <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Version</span></th>
            <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Validator Address</span></th>
            <th style={{ padding: "16px 24px", textAlign: "left", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("stake")}>
              <span className="panel-section-label hover-accent">Stake (QUA) {sortCol === "stake" ? (sortDesc ? "↓" : "↑") : ""}</span>
            </th>
            <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Epoch Slots</span></th>
            <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Proposed</span></th>
            <th style={{ padding: "16px 24px", textAlign: "left", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("signRate")}>
              <span className="panel-section-label hover-accent">Sign Rate {sortCol === "signRate" ? (sortDesc ? "↓" : "↑") : ""}</span>
            </th>
            <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Public Key Snippet</span></th>
          </tr>
        </thead>
        <tbody>
          {validators.map((val, idx) => (
            <tr key={val.address} style={{ borderBottom: idx === validators.length - 1 ? "none" : "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
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
              <td style={{ padding: "16px 24px" }}>
                {val.epoch_slots_assigned ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)" }}>
                      {val.epoch_slots_produced || 0} / {val.epoch_slots_assigned}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: "var(--c-text-3)", fontSize: "0.6875rem" }}>—</span>
                )}
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
              <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--c-text-3)" }} title={val.falcon_pk_hex}>
                {val.falcon_pk_hex.substring(0, 16)}...{val.falcon_pk_hex.substring(val.falcon_pk_hex.length - 16)}
              </td>
            </tr>
          ))}
          {validators.length === 0 && (
            <tr>
              <td colSpan={9} style={{ padding: "48px", textAlign: "center" }}>
                <span className="panel-section-label">No validators registered.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
