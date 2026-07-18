import { Metadata } from 'next';
import { ArrowRightLeft, Clock, Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { fetchMempool } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Mempool | Quanta Explorer',
  description: 'View pending transactions in the Quanta network mempool',
};

export const revalidate = 5;

function shortHash(hash: string, len = 16) {
  if (!hash || hash.length <= len + 3) return hash;
  return `${hash.slice(0, len)}…`;
}

export default async function MempoolPage() {
  const mempoolData = await fetchMempool();
  const txs = mempoolData?.transactions || [];

  return (
    <div className="page-wrap">
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="page-heading" style={{ margin: 0 }}>Pending Transactions</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", marginTop: 8 }}>
            {mempoolData?.transaction_count || 0} transactions waiting in mempool
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Table */}
        <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Hash</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Type</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">From</span></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}></th>
                <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">To</span></th>
                <th style={{ padding: "16px 24px", textAlign: "right" }}><span className="panel-section-label">Amount</span></th>
                <th style={{ padding: "16px 24px", textAlign: "right" }}><span className="panel-section-label">Fee</span></th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => (
                <tr
                  key={tx.tx_hash}
                  style={{
                    borderBottom: i === txs.length - 1 ? "none" : "1px solid var(--c-border)",
                    background: "var(--c-bg-alt)",
                  }}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/tx/${tx.tx_hash}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-accent)", textDecoration: "none" }}>
                      {shortHash(tx.tx_hash)}
                    </Link>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {tx.transaction.tx_type && (
                      <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>
                        {typeof tx.transaction.tx_type === 'string' ? tx.transaction.tx_type : Object.keys(tx.transaction.tx_type)[0]}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/address/${tx.transaction.sender}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                      {shortHash(tx.transaction.sender, 14)}
                    </Link>
                  </td>
                  <td style={{ padding: "16px 8px" }}>
                    <ArrowRight size={14} color="var(--c-text-3)" />
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/address/${tx.transaction.recipient}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                      {shortHash(tx.transaction.recipient, 14)}
                    </Link>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", whiteSpace: "nowrap" }}>
                      {(tx.transaction.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span style={{ color: "var(--c-accent)", fontSize: "0.6875rem" }}>QUA</span>
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)", whiteSpace: "nowrap" }}>
                      {(tx.transaction.fee / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                    </span>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <span className="panel-section-label">Mempool is currently empty.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
