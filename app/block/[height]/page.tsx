import { Metadata } from 'next';
import { fetchBlock } from '@/lib/api';
import { Box, Hash, Clock, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ height: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Block #${p.height} | QuantaScan Explorer`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#00E599]/10 flex items-center justify-center text-[#00E599]">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-black flex items-center gap-3">
            Block <span className="text-gray-400 font-mono">#{block.index}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="sol-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Block Identifiers
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Block Hash</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-600 break-all select-all flex items-center gap-2">
                  {block.hash}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Previous Hash</p>
                <Link href={`/block/${block.index > 0 ? block.index - 1 : 0}`}>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-[#00E599] hover:bg-[#00E599]/5 transition-colors break-all flex items-center gap-2">
                    {block.previous_hash}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="sol-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transactions ({block.transactions.length})
            </h3>
            
            <div className="space-y-4">
              {block.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm bg-gray-50/50 rounded-xl">
                  No transactions in this block (Empty block).
                </div>
              ) : (
                block.transactions.map((tx, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-[#00E599]/30 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">From</p>
                        <Link href={`/address/${tx.sender}`} className="font-mono text-xs text-[#00E599] hover:text-emerald-500 break-all">
                          {tx.sender === '0' ? 'System (Coinbase)' : tx.sender}
                        </Link>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To</p>
                        <Link href={`/address/${tx.recipient}`} className="font-mono text-xs text-[#00E599] hover:text-emerald-500 break-all">
                          {tx.recipient}
                        </Link>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                        <span className="font-bold text-gray-900 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
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
          <div className="glass-card rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#00E599]" />
              Mining Info
            </h3>
            
            <ul className="space-y-4">
              <li>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Miner</p>
                <Link href={`/address/${miner}`} className="font-mono text-xs text-[#00E599] hover:underline break-all">
                  {miner}
                </Link>
              </li>
              <li>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Timestamp</p>
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(block.timestamp * 1000).toLocaleString()}
                </div>
              </li>
              <li>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Difficulty</p>
                <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                  {block.difficulty.toLocaleString()}
                </span>
              </li>
              <li>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nonce</p>
                <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
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
