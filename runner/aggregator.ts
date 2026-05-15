import axios from 'axios';

/**
 * Fetches the raw JS code from the Walrus testnet aggregator.
 * @param blobId The Walrus Blob ID of the function code.
 * @returns The raw string content of the function.
 */
export async function fetchFunctionCode(blobId: string): Promise<string> {
    const aggregatorUrl = `https://walrus-testnet-aggregator.nodes.guru/v1/blobs/${blobId}`;
    
    try {
        console.log(`Fetching code from Walrus: ${blobId}...`);
        const response = await axios.get(aggregatorUrl, {
            responseType: 'text'
        });
        return response.data;
    } catch (error: any) {
        throw new Error(`Failed to fetch code from Walrus: ${error.message}`);
    }
}
