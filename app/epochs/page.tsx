import { Metadata } from 'next';
import { Layers, Clock, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import dbConnect from '@/lib/db';
import BlockModel from '@/lib/models/Block';

export const metadata: Metadata = {
  title: 'Sessions | Quanta Explorer',
  description: 'View BFT Sessions on the Quanta network',
};

export const revalidate = 10;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff < 0 ? 0 : diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

export default async function EpochsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageStr = typeof params.page === 'string' ? params.page : '1';
  let page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 20;

  await dbConnect();
  
  // Quanta session length is 60 blocks
  const SESSION_LENGTH = 60;
  
  const totalBlocks = await BlockModel.countDocuments();
  const totalSessions = Math.ceil(totalBlocks / SESSION_LENGTH);
  const totalPages = Math.max(1, Math.ceil(totalSessions / pageSize));
  
  if (page > totalPages) page = totalPages;
  const skip = Math.max(0, (page - 1) * pageSize);

  // Find blocks that are the start of a session
  const sessionStarts = await BlockModel.find({ index: { $mod: [SESSION_LENGTH, 0] } })
    .sort({ index: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean() as any[];

  return (
    <div className="page-wrap">


      <div className="page-header">
        <div>
          <h1 className="page-heading" style={{ marginBottom: 8 }}>BFT Sessions</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.04em', color: 'var(--c-text-2)', maxWidth: 600, lineHeight: 1.6 }}>
            In Quanta, a <strong>BFT Session</strong> (60 blocks) determines the active validator rotation, while an <strong>Economic Epoch</strong> (1000 blocks) determines staking reward distribution. This page tracks BFT Sessions.
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.04em', color: 'var(--c-text-3)', marginTop: 16 }}>
            {totalSessions.toLocaleString()} total sessions
          </p>
        </div>
      </div>

      <div className="az-divider" style={{ marginBottom: 32 }} />

      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border-mid)', background: 'var(--c-surface)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Session</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Start Block</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">End Block</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Started</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">First Proposer</span></th>
            </tr>
          </thead>
          <tbody>
            {sessionStarts.map((block, i) => {
              const sessionIdx = Math.floor(block.index / SESSION_LENGTH);
              const endBlock = block.index + SESSION_LENGTH - 1;
              return (
                <tr
                  key={sessionIdx}
                  style={{
                    borderBottom: i === sessionStarts.length - 1 ? 'none' : '1px solid var(--c-border)',
                    background: 'var(--c-bg-alt)',
                  }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-text-1)' }}>
                      Session {sessionIdx}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Link href={`/block/${block.index}`}>
                      <span className="tag tag-accent" style={{ fontSize: '0.5625rem' }}>#{block.index}</span>
                    </Link>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="tag tag-accent" style={{ fontSize: '0.5625rem', background: 'transparent', color: 'var(--c-text-2)', borderColor: 'var(--c-border)' }}>
                      #{endBlock}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <Clock size={10} />
                      <TimeAgo timestamp={block.timestamp} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Link href={`/address/${block.proposer}`} className="hover-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-2)', textDecoration: 'none' }}>
                      {block.proposer.slice(0, 16)}…
                    </Link>
                  </td>
                </tr>
              );
            })}
            {sessionStarts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '56px', textAlign: 'center' }}>
                  <span className="panel-section-label">No sessions found.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 40 }}>
          <Link
            href={page > 1 ? `/epochs?page=${page - 1}` : '#'}
            className={`page-btn ${page <= 1 ? 'disabled' : ''}`}
          >
            <ChevronLeft size={16} />
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Page <strong style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{page}</strong> of <strong style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{totalPages}</strong>
          </span>
          <Link
            href={page < totalPages ? `/epochs?page=${page + 1}` : '#'}
            className={`page-btn ${page >= totalPages ? 'disabled' : ''}`}
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
