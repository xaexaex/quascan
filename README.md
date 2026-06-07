# QuaScan Explorer

QuaScan is the official, high-performance block explorer for the **Quanta** post-quantum blockchain ecosystem. Built with Next.js, Tailwind CSS, and MongoDB, it provides a real-time, aesthetically rich interface for navigating blocks, transactions, and post-quantum cryptographic primitives on the Quanta network.

## Features

- **Real-Time Network Dashboard:** Live tracking of chain height, network hashrate, total supply, mining difficulty, and mempool status.
- **Deep Block Inspection:** View detailed metadata for individual blocks, including timestamps, nonces, and the exact miner responsible for the block.
- **Transaction and Signature Explorer:** Track transactions from mempool to confirmation. View full cryptographic details including raw **Falcon-512** public keys and post-quantum signatures.
- **Advanced Wallet Lookups:** Search for any Quanta address to view available balances, locked balances (coinbase maturity and vesting), and complete transaction history.
- **Idempotent Data Sync:** Powered by the backend indexer daemon, which continually synchronizes the Quanta node RPC state directly into a high-speed MongoDB instance.

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend and API:** Next.js API Routes, Mongoose
- **Data Source:** MongoDB (populated continuously via the Rust-based indexer)

## Architecture Note

QuaScan does **not** fetch block data directly from the blockchain RPC in real-time. To ensure lightning-fast page loads and mitigate node DDoS vectors, QuaScan reads purely from its MongoDB instance. 

You **must** have the indexer daemon running in the background to continuously pull blocks from the node RPC and push them into MongoDB.
