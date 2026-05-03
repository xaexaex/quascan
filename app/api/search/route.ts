import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Block from '@/lib/models/Block';
import Transaction from '@/lib/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // Is it a block height?
    if (/^\d+$/.test(q)) {
      const height = parseInt(q, 10);
      const block = await Block.findOne({ index: height });
      if (block) {
        return NextResponse.json({ type: 'block', redirect: `/block/${height}` });
      }
    }

    // Is it a hash? (64 chars hex)
    if (/^[0-9a-fA-F]{64}$/.test(q)) {
      const block = await Block.findOne({ hash: q });
      if (block) {
        return NextResponse.json({ type: 'block', redirect: `/block/${block.index}` });
      }

      const tx = await Transaction.findOne({ txHash: q });
      if (tx) {
        return NextResponse.json({ type: 'tx', redirect: `/tx/${q}` });
      }
    }

    // Default assume address
    if (q.length > 20) { // arbitrary basic check for address length
      return NextResponse.json({ type: 'address', redirect: `/address/${q}` });
    }

    return NextResponse.json({ type: 'unknown', message: 'Not found' }, { status: 404 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
