import { Metadata } from 'next';
import { Box, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

import dbConnect from '@/lib/db';
import BlockModel from '@/lib/models/Block';

export const metadata: Metadata = {
  title: 'Blocks | Quanta Explorer',
  description: 'View all blocks on the Quanta network.',
};

export const revalidate = 0;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff < 0 ? 0 : diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const pageStr = typeof params.page === 'string' ? params.page : '1';
  let page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 20;

  await dbConnect();
  const totalBlocks = await BlockModel.countDocuments();
  const totalPages = Math.ceil(totalBlocks / pageSize);
  
  if (page > totalPages && totalPages > 0) page = totalPages;

  const skip = Math.max(0, (page - 1) * pageSize);
  const blocks = await BlockModel.find({})
    .sort({ index: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean() as any[];

  const startHeight = blocks.length > 0 ? blocks[0].index : 0;
  const endHeight = blocks.length > 0 ? blocks[blocks.length - 1].index : 0;

  return (
    <div className="page-wrap">
      <BackButton />
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <Box size={20} />
        </div>
        <div>
          <span className="page-title">QuantaChain Explorer</span>
          <h1 className="page-heading">Blocks</h1>
          <p className="text-muted mt-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.04em" }}>
            Showing blocks #{startHeight} to #{endHeight}
          </p>
        </div>
      </div>

      <div className="az-divider" style={{ marginBottom: 32 }} />

      {/* Table Card */}
      <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Height</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Age</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Transactions</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Proposer</span></th>
              <th style={{ padding: "16px 24px", textAlign: "right" }}><span className="panel-section-label">Epoch</span></th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, i) => {
              const proposer = block.proposer || 'GENESIS';
              return (
                <tr key={block.index} style={{ borderBottom: i === blocks.length - 1 ? "none" : "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
                  {/* Height */}
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/block/${block.index}`} style={{ display: "inline-block" }}>
                      <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>
                        #{block.index}
                      </span>
                    </Link>
                  </td>
                  
                  {/* Age */}
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-text-3)", fontFamily: "var(--font-mono)", fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      <Clock size={12} />
                      <TimeAgo timestamp={block.timestamp} />
                    </div>
                  </td>
                  
                  {/* Txs */}
                  <td style={{ padding: "16px 24px" }}>
                    <span className="tag" style={{ fontSize: "0.5625rem" }}>
                      {block.transactions?.length ?? 0} txns
                    </span>
                  </td>
                  
                  {/* Proposer */}
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/address/${proposer}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                      {proposer.length > 20 ? `${proposer.substring(0, 16)}...` : proposer}
                    </Link>
                  </td>
                  
                  {/* Epoch */}
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-1)" }}>
                      EPOCH {block.epoch ?? 0}
                    </span>
                  </td>
                </tr>
              );
            })}
            {blocks.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "48px", textAlign: "center" }}>
                  <span className="panel-section-label">No blocks found on this page.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 40 }}>
          <Link
            href={page > 1 ? `/blocks?page=${page - 1}` : '#'}
            className={`page-btn ${page <= 1 ? 'disabled' : ''}`}
          >
            <ChevronLeft size={16} />
          </Link>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Page <strong style={{ color: "var(--c-text-1)", fontWeight: 500 }}>{page}</strong> of <strong style={{ color: "var(--c-text-1)", fontWeight: 500 }}>{Math.max(1, totalPages)}</strong>
          </span>
          <Link
            href={page < totalPages ? `/blocks?page=${page + 1}` : '#'}
            className={`page-btn ${page >= totalPages ? 'disabled' : ''}`}
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

