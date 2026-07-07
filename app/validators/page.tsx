import { fetchValidators, fetchPeers } from "@/lib/api";
import Link from "next/link";
import { ShieldCheck, Cpu, Activity, UserCircle } from "lucide-react";
import BackButton from "@/components/BackButton";

export default async function ValidatorsPage() {
  const [data, peersData] = await Promise.all([fetchValidators(), fetchPeers()]);
  const totalNodes = peersData?.peer_count ?? data?.validators.length ?? 0;

  if (!data) {
    return (
      <div className="page-wrap" style={{ textAlign: "center" }}>
        <h1 className="page-heading" style={{ color: "var(--c-err)" }}>Error loading validators</h1>
        <p className="field-label" style={{ marginTop: 12 }}>Could not connect to the network RPC.</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <BackButton />
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <span className="page-title">Network Security</span>
          <h1 className="page-heading">Consensus Nodes</h1>
        </div>
      </div>

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
            <span className="panel-section-label">Online Now</span>
            <Activity size={16} color="var(--c-accent)" />
          </div>
          <div className="stat-val" style={{ color: "var(--c-accent)" }}>{data.validators.filter(v => v.is_online).length}</div>
        </div>
        
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="panel-section-label">Algorithm</span>
            <ShieldCheck size={16} color="var(--c-accent)" />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 500, color: "var(--c-text-1)", letterSpacing: "-0.02em" }}>AlephBFT (PQC)</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Status</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Network</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Version</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Validator Address</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Stake (QUA)</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Reg. Block / Session</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Public Key Snippet</span></th>
            </tr>
          </thead>
          <tbody>
            {data.validators.map((val, idx) => (
              <tr key={val.address} style={{ borderBottom: idx === data.validators.length - 1 ? "none" : "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
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
                  <Link href={`/address/${val.address}`} className="hover-accent" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)", textDecoration: "none" }}>
                    <UserCircle size={14} color="var(--c-text-3)" />
                    {val.address}
                  </Link>
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-accent)" }}>
                  {(val.stake_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                  Block {val.registered_epoch}
                  <span style={{ marginLeft: 6, fontSize: "0.65rem", color: "var(--c-text-3)" }}>(S{Math.floor(val.registered_epoch / 60)})</span>
                </td>
                <td style={{ padding: "16px 24px", fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--c-text-3)" }} title={val.falcon_pk_hex}>
                  {val.falcon_pk_hex.substring(0, 16)}...{val.falcon_pk_hex.substring(val.falcon_pk_hex.length - 16)}
                </td>
              </tr>
            ))}
            {data.validators.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "48px", textAlign: "center" }}>
                  <span className="panel-section-label">No validators registered.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
