import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import IndexerState from '@/lib/models/IndexerState';
import { fetchStats } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const stats = await fetchStats();
    const chainHeight = stats ? stats.chain_length - 1 : 0;

    let state = await IndexerState.findOne({ key: 'last_indexed_block' });
    const lastIndexedBlock = state ? state.value : -1;

    const isSynced = lastIndexedBlock >= chainHeight;
    const blocksRemaining = Math.max(0, chainHeight - lastIndexedBlock);

    return NextResponse.json({
      lastIndexedBlock,
      chainHeight,
      isSynced,
      blocksRemaining
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
