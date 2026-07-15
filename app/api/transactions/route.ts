import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/lib/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    const type = searchParams.get('type');
    if (type && type !== 'All') {
      query.txType = type;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ blockHeight: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query)
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
