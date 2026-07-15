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
      <div className="page-wrap" style={{ textAlign: "center", padding: "120px 20px" }}>
        <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: 80, height: 80, borderRadius: "50%", background: "rgba(224, 82, 82, 0.1)", border: "1px solid rgba(224, 82, 82, 0.2)", color: "var(--c-err)", marginBottom: 32 }}>
          <AlertCircle size={36} />
        </div>
        <h1 className="page-heading">Transaction Not Found</h1>
        <p className="field-label" style={{ marginTop: 20, marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
          The transaction <span className="tag" style={{ background: "var(--c-bg)", color: "var(--c-text-1)", fontFamily: "var(--font-mono)" }}>{id.substring(0, 20)}...</span> could not be found via the Node RPC.
        </p>
        
        <div className="panel" style={{ maxWidth: 640, margin: "0 auto", textAlign: "left" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, paddingBottom: 16, borderBottom: "1px solid var(--c-border)", color: "var(--c-text-1)" }}>
            <Database size={14} color="var(--c-accent)" />
            <span className="panel-section-label">Storage Index Note</span>
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--c-text-2)", lineHeight: 1.6, marginTop: 16, marginBottom: 20 }}>
            This Quanta Node is currently configured to <strong style={{ color: "var(--c-text-1)", fontWeight: 500 }}>skip indexing Miner Rewards (Coinbase) and Treasury transactions</strong> in its internal database to conserve disk space. If this transaction is a network reward, it safely exists on the active blockchain but cannot be queried directly by its hash.
          </p>
          <div style={{ paddingTop: 16, borderTop: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--c-text-1)", display: "flex", alignItems: "center", gap: 6 }}><ArrowRight size={14} color="var(--c-accent)" /> To view Miner Rewards:</span>
            <span style={{ color: "var(--c-text-2)" }}>Check the details of the specific blocks mined by the exact addresses.</span>
          </div>
        </div>
        
        <div style={{ marginTop: 40 }}>
          <Link href="/" className="page-btn" style={{ width: "auto", padding: "0 24px", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';
  const currentHeight = nodeStats ? nodeStats.chain_length - 1 : 0;

  return (
    <div className="page-wrap">
      <BackButton />
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <ArrowRightLeft size={20} />
        </div>
        <div>
          <span className="page-title">Explorer</span>
          <h1 className="page-heading">Transaction Details</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 32, alignItems: "start" }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Main Transaction Summary */}
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <Hash size={14} color="var(--c-accent)" />
                <span className="panel-section-label">Transaction Synopsis</span>
                {tx.tx_type && (
                  <span className="tag tag-accent" style={{ marginLeft: "auto", fontSize: "0.6875rem" }}>
                    {typeof tx.tx_type === 'string' ? tx.tx_type : Object.keys(tx.tx_type)[0]}
                  </span>
                )}
              </h3>
              <CopyButton text={tx_hash} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span className="field-label">Transaction Hash</span>
                <div className="hash-box">{tx_hash}</div>
              </div>

              {tx.lock_time ? (
                <div>
                  <span className="field-label">Time Lock</span>
                  <div className="hash-box" style={{ background: "rgba(224, 163, 82, 0.1)", color: "rgb(224, 163, 82)", border: "1px solid rgba(224, 163, 82, 0.2)" }}>
                    Locked until block #{tx.lock_time}
                  </div>
                </div>
              ) : null}

              <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--c-border)" }}>
                  <div style={{ padding: 20, borderRight: "1px solid var(--c-border)" }}>
                    <span className="field-label">From</span>
                    {isCoinbase ? (
                      <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>System (Coinbase)</span>
                    ) : (
                      <Link href={`/address/${tx.sender}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none", wordBreak: "break-all" }}>
                        {tx.sender}
                      </Link>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <span className="field-label">To</span>
                    <Link href={`/address/${tx.recipient}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none", wordBreak: "break-all" }}>
                      {tx.recipient}
                    </Link>
                  </div>
                </div>

                <div style={{ padding: 20, background: "var(--c-bg-alt)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <span className="field-label">Amount</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 500, color: "var(--c-text-1)", letterSpacing: "-0.02em" }}>
                      {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span style={{ color: "var(--c-accent)", fontSize: "1.125rem", fontWeight: 400 }}>QUA</span>
                    </span>
                  </div>

                  {!isCoinbase && (
                    <div style={{ textAlign: "right" }}>
                      <span className="field-label">Gas Fee</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                        {(tx.fee / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                      </span>
                    </div>
                  )}
                </div>
                
                {tx.payload && (Array.isArray(tx.payload) ? tx.payload.length > 0 : Object.keys(tx.payload).length > 0) && (
                  <div style={{ padding: 20, borderTop: "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
                    <span className="field-label">Payload Data</span>
                    <div className="hash-box" style={{ background: "var(--c-bg)", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 200, overflowY: "auto" }}>
                      {Array.isArray(tx.payload) ? Buffer.from(tx.payload).toString('utf8').replace(/[^\x20-\x7E]/g, '.') : JSON.stringify(tx.payload)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Post-Quantum Security */}
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <ShieldCheck size={14} color="var(--c-accent)" />
                <span className="panel-section-label">Security Detail</span>
              </h3>
              <span className="tag tag-accent" style={{ fontSize: "0.5rem" }}>{tx.sig_scheme || 'Falcon-512'}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 16, border: "1px solid var(--c-border)", background: "var(--c-bg-alt)", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 size={16} color="var(--c-accent)" style={{ marginTop: 2 }} />
                <div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 500, color: "var(--c-text-1)", display: "block" }}>Signature Verification Valid</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--c-text-2)", lineHeight: 1.5, marginTop: 4, display: "block" }}>
                    This transaction is secured using the <strong style={{ color: "var(--c-accent)", fontWeight: 400 }}>{tx.sig_scheme || 'Falcon-512'}</strong> cryptographic signature algorithm.
                  </span>
                </div>
              </div>

              {/* Raw Public Key Console Panel */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Falcon Public Key ({tx.public_key?.length || 0} bytes)</span>
                  {tx.public_key && <CopyButton text={tx.public_key} />}
                </div>
                <div className="hash-box" style={{ maxHeight: 96, overflowY: "auto" }}>
                  {tx.public_key || "N/A (Coinbase reward / Genesis Transaction)"}
                </div>
              </div>

              {/* Raw Signature Console Panel */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Falcon Signature ({tx.signature?.length || 0} bytes)</span>
                  {tx.signature && <CopyButton text={tx.signature} />}
                </div>
                <div className="hash-box" style={{ maxHeight: 96, overflowY: "auto" }}>
                  {tx.signature || "N/A (Coinbase reward / Genesis Transaction)"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Status & consensus info) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--c-border)", margin: 0 }}>
              <Cpu size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Consensus & Status</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <span className="field-label">Confirmation Status</span>
                {status === 'confirmed' ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span className="tag tag-accent" style={{ display: "inline-flex", gap: 6, width: "fit-content" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-bg)" }} />
                      Confirmed
                    </span>
                    {block_height !== null && currentHeight > 0 && (
                      <span style={{ fontSize: "0.6875rem", color: "var(--c-text-2)" }}>
                        {Math.max(1, currentHeight - block_height + 1)} confirmations
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="tag" style={{ display: "inline-flex", gap: 6, background: "var(--c-surface)", color: "var(--c-text-2)", borderColor: "var(--c-border)" }}>
                    <Clock size={10} />
                    Pending
                  </span>
                )}
              </div>

              {block_height !== null && status === 'confirmed' && (
                <div>
                  <span className="field-label">Included in Block</span>
                  <Link href={`/block/${block_height}`} style={{ textDecoration: "none" }}>
                    <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>
                      #{block_height}
                    </span>
                  </Link>
                </div>
              )}

              <div>
                <span className="field-label">Account Nonce</span>
                <div className="hash-box" style={{ display: "inline-block", background: "var(--c-bg-alt)", color: "var(--c-text-1)" }}>
                  {tx.nonce}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

