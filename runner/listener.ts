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
 * Robust helper to fetch SUI/USD price from multiple sources (Coinbase, CryptoCompare, CoinGecko)
 */
async function fetchSuiPrice(): Promise<number> {
    try {
        const res = await fetch('https://api.coinbase.com/v2/prices/SUI-USD/spot');
        const data = await res.json() as any;
        const price = parseFloat(data.data.amount);
        if (!isNaN(price) && price > 0) return price;
    } catch (e) {
        console.warn("[Price Helper] Coinbase SUI/USD fetch failed, trying CryptoCompare...");
    }

    try {
        const res = await fetch('https://min-api.cryptocompare.com/data/price?fsym=SUI&tsyms=USD');
        const data = await res.json() as any;
        const price = parseFloat(data.USD);
        if (!isNaN(price) && price > 0) return price;
    } catch (e) {
        console.warn("[Price Helper] CryptoCompare SUI/USD fetch failed, trying CoinGecko...");
    }

    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd');
        const data = await res.json() as any;
        const price = parseFloat(data.sui.usd);
        if (!isNaN(price) && price > 0) return price;
    } catch (e) {
        console.warn("[Price Helper] CoinGecko SUI/USD fetch failed.");
    }

    throw new Error("All SUI/USD price provider APIs failed");
}

/**
 * Background worker that monitors price deviation off-chain and triggers
 * on-chain execution if SUI drifts by more than 0.1% or 5 minutes heartbeat.
 */
export async function startPriceDeviationWorker() {
    console.log("[Deviation Worker] Starting SUI/USD Price Deviation Keeper...");
    
    const DEVIATION_THRESHOLD = 0.001; // 0.1% drift for high demo responsiveness
    const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes heartbeat
    const CHECK_INTERVAL = 15 * 1000; // Check off-chain price every 15 seconds
    
    let lastSubmittedPrice: number | null = null;
    let lastSubmittedTime = 0;

    async function checkPrice() {
        try {
            // Fetch live price off-chain (completely free and robust)
            const livePrice = await fetchSuiPrice();
            
            const now = Date.now();
            let shouldTrigger = false;

            if (lastSubmittedPrice === null) {
                console.log(`[Deviation Worker] Initializing... Live SUI price: $${livePrice}`);
                lastSubmittedPrice = livePrice;
                lastSubmittedTime = now;
                shouldTrigger = true; // Trigger first price update on runner start
            } else {
                const diff = Math.abs(livePrice - lastSubmittedPrice);
                const percentDiff = diff / lastSubmittedPrice;
                const timeSinceLastUpdate = now - lastSubmittedTime;

                console.log(`[Deviation Worker] SUI Live: $${livePrice.toFixed(4)} | Last Written: $${lastSubmittedPrice.toFixed(4)} | Drift: ${(percentDiff * 100).toFixed(3)}%`);

                if (percentDiff >= DEVIATION_THRESHOLD) {
                    console.log(`[Deviation Worker] Price drift detected! Drift: ${(percentDiff * 100).toFixed(3)}% >= threshold: ${(DEVIATION_THRESHOLD * 100).toFixed(2)}%`);
                    shouldTrigger = true;
                } else if (timeSinceLastUpdate >= HEARTBEAT_INTERVAL) {
                    console.log(`[Deviation Worker] Heartbeat tick reached (${(HEARTBEAT_INTERVAL / 60000)} mins elapsed).`);
                    shouldTrigger = true;
                }
            }

            if (shouldTrigger && keypair) {
                console.log(`[Deviation Worker] Automatically triggering on-chain function execution...`);
                
                const projectId = process.env.PROJECT_ID || process.env.REGISTRY_ID || "0x0";
                const packageId = process.env.PACKAGE_ID || "0x0";
                
                const tx = new Transaction();
                tx.moveCall({
                    target: `${packageId}::trigger::call_function`,
                    arguments: [
                        tx.object(projectId),
                        tx.pure.string("SUI USD Oracle"),
                        tx.pure.string("{}")
                    ]
                });

                const result = await client.signAndExecuteTransaction({
                    signer: keypair,
                    transaction: tx
                });
                
                console.log(`[Deviation Worker] Successfully triggered on-chain execution! Tx Digest: ${result.digest}`);
                
                // Advance tracking state
                lastSubmittedPrice = livePrice;
                lastSubmittedTime = now;
            } else if (!keypair) {
                console.warn("[Deviation Worker] Skipping trigger: ADMIN_SECRET_KEY is not configured.");
            }
        } catch (error: any) {
            console.error("[Deviation Worker] Error in price tick:", error.message);
        } finally {
            setTimeout(checkPrice, CHECK_INTERVAL);
        }
    }

    // Initialize loop
    checkPrice();
}

/**
 * Polls for ExecutionTriggered events from the specified package.
 * @param packageId The ID of the deployed Move package.
 */
export async function startPolling(packageId: string) {
    console.log(`Starting Sui-Functions Polling Listener for package: ${packageId}...`);
    
    // Start automated price deviation worker in the background
    startPriceDeviationWorker();
    
    let cursor: any = null;
    let isPolling = false;

    // Fetch the latest event to use as the starting cursor, avoiding replaying past history on startup
    try {
        const latestEvent = await client.queryEvents({
            query: { 
                MoveModule: { 
                    package: packageId, 
                    module: 'trigger' 
                } 
            },
            order: 'descending',
            limit: 1
        });
        if (latestEvent && latestEvent.data && latestEvent.data.length > 0) {
            cursor = latestEvent.data[0].id;
            console.log(`[Listener] Initialized starting cursor to latest event: ${latestEvent.data[0].id.txDigest}`);
        } else {
            console.log(`[Listener] No historical events found. Starting poll from the beginning.`);
        }
    } catch (e: any) {
        console.warn(`[Listener] Failed to fetch latest event cursor on startup (will poll from beginning):`, e.message);
    }

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
                    
                    const { project_id, walrus_blob_id, function_name, caller, input_data } = event.parsedJson as any;

                    if (walrus_blob_id) {
                        try {
                            console.log(`Triggering function: ${function_name} (Blob: ${walrus_blob_id}) for project: ${project_id}`);
                            console.log(`Caller: ${caller}`);
                            
                            // 1. Fetch code from Walrus
                            const code = await fetchFunctionCode(walrus_blob_id);
                            
                            // 2. Execute in Sandbox
                            console.log("Executing in sandbox with input:", input_data);
                            const executionResult = await executeInSandbox(code, input_data);
                            
                            console.log("Execution Result:", executionResult);

                            // 3. Submit result back to Sui
                            if (keypair) {
                                console.log(`Submitting result back to Sui...`);
                                const tx = new Transaction();
                                const packageId = process.env.PACKAGE_ID || "0x0";
                                
                                tx.moveCall({
                                    target: `${packageId}::trigger::submit_result`,
                                    arguments: [
                                        tx.object(project_id),
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
