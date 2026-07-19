import { Metadata } from 'next';
import { fetchBlock } from '@/lib/api';
import { Box, Hash, Clock, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import BackButton from '@/components/BackButton';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';

export async function generateMetadata({ params }: { params: Promise<{ height: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Block #${p.height} | Quanta Explorer`,
    description: `Details for block #${p.height} on the Quanta network.`,
  };
}

export const revalidate = 60;

function shortHash(hash: string, len = 16) {
  if (!hash || hash.length <= len + 3) return hash;
  return `${hash.slice(0, len)}…`;
}

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

  const totalFees = block.transactions ? block.transactions.reduce((acc, tx) => acc + (tx.fee || 0), 0) : 0;
  
  await dbConnect();
  const txsFromDb = await TransactionModel.find({ blockHeight: block.index }).lean() as any[];

  return (
    <div className="page-wrap">
      
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="page-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Box size={14} color="var(--c-accent)" />
            QuantaChain Explorer
          </span>
          <h1 className="page-heading" style={{ margin: 0 }}>Block <span style={{ color: "var(--c-accent)", fontFamily: "var(--font-mono)", fontWeight: 400 }}>#{block.index}</span></h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {block.index > 0 ? (
            <Link href={`/block/${block.index - 1}`} style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", textDecoration: "none", color: "var(--c-text-2)", transition: "all var(--t)" }} className="hover-border-accent">
              &larr; Prev
            </Link>
          ) : (
            <span style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", color: "var(--c-text-3)", opacity: 0.5 }}>&larr; Prev</span>
          )}
          <Link href={`/block/${block.index + 1}`} style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", textDecoration: "none", color: "var(--c-text-2)", transition: "all var(--t)" }} className="hover-border-accent">
            Next &rarr;
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        
        {/* Top Info Grid */}
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 1, background: "var(--c-border)" }}>
            <div style={{ padding: 24, background: "var(--c-surface)", gridColumn: "1 / -1" }}>
              <span className="field-label">Block Hash</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", wordBreak: "break-all" }}>
                {block.hash} <CopyButton text={block.hash} />
              </div>
            </div>
            
            <div style={{ padding: 24, background: "var(--c-surface)", gridColumn: "1 / -1" }}>
              <span className="field-label">Previous Hash</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", wordBreak: "break-all" }}>
                <Link href={`/block/${block.index > 0 ? block.index - 1 : 0}`} className="hover-accent" style={{ textDecoration: "none", color: "inherit" }}>
                  {block.previous_hash}
                </Link>
                <CopyButton text={block.previous_hash} />
              </div>
            </div>

            <div style={{ padding: 24, background: "var(--c-surface)" }}>
              <span className="field-label">Validated Timestamp</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                <Clock size={14} color="var(--c-text-3)" />
                {new Date(block.timestamp * 1000).toLocaleString()}
              </div>
            </div>
            
            <div style={{ padding: 24, background: "var(--c-surface)" }}>
              <span className="field-label">Proposer</span>
              <Link href={`/address/${block.proposer || 'GENESIS'}`} className="hover-accent" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", wordBreak: "break-all", textDecoration: "none" }}>
                {block.proposer || 'GENESIS'}
              </Link>
            </div>
            
            <div style={{ padding: 24, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="field-label">Consensus Details</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--c-text-1)" }}>
                <div>Economic Epoch: {block.epoch ?? 0}</div>
                <div>BFT Session: {Math.floor((block.index || 0) / 60)}</div>
                <div>BFT Round: {block.bft_round ?? 0}</div>
              </div>
            </div>

            <div style={{ padding: 24, background: "var(--c-surface)" }}>
              <span className="field-label">BFT Signatures</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                {block.bft_signers?.length || 0} Signers
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 400, color: "var(--c-text-1)" }}>Transactions ({txsFromDb.length})</h3>
            {totalFees > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>
                Total Fees: {(totalFees / 1_000_000).toLocaleString()} QUA
              </span>
            )}
          </div>

          {txsFromDb.length === 0 ? (
            <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
              <span className="panel-section-label">No transactions in this block</span>
            </div>
          ) : (
            <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
                    <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Tx Hash</span></th>
                    <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">From</span></th>
                    <th style={{ padding: "16px 24px", textAlign: "left" }}></th>
                    <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">To</span></th>
                    <th style={{ padding: "16px 24px", textAlign: "right" }}><span className="panel-section-label">Amount</span></th>
                  </tr>
                </thead>
                <tbody>
                  {txsFromDb.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === txsFromDb.length - 1 ? "none" : "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <Link href={`/tx/${tx.txHash}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-accent)", textDecoration: "none" }}>
                          {shortHash(tx.txHash)}
                        </Link>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        {tx.sender === 'COINBASE' ? (
                           <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>System (Coinbase)</span>
                        ) : (
                          <Link href={`/address/${tx.sender}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none", wordBreak: "break-all" }}>
                            {shortHash(tx.sender, 14)}
                          </Link>
                        )}
                      </td>
                      <td style={{ padding: "16px 8px" }}>
                        <ArrowRight size={14} color="var(--c-text-3)" />
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <Link href={`/address/${tx.recipient}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none", wordBreak: "break-all" }}>
                          {shortHash(tx.recipient, 14)}
                        </Link>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                          {(tx.amountMicrounits / 1_000_000).toLocaleString()} <span style={{ color: "var(--c-accent)", fontSize: "0.6875rem" }}>QUA</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

