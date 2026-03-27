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

export const revalidate = 60; // Blocks don't change often

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00E599] flex-shrink-0 mt-1 shadow-lg">
          <Box className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#e2e8f0] flex items-center gap-3">
            Block <span className="text-[#00E599] font-mono">#{block.index}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="dark-card p-6">
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Block Identifiers
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Block Hash</p>
                <div className="bg-[#0b0e14] border border-[#1f2937] rounded p-3 font-mono text-sm text-gray-300 break-all select-all flex items-center gap-2">
                  {block.hash}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Previous Hash</p>
                <Link href={`/block/${block.index > 0 ? block.index - 1 : 0}`}>
                  <div className="bg-[#0b0e14] border border-[#1f2937] rounded p-3 font-mono text-sm text-[#00E599] hover:bg-[#00E599]/10 transition-colors break-all flex items-center gap-2">
                    {block.previous_hash}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="dark-card p-6">
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transactions ({block.transactions.length})
            </h3>
            
            <div className="space-y-4">
              {block.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-mono text-[10px] uppercase tracking-widest bg-[#0b0e14] border border-[#1f2937] rounded">
                  No transactions in this block (Empty block).
                </div>
              ) : (
                block.transactions.map((tx, idx) => (
                  <div key={idx} className="bg-[#0b0e14] rounded p-5 border border-[#1f2937] hover:border-[#00E599]/50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">From</p>
                        <Link href={`/address/${tx.sender}`} className="font-mono text-sm text-[#00E599] hover:text-[#00f0ff] break-all transition-colors">
                          {tx.sender === 'COINBASE' ? 'System (Coinbase)' : tx.sender}
                        </Link>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">To</p>
                        <Link href={`/address/${tx.recipient}`} className="font-mono text-sm text-[#00E599] hover:text-[#00f0ff] break-all transition-colors">
                          {tx.recipient}
                        </Link>
                      </div>
                      <div className="md:col-span-1 md:text-right">
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Amount</p>
                        <span className="font-mono font-bold text-[#00E599] bg-[#00E599]/10 border border-[#00E599]/30 px-2 py-1 rounded text-xs inline-block">
                          {(tx.amount / 1_000_000).toLocaleString()} QUA
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
          <div className="dark-card rounded p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#00E599]" />
              Mining Info
            </h3>
            
            <ul className="space-y-6">
              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Miner</p>
                <Link href={`/address/${miner}`} className="font-mono text-sm text-[#00E599] hover:text-[#00f0ff] break-all transition-colors">
                  {miner}
                </Link>
              </li>
              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Timestamp</p>
                <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {new Date(block.timestamp * 1000).toLocaleString()}
                </div>
              </li>
              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Difficulty</p>
                <span className="font-mono text-sm text-[#e2e8f0] bg-[#0b0e14] border border-[#1f2937] px-3 py-1.5 rounded inline-block">
                  {block.difficulty.toLocaleString()}
                </span>
              </li>
              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Nonce</p>
                <span className="font-mono text-sm text-[#e2e8f0] bg-[#0b0e14] border border-[#1f2937] px-3 py-1.5 rounded inline-block">
                  {block.nonce}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
