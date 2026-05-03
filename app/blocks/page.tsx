import { Metadata } from 'next';
import { Box, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import dbConnect from '@/lib/db';
import BlockModel from '@/lib/models/Block';

export const metadata: Metadata = {
  title: 'Blocks | QuaScan Explorer',
  description: 'View all blocks on the Quanta network.',
};

export const revalidate = 0;

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

  await dbConnect();
  const totalBlocks = await BlockModel.countDocuments();
  const totalPages = Math.ceil(totalBlocks / pageSize);
  
  if (page > totalPages && totalPages > 0) page = totalPages;

  const skip = Math.max(0, (page - 1) * pageSize);
  const blocks = await BlockModel.find({})
    .sort({ index: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean() as any[];

  const startHeight = blocks.length > 0 ? blocks[0].index : 0;
  const endHeight = blocks.length > 0 ? blocks[blocks.length - 1].index : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] shadow-sm">
          <Box className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black">Blocks</h1>
          <p className="text-gray-500 text-xs font-mono mt-1">Showing blocks from #{startHeight} to #{endHeight}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap font-mono">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Age</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transactions</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Miner</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blocks.map((block) => {
                const miner = block.miner || (block.transactions?.find((tx: any) => tx.sender === 'COINBASE')?.recipient) || 'Unknown';
                return (
                  <tr key={block.index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`/block/${block.index}`} className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-black font-mono text-sm hover:border-[#00E599] hover:bg-[#00E599]/20 transition-colors font-bold">
                          #{block.index}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <TimeAgo timestamp={block.timestamp} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-black">
                      <span className="px-3 py-1.5 bg-[#00E599]/10 text-teal-700 border border-[#00E599]/20 rounded-full text-xs font-bold">
                        {block.transactions.length} txns
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm">
                      <Link href={`/address/${miner}`} className="text-[#00E599] hover:underline hover:text-teal-600 transition-colors font-medium">
                        {miner.length > 16 ? `${miner.substring(0, 16)}...` : miner}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-mono">
                      {block.difficulty.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">
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
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${page > 1 ? 'border-gray-200 bg-white text-gray-700 hover:border-[#00E599] hover:text-[#00E599] shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-mono text-gray-500">
            Page <span className="text-black font-bold">{page}</span> of <span className="text-[#00E599] font-bold">{Math.max(1, totalPages)}</span>
          </span>
          <Link
            href={page < totalPages ? `/blocks?page=${page + 1}` : '#'}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${page < totalPages ? 'border-gray-200 bg-white text-gray-700 hover:border-[#00E599] hover:text-[#00E599] shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
