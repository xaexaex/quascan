import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Block from '@/lib/models/Block';
import Transaction from '@/lib/models/Transaction';
import { fetchTx } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // Is it a numeric ID? (Block or Epoch)
    if (/^\d+$/.test(q)) {
      const height = parseInt(q, 10);
      const block = await Block.findOne({ index: height });
      if (block || height === 0) {
        return NextResponse.json({ type: 'block', redirect: `/block/${height}` });
      }
      
      const SESSION_LENGTH = 60;
      const totalBlocks = await Block.countDocuments();
      const totalSessions = Math.ceil(totalBlocks / SESSION_LENGTH);
      if (height < totalSessions) {
        const pageSize = 20;
        const targetPage = Math.floor((totalSessions - height - 1) / pageSize) + 1;
        return NextResponse.json({ type: 'epoch', redirect: `/epochs?page=${targetPage}` });
      }
    }

    // Is it a hash? (Tx or Block)
    if (/^(0x)?[0-9a-fA-F]{40,64}$/.test(q)) {
      const block = await Block.findOne({ hash: q });
      if (block) {
        return NextResponse.json({ type: 'block', redirect: `/block/${block.index}` });
      }

      const tx = await Transaction.findOne({ txHash: q });
      if (tx) {
        return NextResponse.json({ type: 'tx', redirect: `/tx/${q}` });
      }
      
      // Fallback to RPC node for mempool/unindexed txs
      try {
        const rpcTx = await fetchTx(q);
        if (rpcTx && rpcTx.transaction) {
          return NextResponse.json({ type: 'tx', redirect: `/tx/${q}` });
        }
      } catch (e) {
        // Ignore rpc error
      }
    }

    // Default assume address
    // Quanta addresses are usually 40 chars hex (or similar), we'll assume length >= 20.
    if (q.length >= 20) {
      // Check if it's a validator
      const validatorsRes = await fetch('http://127.0.0.1:3000/api/validators').then(r => r.json()).catch(() => null);
      if (validatorsRes?.validators?.some((v: any) => v.address === q)) {
        return NextResponse.json({ type: 'validator', redirect: `/validators/${q}` });
      }

      // Check if it's a contract
      const isContract = await Transaction.exists({ txType: 'ContractDeploy', txHash: q });
      if (isContract) {
        return NextResponse.json({ type: 'contract', redirect: `/contracts/${q}` });
      }

      return NextResponse.json({ type: 'address', redirect: `/address/${q}` });
    }

    return NextResponse.json({ type: 'unknown', message: 'Not found' }, { status: 404 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
