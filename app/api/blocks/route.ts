import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Block from '@/lib/models/Block';
import { syncBlocks } from '@/lib/sync';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Auto-sync in the background
    syncBlocks().catch(console.error);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    if (page < 1) return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
    if (limit < 1 || limit > 100) return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });

    const skip = (page - 1) * limit;

    const blocks = await Block.find({})
      .sort({ index: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBlocks = await Block.countDocuments();
    const totalPages = Math.ceil(totalBlocks / limit);

    return NextResponse.json({
      blocks,
      pagination: {
        page,
        limit,
        totalBlocks,
        totalPages
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
