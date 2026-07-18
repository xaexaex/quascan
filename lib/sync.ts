import dbConnect from './db';
import Block from './models/Block';
import Transaction from './models/Transaction';
import IndexerState from './models/IndexerState';
import { fetchLatestBlocks, Block as RPCBlock } from './api';

let isSyncing = false;

export async function syncBlocks() {
  if (isSyncing) {
    return;
  }

  isSyncing = true;
  try {
    await dbConnect();

    // Fetch latest blocks from the RPC endpoint
    const rpcBlocks = await fetchLatestBlocks(50);
    if (!rpcBlocks || rpcBlocks.length === 0) {
      isSyncing = false;
      return;
    }

    let maxIndex = -1;

    for (const rpcBlock of rpcBlocks) {
      if (rpcBlock.index > maxIndex) {
        maxIndex = rpcBlock.index;
      }

      // 1. Format block for MongoDB model
      const blockData = {
        index: rpcBlock.index,
        hash: rpcBlock.hash,
        previousHash: rpcBlock.previous_hash,
        timestamp: rpcBlock.timestamp,
        epoch: rpcBlock.epoch || 0,
        bftRound: rpcBlock.bft_round || 0,
        txCount: rpcBlock.transactions?.length || 0,
        proposer: rpcBlock.proposer || 'GENESIS',
        transactions: rpcBlock.transactions || []
      };

      // Upsert block
      await Block.findOneAndUpdate(
        { index: rpcBlock.index },
        blockData,
        { upsert: true, returnDocument: 'after', runValidators: true }
      );

      // 2. Format and upsert each transaction in the block
      if (rpcBlock.transactions && rpcBlock.transactions.length > 0) {
        for (const tx of rpcBlock.transactions) {
          const txPayload = (tx as any).V2_Falcon512 || (tx as any).V1_Ed25519 || tx;

          const txData = {
            txHash: txPayload.tx_hash || (Array.isArray(txPayload.signature) ? Buffer.from(txPayload.signature).toString('hex') : (txPayload.signature || '')),
            blockHeight: rpcBlock.index,
            blockTime: rpcBlock.timestamp,
            sender: txPayload.sender || '',
            recipient: txPayload.recipient || txPayload.receiver || '',
            amountMicrounits: txPayload.amount || 0,
            feeMicrounits: txPayload.fee || 0,
            signature: Array.isArray(txPayload.signature) ? Buffer.from(txPayload.signature).toString('hex') : (txPayload.signature || ''),
            publicKey: Array.isArray(txPayload.public_key) ? Buffer.from(txPayload.public_key).toString('hex') : (txPayload.public_key || ''),
            txType: txPayload.sender === 'COINBASE' ? 'coinbase' : 'transfer'
          };

          const hashKey = txData.txHash;
          if (!hashKey) continue;

          await Transaction.findOneAndUpdate(
            { txHash: hashKey },
            txData,
            { upsert: true, returnDocument: 'after', runValidators: true }
          );
        }
      }
    }

    // 3. Update the indexer state with last indexed block
    if (maxIndex !== -1) {
      await IndexerState.findOneAndUpdate(
        { key: 'last_indexed_block' },
        { key: 'last_indexed_block', value: maxIndex },
        { upsert: true, returnDocument: 'after' }
      );
    }

  } catch (error) {
    console.error('Failed to automatically sync blocks into MongoDB', error);
  } finally {
    isSyncing = false;
  }
}
