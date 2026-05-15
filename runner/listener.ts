import * as dotenv from 'dotenv';
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { fetchFunctionCode } from './aggregator.js';
import { executeInSandbox } from './vm_manager.js';

dotenv.config();

// Initialize the client for Testnet
const client = new SuiJsonRpcClient({ 
    url: getJsonRpcFullnodeUrl('testnet'),
    network: 'testnet'
});

/**
 * Polls for ExecutionTriggered events from the specified package.
 * @param packageId The ID of the deployed Move package.
 */
export async function startPolling(packageId: string) {
    console.log(`Starting Sui-Functions Polling Listener for package: ${packageId}...`);
    
    let cursor: any = null;

    // Simple polling loop (every 3 seconds)
    const pollInterval = setInterval(async () => {
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
                        } catch (error: any) {
                            console.error("Error processing execution:", error.message);
                        }
                    }
                }

                // Update cursor to the next page to avoid duplicates
                cursor = result.nextCursor;
            }
        } catch (error: any) {
            console.error("Polling error:", error.message);
        }
    }, 3000);

    console.log("Polling started... (Press Ctrl+C to stop)");
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log("\nStopping listener...");
        clearInterval(pollInterval);
        process.exit(0);
    });
}

// If this script is run directly
const isMain = process.argv[1].endsWith('listener.ts');
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
