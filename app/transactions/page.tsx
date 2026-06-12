import { Metadata } from 'next';
import { ArrowRightLeft, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';

export const metadata: Metadata = {
  title: 'Transactions | QuaScan',
  description: 'Browse all transactions on the Quanta network.',
};

export const revalidate = 0;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff < 0 ? 0 : diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

function shortHash(hash: string, len = 16) {
  if (!hash || hash.length <= len + 3) return hash;
  return `${hash.slice(0, len)}…`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageStr = typeof params.page === 'string' ? params.page : '1';
  let page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 25;

  await dbConnect();
  const total = await TransactionModel.countDocuments();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) page = totalPages;

  const skip = Math.max(0, (page - 1) * pageSize);
  const txs = await TransactionModel.find({})
    .sort({ blockHeight: -1, blockTime: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean() as any[];

  return (
    <div className="page-wrap">
      <BackButton />

      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <ArrowRightLeft size={20} />
        </div>
        <div>
          <span className="page-title">QuantaChain Explorer</span>
          <h1 className="page-heading">Transactions</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.04em', color: 'var(--c-text-3)', marginTop: 4 }}>
            {total.toLocaleString()} total transactions indexed
          </p>
        </div>
      </div>

      <div className="az-divider" style={{ marginBottom: 32 }} />

      {/* Table */}
      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border-mid)', background: 'var(--c-surface)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Hash</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Block</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Age</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">From</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">To</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}><span className="panel-section-label">Amount</span></th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx, i) => {
              const isCoinbase = tx.sender === 'COINBASE';
              return (
                <tr
                  key={tx.txHash}
                  style={{
                    borderBottom: i === txs.length - 1 ? 'none' : '1px solid var(--c-border)',
                    background: 'var(--c-bg-alt)',
                  }}
                >
                  {/* Hash */}
                  <td style={{ padding: '14px 20px' }}>
                    <Link
                      href={`/tx/${tx.txHash}`}
                      className="hover-accent"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-accent)', textDecoration: 'none' }}
                    >
                      {shortHash(tx.txHash)}
                    </Link>
                  </td>

                  {/* Block */}
                  <td style={{ padding: '14px 20px' }}>
                    <Link href={`/block/${tx.blockHeight}`}>
                      <span className="tag tag-accent" style={{ fontSize: '0.5625rem' }}>#{tx.blockHeight}</span>
                    </Link>
                  </td>

                  {/* Age */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <Clock size={10} />
                      <TimeAgo timestamp={tx.blockTime} />
                    </div>
                  </td>

                  {/* From */}
                  <td style={{ padding: '14px 20px' }}>
                    {isCoinbase ? (
                      <span className="tag tag-accent" style={{ fontSize: '0.5625rem' }}>System</span>
                    ) : (
                      <Link
                        href={`/address/${tx.sender}`}
                        className="hover-accent"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-2)', textDecoration: 'none' }}
                      >
                        {shortHash(tx.sender, 14)}
                      </Link>
                    )}
                  </td>

                  {/* Arrow */}
                  <td style={{ padding: '14px 8px' }}>
                    <ArrowRight size={12} color="var(--c-text-3)" />
                  </td>

                  {/* To */}
                  <td style={{ padding: '14px 20px' }}>
                    <Link
                      href={`/address/${tx.recipient}`}
                      className="hover-accent"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-2)', textDecoration: 'none' }}
                    >
                      {shortHash(tx.recipient, 14)}
                    </Link>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-1)', whiteSpace: 'nowrap' }}>
                      {(tx.amountMicrounits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                      <span style={{ color: 'var(--c-accent)', fontSize: '0.5625rem', letterSpacing: '0.06em' }}>QUA</span>
                    </span>
                  </td>
                </tr>
              );
            })}
            {txs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '56px', textAlign: 'center' }}>
                  <span className="panel-section-label">No transactions found.</span>
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
            href={page > 1 ? `/transactions?page=${page - 1}` : '#'}
            className={`page-btn ${page <= 1 ? 'disabled' : ''}`}
          >
            <ChevronLeft size={16} />
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Page <strong style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{page}</strong> of <strong style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{totalPages}</strong>
          </span>
          <Link
            href={page < totalPages ? `/transactions?page=${page + 1}` : '#'}
            className={`page-btn ${page >= totalPages ? 'disabled' : ''}`}
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
