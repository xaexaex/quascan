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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-orange-50 border border-orange-100 mb-6">
          <AlertCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-3xl font-black text-black mb-4">Transaction Not Found</h1>
        <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed text-sm flex items-center justify-center flex-wrap gap-2">
          The transaction <span className="text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg inline-block font-mono text-xs">{id.substring(0, 20)}...</span> could not be found via the Node RPC.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 max-w-3xl mx-auto text-left shadow-sm">
          <h3 className="text-amber-700 font-black mb-3 flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            Storage Index Note
          </h3>
          <p className="text-amber-600 text-sm leading-relaxed mb-6 font-medium">
            This Quanta Node is currently configured to <strong className="font-extrabold text-amber-700">skip indexing Miner Rewards (Coinbase) and Treasury transactions</strong> in its internal database to conserve disk space. If this transaction is a network reward, it safely exists on the active blockchain but cannot be queried directly by its hash.
          </p>
          <div className="pt-4 border-t border-amber-100">
            <span className="text-amber-700 text-sm font-bold flex items-center gap-2"><ArrowRight className="w-4 h-4" /> To view Miner Rewards:</span>
            <p className="text-amber-600 text-xs mt-1 ml-6 font-medium">Check the details of the specific blocks mined by the exact addresses.</p>
          </div>
        </div>
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-[#00E599] text-black font-bold rounded-xl shadow-sm hover:bg-[#00E599]/80 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] flex-shrink-0 shadow-sm">
          <ArrowRightLeft className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black">Transaction Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Identifiers */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Transaction Identifiers
            </h3>

            <div>
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction Hash</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-sm text-gray-700 break-all select-all">
                {tx_hash}
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transfer Details
            </h3>

            <div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">From</p>
                    {isCoinbase ? (
                      <span className="font-mono text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                        System (Coinbase)
                      </span>
                    ) : (
                      <Link href={`/address/${tx.sender}`} className="font-mono text-sm text-[#00E599] hover:text-teal-600 break-all bg-white border border-gray-200 p-3 rounded-xl block transition-colors hover:border-[#00E599]/40">
                        {tx.sender}
                      </Link>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">To</p>
                    <Link href={`/address/${tx.recipient}`} className="font-mono text-sm text-[#00E599] hover:text-teal-600 break-all bg-white border border-gray-200 p-3 rounded-xl block transition-colors hover:border-[#00E599]/40">
                      {tx.recipient}
                    </Link>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Amount</p>
                    <span className="font-black font-mono text-2xl text-[#00E599]">
                      {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                    </span>
                  </div>

                  {!isCoinbase && (
                    <div className="sm:text-right">
                      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Network Fee</p>
                      <span className="font-bold font-mono text-gray-600">
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
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00E599]" />
              Status & Block Info
            </h3>

            <ul className="space-y-6">
              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Status</p>
                {status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E599]/10 text-teal-700 rounded-full border border-[#00E599]/20 text-xs font-bold tracking-widest uppercase">
                    <div className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></div>
                    Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-xs font-bold tracking-widest uppercase">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </li>

              {block_height !== null && status === 'confirmed' && (
                <li>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Included in Block</p>
                  <Link href={`/block/${block_height}`} className="font-mono text-sm font-bold text-gray-900 hover:text-[#00E599] bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl inline-block transition-colors hover:border-[#00E599]/40">
                    #{block_height}
                  </Link>
                </li>
              )}

              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Nonce</p>
                <span className="font-mono text-sm text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl inline-block font-bold">
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
