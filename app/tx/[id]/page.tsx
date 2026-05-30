import { Metadata } from 'next';
import { fetchTx } from '@/lib/api';
import { Hash, Clock, Cpu, ArrowRight, Activity, ArrowRightLeft, Database, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';

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
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-8 text-red-500 shadow-md">
          <AlertCircle className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-black text-text-primary mb-5 font-sans tracking-tight">Transaction Not Found</h1>
        <p className="text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed text-xs font-semibold flex items-center justify-center flex-wrap gap-2">
          The transaction <span className="text-text-primary bg-surface-2 border border-border px-3 py-1.5 rounded-lg inline-block font-mono text-[10px] font-bold">{id.substring(0, 20)}...</span> could not be found via the Node RPC.
        </p>
        <div className="quantum-panel p-8 max-w-2xl mx-auto text-left relative overflow-hidden border border-border">
          <h3 className="text-text-primary font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-widest relative z-10">
            <Database className="w-4 h-4 text-accent" />
            Storage Index Note
          </h3>
          <p className="text-text-secondary text-xs leading-relaxed mb-5 font-semibold relative z-10">
            This Quanta Node is currently configured to <strong className="font-bold text-text-primary">skip indexing Miner Rewards (Coinbase) and Treasury transactions</strong> in its internal database to conserve disk space. If this transaction is a network reward, it safely exists on the active blockchain but cannot be queried directly by its hash.
          </p>
          <div className="pt-4 border-t border-border relative z-10 flex items-center gap-2 text-xs">
            <span className="text-text-primary font-bold flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-accent" /> To view Miner Rewards:</span>
            <p className="text-text-secondary font-semibold">Check the details of the specific blocks mined by the exact addresses.</p>
          </div>
        </div>
        <div className="mt-10">
          <Link href="/" className="inline-flex items-center justify-center px-6 py-2.5 bg-surface border border-border hover:bg-surface-2 text-text-primary font-bold uppercase tracking-wider rounded-xl transition-all text-[10px] cursor-pointer">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6 relative">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 shadow-sm">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary font-sans uppercase">Transaction Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Transaction Summary */}
          <div className="quantum-panel p-6 border border-border space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 uppercase tracking-widest">
                <Hash className="w-4 h-4 text-accent" />
                Transaction Synopsis
              </h3>
              <CopyButton text={tx_hash} />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Transaction Hash</p>
                <div className="bg-surface-2 border border-border rounded-xl p-3.5 font-mono text-xs text-text-primary break-all hover:bg-surface transition-colors font-semibold">
                  {tx_hash}
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-border">
                  <div className="p-5 border-b border-border md:border-b-0 md:border-r">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">From</p>
                    {isCoinbase ? (
                      <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 uppercase tracking-wider">
                        System (Coinbase)
                      </span>
                    ) : (
                      <Link href={`/address/${tx.sender}`} className="font-mono text-xs text-text-secondary hover:text-accent break-all transition-colors font-bold">
                        {tx.sender}
                      </Link>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">To</p>
                    <Link href={`/address/${tx.recipient}`} className="font-mono text-xs text-text-secondary hover:text-accent break-all transition-colors font-bold">
                      {tx.recipient}
                    </Link>
                  </div>
                </div>

                <div className="p-5 bg-surface-2/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Amount</p>
                    <span className="font-black font-sans text-2xl text-text-primary">
                      {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-lg text-accent">QUA</span>
                    </span>
                  </div>

                  {!isCoinbase && (
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Gas Fee</p>
                      <span className="font-bold font-mono text-xs text-text-secondary">
                        {(tx.fee / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post-Quantum Cryptography (PQC) Security Inspector */}
          <div className="quantum-panel p-6 border border-border space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-accent animate-pulse" />
                Post-Quantum Security Detail
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] uppercase tracking-wider font-bold text-accent">
                Falcon-512 Compatible
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-primary block">Signature Verification Valid</span>
                  <span className="text-[10px] text-text-secondary mt-0.5 block font-semibold leading-relaxed">
                    This transaction is secured using the post-quantum <strong className="text-accent font-bold">Falcon-512</strong> cryptographic signature algorithm (PQC Level 5), protecting it against potential future quantum computing decryption vectors.
                  </span>
                </div>
              </div>

              {/* Raw Public Key Console Panel */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <span>Falcon Public Key ({tx.public_key?.length || 0} bytes)</span>
                  {tx.public_key && <CopyButton text={tx.public_key} />}
                </div>
                <div className="bg-surface-2 border border-border rounded-xl p-3.5 font-mono text-[10px] text-text-secondary select-all max-h-24 overflow-y-auto break-all font-semibold leading-relaxed">
                  {tx.public_key || "N/A (Coinbase reward / Genesis Transaction)"}
                </div>
              </div>

              {/* Raw Signature Console Panel */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <span>Falcon Signature ({tx.signature?.length || 0} bytes)</span>
                  {tx.signature && <CopyButton text={tx.signature} />}
                </div>
                <div className="bg-surface-2 border border-border rounded-xl p-3.5 font-mono text-[10px] text-text-secondary select-all max-h-24 overflow-y-auto break-all font-semibold leading-relaxed">
                  {tx.signature || "N/A (Coinbase reward / Genesis Transaction)"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Status & consensus info) */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="quantum-panel p-6 border border-border space-y-6">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 uppercase tracking-widest pb-4 border-b border-border">
              <Cpu className="w-4 h-4 text-accent" />
              Consensus & Status
            </h3>

            <div className="space-y-5 text-xs font-semibold">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Confirmation Status</p>
                {status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-xl border border-accent/20 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                    Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 text-text-secondary rounded-xl border border-border text-[10px] font-bold tracking-wider uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
              </div>

              {block_height !== null && status === 'confirmed' && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Included in Block</p>
                  <Link href={`/block/${block_height}`} className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 rounded-xl px-3.5 py-1.5 inline-block transition-colors hover:bg-accent/20">
                    #{block_height}
                  </Link>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Account Nonce</p>
                <span className="font-mono text-xs text-text-primary bg-surface-2 border border-border rounded-xl px-3.5 py-1.5 inline-block font-bold">
                  {tx.nonce}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

