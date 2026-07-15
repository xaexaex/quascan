import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BlockModel from '@/lib/models/Block';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // A session is every 60 blocks. We can find blocks where index % 60 == 0
    const [blocks, total] = await Promise.all([
      BlockModel.find({ index: { $mod: [60, 0] } })
        .sort({ index: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlockModel.countDocuments({ index: { $mod: [60, 0] } })
    ]);

    return NextResponse.json({
      sessions: blocks.map((b: any) => ({
        session: Math.floor(b.index / 60),
        startBlock: b.index,
        timestamp: b.timestamp,
        proposer: b.proposer
      })),
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching epochs:', error);
    return NextResponse.json({ error: 'Failed to fetch epochs' }, { status: 500 });
  }
}
