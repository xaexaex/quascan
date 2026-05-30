import { Metadata } from 'next';
import { fetchTx } from '@/lib/api';
import { Hash, Clock, Cpu, ArrowRight, Activity, ArrowRightLeft, Database, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Tx ${p.id.substring(0, 10)}... | QuaScan Explorer`,
    description: `Details for transaction ${p.id} on the Quanta network.`,
  };
}

export const revalidate = 10;

export default async function TxDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const txData = await fetchTx(id);

  if (!txData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 text-center pt-24">
        <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-8 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-white mb-6 font-sans tracking-tight">Transaction Not Found</h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-12 leading-relaxed text-sm flex items-center justify-center flex-wrap gap-2">
          The transaction <span className="text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg inline-block font-mono text-xs font-bold">{id.substring(0, 20)}...</span> could not be found via the Node RPC.
        </p>
        <div className="quantum-panel p-8 max-w-3xl mx-auto text-left relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#00E599]/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest relative z-10">
            <Database className="w-5 h-5 text-[#00E599]" />
            Storage Index Note
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium relative z-10">
            This Quanta Node is currently configured to <strong className="font-bold text-white">skip indexing Miner Rewards (Coinbase) and Treasury transactions</strong> in its internal database to conserve disk space. If this transaction is a network reward, it safely exists on the active blockchain but cannot be queried directly by its hash.
          </p>
          <div className="pt-5 border-t border-white/10 relative z-10">
            <span className="text-white text-sm font-bold flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#00E599]" /> To view Miner Rewards:</span>
            <p className="text-gray-500 text-sm mt-1 ml-6 font-medium">Check the details of the specific blocks mined by the exact addresses.</p>
          </div>
        </div>
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-white/5 text-white hover:bg-white/10 hover:text-[#00E599] border border-white/10 font-bold uppercase tracking-widest rounded-xl transition-all text-xs">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6 relative">
        <div className="absolute -left-10 top-0 w-32 h-32 bg-[#00E599]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599] flex-shrink-0 relative z-10 shadow-[0_0_15px_rgba(0,229,153,0.15)]">
          <ArrowRightLeft className="w-7 h-7" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-white font-sans">Transaction Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Transaction Identifiers */}
          <div className="quantum-panel p-8">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Identifiers
            </h3>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction Hash</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 break-all select-all hover:bg-white/10 hover:text-white transition-colors">
                {tx_hash}
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="quantum-panel p-8">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transfer Details
            </h3>

            <div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-white/5">
                  <div className="p-6 border-b border-white/5 md:border-b-0 md:border-r">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">From</p>
                    {isCoinbase ? (
                      <span className="font-mono text-sm font-bold text-[#00E599] bg-[#00E599]/10 border border-[#00E599]/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-2 uppercase tracking-widest">
                        System (Coinbase)
                      </span>
                    ) : (
                      <Link href={`/address/${tx.sender}`} className="font-mono text-sm text-gray-300 hover:text-white hover:bg-white/10 break-all bg-white/5 border border-white/10 rounded-lg p-3 block transition-colors font-medium">
                        {tx.sender}
                      </Link>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">To</p>
                    <Link href={`/address/${tx.recipient}`} className="font-mono text-sm text-gray-300 hover:text-white hover:bg-white/10 break-all bg-white/5 border border-white/10 rounded-lg p-3 block transition-colors font-medium">
                      {tx.recipient}
                    </Link>
                  </div>
                </div>

                <div className="p-6 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Amount</p>
                    <span className="font-black font-sans text-3xl text-white quantum-glow-text">
                      {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-xl text-[#00E599]">QUA</span>
                    </span>
                  </div>

                  {!isCoinbase && (
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Network Fee</p>
                      <span className="font-bold font-mono text-gray-400">
                        {(tx.fee / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="quantum-panel p-8">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Database className="w-5 h-5 text-[#00E599]" />
              Status & Info
            </h3>

            <ul className="space-y-6">
              <li>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Status</p>
                {status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E599]/10 text-[#00E599] rounded-xl border border-[#00E599]/20 text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(0,229,153,0.2)]">
                    <div className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></div>
                    Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-xl border border-white/10 text-xs font-bold tracking-widest uppercase">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </li>

              {block_height !== null && status === 'confirmed' && (
                <li>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Included in Block</p>
                  <Link href={`/block/${block_height}`} className="font-mono text-sm font-bold text-gray-300 hover:text-[#00E599] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 inline-block transition-colors hover:bg-white/10 hover:border-[#00E599]/30">
                    #{block_height}
                  </Link>
                </li>
              )}

              <li>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Nonce</p>
                <span className="font-mono text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 inline-block font-bold">
                  {tx.nonce}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
