import { Metadata } from 'next';
import { fetchAddressInfo, fetchAddressTransactions } from '@/lib/api';
import { Wallet, Coins, History, ArrowRightCircle, ArrowLeftCircle, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';
import CopyButton from '@/components/CopyButton';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Address ${p.id.substring(0, 10)}... | QuaScan Explorer`,
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

  // Hybrid: fetch from BOTH MongoDB (indexer history) AND node RPC (live confirmed txs).
  // Merge + deduplicate by tx_hash so recent blocks not yet indexed still appear.
  const [data, dbTxsRaw, rpcTxsRaw] = await Promise.all([
    fetchAddressInfo(id),
    TransactionModel.find({ $or: [{ sender: id }, { recipient: id }] })
      .sort({ blockHeight: -1 })
      .limit(100)
      .lean() as Promise<any[]>,
    fetchAddressTransactions(id, 10_000).catch(() => null),
  ]);

  // Normalise MongoDB rows
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

  // Normalise RPC rows (already the right shape)
  const rpcTxs = rpcTxsRaw?.transactions ?? [];

  // Merge: start with RPC (most up-to-date), fill in any gaps from DB
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border pb-6 relative">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-text-primary font-sans uppercase">Address Details</h1>
            <div className="flex items-center gap-2 max-w-full">
              <span className="font-mono text-xs sm:text-sm text-text-secondary bg-surface-2 border border-border px-3 py-1.5 rounded-xl break-all select-all font-bold">
                {data?.address || id}
              </span>
              <CopyButton text={data?.address || id} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Balance Card */}
        <div className="quantum-panel p-6 border border-border relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
            <Coins className="w-4 h-4 text-accent" />
            Balance Synopsis
          </h3>

          <div className="space-y-5 relative z-10 text-xs font-semibold">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-sans tracking-tight text-text-primary">
                  {totalQua.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className="text-lg font-bold font-mono text-accent">QUA</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-text-secondary uppercase text-[10px]">Spendable:</span>
              <span className="font-bold font-mono text-text-primary text-sm">{spendableQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
            </div>

            {data && data.locked_balances.length > 0 && (
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-text-secondary uppercase text-[10px] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-accent" /> Locked/Vesting:
                </span>
                <span className="font-bold font-mono text-text-primary text-sm">{lockedQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
              </div>
            )}

            <div className="pt-2">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Account Nonce</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1">
                  {data ? data.nonce : 0}
                </span>
                <span className="text-[10px] text-text-secondary uppercase">Transactions sent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Metrics Card */}
        <div className="quantum-panel p-6 border border-border relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
            <History className="w-4 h-4 text-text-secondary" />
            Transaction Metrics
          </h3>
          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between bg-surface-2/40 border border-border rounded-xl p-5 hover:border-accent/20 transition-colors">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Txs</span>
              <span className="font-sans text-3xl font-black text-text-primary">{txs?.transaction_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2.5 uppercase tracking-widest">
        <History className="w-4 h-4 text-text-secondary" />
        Recent Transactions
      </h3>
      
      <div className="quantum-panel overflow-hidden border border-border mb-12">
        <div className="overflow-x-auto bg-transparent">
          <table className="w-full text-left whitespace-nowrap font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <th className="py-3.5 px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Tx Hash</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Block</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Age</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Type</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">From / To</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Amount (QUA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {txs && txs.transactions.length > 0 ? (
                txs.transactions.map((txData, i) => {
                  const isReceiver = txData.recipient === id;
                  const amtQua = (txData.amount_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
                  const isCoinbase = txData.sender === 'COINBASE';

                  return (
                    <tr key={`${txData.tx_hash}-${i}`} className="hover:bg-surface-2/30 transition-colors group">
                      <td className="py-3.5 px-5">
                        <Link href={`/tx/${txData.tx_hash}`} className="font-semibold text-text-secondary group-hover:text-accent transition-colors">
                          {txData.tx_hash.substring(0, 16)}...
                        </Link>
                      </td>
                      <td className="py-3.5 px-5">
                        <Link href={`/block/${txData.block_height}`} className="font-bold text-text-primary group-hover:text-accent transition-colors">
                          #{txData.block_height}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-text-muted font-semibold group-hover:text-text-secondary transition-colors">
                        <TimeAgo timestamp={txData.block_time} />
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {isCoinbase ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20 text-[9px] uppercase tracking-wider font-bold">
                            Miner Reward
                          </span>
                        ) : isReceiver ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20 text-[9px] uppercase tracking-wider font-bold">
                            <ArrowLeftCircle className="w-3.5 h-3.5" /> IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-2 text-text-secondary rounded-full border border-border text-[9px] uppercase tracking-wider font-bold">
                            <ArrowRightCircle className="w-3.5 h-3.5 text-text-muted" /> OUT
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        {isReceiver ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary">
                            <span className="text-text-muted uppercase">From</span>
                            <span className="font-mono text-text-primary">{txData.sender.length > 20 ? `${txData.sender.substring(0, 8)}...${txData.sender.substring(txData.sender.length - 6)}` : txData.sender}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary">
                            <span className="text-text-muted uppercase">To</span>
                            <span className="font-mono text-text-primary">{txData.recipient.length > 20 ? `${txData.recipient.substring(0, 8)}...${txData.recipient.substring(txData.recipient.length - 6)}` : txData.recipient}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                        {amtQua}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="inline-flex flex-col items-center justify-center space-y-2">
                      <History className="w-6 h-6 text-text-muted" />
                      <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">No transactions found.</span>
                    </div>
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

