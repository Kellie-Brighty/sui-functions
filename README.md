# 🚀 Sui-Functions

**Decentralized, unstoppable serverless execution for the Sui ecosystem.**

Sui-Functions is a high-performance execution engine that allows developers to deploy and run code in a completely trustless, decentralized manner. By combining the security of the **Sui Blockchain** with the scalability of **Walrus Storage**, Sui-Functions provides a "Serverless" experience that is censorship-resistant, permanent, and maintenance-free.

---

## 🏛️ Architecture

The system operates on three primary pillars:

1.  **The Trigger (Sui Blockchain)**: A Move-based registry and execution module. When a function is called on-chain, it emits an event that signals the network to execute the logic.
2.  **The Library (Walrus Storage)**: Function code is stored as Blobs on the Walrus decentralized storage network. This ensures the logic is permanent and cannot be altered or deleted by any central authority.
3.  **The Worker (Runner Engine)**: A secure, isolated execution environment (built with `isolated-vm`) that listens for Sui events, fetches the code from Walrus, and executes it in real-time.

---

## ✨ Key Features

-   **🔒 Unstoppable**: No single point of failure. Your code lives on a decentralized network, making it immune to censorship or cloud provider outages.
-   **⚡ Low Cost**: Eliminate traditional server overhead. Pay only for the compute cycles used via Sui's efficient gas model.
-   **🛠️ Zero Maintenance**: No patching, no scaling, no infrastructure management. Just deploy your logic and it's ready for the world.
-   **🛡️ Secure Sandboxing**: All functions run in a strictly isolated environment with dedicated memory and CPU limits.

---

## 📂 Project Structure

```text
├── sources/            # Sui Move smart contracts
├── runner/             # Node.js execution engine (isolated-vm)
├── website/            # React + TS + Tailwind + AntD Landing Page
├── functions/          # Sample JS functions to be deployed
└── scripts/            # Utility scripts for Walrus uploads
```

---

## 🚀 Getting Started

### 1. Smart Contract Deployment
Deploy the Move package to Sui Testnet/Mainnet:
```bash
sui client publish --gas-budget 100000000
```

### 2. Runner Configuration
Navigate to the `runner` directory, install dependencies, and configure your `.env`:
```bash
cd runner
npm install
cp .env.example .env # Add your PACKAGE_ID and REGISTRY_ID
npm run listen
```

### 3. Website Development
Launch the landing page locally:
```bash
cd website
npm install
npm run dev
```

---

## 🛠️ Usage Flow

1.  **Register a Function**: Upload your JS code to Walrus and link the resulting Blob ID to a function name in the Sui Registry.
2.  **Trigger Execution**: Call the `call_function` method on the Sui contract.
3.  **Observe Results**: The Runner will detect the event, fetch the code, and execute it instantly.

---

## 🏆 Hackathon Details
Built for the **Sui Overflow 2026 Hackathon**. 

**Vision**: To provide a truly decentralized alternative to AWS Lambda, enabling a new generation of "living" applications that operate entirely on-chain and in decentralized storage.

---

## 📄 License
MIT
