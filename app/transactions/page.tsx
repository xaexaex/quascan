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
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="page-heading" style={{ margin: 0 }}>Transactions</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", marginTop: 8 }}>
            A total of {total.toLocaleString()} transactions found
          </p>
        </div>
        {/* Pagination Top */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {page > 1 ? (
              <Link href={`/transactions?page=${page - 1}`} style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", textDecoration: "none", color: "var(--c-text-2)", transition: "all var(--t)" }} className="hover-border-accent">
                &larr; Prev
              </Link>
            ) : (
              <span style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", color: "var(--c-text-3)", opacity: 0.5 }}>&larr; Prev</span>
            )}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)", padding: "0 8px" }}>
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/transactions?page=${page + 1}`} style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", textDecoration: "none", color: "var(--c-text-2)", transition: "all var(--t)" }} className="hover-border-accent">
                Next &rarr;
              </Link>
            ) : (
              <span style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", color: "var(--c-text-3)", opacity: 0.5 }}>Next &rarr;</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Table */}
        <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Tx Hash</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Block</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Age</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">From</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">To</span></th>
                <th style={{ padding: "16px 24px", textAlign: "right" }}><span className="panel-section-label">Amount</span></th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => {
                const isCoinbase = tx.sender === 'COINBASE';
                return (
                  <tr
                    key={tx.txHash}
                    style={{
                      borderBottom: i === txs.length - 1 ? "none" : "1px solid var(--c-border)",
                      background: "var(--c-bg-alt)",
                    }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      {isCoinbase ? (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)" }}>System Tx</span>
                      ) : (
                        <Link href={`/tx/${tx.txHash}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                          {shortHash(tx.txHash)}
                        </Link>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <Link href={`/block/${tx.blockHeight}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)", textDecoration: "none", fontWeight: 500 }}>
                        #{tx.blockHeight}
                      </Link>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-3)" }}>
                        <TimeAgo timestamp={tx.blockTime} />
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {isCoinbase ? (
                        <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>System (Coinbase)</span>
                      ) : (
                        <Link href={`/address/${tx.sender}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                          {shortHash(tx.sender, 14)}
                        </Link>
                      )}
                    </td>
                    <td style={{ padding: "16px 8px" }}>
                      <ArrowRight size={14} color="var(--c-text-3)" />
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <Link href={`/address/${tx.recipient}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                        {shortHash(tx.recipient, 14)}
                      </Link>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                        {(tx.amountMicrounits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span style={{ color: "var(--c-accent)", fontSize: "0.6875rem" }}>QUA</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {txs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <span className="panel-section-label">No transactions found.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bottom */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {page > 1 ? (
              <Link href={`/transactions?page=${page - 1}`} style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", textDecoration: "none", color: "var(--c-text-2)", transition: "all var(--t)" }} className="hover-border-accent">
                &larr; Prev
              </Link>
            ) : (
              <span style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", color: "var(--c-text-3)", opacity: 0.5 }}>&larr; Prev</span>
            )}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)", padding: "0 8px" }}>
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/transactions?page=${page + 1}`} style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", textDecoration: "none", color: "var(--c-text-2)", transition: "all var(--t)" }} className="hover-border-accent">
                Next &rarr;
              </Link>
            ) : (
              <span style={{ padding: "6px 16px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--c-border)", borderRadius: "2px", color: "var(--c-text-3)", opacity: 0.5 }}>Next &rarr;</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
