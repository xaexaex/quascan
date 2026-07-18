import { Metadata } from 'next';
import { fetchAddressInfo, fetchAddressTransactions, fetchValidators } from '@/lib/api';
import { Wallet, Coins, History, ArrowRightCircle, ArrowLeftCircle, Lock, ShieldCheck, Activity } from 'lucide-react';
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  let page = parseInt(sParams.page as string, 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  if (!id) {
    notFound();
  }

  await dbConnect();

  const [data, dbTxsRaw, sentCount, receivedCount, firstTx, lastTx, validatorsData] = await Promise.all([
    fetchAddressInfo(id),
    TransactionModel.find({ $or: [{ sender: id }, { recipient: id }] })
      .sort({ blockHeight: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean() as Promise<any[]>,
    TransactionModel.countDocuments({ sender: id }),
    TransactionModel.countDocuments({ recipient: id }),
    TransactionModel.findOne({ $or: [{ sender: id }, { recipient: id }] }).sort({ blockHeight: 1 }).select('blockTime').lean() as Promise<any>,
    TransactionModel.findOne({ $or: [{ sender: id }, { recipient: id }] }).sort({ blockHeight: -1 }).select('blockTime').lean() as Promise<any>,
    fetchValidators().catch(() => null),
  ]);

  const txCount = sentCount + receivedCount;
  const totalPages = Math.max(1, Math.ceil(txCount / pageSize));

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

  const txs = {
    transaction_count: txCount,
    transactions: dbTxs,
  };

  if (!data && txs.transactions.length === 0) {
    notFound();
  }

  const spendableQua = data ? data.balance_qua : 0;
  const totalQua = data ? data.total_balance_qua : 0;
  const lockedQua = totalQua - spendableQua;

  const validatorInfo = validatorsData?.validators.find((v) => v.address === id);

  return (
    <div className="page-wrap">
      
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="page-heading" style={{ margin: 0 }}>Address Details</h1>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)", wordBreak: "break-all" }}>
              {data?.address || id}
            </span>
            <CopyButton text={data?.address || id} />
          </div>
        </div>
        {validatorInfo && (
          <div>
            {validatorInfo.is_online ? (
              <span className="tag" style={{ fontSize: "0.6875rem", color: "var(--c-accent)", borderColor: "var(--c-accent-mid)", background: "var(--c-accent-dim)" }}>Consensus Node (Online)</span>
            ) : (
              <span className="tag" style={{ fontSize: "0.6875rem", color: "var(--c-text-3)", borderColor: "var(--c-border)", background: "var(--c-bg-alt)" }}>Consensus Node (Offline)</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 40 }}>
        
        {/* Stats Strip Grid */}
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            
            {/* Total Balance */}
            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)" }}>
              <span className="field-label">Total Balance</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 500, color: "var(--c-text-1)", letterSpacing: "-0.02em" }}>
                  {totalQua.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "var(--c-accent)" }}>QUA</span>
              </div>
            </div>

            {/* Spendable & Locked */}
            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Spendable</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                  {spendableQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="field-label" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <Lock size={12} color="var(--c-text-3)" /> Locked
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)" }}>
                  {lockedQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                </span>
              </div>
            </div>

            {/* Tx Metrics */}
            <div style={{ padding: 24, borderRight: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Total Txs</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                  {txs?.transaction_count || 0}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="field-label" style={{ marginBottom: 0 }}>First Active</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-2)" }}>
                  {firstTx ? <TimeAgo timestamp={firstTx.blockTime} /> : "N/A"}
                </span>
              </div>
            </div>

            {/* Validator Stats (if applicable) or Nonce */}
            <div style={{ padding: 24, borderBottom: "1px solid var(--c-border)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              {validatorInfo ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="field-label" style={{ marginBottom: 0 }}>Stake</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-accent)" }}>
                      {(validatorInfo.stake_microunits / 1_000_000).toLocaleString()} QUA
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="field-label" style={{ marginBottom: 0 }}>Sign Rate</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                      {validatorInfo.sign_rate_pct != null ? validatorInfo.sign_rate_pct.toFixed(1) : 0}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="field-label" style={{ marginBottom: 0 }}>Account Nonce</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--c-text-1)" }}>
                      {data ? data.nonce : 0}
                    </span>
                  </div>
                </>
              )}
            </div>

          </div>
          
          {/* Locked Balances Expansion if any */}
          {data && data.locked_balances.length > 0 && (
            <div style={{ padding: 24, background: "var(--c-bg-alt)", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
              <span className="field-label" style={{ marginBottom: 12 }}>Vesting / Locked Schedules</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {data.locked_balances.map((lb: any, idx: number) => {
                  const unlockHeight = lb.unlock_height;
                  const currentHeight = lastTx?.blockHeight || 0;
                  const progress = Math.min(100, Math.max(0, ((currentHeight) / unlockHeight) * 100));
                  return (
                    <div key={idx} style={{ padding: 12, border: "1px solid var(--c-border)", borderRadius: 6, background: "var(--c-surface)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--c-text-1)" }}>{lb.amount_qua.toLocaleString()} QUA</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: progress >= 100 ? "var(--c-accent)" : "var(--c-text-3)" }}>
                          {progress >= 100 ? "Unlocked" : `Unlocks at #${unlockHeight}`}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "var(--c-border-mid)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: "var(--c-accent)", borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 40 }}>
          <Link
            href={page > 1 ? `/address/${id}?page=${page - 1}` : '#'}
            className={`page-btn ${page <= 1 ? 'disabled' : ''}`}
            style={{ padding: "8px 16px", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)", borderRadius: 6, color: page <= 1 ? "var(--c-text-3)" : "var(--c-text-1)", textDecoration: "none" }}
          >
            &larr; Prev
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Page <strong style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{page}</strong> of <strong style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{totalPages}</strong>
          </span>
          <Link
            href={page < totalPages ? `/address/${id}?page=${page + 1}` : '#'}
            className={`page-btn ${page >= totalPages ? 'disabled' : ''}`}
            style={{ padding: "8px 16px", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)", borderRadius: 6, color: page >= totalPages ? "var(--c-text-3)" : "var(--c-text-1)", textDecoration: "none" }}
          >
            Next &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

