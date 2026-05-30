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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6 relative">
        <div className="absolute -left-10 top-0 w-32 h-32 bg-[#00E599]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599] relative z-10 shadow-[0_0_15px_rgba(0,229,153,0.15)]">
          <Box className="w-7 h-7" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-white font-sans">Blocks</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Showing blocks from #{startHeight} to #{endHeight}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="quantum-panel overflow-hidden mb-8">
        <div className="overflow-x-auto bg-transparent">
          <table className="w-full text-left whitespace-nowrap font-mono">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Age</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transactions</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Proposer</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Epoch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blocks.map((block) => {
                const proposer = block.proposer || 'GENESIS';
                return (
                  <tr key={block.index} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/block/${block.index}`} className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white font-mono text-sm group-hover:border-[#00E599]/30 group-hover:text-[#00E599] transition-colors font-bold shadow-sm">
                          #{block.index}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500 group-hover:text-[#00E599] transition-colors" />
                        <TimeAgo timestamp={block.timestamp} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold">
                      <span className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-full border border-white/5 text-xs font-bold group-hover:border-[#00E599]/30 group-hover:text-[#00E599] transition-colors">
                        {block.transactions.length} txns
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm font-medium text-gray-400 group-hover:text-[#00E599] transition-colors">
                      <Link href={`/address/${proposer}`}>
                        {proposer.length > 16 ? `${proposer.substring(0, 16)}...` : proposer}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-500 group-hover:text-gray-300 transition-colors font-mono">
                      {block.epoch ?? 0}
                    </td>
                  </tr>
                );
              })}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium text-xs uppercase tracking-widest">
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
        <div className="flex items-center justify-center gap-6">
          <Link
            href={page > 1 ? `/blocks?page=${page - 1}` : '#'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page > 1 ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#00E599]' : 'bg-transparent border border-white/5 text-gray-700 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-gray-400">
            Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{Math.max(1, totalPages)}</span>
          </span>
          <Link
            href={page < totalPages ? `/blocks?page=${page + 1}` : '#'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page < totalPages ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#00E599]' : 'bg-transparent border border-white/5 text-gray-700 cursor-not-allowed'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
