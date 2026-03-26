import { Metadata } from 'next';
import { fetchStats, fetchBlock, Block } from '@/lib/api';
import { Box, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blocks | QuantaScan Explorer',
  description: 'View all blocks on the Quanta network.',
};

export const revalidate = 10;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const pageStr = typeof params.page === 'string' ? params.page : '1';
  let page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 20;

  const stats = await fetchStats();
  const currentHeight = stats ? stats.chain_length : 0;
  
  const totalPages = Math.ceil(currentHeight / pageSize);
  if (page > totalPages && totalPages > 0) page = totalPages;

  const startHeight = Math.max(0, currentHeight - 1 - (page - 1) * pageSize);
  const endHeight = Math.max(0, startHeight - pageSize + 1);

  const blockPromises = [];
  for (let i = startHeight; i >= endHeight; i--) {
    if (i >= 0) {
      blockPromises.push(fetchBlock(i));
    }
  }

  const blocksUnfiltered = await Promise.all(blockPromises);
  const blocks = blocksUnfiltered.filter((b): b is Block => b !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#00E599]/10 flex items-center justify-center text-[#00E599]">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-black">Blocks</h1>
          <p className="text-gray-500 text-sm">Showing blocks from #{startHeight} to #{endHeight}</p>
        </div>
      </div>

      <div className="sol-card overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Height</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Transactions</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Miner</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blocks.map((block) => {
                const miner = block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient || 'Unknown';
                return (
                <tr key={block.index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={`/block/${block.index}`} className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-mono text-sm font-bold">
                        #{block.index}
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <TimeAgo timestamp={block.timestamp} />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">
                    <span className="px-2 py-1 bg-[#00E599]/10 text-emerald-800 rounded-md">
                      {block.transactions.length} txns
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs">
                    <Link href={`/address/${miner}`} className="text-[#00E599] hover:underline hover:text-emerald-500 transition-colors">
                      {miner.length > 16 ? `${miner.substring(0, 16)}...` : miner}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                    {block.difficulty.toLocaleString()}
                  </td>
                </tr>
              )})}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    No blocks found on this page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={page > 1 ? `/blocks?page=${page - 1}` : '#'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${page > 1 ? 'bg-gray-100 text-gray-900 hover:bg-[#00E599] hover:text-black font-bold' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-bold text-gray-600">
            Page {page} of {Math.max(1, totalPages)}
          </span>
          <Link
            href={page < totalPages ? `/blocks?page=${page + 1}` : '#'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${page < totalPages ? 'bg-gray-100 text-gray-900 hover:bg-[#00E599] hover:text-black font-bold' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
