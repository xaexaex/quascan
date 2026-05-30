import { Metadata } from 'next';
import { fetchBlock } from '@/lib/api';
import { Box, Hash, Clock, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

  const miner = block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient || 'Unknown';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-10 relative">
        <div className="absolute -left-10 top-0 w-32 h-32 bg-[#00E599]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599] flex-shrink-0 shadow-[0_0_15px_rgba(0,229,153,0.15)] relative z-10">
          <Box className="w-7 h-7" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 font-sans">
            Block <span className="text-[#00E599] font-mono">#{block.index}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Block Identifiers */}
          <div className="quantum-panel p-8">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Block Identifiers
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Block Hash</p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 break-all select-all hover:bg-white/10 hover:text-white transition-colors">
                  {block.hash}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Previous Hash</p>
                <Link href={`/block/${block.index > 0 ? block.index - 1 : 0}`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 hover:bg-white/10 hover:text-[#00E599] hover:border-[#00E599]/30 transition-colors break-all">
                    {block.previous_hash}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="quantum-panel p-8">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transactions <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-xs">{block.transactions.length}</span>
            </h3>

            <div className="space-y-4">
              {block.transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium text-xs uppercase tracking-widest bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                  No transactions in this block (Empty block).
                </div>
              ) : (
                block.transactions.map((tx, idx) => (
                  <div key={idx} className="bg-white/[0.02] rounded-xl p-6 border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.04]">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">From</p>
                        <Link href={`/address/${tx.sender}`} className="font-mono text-sm text-gray-400 hover:text-white break-all transition-colors font-medium">
                          {tx.sender === 'COINBASE' ? 'System (Coinbase)' : tx.sender}
                        </Link>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">To</p>
                        <Link href={`/address/${tx.recipient}`} className="font-mono text-sm text-gray-400 hover:text-white break-all transition-colors font-medium">
                          {tx.recipient}
                        </Link>
                      </div>
                      <div className="md:col-span-1 md:text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Amount</p>
                        <span className="font-mono font-bold text-white group-hover:text-[#00E599] transition-colors">
                          {(tx.amount / 1_000_000).toLocaleString()} <span className="text-xs text-[#00E599]">QUA</span>
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
          <div className="quantum-panel p-8">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Cpu className="w-5 h-5 text-[#00E599]" />
              Consensus Info
            </h3>

            <ul className="space-y-6">
              <li>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Proposer</p>
                <Link href={`/address/${block.proposer || 'GENESIS'}`} className="font-mono text-sm text-gray-300 hover:text-[#00E599] break-all transition-colors font-medium bg-white/5 border border-white/10 rounded-xl p-3 block hover:bg-white/10 hover:border-[#00E599]/30">
                  {block.proposer || 'GENESIS'}
                </Link>
              </li>
              <li>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Timestamp</p>
                <div className="flex items-center gap-2 text-sm text-gray-300 font-mono bg-white/5 border border-white/10 rounded-xl p-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {new Date(block.timestamp * 1000).toLocaleString()}
                </div>
              </li>
              <div className="grid grid-cols-2 gap-4">
                <li>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Epoch</p>
                  <span className="font-mono text-sm text-white bg-white/5 border border-white/10 px-4 py-3 rounded-xl block text-center font-bold">
                    {block.epoch ?? 0}
                  </span>
                </li>
                <li>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">BFT Round</p>
                  <span className="font-mono text-sm text-white bg-white/5 border border-white/10 px-4 py-3 rounded-xl block text-center font-bold">
                    {block.bft_round ?? 0}
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
