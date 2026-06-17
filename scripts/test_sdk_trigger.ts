import { SuiFunctions } from '../sdk/src/index';
import * as paillierBigint from 'paillier-bigint';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config();

const PACKAGE_ID = "0x41442ae1e170a68f3486ce0fd4fb03a2a48f4c69ee61cd5e8a563311aaaa3a95";
const REGISTRY_ID = "0x48fc4208313f2fe1fce5df5a36af0cac209ca40db9855f7bb712cf2e95060ec1";

// To run this test, replace with your actual project ID after creating one on the dashboard
const PROJECT_ID = "0x497349a23a846f2ee33101b0ca629e38104292f483a8220e6abf0a7111f244d7"; 

async function main() {
    console.log("=== 1. Client Setup ===");
    
    // In a real app, the Node Operator's public key is fetched from the registry.
    // For this test, we generate a mock keypair to simulate the Operator's keys.
    const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(512);
    const pubKeyStr = JSON.stringify({ n: publicKey.n.toString(), g: publicKey.g.toString() });

    console.log("=== 2. Encrypting Data with @sui-functions/sdk ===");
    const rawPayload = {
        valA: 50,
        valB: 75,
        secretApiKey: "sk_live_1234567890" // This string will be converted to a Honey-Token by the IDS
    };

    console.log("Original Payload:", rawPayload);

    // Use the SDK to blind the numbers
    const encryptedPayload = await SuiFunctions.encryptPayload(rawPayload, pubKeyStr);
    
    // Attach the public key so the Sandbox can use it for math
    encryptedPayload.pubKey = { n: publicKey.n.toString(), g: publicKey.g.toString() };

    console.log("\nBlinded Payload (Ready for Blockchain):");
    console.log(encryptedPayload);

    console.log("\n=== 3. Triggering Smart Contract ===");
    
    // Load local client wallet
    const configDir = path.join(os.homedir(), '.sui-functions');
    const keyPath = path.join(configDir, 'operator.json');
    let keypair: any;
    
    const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');
    const { decodeSuiPrivateKey } = await import('@mysten/sui/cryptography');
    
    if (fs.existsSync(keyPath)) {
        const data = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        const parsed = decodeSuiPrivateKey(data.secretKey);
        keypair = Ed25519Keypair.fromSecretKey(parsed.secretKey);
    } else {
        console.error("Local wallet not found. Please create one.");
        return;
    }

    const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${PACKAGE_ID}::trigger::call_function`,
        arguments: [
            tx.object(PROJECT_ID),
            tx.pure("secure_math"),
            tx.pure(JSON.stringify(encryptedPayload)),
            tx.object(REGISTRY_ID),
            tx.object('0x6') // SUI Clock
        ]
    });

    console.log("Submitting transaction to Sui...");
    
    
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
        options: { showEffects: true }
    });
    
    console.log("Tx Digest:", result.digest);
}

main().catch(console.error);
