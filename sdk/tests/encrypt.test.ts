import * as paillierBigint from 'paillier-bigint';
import { SuiFunctions } from '../src/index';

async function runTests() {
    console.log("=== Testing @sui-functions/sdk ===");
    
    // 1. Generate a mock Node Operator keypair
    console.log("[1] Generating mock 512-bit Paillier Keypair for testing...");
    const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(512);
    
    const publicKeyStr = JSON.stringify({
        n: publicKey.n.toString(),
        g: publicKey.g.toString()
    });

    // 2. Define a mixed payload
    const originalPayload = {
        agent_balance: 100,
        fee_rate: 5,
        openai_api_key: "sk-proj-123456789",
        stripe_secret: "sk_live_abc123"
    };

    console.log("\n[2] Original Payload:");
    console.log(JSON.stringify(originalPayload, null, 2));

    // 3. Encrypt via SDK
    console.log("\n[3] Encrypting Payload using SDK...");
    const securePayload = await SuiFunctions.encryptPayload(originalPayload, publicKeyStr);

    console.log("Secure Payload:");
    console.log(JSON.stringify(securePayload, null, 2));

    // 4. Verify the split-security model
    let testsPassed = true;

    // Verify Numbers (should be encrypted strings)
    if (typeof securePayload.agent_balance === 'string' && securePayload.agent_balance.length > 50) {
        console.log("✅ Math values (agent_balance) were successfully encrypted into large ciphertexts.");
    } else {
        console.error("❌ Math values failed to encrypt properly!");
        testsPassed = false;
    }

    // Verify Strings (should be plaintext)
    if (securePayload.openai_api_key === "sk-proj-123456789") {
        console.log("✅ String secrets (openai_api_key) were left as plaintext for the IDS Canary Traps.");
    } else {
        console.error("❌ String secrets were modified!");
        testsPassed = false;
    }

    // 5. Verify the node operator can still do homomorphic math
    console.log("\n[4] Simulating Homomorphic Math on the Node Runner...");
    
    // Runner does: secure_agent_balance + secure_fee_rate
    const encBalance = BigInt(securePayload.agent_balance);
    const encFee = BigInt(securePayload.fee_rate);
    const encResult = publicKey.addition(encBalance, encFee);
    
    // Runner submits encResult back. User decrypts it.
    const decryptedResult = privateKey.decrypt(encResult);
    console.log(`Node operator computed encrypted math. Decrypted result: ${decryptedResult.toString()}`);
    
    if (decryptedResult.toString() === "105") {
        console.log("✅ Homomorphic addition was mathematically sound.");
    } else {
        console.error("❌ Homomorphic addition failed.");
        testsPassed = false;
    }

    if (testsPassed) {
        console.log("\n🎉 All SDK tests passed successfully!");
    } else {
        console.log("\n⚠️ Some tests failed.");
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
