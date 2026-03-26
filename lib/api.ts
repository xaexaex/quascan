export const RPC_URL = "https://rpc.quantachain.org";

export interface NetworkStats {
  chain_length: number;
  total_transactions: number;
  current_difficulty: number;
  mining_reward: number;
  total_supply: number;
  pending_transactions: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  previous_hash: string;
  hash: string;
  difficulty: number;
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  fee: number;
  nonce: number;
  signature: string;
  public_key: string;
}

export async function fetchStats(): Promise<NetworkStats | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/stats`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch stats", error);
    return null;
  }
}

export async function fetchBlock(height: number): Promise<Block | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/block/${height}`, {
      next: { revalidate: 60 }, // Blocks don't change, cache longer
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch block at ${height}`, error);
    return null;
  }
}

export async function fetchLatestBlocks(count: number = 10): Promise<Block[]> {
  const stats = await fetchStats();
  if (!stats) return [];
  
  const currentHeight = stats.chain_length;
  // If chain_length is 10, blocks are likely 0 to 9. Let's fetch from max(0, currentHeight - 1).
  const start = Math.max(0, currentHeight - 1);
  const end = Math.max(0, start - count + 1);

  const promises = [];
  for (let h = start; h >= end; h--) {
    promises.push(fetchBlock(h));
  }

  const results = await Promise.all(promises);
  return results.filter((b): b is Block => b !== null);
}

export async function fetchBalance(address: string): Promise<{ address: string, balance_microunits: number, nonce: number } | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch balance for ${address}`, error);
    return null;
  }
}
