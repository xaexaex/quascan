import { Metadata } from 'next';
import { fetchStats, fetchLatestBlocks } from '@/lib/api';
import { Activity, Box, Pickaxe, Coins, Clock, Database, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'QuantaScan | Quantum-Resistant Blockchain Explorer',
  description: 'Real-time blockchain explorer for the Quanta network.',
};

export const revalidate = 10;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff}s</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h</>;
  return <>{Math.floor(diff / 86400)}d</>;
}

export default async function Home() {
  const [stats, latestBlocks] = await Promise.all([
    fetchStats(),
    fetchLatestBlocks(15) 
  ]);

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-12">
      
      {/* Top Title & Network Status Banner */}
      <div className="bg-white border-b border-gray-200 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-[#00E599]" />
              Network Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Real-time statistics for the Quanta Mainnet.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 self-start md:self-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E599]"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Mainnet Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Stat Box 1 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chain Height</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                <Box className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
              {stats?.chain_length.toLocaleString() || '---'}
            </div>
          </div>

          {/* Stat Box 2 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
              {stats?.current_difficulty.toLocaleString() || '---'}
            </div>
          </div>

          {/* Stat Box 3 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mempool Txs</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                <Pickaxe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight flex items-baseline gap-1">
              {stats?.pending_transactions.toLocaleString() || '0'}
            </div>
          </div>

          {/* Stat Box 4 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Supply</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
              {stats ? `${(stats.total_supply / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '---'}
            </div>
          </div>

        </div>

        {/* Latest Blocks Table Panel */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              Recent Blocks
            </h2>
            <Link 
              href="/blocks" 
              className="text-xs font-bold text-[#00E599] hover:text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Block</th>
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Relayed Age</th>
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Txs</th>
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Miner</th>
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestBlocks.map((block) => {
                  const miner = block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient || 'Unknown';
                  return (
                    <tr key={block.index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <Link href={`/block/${block.index}`} className="font-mono text-sm font-bold text-[#00E599] hover:text-emerald-600 transition-colors mr-2">
                          {block.index}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-sm text-gray-700 font-medium">
                           <TimeAgo timestamp={block.timestamp} /> ago
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5" title={new Date(block.timestamp * 1000).toISOString()}>
                          {new Date(block.timestamp * 1000).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex px-2.5 py-1 bg-gray-100/80 text-gray-700 rounded-md text-xs font-bold border border-gray-200/60">
                          {block.transactions.length}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <Link href={`/address/${miner}`} className="font-mono text-sm text-gray-600 hover:text-[#00E599] hover:underline transition-colors">
                          {miner.length > 20 ? `${miner.substring(0, 10)}...${miner.substring(miner.length - 8)}` : miner}
                        </Link>
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-sm text-gray-600">
                        {block.difficulty.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {latestBlocks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="inline-flex flex-col flex-wrap items-center justify-center">
                        <Clock className="w-8 h-8 text-gray-300 mb-3" />
                        <span className="text-gray-500 text-sm font-medium">No block data available from the RPC node.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
