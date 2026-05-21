import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Code2, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  HelpCircle, 
  Terminal, 
  ArrowRight, 
  Lock, 
  Settings, 
  Zap, 
  Sparkles,
  Link,
  Activity,
  FileCode,
  DollarSign,
  Ticket,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface DocsSection {
  id: string;
  title: string;
  icon: any;
  category: string;
  layman: React.ReactNode;
  developer: React.ReactNode;
  keywords: string[];
}

interface DocsViewProps {
  onBackToLanding?: () => void;
  isDashboardView?: boolean;
}

export const DocsView: React.FC<DocsViewProps> = ({ onBackToLanding, isDashboardView = false }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('intro');
  const [audienceMode, setAudienceMode] = useState<'layman' | 'developer'>('developer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections: DocsSection[] = useMemo(() => [
    {
      id: 'intro',
      title: 'Introduction',
      category: 'Overview',
      icon: BookOpen,
      keywords: ['intro', 'about', 'concept', 'what is', 'architecture', 'overview', 'serverless', 'lambda'],
      layman: (
        <div className="space-y-6 animate-fade-in-up">
          <div className="p-5 border border-brand-orange/20 bg-brand-orange/5 rounded-2xl">
            <h4 className="text-brand-orange font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles size={20} />
              The Decentralized Cloud Revolution
            </h4>
            <p className="text-slate-300 leading-relaxed text-sm">
              Today's web runs on centralized servers owned by giant corporations. When you deploy a "serverless function" on AWS or Google Cloud, you pay a "cloud tax," lock yourself into their ecosystem, and risk downtime, censorship, or silent code updates. 
              <strong className="text-white"> Sui-Functions</strong> replaces this model. It lets you run secure, serverless scripts on a decentralized network with no central middlemen, completely transparent auditing, and direct blockchain integration.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Why Sui-Functions?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange" />
                  No Web2 Middlemen
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eliminate monthly bills, account suspensions, and vendor lock-in. Pay only for the exact computing resources you use directly via Sui tokens.
                </p>
              </div>
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  Tamper-proof Logic
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your code lives immutably on Walrus storage. Nobody—not even the hosting operator—can secretly modify the script once it is deployed.
                </p>
              </div>
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue" />
                  Audited & Secure
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A transparent community audit process verifies that scripts don't leak private keys or execute malicious actions before they can run on nodes.
                </p>
              </div>
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Connected to Smart Contracts
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trigger serverless logic instantly when a transaction completes on the Sui blockchain, and feed the results straight back to the contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      developer: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-brand-orange">Sui-Functions</strong> is a decentralized, zero-trust serverless execution framework built on the Sui Network and Walrus Storage. It enables the registration, auditing, event-driven execution, and verification of serverless scripts inside lightweight, secure V8 isolate sandboxes.
          </p>

          <div className="bg-[#0b0c15] border border-brand-card-border p-5 rounded-2xl space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Core Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-brand-dark rounded-xl border border-brand-card-border">
                <div className="text-slate-500 mb-1">Runtime Engine</div>
                <div className="text-brand-orange font-bold">V8 Isolate (isolated-vm)</div>
              </div>
              <div className="p-3 bg-brand-dark rounded-xl border border-brand-card-border">
                <div className="text-slate-500 mb-1">Storage Layer</div>
                <div className="text-brand-blue font-bold">Walrus Storage Blobs</div>
              </div>
              <div className="p-3 bg-brand-dark rounded-xl border border-brand-card-border">
                <div className="text-slate-500 mb-1">State & Events</div>
                <div className="text-[#10b981] font-bold">Sui Smart Contracts</div>
              </div>
              <div className="p-3 bg-brand-dark rounded-xl border border-brand-card-border">
                <div className="text-slate-500 mb-1">Sandbox Limits</div>
                <div className="text-amber-400 font-bold">128MB Heap, 5s Execution</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white">How it works: The Off-Chain Loop</h4>
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2.5">
              <li>
                <span className="text-white font-semibold">Event Interception:</span> A client contract invokes the `call_function` entry point in the Sui-Functions Move registry, emitting an `ExecutionTriggered` event.
              </li>
              <li>
                <span className="text-white font-semibold">Blob Resolution:</span> An off-chain daemon listener detects the event, reads the corresponding project metadata, and retrieves the function's JavaScript source code from Walrus using its cryptographic Blob ID.
              </li>
              <li>
                <span className="text-white font-semibold">Sandboxed Execution:</span> The runner instantiates a secure V8 isolate, injects the request parameters (input payload), runs the script under a 5-second timeout, and computes the result.
              </li>
              <li>
                <span className="text-white font-semibold">Cryptographic Commit:</span> The runner signs the execution proof and calls the `submit_result` Move contract function, committing the response data on-chain and emitting an `ExecutionCompleted` event.
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'pillars',
      title: 'The Three Pillars',
      category: 'Overview',
      icon: Layers,
      keywords: ['pillars', 'architecture', 'walrus', 'sui', 'v8', 'isolate', 'structure', 'how it works'],
      layman: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            Think of Sui-Functions as a secure, automatic vending machine. It has three core parts that work together to make sure you get exactly what you order without having to trust anyone:
          </p>

          <div className="space-y-4">
            {/* Pillar 1 */}
            <div className="flex gap-4 p-5 bg-brand-card border border-brand-card-border rounded-2xl">
              <div className="p-3 bg-brand-orange/10 border border-brand-orange/30 rounded-xl h-fit text-brand-orange">
                <Settings size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base mb-1">Pillar 1: The Coordinator (Sui Smart Contract)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This acts like the button pad on a vending machine. When you push a button (invoke a transaction), it registers the request, verifies your identity, logs the action publicly, and handles payments. It's the central brain that coordinates everything.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex gap-4 p-5 bg-brand-card border border-brand-card-border rounded-2xl">
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-xl h-fit text-brand-blue">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base mb-1">Pillar 2: The Vault (Walrus Storage)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This is the secure vault inside the machine where the recipes (your JavaScript code) are locked away. Because it uses Walrus, nobody can reach in and secretly swap your high-quality recipe for a bad one. Once stored, it's permanent and verified.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex gap-4 p-5 bg-brand-card border border-brand-card-border rounded-2xl">
              <div className="p-3 bg-brand-green/10 border border-brand-green/30 rounded-xl h-fit text-brand-green">
                <Cpu size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base mb-1">Pillar 3: The Robotic Worker (V8 Sandbox Runner)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This is the mechanical arm that reads the recipe from the vault, grabs the ingredients (your input data), cooks the dish in a clean sandbox, and hands it back to you. The arm does not have access to the outside world, ensuring it cannot steal or leak your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      developer: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            Sui-Functions decouples state coordination, logic storage, and isolated execution into three independent, verifiable layers:
          </p>

          <div className="space-y-6">
            {/* Pillar 1 Details */}
            <div className="bg-brand-card border border-brand-card-border p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 text-[10px] bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-bold uppercase rounded-lg font-mono">
                  Pillar 1
                </span>
                <span className="text-xs text-slate-500 font-mono">sources/trigger.move</span>
              </div>
              <h4 className="text-lg font-bold text-white">Sui Smart Contract Coordination</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The smart contract registry acts as the state machine. It manages project boundaries (`Project` struct), function routing (`FunctionMetadata` mapping), permission verification, auditor credentials (`GLOBAL_AUDITOR_BLOB_ID`), and event-based dispatching. It guarantees that a function status resets to `STATUS_PENDING` on code update, requiring a re-audit to run.
              </p>
            </div>

            {/* Pillar 2 Details */}
            <div className="bg-brand-card border border-brand-card-border p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 text-[10px] bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-bold uppercase rounded-lg font-mono">
                  Pillar 2
                </span>
                <span className="text-xs text-slate-500 font-mono">Walrus Storage Network</span>
              </div>
              <h4 className="text-lg font-bold text-white">Immutable Logic Storage (Walrus Blobs)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                JavaScript script files are uploaded directly to the Walrus decentralized network, generating a unique cryptographic Blob ID. Because Walrus storage is immutable, the runner is guaranteed to fetch and execute the exact byte-for-byte source code registered by the developer on-chain, eliminating malicious middle-man upgrades.
              </p>
            </div>

            {/* Pillar 3 Details */}
            <div className="bg-brand-card border border-brand-card-border p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 text-[10px] bg-brand-green/10 border border-brand-green/30 text-brand-green font-bold uppercase rounded-lg font-mono">
                  Pillar 3
                </span>
                <span className="text-xs text-slate-500 font-mono">runner/vm_manager.ts</span>
              </div>
              <h4 className="text-lg font-bold text-white">Secure V8 Sandbox Runner</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The off-chain daemon listener uses Google V8 isolates (`isolated-vm` in Node.js) to compile and execute scripts. Each script is allocated a strict 128MB memory limit and a 5000ms CPU timeout. Standard dangerous APIs (such as filesystem access, raw processes, or environment secrets) are omitted. A secure HTTP fetch shim is provided to make external web calls, while console.log is intercepted and routed to the secure audit logs.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quickstart',
      title: 'Deployment & Setup (A-Z)',
      category: 'Developer Guide',
      icon: Terminal,
      keywords: ['quickstart', 'setup', 'cli', 'deploy', 'upload', 'run', 'runner', 'listener', 'commands', 'npm', 'epochs'],
      layman: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            Deploying a function takes less than 5 minutes! Here is the step-by-step path to register your script and see it execute live on the decentralized web:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold font-mono text-sm shrink-0">
                1
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">Write your Serverless Code</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Write your logic in standard JavaScript. Use `return` statements to pass values back. For example, a script that checks if a discount coupon is valid.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold font-mono text-sm shrink-0">
                2
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">Upload to the Vault (Walrus)</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use the upload tool in your Sui-Functions dashboard. Select your `.js` file and upload it. The dashboard will communicate with Walrus storage nodes and return a unique **Blob ID** string.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold font-mono text-sm shrink-0">
                3
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">Register on the Smart Contract</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  On the dashboard, create a new function under your project workspace. Enter the function name (e.g., "Coupon Checker"), paste the **Blob ID**, and sign the transaction with your Sui wallet.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold font-mono text-sm shrink-0">
                4
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">Approve & Execute!</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Once registered, the auditor checks the script. Once verified, external projects can trigger your function anytime, and the worker nodes will execute the code and output the verified results on-chain!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      developer: (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 1: Write and Upload Function Code to Walrus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your function should be standard JavaScript with ES6 support, executing inside an implicit async IIFE context. You can upload using either the HTTP PUT API (recommended for client frontends) or the Walrus CLI tool:
            </p>

            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden">
              <div className="bg-[#0b0c14] px-4 py-2 border-b border-brand-card-border/60 flex justify-between items-center text-xs font-mono text-slate-300">
                <span>walrus-upload.sh</span>
                <button 
                  onClick={() => handleCopy('walrus store ./hello_world.js --epochs 180', 'cmd-walrus')}
                  className="hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {copiedId === 'cmd-walrus' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === 'cmd-walrus' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-slate-350 bg-[#07080D] overflow-x-auto leading-relaxed">
                <div className="text-slate-500"># Upload a file to Walrus storage for 180 epochs</div>
                <div>$ walrus store ./hello_world.js --epochs 180</div>
                <div className="text-[#10b981] mt-2">✓ Successfully uploaded. Blob ID: W7VwX2jrIHLoY6kve6zLKR9JvaF30k_2tql-g6qcNxQ</div>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Alternatively, you can PUT the raw file data directly to the testnet publisher endpoint:
            </p>
            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden font-mono text-xs text-slate-350 p-4 bg-[#07080D]">
              <span className="text-brand-blue font-bold">PUT</span> https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 2: Register the Function On-Chain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register the Walrus Blob ID in your project workspace on the Sui testnet smart contract. You can do this directly from the Dashboard by clicking "Add Function", or via a Sui Move transaction block:
            </p>

            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden">
              <div className="bg-[#0b0c14] px-4 py-2 border-b border-brand-card-border/60 flex justify-between items-center text-xs font-mono text-slate-300">
                <span>sui-register.ts</span>
                <button 
                  onClick={() => handleCopy(`const tx = new Transaction();
tx.moveCall({
  target: '0x53636064fefacacc924df2766cd2e4678456d3163373ee084227e638aae3e76e::trigger::register_function',
  arguments: [
    tx.object(PROJECT_ID),
    tx.pure.string("Hello World"),
    tx.pure.string("W7VwX2jrIHLoY6kve6zLKR9JvaF30k_2tql-g6qcNxQ")
  ]
});`, 'cmd-register')}
                  className="hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {copiedId === 'cmd-register' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === 'cmd-register' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-slate-350 bg-[#07080D] overflow-x-auto leading-relaxed">
                <span className="text-brand-blue">const</span> tx = <span className="text-brand-orange">new</span> Transaction();<br />
                tx.moveCall({'{'}<br />
                &nbsp;&nbsp;target: <span className="text-emerald-400">"0x5363...::trigger::register_function"</span>,<br />
                &nbsp;&nbsp;arguments: [<br />
                &nbsp;&nbsp;&nbsp;&nbsp;tx.object(PROJECT_ID),<br />
                &nbsp;&nbsp;&nbsp;&nbsp;tx.pure.string(<span className="text-emerald-400">"Hello World"</span>),<br />
                &nbsp;&nbsp;&nbsp;&nbsp;tx.pure.string(<span className="text-emerald-400">"W7VwX2jrIHLoY6kve6zLKR9JvaF30k_2tql-g6qcNxQ"</span>)<br />
                &nbsp;&nbsp;]<br />
                {'});'}
              </div>
            </div>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs leading-relaxed">
              <strong>💡 Status Reset:</strong> Any registration or update resets the function status to `STATUS_PENDING` (value: 0). Before a function can be executed by the daemon worker runner, it must be verified by the designated auditor, moving to `STATUS_VERIFIED` (value: 1).
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 3: Setup & Run the Off-Chain Daemon Listener</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The daemon listener coordinates off-chain workers. It monitors the event bus, fetches Walrus blobs, runs V8 isolates, and submits results back on-chain.
            </p>

            <h5 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">1. Create a `.env` file inside the `runner/` directory:</h5>
            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden font-mono text-xs text-slate-350 p-4 bg-[#07080D] space-y-1">
              <div>SUI_RPC_URL=https://fullnode.testnet.sui.io:443</div>
              <div>SUI_PRIVATE_KEY=suiprivkey1... <span className="text-slate-500"># Private key of the operator executing submits</span></div>
              <div>PACKAGE_ID=0x53636064fefacacc924df2766cd2e4678456d3163373ee084227e638aae3e76e</div>
              <div>AUDITOR_KEY=0x66e2da5161ad3a89e2c45f4d8a571ea38de1f4c718</div>
            </div>

            <h5 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">2. Install dependencies and start listening:</h5>
            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden">
              <div className="bg-[#0b0c14] px-4 py-2 border-b border-brand-card-border/60 flex justify-between items-center text-xs font-mono text-slate-300">
                <span>Terminal</span>
                <button 
                  onClick={() => handleCopy('cd runner\nnpm install\nnpm run listen', 'cmd-runner-boot')}
                  className="hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {copiedId === 'cmd-runner-boot' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === 'cmd-runner-boot' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-slate-350 bg-[#07080D] overflow-x-auto leading-relaxed">
                <div>$ cd runner</div>
                <div>$ npm install</div>
                <div>$ npm run listen</div>
                <div className="text-blue-400 mt-2">=== Sui-Functions Event Listener Booted ===</div>
                <div className="text-slate-500">Listening to events on package: 0x53636064fefacacc924df2766cd2e4678456d3163373ee084227e638aae3e76e</div>
                <div className="text-emerald-400">📡 Listening for execution trigger requests...</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'integration',
      title: 'Connecting Externally (A-Z)',
      category: 'Developer Guide',
      icon: Link,
      keywords: ['integration', 'connect', 'storefront', 'sdk', 'event', 'listener', 'listen', 'trigger', 'call_function', 'external'],
      layman: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            Sui-Functions behaves exactly like standard Web2 APIs, but they are fully sovereign and decentralized! Connecting them to your own frontend apps, Web3 storefronts, or backend services is highly intuitive:
          </p>

          <div className="space-y-4">
            <div className="p-5 bg-brand-card border border-brand-card-border rounded-xl">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <Ticket className="text-brand-orange" size={20} />
                Example 1: E-commerce Coupon Validation
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Suppose you run an online storefront. Instead of managing coupon logic on a central server, you deploy the coupon rules script once to Walrus. When a user checks out, your app requests coupon verification on the blockchain. The nodes validate it automatically and return the percentage discount directly to the UI, securely adjusting the total price.
              </p>
              <div className="w-full flex justify-end">
                <span className="text-[11px] text-brand-orange font-semibold flex items-center gap-1">
                  Check out the code in the Code Playground section <ArrowRight size={12} />
                </span>
              </div>
            </div>

            <div className="p-5 bg-brand-card border border-brand-card-border rounded-xl">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <DollarSign className="text-brand-blue" size={20} />
                Example 2: Sovereign Price Feed Oracles
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Decentralized Finance (DeFi) platforms need real-time asset pricing. You can write a short function that pulls SUI/USD exchange rates from public API feeds, run it every 20 seconds, verify the values securely inside sandbox isolates, and feed the price directly into your smart contracts, keeping valuations completely up to date.
              </p>
            </div>
          </div>
        </div>
      ),
      developer: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            Integrating Sui-Functions into external applications consists of two steps: triggering execution via a smart contract transaction, and querying the event log for the cryptographic completion proof.
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">1. Triggering Functions from Client Applications</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a Sui Transaction Block that performs a `moveCall` to `trigger::call_function`. Pass the target `project_id`, the registered name of the function, and your parameters formatted as a JSON string:
            </p>

            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden">
              <div className="bg-[#0b0c14] px-4 py-2 border-b border-brand-card-border/60 flex justify-between items-center text-xs font-mono text-slate-300">
                <span>trigger_call.ts</span>
                <button 
                  onClick={() => handleCopy(`import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
tx.moveCall({
  target: '0x5363...::trigger::call_function',
  arguments: [
    tx.object(PROJECT_ID),
    tx.pure.string("Coupon Validator"),
    tx.pure.string(JSON.stringify({ coupon: "SUI_LAMBDA" }))
  ]
});

// Await wallet signature and transaction execution
const result = await signAndExecuteTransaction({ transaction: tx });`, 'js-trigger-call')}
                  className="hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {copiedId === 'js-trigger-call' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === 'js-trigger-call' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-[#ABB2BF] bg-[#07080D] overflow-x-auto leading-relaxed">
                <span className="text-[#C678DD]">const</span> tx = <span className="text-[#C678DD]">new</span> <span className="text-[#E5C07B]">Transaction</span>();<br />
                tx.moveCall({'{'}<br />
                &nbsp;&nbsp;target: <span className="text-[#98C379]">"0x5363...::trigger::call_function"</span>,<br />
                &nbsp;&nbsp;arguments: [<br />
                &nbsp;&nbsp;&nbsp;&nbsp;tx.object(PROJECT_ID),<br />
                &nbsp;&nbsp;&nbsp;&nbsp;tx.pure.string(<span className="text-[#98C379]">"Coupon Validator"</span>),<br />
                &nbsp;&nbsp;&nbsp;&nbsp;tx.pure.string(<span className="text-[#E5C07B]">JSON</span>.stringify({'{'} coupon: <span className="text-[#98C379]">"SUI_LAMBDA"</span> {'}'}))<br />
                &nbsp;&nbsp;]<br />
                {'});'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">2. Listening for Asynchronous Execution Results</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Because V8 execution is performed off-chain, the transaction submits a request and completes asynchronously. Your frontend application must query or subscribe to the `ExecutionCompleted` event type to receive the final returned data:
            </p>

            <div className="bg-[#08090e] border border-brand-card-border rounded-xl overflow-hidden">
              <div className="bg-[#0b0c14] px-4 py-2 border-b border-brand-card-border/60 flex justify-between items-center text-xs font-mono text-slate-300">
                <span>poll_events.ts</span>
                <button 
                  onClick={() => handleCopy(`const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

const events = await client.queryEvents({
  query: {
    MoveModule: {
      package: PACKAGE_ID,
      module: 'trigger'
    }
  },
  limit: 10,
  order: 'descending'
});

const completedEvent = events.data.find(event => 
  event.type.includes('ExecutionCompleted') &&
  event.parsedJson.function_name === 'Coupon Validator' &&
  event.parsedJson.project_id === PROJECT_ID
);

if (completedEvent) {
  const result = JSON.parse(completedEvent.parsedJson.result_data);
  console.log("Returned Payload:", result); // { valid: true, discount: 0.5 }
}`, 'js-poll-events')}
                  className="hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {copiedId === 'js-poll-events' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === 'js-poll-events' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-[#ABB2BF] bg-[#07080D] overflow-x-auto leading-relaxed">
                <span className="text-[#C678DD]">const</span> events = <span className="text-[#C678DD]">await</span> client.queryEvents({'{'}<br />
                &nbsp;&nbsp;query: {'{'} MoveModule: {'{'} package: PACKAGE_ID, module: <span className="text-[#98C379]">'trigger'</span> {'}'} {'}'},<br />
                &nbsp;&nbsp;limit: <span className="text-[#D19A66]">10</span>,<br />
                &nbsp;&nbsp;order: <span className="text-[#98C379]">'descending'</span><br />
                {'});'}<br /><br />
                <span className="text-[#C678DD]">const</span> completed = events.data.find(e =&gt; e.type.includes(<span className="text-[#98C379]">'ExecutionCompleted'</span>));<br />
                <span className="text-[#C678DD]">if</span> (completed) {'{'}<br />
                &nbsp;&nbsp;<span className="text-[#C678DD]">const</span> payload = <span className="text-[#E5C07B]">JSON</span>.parse(completed.parsedJson.result_data);<br />
                &nbsp;&nbsp;<span className="text-[#E5C07B]">console</span>.log(payload); <span className="text-[#5C6370]">// {"{ valid: true, discount: 0.5 }"}</span><br />
                {'}'}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'playground',
      title: 'Code Playground & Sandbox API',
      category: 'Developer Guide',
      icon: Code2,
      keywords: ['playground', 'code', 'snippet', 'coupon', 'oracle', 'hello world', 'example', 'fetch', 'sandbox', 'globalthis', 'console'],
      layman: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed">
            Here are three sample scripts that demonstrate the flexibility of Sui-Functions serverless isolates. You can copy these directly to test execution on your own runner:
          </p>

          <div className="space-y-5">
            {/* Coupon Validator */}
            <div className="bg-brand-card border border-brand-card-border p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Ticket size={16} className="text-brand-orange" />
                  coupon_validator.js
                </h4>
                <span className="text-[10px] bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-mono rounded px-2 py-0.5">Coupon Validation</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Accepts a user-supplied coupon code string inside the input parameters. If it matches a predefined list, it applies a discount and returns a success payload; otherwise, it rejects it.
              </p>
              <div className="bg-brand-dark p-3.5 rounded-xl border border-brand-card-border font-mono text-xs text-slate-350 overflow-x-auto leading-relaxed">
                <div>const input = globalThis.input || {};</div>
                <div>const coupon = (input.coupon || "").trim().toUpperCase();</div>
                <div className="text-slate-500 mt-1">// ... validation matches ...</div>
                <div className="text-blue-400">return &#123; valid: true, discount: 0.5, code: "SUI_LAMBDA" &#125;;</div>
              </div>
            </div>

            {/* Price Oracle */}
            <div className="bg-brand-card border border-brand-card-border p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <DollarSign size={16} className="text-brand-blue" />
                  sui_usd_oracle.js
                </h4>
                <span className="text-[10px] bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-mono rounded px-2 py-0.5">Price Feed Oracle</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Performs a secure external API call using the sandbox's customized `fetch` shim. It queries three separate public APIs sequentially as fallbacks, parses the spot price, and returns it.
              </p>
              <div className="bg-brand-dark p-3.5 rounded-xl border border-brand-card-border font-mono text-xs text-slate-350 overflow-x-auto leading-relaxed">
                <div>const res = await fetch("https://api.coinbase.com/v2/prices/SUI-USD/spot");</div>
                <div>const data = await res.json();</div>
                <div className="text-blue-400">return &#123; asset: "SUI/USD", price: parseFloat(data.data.amount) &#125;;</div>
              </div>
            </div>
          </div>
        </div>
      ),
      developer: (
        <div className="space-y-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed text-sm">
            Sui-Functions sandboxes run inside a secure V8 isolate wrapper that injects custom global shims. Your functions can interact with the host and network using these standard APIs:
          </p>

          {/* Sandbox Global API References */}
          <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl space-y-3 font-mono text-xs">
            <h4 className="text-white font-bold text-sm border-b border-brand-card-border pb-2">Global Sandbox Environment Reference</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-brand-orange font-bold font-mono">globalThis.input</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  JSON-parsed request parameters passed by the caller (defaults to an empty object `{}`).
                </div>
              </div>
              <div>
                <div className="text-brand-orange font-bold font-mono">globalThis.inputData</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  The raw string representation of the input parameters, allowing custom parser implementations.
                </div>
              </div>
              <div>
                <div className="text-brand-blue font-bold font-mono">globalThis.fetch(url)</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Shimmed fetch client. Resolves asynchronously via the host network. Exposes `.text()` and `.json()` helper methods.
                </div>
              </div>
              <div>
                <div className="text-[#10b981] font-bold font-mono">globalThis.console.log(...args)</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Shimmed log writer. Transmits stringified logs to the host machine for real-time audit tracing, prefixing outputs with `[VM]`.
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Code Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Full-Featured Code Snippets</h3>
            
            {/* Snippet 1: Oracle */}
            <div className="bg-[#08090e] border border-brand-card-border rounded-2xl overflow-hidden shadow-card-glow">
              <div className="bg-[#0b0c14] px-5 py-3.5 border-b border-brand-card-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-[#0f101a] px-3.5 py-1.5 rounded-lg border border-brand-card-border/50 text-xs font-semibold text-slate-200 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  sui_usd_oracle.js
                </div>
                <button 
                  onClick={() => handleCopy(`// Fetch spot price from Coinbase and CoinGecko
async function fetchPrice() {
  try {
    const res = await fetch("https://api.coinbase.com/v2/prices/SUI-USD/spot");
    const data = await res.json();
    return parseFloat(data.data.amount);
  } catch (e) {
    console.log("Coinbase failed, falling back to CoinGecko...");
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd");
    const data = await res.json();
    return data.sui.usd;
  }
}

try {
  const price = await fetchPrice();
  console.log("Oracle fetch success: $" + price);
  return { status: "success", asset: "SUI/USD", price, timestamp: new Date().toISOString() };
} catch (err) {
  return { status: "error", message: err.message };
}`, 'code-oracle')}
                  className="text-xs text-slate-400 hover:text-brand-orange flex items-center gap-1 transition-colors font-semibold"
                >
                  {copiedId === 'code-oracle' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === 'code-oracle' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="p-6 font-mono text-xs leading-relaxed overflow-x-auto text-[#ABB2BF] bg-[#07080D]">
                <div><span className="text-[#8A95A5] italic">// Live SUI/USD price oracle with resilient APIs</span></div>
                <div><span className="text-[#C678DD]">async function</span> <span className="text-[#61AFEF]">fetchPrice</span>() {'{'}</div>
                <div>&nbsp;&nbsp;<span className="text-[#C678DD]">try</span> {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#C678DD]">const</span> res = <span className="text-[#C678DD]">await</span> <span className="text-[#56B6C2]">fetch</span>(<span className="text-[#98C379]">"https://api.coinbase.com/v2/prices/SUI-USD/spot"</span>);</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#C678DD]">const</span> data = <span className="text-[#C678DD]">await</span> res.json();</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#C678DD]">return</span> <span className="text-[#56B6C2]">parseFloat</span>(data.data.amount);</div>
                <div>&nbsp;&nbsp;{'}'} <span className="text-[#C678DD]">catch</span> (e) {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#E5C07B]">console</span>.log(<span className="text-[#98C379]">"Coinbase API failed, falling back to CoinGecko..."</span>);</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#C678DD]">const</span> res = <span className="text-[#C678DD]">await</span> <span className="text-[#56B6C2]">fetch</span>(<span className="text-[#98C379]">"https://api.coingecko.com/..."</span>);</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#C678DD]">const</span> data = <span className="text-[#C678DD]">await</span> res.json();</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#C678DD]">return</span> data.sui.usd;</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</div>
                <div>{'}'}</div>
                <div className="mt-2">&nbsp;&nbsp;<span className="text-[#C678DD]">const</span> price = <span className="text-[#C678DD]">await</span> <span className="text-[#61AFEF]">fetchPrice</span>();</div>
                <div>&nbsp;&nbsp;<span className="text-[#C678DD]">return</span> {'{'} status: <span className="text-[#98C379]">"success"</span>, asset: <span className="text-[#98C379]">"SUI/USD"</span>, price {'}'};</div>
              </div>
            </div>

            {/* Snippet 2: Coupon */}
            <div className="bg-[#08090e] border border-brand-card-border rounded-2xl overflow-hidden shadow-card-glow">
              <div className="bg-[#0b0c14] px-5 py-3.5 border-b border-brand-card-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-[#0f101a] px-3.5 py-1.5 rounded-lg border border-brand-card-border/50 text-xs font-semibold text-slate-200 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  coupon_validator.js
                </div>
                <button 
                  onClick={() => handleCopy(`const input = globalThis.input || {};
const coupon = (input.coupon || "").trim().toUpperCase();

console.log("Validating coupon code: " + coupon);

if (coupon === "SUI_LAMBDA") {
  return { valid: true, discount: 0.5, code: "SUI_LAMBDA" };
}
if (coupon === "V8_SANDBOX") {
  return { valid: true, discount: 0.3, code: "V8_SANDBOX" };
}
return { valid: false, discount: 0, reason: "Coupon code not found in workspace rules" };`, 'code-coupon')}
                  className="text-xs text-slate-400 hover:text-brand-orange flex items-center gap-1 transition-colors font-semibold"
                >
                  {copiedId === 'code-coupon' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === 'code-coupon' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="p-6 font-mono text-xs leading-relaxed overflow-x-auto text-[#ABB2BF] bg-[#07080D]">
                <div><span className="text-[#C678DD]">const</span> input = globalThis.input || {'{}'};</div>
                <div><span className="text-[#C678DD]">const</span> coupon = (input.coupon || <span className="text-[#98C379]">""</span>).trim().toUpperCase();</div>
                <div className="mt-2"><span className="text-[#E5C07B]">console</span>.log(<span className="text-[#98C379]">"Validating coupon: "</span> + coupon);</div>
                <div className="mt-2"><span className="text-[#C678DD]">if</span> (coupon === <span className="text-[#98C379]">"SUI_LAMBDA"</span>) {'{'}</div>
                <div>&nbsp;&nbsp;<span className="text-[#C678DD]">return</span> {'{'} valid: <span className="text-[#D19A66]">true</span>, discount: <span className="text-[#D19A66]">0.5</span>, code: <span className="text-[#98C379]">"SUI_LAMBDA"</span> {'}'};</div>
                <div>{'}'}</div>
                <div><span className="text-[#C678DD]">return</span> {'{'} valid: <span className="text-[#D19A66]">false</span>, discount: <span className="text-[#D19A66]">0</span> {'}'};</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'limits',
      title: 'Limits & Troubleshooting',
      category: 'Reference',
      icon: HelpCircle,
      keywords: ['limits', 'troubleshooting', 'error', 'fails', 'timeout', 'pending', 'status', 'audit', 'memory', 'cpu'],
      layman: (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>

            <div className="space-y-3">
              <div className="border border-brand-card-border bg-brand-card p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  Why is my function stuck in "Pending Audit" state?
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every time you register or update a script, the security system locks it in "Pending Audit" status. Before the nodes will execute it, a designated auditor must review the script and verify that it does not contain malicious code or lock up resources. Once approved, the status automatically updates to "Verified".
                </p>
              </div>

              <div className="border border-brand-card-border bg-brand-card p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  What are the sandbox memory and CPU limits?
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To keep runner nodes running efficiently, each serverless function gets **128 megabytes of memory** and a maximum **5 seconds of execution time**. If a script loops forever or uses too much memory, the sandbox will terminate it automatically and return a timeout error.
                </p>
              </div>

              <div className="border border-brand-card-border bg-brand-card p-4 rounded-xl">
                <h5 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  Can my script access the runner's disk or file system?
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No. The isolated runner sandbox runs in a zero-privilege V8 container. It cannot view the host's files, load external files from disk, or access system environment variables, ensuring absolute security.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      developer: (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Technical Sandbox Limits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google V8 Isolate sandboxes enforce strict boundaries to prevent denial-of-service (DoS) attacks, memory starvation, and host compromise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl space-y-1">
                <div className="text-brand-orange font-bold">Memory Bounds</div>
                <div className="text-[11px] text-slate-400">128 MB heap allocation limit per isolate context.</div>
              </div>
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl space-y-1">
                <div className="text-brand-blue font-bold">CPU Timeout</div>
                <div className="text-[11px] text-slate-400">5000 milliseconds limit on execution threads.</div>
              </div>
              <div className="bg-brand-card border border-brand-card-border p-4 rounded-xl space-y-1">
                <div className="text-[#10b981] font-bold">Thread Model</div>
                <div className="text-[11px] text-slate-400">Single-threaded event loop, non-blocking shims only.</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Troubleshooting Matrix</h3>
            
            <div className="border border-brand-card-border rounded-xl overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-brand-card border-b border-brand-card-border text-slate-300">
                    <th className="p-3">Error / Status</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Remedy / Action</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400 divide-y divide-brand-card-border">
                  <tr>
                    <td className="p-3 text-brand-orange font-bold">EFunctionNotFound</td>
                    <td className="p-3 leading-relaxed">The called function name is not registered in the Sui project metadata.</td>
                    <td className="p-3 leading-relaxed">Verify spelling inside the transaction call and ensure it is registered on-chain.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-orange font-bold">STATUS_PENDING (0)</td>
                    <td className="p-3 leading-relaxed">Function was recently created or updated and requires an audit.</td>
                    <td className="p-3 leading-relaxed">Review the script using the Walrus Auditor tool and submit verification.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-orange font-bold">Execution timeout exceeded</td>
                    <td className="p-3 leading-relaxed">The script took longer than 5 seconds to return or resolve a promise.</td>
                    <td className="p-3 leading-relaxed">Optimize async loops, reduce remote HTTP hops, or use parallel fetches.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-orange font-bold">Isolate memory limit exceeded</td>
                    <td className="p-3 leading-relaxed">The VM exceeded the 128MB limit (e.g. infinite array push).</td>
                    <td className="p-3 leading-relaxed">Avoid storing large object arrays in memory. Keep payloads small.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }
  ], [copiedId]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(sec => 
      sec.title.toLowerCase().includes(query) ||
      sec.category.toLowerCase().includes(query) ||
      sec.keywords.some(kw => kw.includes(query))
    );
  }, [sections, searchQuery]);

  // Navigate between sections linearly
  const activeIndex = sections.findIndex(s => s.id === activeSectionId);
  const nextSection = activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null;
  const prevSection = activeIndex > 0 ? sections[activeIndex - 1] : null;

  const currentSection = sections.find(s => s.id === activeSectionId) || sections[0];

  return (
    <div className="w-full text-slate-100 flex flex-col min-h-screen">
      {/* Top Banner / Breadcrumb */}
      {!isDashboardView && (
        <div className="bg-[#0b0c15]/60 border-b border-brand-card-border/60 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToLanding} 
              className="text-xs font-semibold text-slate-400 hover:text-brand-orange transition-colors flex items-center gap-1.5 bg-brand-card border border-brand-card-border px-3 py-1.5 rounded-lg"
            >
              <ChevronLeft size={14} />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-500">/</span>
            <div className="flex items-center gap-2 font-semibold text-white">
              <BookOpen size={16} className="text-brand-orange animate-pulse" />
              <span>Documentation Portal</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-brand-dark/50 px-3 py-1.5 rounded-lg border border-brand-card-border/40">
            Sovereign Serverless Protocol <span className="text-brand-orange">v1.0.0</span>
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar + Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search guides, APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/60 border border-brand-card-border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-brand-orange/60 transition-colors font-sans placeholder-slate-500"
            />
          </div>

          {/* Sidebar Menu Panel */}
          <div className="bg-[#08090e]/80 border border-brand-card-border rounded-2xl p-4 space-y-2 backdrop-blur-md lg:sticky lg:top-24">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono px-3">
              Sections
            </span>
            <div className="space-y-1 mt-2">
              {filteredSections.map(sec => {
                const Icon = sec.icon;
                const isActive = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold transition-all duration-200 group ${
                      isActive 
                        ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-orange-glow' 
                        : 'text-slate-400 hover:bg-brand-card hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={`transition-transform duration-200 ${isActive ? 'scale-110 text-brand-orange' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1 truncate">{sec.title}</span>
                    <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-500 ${isActive ? 'text-brand-orange opacity-100' : ''}`} />
                  </button>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching documentation found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Documentation Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Content Header Card */}
          <div className="bg-[#08090e]/80 border border-brand-card-border rounded-2xl p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-brand-orange uppercase font-bold tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                {currentSection.category}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">{currentSection.title}</h2>
            </div>

            {/* Global Audience Toggle */}
            <div className="bg-brand-dark/80 p-1.5 rounded-xl border border-brand-card-border flex items-center gap-1 w-full sm:w-fit shrink-0">
              <button
                onClick={() => setAudienceMode('layman')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  audienceMode === 'layman'
                    ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-orange-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>💡</span>
                <span className="truncate">Layman Metaphors</span>
              </button>
              <button
                onClick={() => setAudienceMode('developer')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  audienceMode === 'developer'
                    ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-orange-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>💻</span>
                <span className="truncate">Developer View</span>
              </button>
            </div>
          </div>

          {/* Content Body Panel */}
          <div className="bg-[#08090e]/80 border border-brand-card-border rounded-2xl p-6 md:p-8 backdrop-blur-md min-h-[400px]">
            {audienceMode === 'layman' ? currentSection.layman : currentSection.developer}
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center pt-4">
            {prevSection ? (
              <button
                onClick={() => setActiveSectionId(prevSection.id)}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-[#08090e]/80 border border-brand-card-border hover:border-brand-card-border/80 px-4 py-2.5 rounded-xl"
              >
                <ChevronLeft size={14} />
                <span>Prev: {prevSection.title}</span>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                onClick={() => setActiveSectionId(nextSection.id)}
                className="flex items-center gap-2 text-xs font-bold text-brand-orange hover:text-brand-orange/80 transition-colors bg-brand-orange/5 border border-brand-orange/20 hover:border-brand-orange/30 px-4 py-2.5 rounded-xl shadow-orange-glow"
              >
                <span>Next: {nextSection.title}</span>
                <ChevronRight size={14} />
              </button>
            ) : <div />}
          </div>
        </div>

      </div>
    </div>
  );
};
