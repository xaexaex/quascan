import { Metadata } from 'next';
import { fetchValidatorByAddress } from '@/lib/api';
import { ShieldCheck, UserCircle, Activity, Box, Lock, CheckCircle2, ChevronRight, Hash } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import CopyButton from '@/components/CopyButton';
import monikers from '@/lib/monikers.json';

export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Validator ${p.address.substring(0, 10)}... | Quanta Explorer`,
    description: `Validator details for ${p.address} on the Quanta network.`,
  };
}

export const revalidate = 60;

export default async function ValidatorDetailsPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params;
  const validator = await fetchValidatorByAddress(address);

  if (!validator) {
    notFound();
  }

  const moniker = (monikers as Record<string, string>)[address];

  return (
    <div className="page-wrap">
      <BackButton />
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <UserCircle size={20} />
        </div>
        <div style={{ width: "100%" }}>
          <span className="page-title">Validator Profile</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h1 className="page-heading" style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
              {moniker || "Unknown Validator"}
              {validator.active && <span className="tag tag-accent" style={{ fontSize: "0.5625rem", verticalAlign: "middle" }}>Active BFT</span>}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 32, alignItems: "start" }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
              <Hash size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Identity & Stake</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Wallet Address</span>
                  <CopyButton text={address} />
                </div>
                <div className="hash-box">
                  <Link href={`/address/${address}`} style={{ color: "var(--c-text-2)", textDecoration: "none" }} className="hover-accent">
                    {address}
                  </Link>
                </div>
              </div>
              
              <div style={{ padding: 20, background: "var(--c-bg-alt)", border: "1px solid var(--c-border)" }}>
                <span className="field-label">Total Delegated Stake</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 500, color: "var(--c-accent)", letterSpacing: "-0.02em", display: "block", marginTop: 4 }}>
                  {(validator.stake_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span style={{ fontSize: "1.125rem", fontWeight: 400, color: "var(--c-text-2)" }}>QUA</span>
                </span>
              </div>
            </div>
          </div>

          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
              <Lock size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Cryptographic Keys (Falcon-512)</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Public Key (Hex)</span>
                  {validator.falcon_pk_hex && <CopyButton text={validator.falcon_pk_hex} />}
                </div>
                <div className="hash-box" style={{ maxHeight: 96, overflowY: "auto", fontSize: "0.6875rem", wordBreak: "break-all" }}>
                  {validator.falcon_pk_hex || "N/A"}
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
              <Activity size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Consensus Performance</span>
              {validator.is_online ? (
                <span className="tag" style={{ marginLeft: "auto", fontSize: "0.5625rem", color: "#4ade80", borderColor: "#4ade8040", background: "#4ade8010" }}>Online</span>
              ) : (
                <span className="tag" style={{ marginLeft: "auto", fontSize: "0.5625rem", color: "#f87171", borderColor: "#f8717140", background: "#f8717110" }}>Offline</span>
              )}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: 16, background: "var(--c-bg-alt)", border: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Blocks Proposed</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", color: "var(--c-text-1)" }}>{validator.blocks_proposed ?? 0}</span>
              </div>
              <div style={{ padding: 16, background: "var(--c-bg-alt)", border: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Blocks Signed</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", color: "var(--c-text-1)" }}>{validator.blocks_signed ?? 0}</span>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Sign Rate (Window: {validator.uptime_window} blocks)</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: validator.sign_rate_pct != null && validator.sign_rate_pct >= 90 ? "#4ade80" : validator.sign_rate_pct != null && validator.sign_rate_pct >= 70 ? "#facc15" : "#f87171" }}>
                  {validator.sign_rate_pct != null ? `${validator.sign_rate_pct.toFixed(2)}%` : "N/A"}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--c-bg-alt)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(validator.sign_rate_pct || 0, 100)}%`, background: validator.sign_rate_pct != null && validator.sign_rate_pct >= 90 ? "#4ade80" : validator.sign_rate_pct != null && validator.sign_rate_pct >= 70 ? "#facc15" : "#f87171", borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16, borderTop: "1px dashed var(--c-border)" }}>
              <div>
                <span className="field-label">Reg. Epoch / Session</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", display: "block", marginTop: 4 }}>
                  Block {validator.registered_epoch} / S{Math.floor((validator.registered_epoch || 0) / 60)}
                </span>
              </div>
              <div>
                <span className="field-label">Node Version</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", display: "block", marginTop: 4 }}>
                  {validator.node_version ? `v${validator.node_version}` : "Unknown"}
                </span>
              </div>
              <div>
                <span className="field-label">Epoch Slots</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", display: "block", marginTop: 4 }}>
                  {validator.epoch_slots_assigned ? `${validator.epoch_slots_produced || 0} / ${validator.epoch_slots_assigned}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="field-label">Status</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", display: "block", marginTop: 4 }}>
                  {validator.unbonding_epoch ? `Unbonding (Epoch ${validator.unbonding_epoch})` : validator.slash_cooldown_until_epoch ? `Slashed (Cooldown until ${validator.slash_cooldown_until_epoch})` : "Active"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
