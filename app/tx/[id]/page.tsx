import { Metadata } from 'next';
import { fetchTx, fetchStats } from '@/lib/api';
import { Hash, Clock, Cpu, ArrowRight, ArrowRightLeft, Database, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import BackButton from '@/components/BackButton';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Tx ${p.id.substring(0, 10)}... | Quanta Explorer`,
    description: `Details for transaction ${p.id} on the Quanta network.`,
  };
}

export const revalidate = 10;

export default async function TxDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const txData = await fetchTx(id);
  const nodeStats = await fetchStats();

  if (!txData) {
    return (
      <div className="page-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", padding: "80px 20px" }}>
        <h1 className="page-heading" style={{ marginBottom: 16 }}>Transaction Not Found</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", wordBreak: "break-all", maxWidth: 600 }}>
          {id}
        </p>

        <div className="panel" style={{ maxWidth: 600, marginTop: 40, textAlign: "left", padding: 32 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "var(--c-text-1)" }}>Why am I seeing this?</h3>
          <ul style={{ color: "var(--c-text-2)", fontSize: "0.875rem", lineHeight: 1.6, paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li><strong style={{ color: "var(--c-text-1)" }}>Pending:</strong> The transaction is still waiting to be finalized.</li>
            <li><strong style={{ color: "var(--c-text-1)" }}>System Tx:</strong> It is a block reward (Coinbase) or Treasury transaction. This node skips indexing them to conserve disk space.</li>
            <li><strong style={{ color: "var(--c-text-1)" }}>Dropped:</strong> The transaction failed, was rejected, or was dropped by the network.</li>
          </ul>
        </div>
        
        <Link href="/" className="page-btn" style={{ marginTop: 40, padding: "0 24px", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Return Home
        </Link>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';
  const currentHeight = nodeStats ? nodeStats.chain_length - 1 : 0;

  return (
    <div className="page-wrap">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-heading" style={{ margin: 0 }}>Transaction Details</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        
        {/* Top Info Grid */}
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            
            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)", gridColumn: "1 / -1" }}>
              <span className="field-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Transaction Hash
                {tx.tx_type && (
                  <span className="tag tag-accent" style={{ fontSize: "0.625rem" }}>
                    {typeof tx.tx_type === 'string' ? tx.tx_type : Object.keys(tx.tx_type)[0]}
                  </span>
                )}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", wordBreak: "break-all" }}>
                {tx_hash} <CopyButton text={tx_hash} />
              </div>
            </div>
            
            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">Status</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {status === 'confirmed' ? (
                  <>
                    <span className="tag tag-accent" style={{ display: "inline-flex", gap: 6, fontSize: "0.6875rem" }}>
                      <CheckCircle2 size={12} /> Confirmed
                    </span>
                    {block_height !== null && currentHeight > 0 && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                        {Math.max(1, currentHeight - block_height + 1)} confirmations
                      </span>
                    )}
                  </>
                ) : (
                  <span className="tag" style={{ display: "inline-flex", gap: 6, background: "var(--c-surface)", color: "var(--c-text-2)", borderColor: "var(--c-border)" }}>
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>
            </div>

            <div style={{ padding: 24, borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">Block</span>
              {block_height !== null && status === 'confirmed' ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                  <Link href={`/block/${block_height}`} className="hover-accent" style={{ textDecoration: "none", color: "inherit" }}>
                    #{block_height}
                  </Link>
                </div>
              ) : (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-3)" }}>Unconfirmed</div>
              )}
            </div>

            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">From</span>
              {isCoinbase ? (
                <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>System (Coinbase)</span>
              ) : (
                <Link href={`/address/${tx.sender}`} className="hover-accent" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", wordBreak: "break-all", textDecoration: "none" }}>
                  {tx.sender}
                </Link>
              )}
            </div>

            <div style={{ padding: 24, borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">To</span>
              <Link href={`/address/${tx.recipient}`} className="hover-accent" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", wordBreak: "break-all", textDecoration: "none" }}>
                {tx.recipient}
              </Link>
            </div>

            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">Value</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, color: "var(--c-text-1)", letterSpacing: "-0.02em" }}>
                {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span style={{ color: "var(--c-accent)", fontSize: "0.875rem", fontWeight: 400 }}>QUA</span>
              </div>
            </div>

            <div style={{ padding: 24, borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">Transaction Fee</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)" }}>
                {!isCoinbase ? `${(tx.fee / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA` : "0 QUA"}
              </div>
            </div>

            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)" }}>
              <span className="field-label">Nonce</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                {tx.nonce}
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <span className="field-label">Time Lock</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                {tx.lock_time ? `Locked until block #${tx.lock_time}` : "None"}
              </div>
            </div>
            
            {tx.payload && (Array.isArray(tx.payload) ? tx.payload.length > 0 : Object.keys(tx.payload).length > 0) && (
              <div style={{ padding: 24, borderTop: "1px solid var(--c-border)", gridColumn: "1 / -1", background: "var(--c-bg-alt)" }}>
                <span className="field-label">Payload Data</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 200, overflowY: "auto" }}>
                  {Array.isArray(tx.payload) ? Buffer.from(tx.payload).toString('utf8').replace(/[^\x20-\x7E]/g, '.') : JSON.stringify(tx.payload)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post-Quantum Security */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <ShieldCheck size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Post-Quantum Security</span>
            </h3>
            <span className="tag tag-accent" style={{ fontSize: "0.5rem" }}>{tx.sig_scheme || 'Falcon-512'}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Public Key ({tx.public_key?.length || 0} bytes)</span>
                {tx.public_key && <CopyButton text={tx.public_key} />}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", wordBreak: "break-all", maxHeight: 96, overflowY: "auto", background: "var(--c-bg-alt)", padding: 12, borderRadius: 6, border: "1px solid var(--c-border)" }}>
                {tx.public_key || "N/A (System Transaction)"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Signature ({tx.signature?.length || 0} bytes)</span>
                {tx.signature && <CopyButton text={tx.signature} />}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", wordBreak: "break-all", maxHeight: 96, overflowY: "auto", background: "var(--c-bg-alt)", padding: 12, borderRadius: 6, border: "1px solid var(--c-border)" }}>
                {tx.signature || "N/A (System Transaction)"}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

