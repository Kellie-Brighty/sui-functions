import * as dotenv from 'dotenv';
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { fetchFunctionCode } from './aggregator.js';
import { executeInSandbox } from './vm_manager.js';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

dotenv.config();

// Initialize the client for Testnet
const client = new SuiJsonRpcClient({ 
    url: getJsonRpcFullnodeUrl('testnet'),
    network: 'testnet'
});

// Load operator private key
const secretKey = process.env.ADMIN_SECRET_KEY;
const keypair = secretKey ? Ed25519Keypair.fromSecretKey(secretKey) : null;

/**
 * Polls for ExecutionTriggered events from the specified package.
 * @param packageId The ID of the deployed Move package.
 */
export async function startPolling(packageId: string) {
    console.log(`Starting Sui-Functions Polling Listener for package: ${packageId}...`);
    
    let cursor: any = null;
    let isPolling = false;

    // Recursive timeout polling to prevent race conditions
    async function poll() {
        if (isPolling) return;
        isPolling = true;
        
        try {
            // Query for events from the package
            const result = await client.queryEvents({
                query: { 
                    MoveModule: { 
                        package: packageId, 
                        module: 'trigger' 
                    } 
                },
                cursor: cursor,
                order: 'ascending',
            });

            if (result.data.length > 0) {
                // Capture nextCursor immediately to advance polling state
                const nextCursor = result.nextCursor;

                for (const event of result.data) {
                    console.log("\n--- New Execution Triggered ---");
                    
                    const { walrus_blob_id, function_name, caller } = event.parsedJson as any;

                    if (walrus_blob_id) {
                        try {
                            console.log(`Triggering function: ${function_name} (Blob: ${walrus_blob_id})`);
                            console.log(`Caller: ${caller}`);
                            
                            // 1. Fetch code from Walrus
                            const code = await fetchFunctionCode(walrus_blob_id);
                            
                            // 2. Execute in Sandbox
                            console.log("Executing in sandbox...");
                            const executionResult = await executeInSandbox(code);
                            
                            console.log("Execution Result:", executionResult);

                            // 3. Submit result back to Sui
                            if (keypair) {
                                console.log(`Submitting result back to Sui...`);
                                const tx = new Transaction();
                                const registryId = process.env.REGISTRY_ID || "0x0";
                                const packageId = process.env.PACKAGE_ID || "0x0";
                                
                                tx.moveCall({
                                    target: `${packageId}::trigger::submit_result`,
                                    arguments: [
                                        tx.object(registryId),
                                        tx.pure.string(function_name),
                                        tx.pure.string(JSON.stringify(executionResult) ?? "null")
                                    ]
                                });

                                const writeResult = await client.signAndExecuteTransaction({
                                    signer: keypair,
                                    transaction: tx
                                });
                                console.log(`Result submitted successfully! Tx Digest: ${writeResult.digest}`);
                            } else {
                                console.warn("WARNING: ADMIN_SECRET_KEY is not set. Skipping on-chain submission.");
                            }
                        } catch (error: any) {
                            console.error("Error processing execution:", error.message);
                        }
                    }
                }

                // Update cursor
                cursor = nextCursor;
            }
        } catch (error: any) {
            console.error("Polling error:", error.message);
        } finally {
            isPolling = false;
            // Schedule the next poll tick 3 seconds AFTER the current one completely finishes
            setTimeout(poll, 3000);
        }
    }

    // Start first poll tick
    setTimeout(poll, 1000);

    console.log("Polling started... (Press Ctrl+C to stop)");
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log("\nStopping listener...");
        process.exit(0);
    });
}

// If this script is run directly
const isMain = process.argv[1].endsWith('listener.ts') || process.argv[1].endsWith('listener.js');
if (isMain) {
    const packageId = process.env.PACKAGE_ID || "0x0";
    if (packageId === "0x0") {
        console.warn("WARNING: PACKAGE_ID is not set. Please set it in .env");
    }
    startPolling(packageId).catch(err => {
        console.error("Critical listener error:", err);
        process.exit(1);
    });
}
