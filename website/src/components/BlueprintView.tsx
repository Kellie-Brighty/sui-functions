import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Shield, Settings, Server, Cpu } from 'lucide-react';
import { Button } from './shared';

interface BlueprintViewProps {
  onBackToLanding: () => void;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({ onBackToLanding }) => {
  return (
    <div className="w-full bg-brand-dark min-h-screen pt-12 pb-24 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand-indigo/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-sui/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Navigation */}
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-slate-400 hover:text-brand-sui transition-colors mb-12 group font-medium text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-sui/10 border border-brand-sui/20 text-brand-sui text-xs font-bold font-mono uppercase tracking-wider mb-6"
          >
            <Settings size={14} />
            Integration Architecture
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 font-outfit"
          >
            Autonomous Agent <br className="hidden md:block"/>
            <span className="text-brand-sui">Deployment Blueprint</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 leading-relaxed max-w-3xl"
          >
            A Step-by-Step Implementation Guide for Trustless, Event-Driven Edge Compute. 
            This guide serves as a practical, actionable companion to outline precisely what a developer needs to do at each phase of the deployment pipeline to transition an autonomous agent from local JavaScript execution to a highly secure, zero-trust decentralized edge network.
          </motion.p>
        </div>

        {/* Flowchart Diagram */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-20 bg-brand-card border border-brand-card-border rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-indigo via-brand-sui to-emerald-400" />
          <h2 className="text-xl font-bold text-white mb-6 font-outfit flex items-center gap-3">
            <Cpu className="text-brand-sui" size={24} />
            Integration Flowchart
          </h2>
          <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-4">
            <img 
              src="/sui-functions-integration-flowchart.svg" 
              alt="Integration Flowchart" 
              className="w-full max-w-4xl object-contain drop-shadow-xl rounded-lg"
            />
          </div>
        </motion.div>

        {/* Content Body */}
        <div className="space-y-16">
          
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl"
          >
            <h2 className="text-3xl font-bold font-outfit text-white mt-12 mb-6">Architecture Overview</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Traditional agent hosting relies on centralized servers (e.g., AWS, GCP, DigitalOcean), exposing Web2 API secrets and creating single points of network failure.
            </p>
            <p className="text-slate-300 leading-relaxed mb-6">Sui-Functions decouples this compute loop:</p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-10">
              <li>The <strong className="text-white">Codebase</strong> is stored immutably on the <strong className="text-white">Walrus Protocol</strong> (decentralized storage).</li>
              <li>The <strong className="text-white">Execution Triggers</strong> are recorded on the <strong className="text-white">Sui Blockchain</strong>.</li>
              <li>The <strong className="text-white">Compute</strong> runs on-demand inside isolated WebAssembly (Wasm) or Secure Node.js Sandboxes across the decentralized edge network, paying only for the gas burned during the compute window.</li>
            </ul>

            <hr className="border-brand-card-border my-16" />

            <h2 className="text-3xl font-bold font-outfit text-white mb-8">Detailed Step-by-Step Implementation Guide</h2>

            <h3 className="text-2xl font-bold font-outfit text-white mt-12 mb-4">Phase 1: Local Development & Sandbox Configuration</h3>
            <p className="text-slate-300 leading-relaxed mb-8">
              Your autonomous agent is authored in standard JavaScript or TypeScript. However, because it runs inside an isolated, decentralized sandbox, it must adhere to strict zero-trust runtime limitations.
            </p>

            <h4 className="text-lg font-bold text-white mt-8 mb-4">1. Configure the Local Project Workspace</h4>
            <p className="text-slate-300 leading-relaxed mb-4">Create a clean directory structure for your agent logic:</p>
            <pre className="bg-[#0b1016] border border-brand-card-border rounded-xl p-6 text-sm font-mono text-brand-sui mb-8 overflow-x-auto"><code>{`my-sui-agent/
├── package.json
├── src/
│   └── index.ts       # Main agent logic (your entry point)
├── .env.example       # Local variables only
└── README.md`}</code></pre>

            <h4 className="text-lg font-bold text-white mt-8 mb-4">2. Restrict Sandbox Operations</h4>
            <p className="text-slate-300 leading-relaxed mb-4">Ensure your <code className="bg-[#0b1016] text-brand-sui px-2 py-0.5 rounded border border-brand-card-border">index.ts</code> script uses standard export structures. The edge worker expects an exported entry function (e.g., main or handler) that receives a dynamic payload:</p>
            
            <pre className="bg-[#0b1016] border border-brand-card-border rounded-xl p-6 text-sm font-mono text-emerald-400 mb-12 overflow-x-auto"><code>{`// src/index.ts

// The edge environment injects payload inputs and secure env secrets dynamically
export async function handler(payload: ArrayBuffer, env: Record<string, string>) {
  try {
    const data = JSON.parse(new TextDecoder().decode(payload));
    const apiKey = env.OPENAI_API_KEY; // Pulled from the Zero-Trust Secrets Manager
    
    // Your agent logic here
    const result = { status: "success", received: data };
    
    return new TextEncoder().encode(JSON.stringify(result));
  } catch (error) {
    return new TextEncoder().encode(JSON.stringify({ error: error.message }));
  }
}`}</code></pre>

            <h3 className="text-2xl font-bold font-outfit text-white mt-16 mb-4">Phase 2: Web3 Authentication & Deployment Preparation</h3>
            <p className="text-slate-300 leading-relaxed mb-8">
              Unlike traditional platforms where you configure SSH keys or IAM roles, Sui-Functions utilizes native Web3 cryptography to authenticate developers and deploy files.
            </p>
            
            <h4 className="text-lg font-bold text-white mt-8 mb-4">1. Connect and Verify Your Wallet</h4>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Open the Sui-Functions Developer Console.</li>
              <li>Trigger a secure Web3 wallet connection prompt (e.g., using Surf or Sui Wallet).</li>
              <li>The platform will challenge you to cryptographically sign a lightweight login session payload using your private key:</li>
            </ul>
            <pre className="text-center font-mono text-sm bg-[#0b1016] border border-brand-card-border rounded-xl py-6 mb-6 text-purple-400 overflow-x-auto"><code>Signature = Sign_Ed25519(Wallet Private Key, Session Challenge)</code></pre>
            <p className="text-slate-300 leading-relaxed mb-8">This establishes identity without exposing private keys or transmitting passwords.</p>

            <h4 className="text-lg font-bold text-white mt-8 mb-4">2. Setup the Code Bundle</h4>
            <p className="text-slate-300 leading-relaxed mb-4">In your project directory, compile your TypeScript code into a single, self-contained JavaScript file:</p>
            <pre className="bg-[#0b1016] border border-brand-card-border rounded-xl p-6 text-sm font-mono text-brand-sui mb-12 overflow-x-auto"><code>{`# Bundle typescript files into a single distribution module
npx esbuild src/index.ts --bundle --platform=node --format=esm --outfile=dist/bundle.js`}</code></pre>

            <h3 className="text-2xl font-bold font-outfit text-white mt-16 mb-4">Phase 3: Zero-Trust Secrets Configuration</h3>
            <p className="text-slate-300 leading-relaxed mb-8">
              If your agent interacts with external Web2 services (like OpenAI, Twitter/X, Discord, or Telegram), you must securely configure your keys.
            </p>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 my-8 flex gap-4 items-start">
              <Shield className="text-red-400 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-red-400 font-bold text-lg m-0 mb-2">CRITICAL SECURITY RULE</h4>
                <p className="text-red-200/80 m-0 text-sm leading-relaxed">
                  Do not hardcode API keys or upload raw <code className="bg-red-900/30 px-1.5 py-0.5 rounded">.env</code> files to Walrus. Walrus is public, immutable storage. Anyone would be able to read your keys!
                </p>
              </div>
            </div>

            <h4 className="text-lg font-bold text-white mt-8 mb-4">1. Encrypt API Keys</h4>
            <p className="text-slate-300 leading-relaxed mb-4">Instead of publishing keys, submit them using the dashboard's Secrets Manager:</p>
            <p className="text-slate-300 leading-relaxed mb-4">When you enter a key (e.g., <code className="bg-[#0b1016] text-brand-sui px-2 py-0.5 rounded border border-brand-card-border">OPENAI_API_KEY</code>), the browser encrypts the string locally using the public key of the Sui-Functions Edge Oracle Network:</p>
            <pre className="text-center font-mono text-sm bg-[#0b1016] border border-brand-card-border rounded-xl py-6 mb-6 text-purple-400 overflow-x-auto"><code>Encrypted Key = Encrypt_RSA/ECIES(Oracle Public Key, API Key Value)</code></pre>
            <p className="text-slate-300 leading-relaxed mb-8">
              Upload only the encrypted payload. Decryption occurs strictly inside the hardware-isolated TEE (Trusted Execution Environment) of the specific edge nodes processing your compute task. Node operators cannot intercept your API keys.
            </p>

            <h4 className="text-lg font-bold text-white mt-8 mb-4">2. Configure the Seal Proxy Layer (Optional)</h4>
            <p className="text-slate-300 leading-relaxed mb-4">If your agent triggers off-chain events and must return those results securely back to a Sui smart contract, enable the Seal Proxy:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>When your agent requests external Web2 API data, the Seal Proxy interceptor wraps the response.</li>
              <li>The proxy dynamically signs the returned Web2 payload with its own on-chain identity:</li>
            </ul>
            <pre className="text-center font-mono text-sm bg-[#0b1016] border border-brand-card-border rounded-xl py-6 mb-6 text-purple-400 overflow-x-auto"><code>Payload Signature = Sign_Ed25519(Seal Proxy Private Key, Web2 Response)</code></pre>
            <p className="text-slate-300 leading-relaxed mb-12">This lets your Sui Move smart contract instantly verify that the Web2 payload was not modified before processing on-chain.</p>

            <h3 className="text-2xl font-bold font-outfit text-white mt-16 mb-4">Phase 4: Immutable Deployment to Walrus & Sui</h3>
            <p className="text-slate-300 leading-relaxed mb-8">When you click <strong className="text-white">Deploy Agent</strong> on the dashboard, a dual-blockchain registration sequence is fired.</p>

            <div className="bg-brand-card border border-brand-card-border rounded-xl p-6 my-8 font-mono text-xs sm:text-sm text-brand-sui whitespace-pre overflow-x-auto text-center">
{`                  ┌───────────────────────┐
                  │ Click "Deploy Agent"  │
                  └───────────┬───────────┘
                              ▼
             ┌─────────────────────────────────┐
             │ Browser signs transaction using │
             │   connected Sui Wallet keys     │
             └────────────────┬────────────────┘
                              ▼
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
┌───────────────────────┐             ┌────────────────────────┐
│ Raw JS Code Bundle    │             │ Smart Contract Registry│
│ written immutably to  │             │ entry logged natively  │
│ Walrus Storage        │             │ on Sui Network Ledger  │
└───────────────────────┘             └────────────────────────┘`}
            </div>

            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-12">
              <li><strong className="text-white">Upload to Walrus:</strong> The bundled <code className="bg-[#0b1016] text-brand-sui px-2 py-0.5 rounded border border-brand-card-border">bundle.js</code> script is uploaded to Walrus Protocol decentralized storage. Because it is decentralized, your script cannot be taken down, deleted, or edited by any third party.</li>
              <li><strong className="text-white">Register on Sui:</strong> A transaction records the metadata (such as the Walrus file address and agent properties) within the <code className="bg-[#0b1016] text-brand-sui px-2 py-0.5 rounded border border-brand-card-border">sui_functions::registry</code> smart contract.</li>
              <li><strong className="text-white">Function ID Generation:</strong> Once confirmed, you are returned an on-chain Function ID object (e.g., <code className="bg-[#0b1016] text-brand-sui px-2 py-0.5 rounded border border-brand-card-border">0x8d3b...12ac</code>). This ID serves as the global address to invoke your agent.</li>
            </ul>

            <h3 className="text-2xl font-bold font-outfit text-white mt-16 mb-4">Phase 5: Event-Driven On-Chain Triggers</h3>
            <p className="text-slate-300 leading-relaxed mb-8">
              Once your agent is deployed, you do not need to keep servers running continuously to monitor it. Any on-chain Sui smart contract can trigger your agent programmatically.
            </p>

            <h4 className="text-lg font-bold text-white mt-8 mb-4">Smart Contract Integration (Sui Move)</h4>
            <p className="text-slate-300 leading-relaxed mb-4">To integrate the trigger inside your own custom Move modules, call the native <code className="bg-[#0b1016] text-brand-sui px-2 py-0.5 rounded border border-brand-card-border">registry::trigger</code> hook:</p>

            <pre className="bg-[#0b1016] border border-brand-card-border rounded-xl p-6 text-sm font-mono text-emerald-400 mb-12 overflow-x-auto"><code>{`module my_app::arbitrage_module {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{ID};
    
    // Import the native Sui-Functions registry hook
    use sui_functions::registry;

    /// Triggers decentralized agent evaluation during on-chain operations
    public fun check_prices_and_arbitrage(
        function_id: ID, 
        payload: vector<u8>, 
        ctx: &mut TxContext
    ) {
        // Business logic preceding trigger execution goes here...

        // Fire the on-chain trigger.
        // The Sui-Functions network detects this event and fires an edge execution sandbox automatically.
        registry::trigger(
            function_id, 
            payload, 
            ctx
        );
    }
}`}</code></pre>

            <hr className="border-brand-card-border my-12" />

            <div className="bg-gradient-to-br from-brand-card to-brand-card/50 border border-brand-card-border rounded-2xl p-8 mb-12">
              <h3 className="text-white mt-0 mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-[#00FFAA]" size={28} />
                Developer Action Item Checklist
              </h3>
              <p className="text-slate-400 mb-6">Use this checklist to ensure your deployment pipeline is robust, secure, and production-ready:</p>
              
              <ul className="space-y-4 list-none pl-0 text-slate-300">
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded border border-[#14304A] bg-[#08090d] shrink-0 mt-0.5 flex items-center justify-center"></div>
                  <span><strong>Code Optimization:</strong> Ensure code files are bundled and optimized using a bundler (like esbuild or webpack) under 5MB.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded border border-[#14304A] bg-[#08090d] shrink-0 mt-0.5 flex items-center justify-center"></div>
                  <span><strong>No Local Storage:</strong> Ensure your agent logic does not write files to local server directories (use external databases or API webhooks instead).</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded border border-[#14304A] bg-[#08090d] shrink-0 mt-0.5 flex items-center justify-center"></div>
                  <span><strong>Secrets Audit:</strong> Double check that no Web2 credentials, private keys, or passwords are left inside the uploaded javascript file.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded border border-[#14304A] bg-[#08090d] shrink-0 mt-0.5 flex items-center justify-center"></div>
                  <span><strong>SUI Gas Management:</strong> Allocate enough SUI gas to the calling address to fund the transaction fee that initiates the decentralized trigger.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded border border-[#14304A] bg-[#08090d] shrink-0 mt-0.5 flex items-center justify-center"></div>
                  <span><strong>Local Testing:</strong> Test the main JS handler file locally with mocked payload arguments prior to deploying live on-chain.</span>
                </li>
              </ul>
            </div>

          </motion.section>
        </div>
      </div>
    </div>
  );
};
