import { Metadata } from 'next';
import { fetchBlock } from '@/lib/api';
import { Box, Hash, Clock, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import BackButton from '@/components/BackButton';

export async function generateMetadata({ params }: { params: Promise<{ height: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Block #${p.height} | Quanta Explorer`,
    description: `Details for block #${p.height} on the Quanta network.`,
  };
}

export const revalidate = 60;

export default async function BlockDetailsPage({
  params,
}: {
  params: Promise<{ height: string }>
}) {
  const { height } = await params;
  const blockIndex = parseInt(height, 10);

  if (isNaN(blockIndex)) {
    notFound();
  }

  const block = await fetchBlock(blockIndex);

  if (!block) {
    notFound();
  }

  return (
    <div className="page-wrap">
      <BackButton />
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <Box size={20} />
        </div>
        <div>
          <span className="page-title">Block Identifiers</span>
          <h1 className="page-heading">Block <span style={{ color: "var(--c-accent)", fontFamily: "var(--font-mono)", fontWeight: 400 }}>#{block.index}</span></h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 32, alignItems: "start" }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--c-border)", margin: 0 }}>
              <Hash size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Block Identifiers</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Block Hash</span>
                  <CopyButton text={block.hash} />
                </div>
                <div className="hash-box">{block.hash}</div>
              </div>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Previous Hash</span>
                  <CopyButton text={block.previous_hash} />
                </div>
                <Link href={`/block/${block.index > 0 ? block.index - 1 : 0}`} style={{ textDecoration: "none" }}>
                  <div className="hash-box hover-border-accent" style={{ color: "var(--c-text-2)", transition: "all var(--t)" }}>
                    {block.previous_hash}
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--c-border)", margin: 0 }}>
              <ArrowRight size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Transactions</span>
              <span className="tag" style={{ fontSize: "0.5rem", marginLeft: 4 }}>{block.transactions?.length || 0}</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(!block.transactions || block.transactions.length === 0) ? (
                <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed var(--c-border)", background: "var(--c-bg-alt)" }}>
                  <span className="panel-section-label">No transactions in this block (Empty block).</span>
                </div>
              ) : (
                block.transactions.map((tx, idx) => (
                  <div key={idx} className="hover-border-accent" style={{ padding: 16, background: "var(--c-bg-alt)", border: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 12, transition: "border-color var(--t)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <span className="field-label">From</span>
                        <Link href={`/address/${tx.sender}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-2)", textDecoration: "none", wordBreak: "break-all" }}>
                          {tx.sender === 'COINBASE' ? 'System (Coinbase)' : tx.sender}
                        </Link>
                      </div>
                      <div>
                        <span className="field-label">To</span>
                        <Link href={`/address/${tx.recipient}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-2)", textDecoration: "none", wordBreak: "break-all" }}>
                          {tx.recipient}
                        </Link>
                      </div>
                    </div>
                    <div style={{ paddingTop: 12, borderTop: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="field-label" style={{ marginBottom: 0 }}>Amount</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                        {(tx.amount / 1_000_000).toLocaleString()} <span style={{ color: "var(--c-accent)", fontSize: "0.6875rem" }}>QUA</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
        
        {/* Right Column / Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--c-border)", margin: 0 }}>
              <Cpu size={14} color="var(--c-accent)" />
              <span className="panel-section-label">Consensus Info</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <span className="field-label">Block Proposer</span>
                <Link href={`/address/${block.proposer || 'GENESIS'}`} style={{ textDecoration: "none" }}>
                  <div className="hash-box" style={{ background: "var(--c-bg-alt)", display: "block" }}>
                    {block.proposer || 'GENESIS'}
                  </div>
                </Link>
              </div>
              
              <div>
                <span className="field-label">Mined Timestamp</span>
                <div className="hash-box" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--c-text-1)" }}>
                  <Clock size={14} color="var(--c-text-3)" />
                  {new Date(block.timestamp * 1000).toLocaleString()}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span className="field-label">Epoch</span>
                  <div className="hash-box" style={{ background: "var(--c-bg-alt)", textAlign: "center", color: "var(--c-text-1)" }}>
                    Epoch {block.epoch ?? 0}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <span className="field-label">BFT Round</span>
                  <div className="hash-box" style={{ background: "var(--c-bg-alt)", textAlign: "center", color: "var(--c-text-1)" }}>
                    Round {block.bft_round ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

