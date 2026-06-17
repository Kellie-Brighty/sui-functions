// functions/secure_math.js
// A test serverless function to demonstrate Two-Tiered Confidentiality.
// This will be uploaded to Walrus and executed inside the Decentralized Node's V8 Sandbox.

const input = globalThis.input || {};

console.log("=====================================");
console.log("🔒 SECURE MATH EXECUTING IN SANDBOX");
console.log("=====================================");

if (!input.pubKey || !input.valA || !input.valB) {
    return { status: "error", message: "Missing required inputs: pubKey, valA, valB" };
}

// Perform Fully Homomorphic Addition on the massive encrypted strings!
// The Node Operator cannot see the actual numbers because they are 309-character ciphertexts.
const encryptedSum = globalThis.SuiFHE.add(input.pubKey, input.valA, input.valB);

console.log("✅ Homomorphic addition completed without decryption!");

// Return the blinded ciphertext back to the blockchain.
// Only the original client (who has the private key) can decrypt this result!
return {
    status: "success",
    encryptedSum: encryptedSum
};
