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
        difficulty: rpcBlock.bft_round || 1,
        nonce: rpcBlock.bft_round || 0,
        txCount: rpcBlock.transactions?.length || 0,
        miner: rpcBlock.proposer || 'GENESIS',
        transactions: rpcBlock.transactions || []
      };

      // Upsert block
      await Block.findOneAndUpdate(
        { index: rpcBlock.index },
        blockData,
        { upsert: true, new: true, runValidators: true }
      );

      // 2. Format and upsert each transaction in the block
      if (rpcBlock.transactions && rpcBlock.transactions.length > 0) {
        for (const tx of rpcBlock.transactions) {
          const txData = {
            txHash: tx.signature,
            blockHeight: rpcBlock.index,
            blockTime: rpcBlock.timestamp,
            sender: tx.sender,
            recipient: tx.recipient,
            amountMicrounits: tx.amount,
            feeMicrounits: tx.fee,
            signature: tx.signature,
            publicKey: tx.public_key,
            txType: tx.sender === 'COINBASE' ? 'coinbase' : 'transfer'
          };

          await Transaction.findOneAndUpdate(
            { txHash: tx.signature },
            txData,
            { upsert: true, new: true, runValidators: true }
          );
        }
      }
    }

    // 3. Update the indexer state with last indexed block
    if (maxIndex !== -1) {
      await IndexerState.findOneAndUpdate(
        { key: 'last_indexed_block' },
        { key: 'last_indexed_block', value: maxIndex },
        { upsert: true, new: true }
      );
    }

  } catch (error) {
    console.error('Failed to automatically sync blocks into MongoDB', error);
  } finally {
    isSyncing = false;
  }
}
