import * as paillierBigint from 'paillier-bigint';

export class SuiFunctions {
    /**
     * Encrypts the provided payload using the Node Operator's public key.
     * This ensures the Two-Tiered Confidentiality model:
     * - `number` values are encrypted using Paillier Homomorphic Encryption.
     * - `string` and other values are left as plaintext, assuming they will be protected
     *   by the runner's Intrusion Detection System (Honey-Tokens) in RAM.
     * 
     * @param payload The JSON payload to securely transmit.
     * @param publicKeyStr The serialized JSON string of the Paillier public key { n, g }.
     */
    static async encryptPayload(payload: Record<string, any>, publicKeyStr: string): Promise<Record<string, any>> {
        const pubKeyData = JSON.parse(publicKeyStr);
        const publicKey = new paillierBigint.PublicKey(BigInt(pubKeyData.n), BigInt(pubKeyData.g));
        
        const securePayload: Record<string, any> = {};
        
        for (const [key, value] of Object.entries(payload)) {
            if (typeof value === 'number') {
                // Convert number to BigInt and encrypt.
                // The ciphertext is returned as a BigInt, which we serialize to a string.
                const encryptedVal = publicKey.encrypt(BigInt(value));
                securePayload[key] = encryptedVal.toString();
            } else {
                // Pass through strings and other types for the IDS to handle.
                securePayload[key] = value;
            }
        }
        
        return securePayload;
    }
}
