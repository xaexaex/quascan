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
  if (diff < 60) return <>{diff < 0 ? 0 : diff}s ago</>;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24 transition-colors duration-300">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6 relative">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-sm">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary font-sans uppercase">Blocks</h1>
          <p className="text-text-secondary text-xs font-semibold mt-1">Showing blocks from #{startHeight} to #{endHeight}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="quantum-panel overflow-hidden border border-border mb-8">
        <div className="overflow-x-auto bg-transparent">
          <table className="w-full text-left whitespace-nowrap font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">Age</th>
                <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">Transactions</th>
                <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">Proposer</th>
                <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">Epoch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {blocks.map((block) => {
                const proposer = block.proposer || 'GENESIS';
                return (
                  <tr key={block.index} className="hover:bg-surface-2/30 transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/block/${block.index}`} className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-surface border border-border flex items-center justify-center text-text-primary font-mono text-xs group-hover:border-accent/30 group-hover:text-accent transition-colors font-bold shadow-sm">
                          #{block.index}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-xs text-text-secondary font-semibold group-hover:text-text-primary transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                        <TimeAgo timestamp={block.timestamp} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold">
                      <span className="px-3 py-1.5 bg-surface border border-border text-text-secondary rounded-full text-[10px] font-bold group-hover:border-accent/30 group-hover:text-accent transition-colors">
                        {block.transactions?.length ?? 0} txns
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors">
                      <Link href={`/address/${proposer}`}>
                        {proposer.length > 20 ? `${proposer.substring(0, 16)}...` : proposer}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-text-muted group-hover:text-text-secondary transition-colors font-mono">
                      EPOCH {block.epoch ?? 0}
                    </td>
                  </tr>
                );
              })}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted font-bold text-xs uppercase tracking-widest">
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
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${page > 1 ? 'bg-surface border-border text-text-primary hover:bg-surface-2 hover:text-accent' : 'bg-transparent border-border text-text-muted cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-bold text-text-secondary">
            Page <span className="text-text-primary font-black">{page}</span> of <span className="text-text-primary font-black">{Math.max(1, totalPages)}</span>
          </span>
          <Link
            href={page < totalPages ? `/blocks?page=${page + 1}` : '#'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${page < totalPages ? 'bg-surface border-border text-text-primary hover:bg-surface-2 hover:text-accent' : 'bg-transparent border-border text-text-muted cursor-not-allowed'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

