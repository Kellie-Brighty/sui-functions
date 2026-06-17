require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Utility to swap out ${SECRET.XYZ} placeholders with actual decrypted keys
function injectSecrets(inputStr) {
  if (!inputStr) return inputStr;
  let result = inputStr;
  
  // Find all instances of ${SECRET.NAME}
  const regex = /\$\{SECRET\.([a-zA-Z0-9_]+)\}/g;
  let match;
  
  while ((match = regex.exec(inputStr)) !== null) {
    const fullMatch = match[0];
    const secretKey = match[1];
    
    // In production, we use @mysten/seal here to decrypt the Blob ID on Walrus.
    // For local testing, we fallback to our explicit trusted .env file
    const secretValue = process.env[secretKey];
    
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
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' });
    }

    console.log(`\n[PROXY] Incoming request for project ${projectId || 'unknown'}`);
    console.log(`[PROXY] Target: ${method} ${targetUrl}`);

    // 1. Inject secrets into URL (e.g. API keys in query params)
    const secureUrl = injectSecrets(targetUrl);
    
    // 2. Inject secrets into Headers (e.g. Bearer tokens)
    const secureHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        secureHeaders[key] = injectSecrets(value);
      } else {
        secureHeaders[key] = value;
      }
    }

    // 3. Inject secrets into Body
    let secureBody = body;
    if (typeof body === 'string') {
      secureBody = injectSecrets(body);
    } else if (body && typeof body === 'object') {
      secureBody = JSON.parse(injectSecrets(JSON.stringify(body)));
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
    
    // 5. Forward the response back to the decentralized Node Operator
    res.status(response.status).json(response.data);
    
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
