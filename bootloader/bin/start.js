#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AGGREGATOR_URL = 'https://walrus-testnet-aggregator.nodes.guru';

async function main() {
  console.log(`\n\x1b[36m\x1b[1m⚡ SUI FUNCTIONS \x1b[0m\x1b[90m// DECENTRALIZED NODE\x1b[0m\n`);
  
  const args = process.argv.slice(2);
  let coreBlobId = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--core') {
      coreBlobId = args[i + 1];
    }
  }

  if (!coreBlobId) {
    console.error("❌ Error: Missing --core <WALRUS_BLOB_ID> argument.");
    console.error("Please provide the BLOB ID of the runner engine.");
    process.exit(1);
  }

  console.log(`\x1b[90m↓ Fetching engine from Walrus: \x1b[0m${coreBlobId}`);

  try {
    const res = await fetch(`${AGGREGATOR_URL}/v1/blobs/${coreBlobId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch from Walrus: ${res.statusText}`);
    }
    
    const engineCode = await res.text();
    console.log(`\x1b[32m✓ Engine downloaded \x1b[90m(${(engineCode.length / 1024).toFixed(2)} KB)\x1b[0m`);

    // Write the engine to a local cache directory inside the CLI package so Node can resolve its node_modules
    const cacheDir = path.join(__dirname, '..', '.sui-functions-cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    const enginePath = path.join(cacheDir, `engine_${coreBlobId}.js`);
    fs.writeFileSync(enginePath, engineCode);

    console.log(`\n\x1b[35m▶ Booting Decentralized Engine...\x1b[0m\n`);
    
    // Spawn the downloaded engine
    const engineProcess = spawn('node', [enginePath], {
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--no-warnings' }
    });

    engineProcess.on('close', (code) => {
      console.log(`\n\x1b[31m🛑 Engine stopped with exit code ${code}\x1b[0m`);
      process.exit(code);
    });

  } catch (error) {
    console.error(`\n❌ Bootloader Error: ${error.message}`);
    process.exit(1);
  }
}

main();
