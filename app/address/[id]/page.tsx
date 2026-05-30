import { Metadata } from 'next';
import { fetchAddressInfo, fetchAddressTransactions } from '@/lib/api';
import { Wallet, Coins, History, ArrowRightCircle, ArrowLeftCircle, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';

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
  if (diff < 60) return <>{diff}s</>;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-10 border-b border-white/10 pb-6 relative">
        <div className="absolute -left-10 top-0 w-32 h-32 bg-[#00E599]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599] flex-shrink-0 relative z-10 shadow-[0_0_15px_rgba(0,229,153,0.15)]">
          <Wallet className="w-7 h-7" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 font-sans">Address</h1>
          <div className="inline-flex max-w-full">
            <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-sm md:text-base text-gray-300 break-all select-all hover:bg-white/10 hover:text-white transition-colors">
              {data?.address || id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Balance Card */}
        <div className="quantum-panel p-8 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#00E599]/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
            <Coins className="w-5 h-5 text-[#00E599]" />
            Balance Synopsis
          </h3>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-sans tracking-tight text-white quantum-glow-text">
                  {totalQua.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className="text-xl font-bold font-mono text-[#00E599]">QUA</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm border-b border-white/5 pb-3">
              <span className="text-gray-500 font-medium text-xs uppercase tracking-widest">Spendable:</span>
              <span className="font-bold font-mono text-white">{spendableQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
            </div>

            {data && data.locked_balances.length > 0 && (
              <div className="flex items-center justify-between text-sm border-b border-white/5 pb-3">
                <span className="text-gray-500 font-medium text-xs uppercase tracking-widest flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#00E599]" /> Locked/Vesting:
                </span>
                <span className="font-bold font-mono text-white">{lockedQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
              </div>
            )}

            <div className="pt-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Account Nonce</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#00E599] bg-[#00E599]/10 border border-[#00E599]/20 rounded-lg px-3 py-1">
                  {data ? data.nonce : 0}
                </span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Transactions sent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Metrics Card */}
        <div className="quantum-panel p-8 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
            <History className="w-5 h-5 text-gray-400" />
            Transaction Metrics
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Txs</span>
              <span className="font-sans text-3xl font-black text-white">{txs?.transaction_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
          <History className="w-5 h-5" />
        </div>
        Recent Transactions
      </h3>
      <div className="quantum-panel overflow-hidden mb-12">
        <div className="overflow-x-auto bg-transparent">
          <table className="w-full text-left whitespace-nowrap font-mono">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tx Hash</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Block</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Age</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Type</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">From / To</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Amount (QUA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {txs && txs.transactions.length > 0 ? (
                txs.transactions.map((txData, i) => {
                  const isReceiver = txData.recipient === id;
                  const amtQua = (txData.amount_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
                  const isCoinbase = txData.sender === 'COINBASE';

                  return (
                    <tr key={`${txData.tx_hash}-${i}`} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-5">
                        <Link href={`/tx/${txData.tx_hash}`} className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                          {txData.tx_hash.substring(0, 16)}...
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <Link href={`/block/${txData.block_height}`} className="text-sm font-bold text-white group-hover:text-[#00E599] transition-colors">
                          {txData.block_height}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                          <TimeAgo timestamp={txData.block_time} />
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {isCoinbase ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00E599]/10 text-[#00E599] rounded-full border border-[#00E599]/20 text-[10px] uppercase tracking-widest font-bold">
                            Miner Reward
                          </span>
                        ) : isReceiver ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white rounded-full border border-white/10 text-[10px] uppercase tracking-widest font-bold">
                            <ArrowLeftCircle className="w-3.5 h-3.5 text-[#00E599]" /> IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-gray-400 rounded-full border border-white/5 text-[10px] uppercase tracking-widest font-bold">
                            <ArrowRightCircle className="w-3.5 h-3.5" /> OUT
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-sm">
                        {isReceiver ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">From</span>
                            <span className="font-medium text-gray-300">{txData.sender.length > 20 ? `${txData.sender.substring(0, 10)}...${txData.sender.substring(txData.sender.length - 6)}` : txData.sender}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">To</span>
                            <span className="font-medium text-gray-300">{txData.recipient.length > 20 ? `${txData.recipient.substring(0, 10)}...${txData.recipient.substring(txData.recipient.length - 6)}` : txData.recipient}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right text-sm font-bold text-white group-hover:text-[#00E599] transition-colors">
                        {amtQua}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      <History className="w-8 h-8 text-gray-600 mb-3" />
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">No transactions found.</span>
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
