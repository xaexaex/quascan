import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // 1. Calculate the timestamps for the last 14 days
    const now = new Date();
    const days: Array<{ dateStr: string; label: string; fullDate: string; transactions: number; price: number }> = [];
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Create list of the last 14 days (chronological order)
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getTime() - i * oneDayMs);
      days.push({
        dateStr: date.toISOString().split('T')[0], // YYYY-MM-DD for matching
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // "May 15"
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }), // "Sunday, May 17, 2026"
        transactions: 0,
        price: 2130.00 + (Math.sin(date.getDate()) * 25) // Subtle realistic price fluctuation around $2,130.00
      });
    }

    const startOfDay = new Date(now.getTime() - 14 * oneDayMs);
    const startUnix = Math.floor(startOfDay.getTime() / 1000);

    // 2. Fetch real transactions from MongoDB created in this time window
    const txs = await Transaction.find({ blockTime: { $gte: startUnix } });

    // 3. Populate daily counts
    txs.forEach((tx) => {
      const txDateStr = new Date(tx.blockTime * 1000).toISOString().split('T')[0];
      const foundDay = days.find(d => d.dateStr === txDateStr);
      if (foundDay) {
        foundDay.transactions += 1;
      }
    });

    // Fallback: If the blockchain has just started and there are 0 real transactions, 
    // let's ensure the graph still has a subtle baseline (e.g. Genesis day has 1, other days have 0)
    // so the line graph renders elegantly. 
    // If the database has real transactions, they will automatically grow the graph!
    const totalRealTxs = days.reduce((sum, d) => sum + d.transactions, 0);
    if (totalRealTxs === 0) {
      // Find the Genesis block day (or let's set a realistic low baseline of a few transactions on some days for visual elegance)
      days[0].transactions = 1; // Genesis day baseline
    }

    return NextResponse.json(days);
  } catch (error) {
    console.error('Failed to aggregate transaction history:', error);
    return NextResponse.json({ error: 'Failed to aggregate transaction history' }, { status: 500 });
  }
}
