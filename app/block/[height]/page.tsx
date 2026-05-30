import { Metadata } from 'next';
import { fetchBlock } from '@/lib/api';
import { Box, Hash, Clock, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';

export async function generateMetadata({ params }: { params: Promise<{ height: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Block #${p.height} | QuaScan Explorer`,
    description: `Details for block #${p.height} on the Quanta network.`,
  };
}

export const revalidate = 60;

export default async function BlockDetailsPage({
  params,
}: {
  params: Promise<{ height: string }>
}) {
  const { height } = await params;
  const blockIndex = parseInt(height, 10);

  if (isNaN(blockIndex)) {
    notFound();
  }

  const block = await fetchBlock(blockIndex);

  if (!block) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24 transition-colors duration-300">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6 relative">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-sm">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-3 font-sans uppercase">
            Block <span className="text-accent font-mono">#{block.index}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Block Identifiers */}
          <div className="quantum-panel p-6 border border-border">
            <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-border">
              <Hash className="w-4 h-4 text-accent" />
              Block Identifiers
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  <span>Block Hash</span>
                  <CopyButton text={block.hash} />
                </div>
                <div className="bg-surface-2 border border-border rounded-xl p-3.5 font-mono text-xs text-text-primary break-all hover:bg-surface transition-colors font-semibold">
                  {block.hash}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  <span>Previous Hash</span>
                  <CopyButton text={block.previous_hash} />
                </div>
                <Link href={`/block/${block.index > 0 ? block.index - 1 : 0}`}>
                  <div className="bg-surface border border-border rounded-xl p-3.5 font-mono text-xs text-text-secondary hover:text-accent hover:border-accent/30 transition-all break-all font-semibold">
                    {block.previous_hash}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Transactions list */}
          <div className="quantum-panel p-6 border border-border">
            <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-border">
              <ArrowRight className="w-4 h-4 text-accent" />
              Transactions <span className="ml-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent font-bold">{block.transactions?.length || 0}</span>
            </h3>

            <div className="space-y-3.5">
              {(!block.transactions || block.transactions.length === 0) ? (
                <div className="text-center py-10 text-text-muted font-bold text-[10px] uppercase tracking-widest bg-surface-2/10 border border-dashed border-border rounded-xl">
                  No transactions in this block (Empty block).
                </div>
              ) : (
                block.transactions.map((tx, idx) => (
                  <div key={idx} className="bg-surface-2/20 rounded-xl p-5 border border-border hover:border-accent/20 transition-all hover:bg-surface">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-semibold">
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">From</p>
                        <Link href={`/address/${tx.sender}`} className="font-mono text-text-secondary hover:text-accent break-all transition-colors font-bold">
                          {tx.sender === 'COINBASE' ? 'System (Coinbase)' : tx.sender}
                        </Link>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">To</p>
                        <Link href={`/address/${tx.recipient}`} className="font-mono text-text-secondary hover:text-accent break-all transition-colors font-bold">
                          {tx.recipient}
                        </Link>
                      </div>
                      <div className="md:col-span-1 md:text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-border">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Amount</p>
                        <span className="font-mono font-black text-text-primary">
                          {(tx.amount / 1_000_000).toLocaleString()} <span className="text-[10px] text-accent font-bold">QUA</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="quantum-panel p-6 border border-border">
            <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-border">
              <Cpu className="w-4 h-4 text-accent" />
              Consensus Info
            </h3>

            <ul className="space-y-5 text-xs font-semibold">
              <li>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Block Proposer</p>
                <Link href={`/address/${block.proposer || 'GENESIS'}`} className="font-mono text-xs text-text-secondary hover:text-accent break-all transition-colors font-bold bg-surface-2 border border-border rounded-xl p-3 block hover:border-accent/30">
                  {block.proposer || 'GENESIS'}
                </Link>
              </li>
              <li>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Mined Timestamp</p>
                <div className="flex items-center gap-2 text-text-primary font-mono bg-surface border border-border rounded-xl p-3">
                  <Clock className="w-4 h-4 text-text-muted" />
                  {new Date(block.timestamp * 1000).toLocaleString()}
                </div>
              </li>
              <div className="grid grid-cols-2 gap-4">
                <li>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Epoch</p>
                  <span className="font-mono text-text-primary bg-surface-2 border border-border px-4 py-2.5 rounded-xl block text-center font-bold">
                    Epoch {block.epoch ?? 0}
                  </span>
                </li>
                <li>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">BFT Round</p>
                  <span className="font-mono text-text-primary bg-surface-2 border border-border px-4 py-2.5 rounded-xl block text-center font-bold">
                    Round {block.bft_round ?? 0}
                  </span>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

