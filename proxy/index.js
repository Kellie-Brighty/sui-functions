require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { decodeSuiPrivateKey } = require('@mysten/sui/cryptography');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { toBase64 } = require('@mysten/sui/utils');

let proxyKeypair = null;
if (process.env.PROXY_PRIVATE_KEY) {
  try {
    const parsed = decodeSuiPrivateKey(process.env.PROXY_PRIVATE_KEY);
    proxyKeypair = Ed25519Keypair.fromSecretKey(parsed.secretKey);
    console.log(`[PROXY] Cryptographic Attestation Enabled. Public Key: ${proxyKeypair.getPublicKey().toSuiAddress()}`);
  } catch (e) {
    console.warn(`[PROXY] Failed to load PROXY_PRIVATE_KEY:`, e.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Mock Seal Decryptor for demonstration
async function unsealSecret(ciphertext) {
  // In a real production Mysten Seal integration, this calls the Seal Key Servers
  // using the proxy's server-side authentication to decrypt the ciphertext.
  // For demonstration, we assume the ciphertext is base64 encoded plaintext prefixed with "sealed_"
  if (ciphertext.startsWith('sealed_')) {
    return Buffer.from(ciphertext.replace('sealed_', ''), 'base64').toString('utf8');
  }
  return ciphertext; // fallback
}

// Utility to swap out ${SECRET.XYZ} placeholders with actual decrypted keys
async function injectSecrets(inputStr, sealedSecrets = {}) {
  if (!inputStr) return inputStr;
  let result = inputStr;
  
  // Find all instances of ${SECRET.NAME}
  const regex = /\$\{SECRET\.([a-zA-Z0-9_]+)\}/g;
  let match;
  
  while ((match = regex.exec(inputStr)) !== null) {
    const fullMatch = match[0];
    const secretKey = match[1];
    
    // 1. Try to find the secret in the dynamically provided sealedSecrets from the Node Operator
    let secretValue = sealedSecrets[secretKey];
    
    // 2. If it's a sealed secret, decrypt it using the Mysten Seal Protocol
    if (secretValue) {
      secretValue = await unsealSecret(secretValue);
    }
    
    // 3. Fallback to local .env file
    if (!secretValue) {
      secretValue = process.env[secretKey];
    }
    
    if (secretValue) {
      result = result.replace(fullMatch, secretValue);
      console.log(`[PROXY] Securely injected secret for key: ${secretKey}`);
    } else {
      console.log(`[PROXY] Warning: Secret key ${secretKey} not found in trusted store!`);
    }
  }
  return result;
}

app.post('/proxy', async (req, res) => {
  try {
    const { targetUrl, method = 'GET', headers = {}, body, projectId } = req.body;
    
    // Extract the sealed secrets passed securely from the Node Operator
    const sealedSecretsRaw = req.headers['x-sui-sealed-secrets'];
    let sealedSecrets = {};
    if (sealedSecretsRaw) {
      try {
        sealedSecrets = JSON.parse(sealedSecretsRaw);
      } catch (e) {
        console.warn('[PROXY] Failed to parse x-sui-sealed-secrets header');
      }
    }
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' });
    }

    console.log(`\n[PROXY] Incoming request for project ${projectId || 'unknown'}`);
    console.log(`[PROXY] Target: ${method} ${targetUrl}`);

    // 1. Inject secrets into URL (e.g. API keys in query params)
    const secureUrl = await injectSecrets(targetUrl, sealedSecrets);
    
    // 2. Inject secrets into Headers (e.g. Bearer tokens)
    const secureHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        secureHeaders[key] = await injectSecrets(value, sealedSecrets);
      } else {
        secureHeaders[key] = value;
      }
    }

    // 3. Inject secrets into Body
    let secureBody = body;
    if (typeof body === 'string') {
      secureBody = await injectSecrets(body, sealedSecrets);
    } else if (body && typeof body === 'object') {
      secureBody = JSON.parse(await injectSecrets(JSON.stringify(body), sealedSecrets));
    }

    // 4. Dispatch the true TLS request
    console.log(`[PROXY] Dispatching secure TLS request...`);
    const response = await axios({
      url: secureUrl,
      method: method,
      headers: secureHeaders,
      data: secureBody,
      validateStatus: () => true // Resolve on any status code so we can forward it
    });

    console.log(`[PROXY] Response received: ${response.status}`);
    
    // 5. Sign the response data if cryptographic attestation is enabled
    let signatureBase64 = null;
    let proxyPublicKeyBase64 = null;
    
    // Convert response data to string for signing
    const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    
    if (proxyKeypair) {
      const dataBytes = new TextEncoder().encode(responseText);
      // We sign the raw data bytes because trigger.move verifies raw bytes
      const signatureBytes = await proxyKeypair.sign(dataBytes);
      signatureBase64 = toBase64(signatureBytes);
      proxyPublicKeyBase64 = proxyKeypair.getPublicKey().toBase64();
      console.log(`[PROXY] Generated cryptographic signature for response.`);
    }

    // 6. Forward the response back to the decentralized Node Operator
    res.status(200).json({
      status: response.status,
      text: responseText,
      signature: signatureBase64,
      proxyPublicKey: proxyPublicKeyBase64
    });
    
  } catch (error) {
    console.error(`[PROXY] Internal Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛡️  Sui-Functions Trusted Seal Proxy running on port ${PORT}`);
  console.log(`Ready to intercept and inject ${'`${SECRET.NAME}`'} variables.`);
});
