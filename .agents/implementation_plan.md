# Implementation Plan: Sui-Functions MVP

## Goal
Build a decentralized serverless execution platform (Decentralized AWS Lambda) for the Sui Overflow 2026 Hackathon.

## Architecture Overview

### 1. Move Layer (On-chain)
- **Registry Module**: A central registry that maps unique Function IDs (or Walrus Blob IDs) to function metadata.
- **Trigger Module**: Emits events when a function is called, which the off-chain Runner Layer listens to.
- **Access Control**: Initial version will use simple owner-based or capability-based execution.

### 2. Storage Layer (Walrus)
- **JS Snippets**: Functions are stored as JavaScript snippets on Walrus.
- **Integration**: Move contracts will store the `blob_id` of the snippet.

### 3. Runner Layer (Off-chain)
- **Listener**: Node.js service using Sui SDK to listen for `FunctionCall` events.
- **Fetcher**: Downloads the JS snippet from Walrus using the `blob_id`.
- **Sandbox**: Executes the code in a secure environment (Isolates/VM).
- **Callback (Optional for MVP)**: Updates function execution status on-chain.

## Phases

### Phase 1: Move Foundation (Current)
- [x] Initialize Sui Move package.
- [ ] Draft `sources/trigger.move` for event emission.
- [ ] Draft `sources/registry.move` for linking functions to Walrus IDs.
- [ ] Gas optimization and security audit readiness.

### Phase 2: Storage Integration
- [x] Setup Walrus CLI integration scripts.
- [x] Create scripts to upload JS snippets and capture `blob_id`.
- [x] Create sample JS functions.

### Phase 3: Runner Implementation
- [ ] Build Node.js event listener.
- [ ] Implement Walrus fetcher.
- [ ] Implement secure JS execution sandbox.

### Phase 4: Integration & Testing
- [ ] End-to-end testing: Trigger on Sui -> Execute on Runner -> Result.
- [ ] Testnet deployment.

## Technical Stack
- **Smart Contracts**: Sui Move
- **Storage**: Walrus
- **Runner**: Node.js + `isolated-vm` or `workerd`
- **Network**: Sui Testnet
