import { Metadata } from 'next';
import { fetchAddressInfo, fetchAddressTransactions } from '@/lib/api';
import { Wallet, Coins, History, ArrowRightCircle, ArrowLeftCircle, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';
import CopyButton from '@/components/CopyButton';
import BackButton from '@/components/BackButton';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Address ${p.id.substring(0, 10)}... | Quanta Explorer`,
    description: `Details for address ${p.id} on the Quanta network.`,
  };
}

export const revalidate = 0;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff < 0 ? 0 : diff}s</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h</>;
  return <>{Math.floor(diff / 86400)}d</>;
}

export default async function AddressDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  await dbConnect();

  const [data, dbTxsRaw, rpcTxsRaw] = await Promise.all([
    fetchAddressInfo(id),
    TransactionModel.find({ $or: [{ sender: id }, { recipient: id }] })
      .sort({ blockHeight: -1 })
      .limit(100)
      .lean() as Promise<any[]>,
    fetchAddressTransactions(id, 10_000).catch(() => null),
  ]);

  const dbTxs = (dbTxsRaw ?? []).map((tx: any) => ({
    tx_hash: tx.txHash as string,
    block_height: tx.blockHeight as number,
    block_time: tx.blockTime as number,
    sender: tx.sender as string,
    recipient: tx.recipient as string,
    amount_microunits: tx.amountMicrounits as number,
    fee_microunits: tx.feeMicrounits as number,
    tx_type: (tx.txType || 'TRANSFER') as string,
  }));

  const rpcTxs = rpcTxsRaw?.transactions ?? [];

  const seen = new Set<string>();
  const merged: typeof rpcTxs = [];
  for (const tx of [...rpcTxs, ...dbTxs]) {
    if (!seen.has(tx.tx_hash)) {
      seen.add(tx.tx_hash);
      merged.push(tx);
    }
  }
  merged.sort((a, b) => b.block_height - a.block_height);
  const topTxs = merged.slice(0, 100);

  const txs = {
    transaction_count: Math.max(
      rpcTxsRaw?.transaction_count ?? 0,
      await TransactionModel.countDocuments({ $or: [{ sender: id }, { recipient: id }] }),
    ),
    transactions: topTxs,
  };

  if (!data && txs.transactions.length === 0) {
    notFound();
  }

  const spendableQua = data ? data.balance_qua : 0;
  const totalQua = data ? data.total_balance_qua : 0;
  const lockedQua = totalQua - spendableQua;

  return (
    <div className="page-wrap">
      <BackButton />
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-icon">
          <Wallet size={20} />
        </div>
        <div>
          <span className="page-title">Explorer</span>
          <h1 className="page-heading">Address Details</h1>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span className="tag" style={{ background: "var(--c-surface)", color: "var(--c-text-1)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", userSelect: "all", wordBreak: "break-all" }}>
              {data?.address || id}
            </span>
            <CopyButton text={data?.address || id} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 48 }}>
        
        {/* Balance Card */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 32 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
            <Coins size={14} color="var(--c-accent)" />
            <span className="panel-section-label">Balance Synopsis</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <span className="field-label">Total Balance</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 500, color: "var(--c-text-1)", letterSpacing: "-0.02em" }}>
                  {totalQua.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.125rem", color: "var(--c-accent)", fontWeight: 500 }}>QUA</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label" style={{ marginBottom: 0 }}>Spendable:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", fontWeight: 500 }}>{spendableQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
            </div>

            {data && data.locked_balances.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
                <span className="field-label" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <Lock size={12} color="var(--c-accent)" /> Locked/Vesting:
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", fontWeight: 500 }}>{lockedQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
              </div>
            )}

            <div>
              <span className="field-label">Account Nonce</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="tag tag-accent" style={{ fontSize: "0.6875rem" }}>
                  {data ? data.nonce : 0}
                </span>
                <span className="field-label" style={{ marginBottom: 0 }}>Transactions sent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Metrics Card */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 32 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
            <History size={14} color="var(--c-text-2)" />
            <span className="panel-section-label">Transaction Metrics</span>
          </h3>
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 24 }}>
              <span className="panel-section-label">Total Txs</span>
              <span className="stat-val" style={{ fontSize: "2rem" }}>{txs?.transaction_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 24px 0" }}>
        <History size={14} color="var(--c-text-2)" />
        <span className="panel-section-label" style={{ color: "var(--c-text-1)" }}>Recent Transactions</span>
      </h3>
      
      <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-mid)", background: "var(--c-surface)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Tx Hash</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Block</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">Age</span></th>
              <th style={{ padding: "16px 24px", textAlign: "center" }}><span className="panel-section-label">Type</span></th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}><span className="panel-section-label">From / To</span></th>
              <th style={{ padding: "16px 24px", textAlign: "right" }}><span className="panel-section-label">Amount (QUA)</span></th>
            </tr>
          </thead>
          <tbody>
            {txs && txs.transactions.length > 0 ? (
              txs.transactions.map((txData, i) => {
                const isReceiver = txData.recipient === id;
                const amtQua = (txData.amount_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
                const isCoinbase = txData.sender === 'COINBASE';

                return (
                  <tr key={`${txData.tx_hash}-${i}`} style={{ borderBottom: i === txs.transactions.length - 1 ? "none" : "1px solid var(--c-border)", background: "var(--c-bg-alt)" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <Link href={`/tx/${txData.tx_hash}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-2)", textDecoration: "none" }}>
                        {txData.tx_hash.substring(0, 16)}...
                      </Link>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <Link href={`/block/${txData.block_height}`} className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)", textDecoration: "none", fontWeight: 500 }}>
                        #{txData.block_height}
                      </Link>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-3)" }}>
                        <TimeAgo timestamp={txData.block_time} />
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      {isCoinbase ? (
                        <span className="tag tag-accent" style={{ fontSize: "0.5625rem" }}>Miner Reward</span>
                      ) : isReceiver ? (
                        <span className="tag tag-accent" style={{ fontSize: "0.5625rem", display: "inline-flex", gap: 6 }}>
                          <ArrowLeftCircle size={10} /> IN
                        </span>
                      ) : (
                        <span className="tag" style={{ fontSize: "0.5625rem", display: "inline-flex", gap: 6, background: "var(--c-surface)", color: "var(--c-text-2)", borderColor: "var(--c-border)" }}>
                          <ArrowRightCircle size={10} /> OUT
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {isReceiver ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="field-label" style={{ marginBottom: 0, fontSize: "0.5625rem" }}>From</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-1)" }}>{txData.sender.length > 20 ? `${txData.sender.substring(0, 8)}...${txData.sender.substring(txData.sender.length - 6)}` : txData.sender}</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="field-label" style={{ marginBottom: 0, fontSize: "0.5625rem" }}>To</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-1)" }}>{txData.recipient.length > 20 ? `${txData.recipient.substring(0, 8)}...${txData.recipient.substring(txData.recipient.length - 6)}` : txData.recipient}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <span className="hover-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)", fontWeight: 500 }}>
                        {amtQua}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <History size={24} color="var(--c-text-3)" />
                    <span className="panel-section-label">No transactions found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

