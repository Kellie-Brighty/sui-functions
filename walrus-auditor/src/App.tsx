import { useState, useMemo } from 'react';
import { 
  Shield, 
  Zap, 
  Play, 
  Terminal, 
  RefreshCw, 
  Cpu, 
  Lock, 
  DownloadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  History, 
  Plus, 
  Database,
  Activity,
  Info
} from 'lucide-react';
import './App.css';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// Constants matching our deployed Move package on Sui Testnet
const PACKAGE_ID = '0x0a4c46e798a86a660b6c40d4be93d9b97bcad0183f97f4ffa2fc8a38dbf84086';

interface AuditLogEntry {
  id: string;
  txHash: string;
  functionName: string;
  blobId: string;
  timestamp: string;
  status: 'passed' | 'warning' | 'critical';
  gasUsed: number;
  durationMs: number;
  memoryMb: number;
}

const PRESET_BLOBS = [
  {
    id: 'sui_usd_oracle.js',
    name: 'Sui USD Price Oracle Feed',
    blobId: '0geOO6RLle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETj8',
    description: 'Queries decentralized price nodes and updates Sui-Functions price records.',
    code: `// Sui-Functions Oracle worker
async function handle(ctx) {
  console.log("Fetching current SUI price feed...");
  const resp = await ctx.fetch("https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd");
  const data = await resp.json();
  const price = data.sui.usd;
  console.log("SUI USD Price Resolved: $" + price);
  
  // Format transaction to update on-chain oracle
  const tx = new ctx.Transaction();
  tx.moveCall({
    target: "0x0a4c46e798a86a660b6c40d4be93d9b97bcad0183f97f4ffa2fc8a38dbf84086::trigger::update_oracle",
    arguments: [tx.pure.u64(Math.floor(price * 1000))]
  });
  
  return { price, txBytes: tx.serialize() };
}`
  },
  {
    id: 'coupon_validator.js',
    name: 'E-Commerce Coupon Validator',
    blobId: '3e9dOO6Rlle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETa4',
    description: 'Verifies dynamic pricing promotions and emits cryptographic sign-offs.',
    code: `// Sui-Functions Order Promotion Verification
async function handle(ctx) {
  const { cartTotal, promoCode } = ctx.inputData;
  console.log("Validating promotional code: " + promoCode);
  
  let discount = 0;
  if (promoCode === "SUI_SUMMER_2026") {
    discount = cartTotal * 0.15; // 15% discount
  } else if (promoCode === "VIP_DEFI_POWER") {
    discount = cartTotal * 0.25; // 25% discount
  }
  
  console.log("Calculated Discount: $" + discount);
  return {
    valid: discount > 0,
    newTotal: cartTotal - discount,
    discountApplied: discount
  };
}`
  },
  {
    id: 'malicious_test.js',
    name: 'Suspicious Storage Overload',
    blobId: '9w2dOO6Rlle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETr2',
    description: 'Simulated memory overload script to test sandbox constraints.',
    code: `// VM Isolation Sandboxing Test: Heap Overflow attempt
async function handle(ctx) {
  console.log("Running storage benchmark...");
  const leak = [];
  // Warning: Unrestricted loop allocating memory heap
  for (let i = 0; i < 9999999; i++) {
    leak.push(new Array(1000).fill("⚠️ INJECTING DATA STATE"));
  }
  return { success: true };
}`
  }
];

export default function App() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspector' | 'playground' | 'register'>('dashboard');

  // Input states
  const [blobIdInput, setBlobIdInput] = useState('0geOO6RLle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETj8');
  const [isFetchingBlob, setIsFetchingBlob] = useState(false);
  const [inspectCode, setInspectCode] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('sui_usd_oracle.js');

  // VM Simulator states
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simTimeLimit, setSimTimeLimit] = useState(200); // ms
  const [simMemoryLimit, setSimMemoryLimit] = useState(64); // MB
  const [customPlaygroundCode, setCustomPlaygroundCode] = useState(PRESET_BLOBS[0].code);

  // On-chain registration form states
  const [regProjId, setRegProjId] = useState('0xec806... (Sui Project Object ID)');
  const [regFuncName, setRegFuncName] = useState('Sui Price Monitor');
  const [regBlobId, setRegBlobId] = useState('0geOO6RLle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETj8');
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txSuccessDigest, setTxSuccessDigest] = useState('');

  // Static reports for presets
  const activePreset = useMemo(() => {
    return PRESET_BLOBS.find(p => p.blobId === blobIdInput) || {
      name: 'Custom Unlinked Blob',
      description: 'Newly resolved Walrus storage item',
      code: inspectCode || '// Custom downloaded code'
    };
  }, [blobIdInput, inspectCode]);

  // Mock static code analyzer results
  const staticAuditResults = useMemo(() => {
    const codeToCheck = activePreset.code || inspectCode;
    const hasFetch = codeToCheck.includes('fetch');
    const hasTx = codeToCheck.includes('Transaction');
    const hasInfiniteLoop = codeToCheck.includes('for (let i = 0;') || codeToCheck.includes('while(true)');
    
    return {
      memoryLeakScore: hasInfiniteLoop ? 'HIGH RISK' : 'SECURE',
      networkAccess: hasFetch ? 'RESTRICTED FETCH ALLOWED' : 'NO OUTBOUND NETWORK',
      stateMutation: hasTx ? 'MUTATES SUI BLOCKCHAIN' : 'READ-ONLY SANDBOX',
      v8SafetyScore: hasInfiniteLoop ? 35 : hasFetch ? 92 : 100,
      warnings: hasInfiniteLoop 
        ? ['Detected potential unbounded heap growth pattern. Wait times may exceed sandbox execution limits.']
        : []
    };
  }, [activePreset, inspectCode]);

  // Mock initial audit log data
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-081',
      txHash: '0x3a4f89d...0c8d',
      functionName: 'Sui USD Price Oracle Feed',
      blobId: '0geOO6RLle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETj8',
      timestamp: '2026-05-19 09:12:44',
      status: 'passed',
      gasUsed: 14200,
      durationMs: 42,
      memoryMb: 18.2
    },
    {
      id: 'AUD-080',
      txHash: '0x8b321a0...92a1',
      functionName: 'E-Commerce Coupon Validator',
      blobId: '3e9dOO6Rlle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETa4',
      timestamp: '2026-05-19 08:44:12',
      status: 'passed',
      gasUsed: 9800,
      durationMs: 14,
      memoryMb: 8.4
    },
    {
      id: 'AUD-079',
      txHash: '0xf428ab2...67b4',
      functionName: 'Suspicious Storage Overload',
      blobId: '9w2dOO6Rlle4NjptiPQ0ZHzaTAb0Ghi-VyW5tfHHETr2',
      timestamp: '2026-05-18 21:05:03',
      status: 'critical',
      gasUsed: 22000,
      durationMs: 200,
      memoryMb: 128.0
    }
  ]);

  // Simulated inspector loading
  const handleInspectBlob = (blobId: string) => {
    setIsFetchingBlob(true);
    setBlobIdInput(blobId);
    
    // Check if preset matches
    const preset = PRESET_BLOBS.find(p => p.blobId === blobId);
    
    setTimeout(() => {
      if (preset) {
        setInspectCode(preset.code);
      } else {
        setInspectCode(`// Custom Walrus Blob Resolution Result
// Hash: ${blobId}
async function handle(ctx) {
  console.log("Analyzing remote compiled payload...");
  const rawData = await ctx.getRawPayload();
  return { 
    valid: true,
    sizeBytes: rawData.length 
  };
}`);
      }
      setIsFetchingBlob(false);
    }, 1500);
  };

  // VM sandbox simulator trigger
  const runSimulatorVM = () => {
    setIsSimRunning(true);
    setSimLogs([]);
    
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(msg);
      setSimLogs([...logs]);
    };

    setTimeout(() => addLog("[VM] Initializing isolated-vm V8 context..."), 100);
    setTimeout(() => addLog(`[VM] Constraining resources: Max Memory = ${simMemoryLimit}MB, Timeout = ${simTimeLimit}ms`), 400);
    setTimeout(() => addLog("[VM] Injecting secure execution context APIs (fetch, Transaction, u64)..."), 700);
    
    setTimeout(() => {
      addLog("[VM] Downloading linked source bundle from Walrus Storage...");
      addLog(`[VM] Executed compile() successfully. Bytecode size: ${(customPlaygroundCode.length * 0.001).toFixed(2)} KB`);
    }, 1100);

    setTimeout(() => {
      addLog("[VM] Running handle() entry point...");
      if (customPlaygroundCode.includes('coingecko')) {
        addLog("Stdout: Fetching current SUI price feed...");
        addLog("Stdout: SUI USD Price Resolved: $1.84");
        addLog("Stdout: Emitting Tx update payload on-chain.");
        addLog("✅ VM execution completed successfully.");
      } else if (customPlaygroundCode.includes('promoCode')) {
        addLog("Stdout: Validating promotional code: SUI_SUMMER_2026");
        addLog("Stdout: Calculated Discount: $27.60");
        addLog("✅ VM execution completed successfully.");
      } else if (customPlaygroundCode.includes('leak.push')) {
        addLog("Stdout: Running storage benchmark...");
        addLog(`ALERT: Isolate exceeded restricted memory heap: ${simMemoryLimit}MB`);
        addLog("❌ VM execution failed: Out of Memory (OOM) threshold violated.");
      } else {
        addLog("Stdout: Custom execution completed.");
        addLog("✅ VM execution completed successfully.");
      }
      setIsSimRunning(false);
    }, 1800);
  };

  // Transaction execution to register function
  const handleRegisterOnChain = async () => {
    if (!currentAccount) {
      alert("Please connect your Sui wallet first!");
      return;
    }
    setTxSubmitting(true);
    setTxSuccessDigest('');
    
    try {
      const tx = new Transaction();
      // Target: packageId::trigger::register_function
      tx.moveCall({
        target: `${PACKAGE_ID}::trigger::register_function`,
        arguments: [
          tx.object(regProjId),
          tx.pure.string(regFuncName),
          tx.pure.string(regBlobId)
        ]
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            setTxSuccessDigest(result.digest);
            setTxSubmitting(false);
            
            // Append dynamic entry to audit logs table
            const newEntry: AuditLogEntry = {
              id: `AUD-0${auditLogs.length + 80}`,
              txHash: result.digest.substring(0, 12) + '...',
              functionName: regFuncName,
              blobId: regBlobId,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              status: 'passed',
              gasUsed: 13500,
              durationMs: 25,
              memoryMb: 6.2
            };
            setAuditLogs([newEntry, ...auditLogs]);
          },
          onError: (err) => {
            console.error("Move registration error:", err);
            alert(`Transaction failed: ${err.message || 'Unknown error'}`);
            setTxSubmitting(false);
          }
        }
      );
    } catch (e: any) {
      console.error(e);
      alert(`Could not sign transaction: ${e.message}`);
      setTxSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="grid-overlay"></div>
      
      {/* Sidebar Section */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">W</div>
            <div>
              <div className="brand-name">Walrus Auditor</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-orange)' }}>SUI-FUNCTIONS COPROCESSOR</div>
            </div>
          </div>
          
          <ul className="nav-list">
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Activity size={18} />
              Overview
            </li>
            <li 
              className={`nav-item ${activeTab === 'inspector' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inspector');
                handleInspectBlob(blobIdInput);
              }}
            >
              <Shield size={18} />
              Blob Inspector
            </li>
            <li 
              className={`nav-item ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={() => setActiveTab('playground')}
            >
              <Terminal size={18} />
              VM Telemetry Sandbox
            </li>
            <li 
              className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <Plus size={18} />
              Register Move Worker
            </li>
          </ul>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span className="pulse-dot pulse"></span>
              Sui Testnet Nodes Active
            </div>
          </div>
          <ConnectButton style={{ width: '100%' }} />
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-orange">Security Audit Hub</span>
            </div>
            <h1 className="page-title">
              {activeTab === 'dashboard' && "Sovereign Audit Panel"}
              {activeTab === 'inspector' && "Walrus Blob Inspector"}
              {activeTab === 'playground' && "VM Telemetry Playground"}
              {activeTab === 'register' && "Register On-Chain Function"}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && "Monitor storage integrity, trace coprocessor executions, and review sandbox constraints."}
              {activeTab === 'inspector' && "Retrieve javascript source bundles from Walrus Storage nodes and run static audit logs."}
              {activeTab === 'playground' && "Boot isolated-vm contexts and adjust execution resource bounds in real-time."}
              {activeTab === 'register' && "Link Walrus blob IDs to Move contracts to register unstoppable serverless logic."}
            </p>
          </div>
        </header>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Metics Grid */}
            <div className="dashboard-grid">
              <div className="glass-panel metric-card">
                <Shield size={24} className="metric-card-icon" style={{ color: 'var(--accent-orange)' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Blobs Audited</div>
                <div className="metric-card-value gradient-text">248</div>
                <div className="metric-card-label">● 100% Integrity Match</div>
              </div>
              <div className="glass-panel metric-card">
                <Cpu size={24} className="metric-card-icon" style={{ color: 'var(--accent-emerald)' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Workers</div>
                <div className="metric-card-value" style={{ color: 'var(--accent-emerald)' }}>18</div>
                <div className="metric-card-label">Avg Exec Time: 34ms</div>
              </div>
              <div className="glass-panel metric-card">
                <Database size={24} className="metric-card-icon" style={{ color: 'var(--accent-sui)' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Walrus Storage Nodes</div>
                <div className="metric-card-value" style={{ color: 'var(--accent-sui)' }}>32</div>
                <div className="metric-card-label">1.2 TB Replicated</div>
              </div>
              <div className="glass-panel metric-card">
                <Zap size={24} className="metric-card-icon" style={{ color: 'var(--accent-purple)' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cumulative Gas Saved</div>
                <div className="metric-card-value" style={{ color: 'var(--accent-purple)' }}>42.5 SUI</div>
                <div className="metric-card-label">Via Coprocessor Offloading</div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} /> Recent Audit Telemetry
                </h3>
                <span className="badge badge-sui">Epoch 24 Logs</span>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px' }}>Audit ID</th>
                      <th style={{ padding: '12px 16px' }}>Function Name</th>
                      <th style={{ padding: '12px 16px' }}>Walrus Blob ID</th>
                      <th style={{ padding: '12px 16px' }}>Time</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Resource Metrics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                          transition: 'background 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px', fontFamily: 'var(--mono)', fontSize: '12px' }}>{log.id}</td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{log.functionName}</td>
                        <td style={{ padding: '16px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {log.blobId.substring(0, 10)}...{log.blobId.substring(log.blobId.length - 8)}
                        </td>
                        <td style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{log.timestamp}</td>
                        <td style={{ padding: '16px' }}>
                          <span className={`badge ${
                            log.status === 'passed' ? 'badge-emerald' : log.status === 'warning' ? 'badge-orange' : 'badge-purple'
                          }`}>
                            {log.status === 'passed' && 'PASSED'}
                            {log.status === 'warning' && 'WARNING'}
                            {log.status === 'critical' && 'FAILED'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {log.durationMs}ms | {log.memoryMb}MB | {log.gasUsed} gas
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Inspector */}
        {activeTab === 'inspector' && (
          <div className="detail-grid">
            <div className="glass-panel blob-inspector-panel">
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white' }}>Inspect Walrus Storage Blob</h3>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Select Preset Blob Template
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {PRESET_BLOBS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleInspectBlob(preset.blobId)}
                      className="btn-premium-secondary"
                      style={{ 
                        padding: '10px 16px', 
                        fontSize: '13px',
                        border: blobIdInput === preset.blobId ? '1px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        background: blobIdInput === preset.blobId ? 'rgba(255, 126, 33, 0.08)' : ''
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Or Input Custom Walrus Blob ID
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={blobIdInput}
                    onChange={(e) => setBlobIdInput(e.target.value)}
                    className="input-premium"
                    placeholder="Enter Blob Hash..."
                  />
                  <button 
                    onClick={() => handleInspectBlob(blobIdInput)}
                    className="btn-premium-primary"
                    style={{ padding: '0 24px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={isFetchingBlob}
                  >
                    {isFetchingBlob ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <DownloadCloud size={16} />
                    )}
                    Resolve
                  </button>
                </div>
              </div>

              {/* Resolved Code Editor Panel */}
              <div className="code-editor-wrapper">
                <div className="code-editor-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={14} style={{ color: 'var(--accent-orange)' }} />
                    <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'white' }}>{activePreset.name}</span>
                  </div>
                  <span className="badge badge-sui" style={{ fontSize: '9px' }}>Walrus Immutable Storage</span>
                </div>
                <textarea
                  readOnly
                  value={inspectCode || activePreset.code}
                  className="code-textarea"
                />
              </div>
            </div>

            {/* Side Static Security Report Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Shield size={18} style={{ color: 'var(--accent-orange)' }} /> Code Sandbox Security Score
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: '4px solid',
                    borderColor: staticAuditResults.v8SafetyScore > 70 ? 'var(--accent-emerald)' : 'var(--accent-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--display)',
                    fontSize: '24px',
                    fontWeight: 700
                  }}>
                    {staticAuditResults.v8SafetyScore}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>V8 Isolate Compliance</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                      {staticAuditResults.v8SafetyScore > 70 ? 'Optimal Isolation' : 'Potential Warning'}
                    </div>
                  </div>
                </div>

                <div className="audit-list">
                  <div className="audit-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Memory Heap Risk</span>
                    <span className="badge badge-emerald" style={{
                      background: staticAuditResults.memoryLeakScore === 'SECURE' ? '' : 'rgba(239, 68, 68, 0.1)',
                      color: staticAuditResults.memoryLeakScore === 'SECURE' ? '' : '#f87171',
                      border: staticAuditResults.memoryLeakScore === 'SECURE' ? '' : '1px solid rgba(239, 68, 68, 0.2)'
                    }}>{staticAuditResults.memoryLeakScore}</span>
                  </div>
                  <div className="audit-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>External Networks</span>
                    <span className="badge badge-orange">{staticAuditResults.networkAccess}</span>
                  </div>
                  <div className="audit-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Blockchain State Mutation</span>
                    <span className="badge badge-sui">{staticAuditResults.stateMutation}</span>
                  </div>
                </div>

                {staticAuditResults.warnings.length > 0 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '12px 16px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '10px',
                    fontSize: '12px',
                    color: 'var(--accent-amber)'
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <div>{staticAuditResults.warnings[0]}</div>
                  </div>
                )}
              </div>

              {/* Informational Widget */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Info size={18} style={{ color: 'var(--accent-sui)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>What is a Walrus Blob Audit?</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                      Coprocessors fetch verified JavaScript binaries directly from Walrus storage nodes using consensus hash signatures. This panel validates code compliance before workers process on-chain callbacks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Playground */}
        {activeTab === 'playground' && (
          <div className="detail-grid">
            <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Interactive VM Sandbox Simulator</h3>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Select Preset Template to Edit
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {PRESET_BLOBS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setCustomPlaygroundCode(preset.code);
                      }}
                      className="btn-premium-secondary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        borderColor: selectedPresetId === preset.id ? 'var(--accent-orange)' : 'var(--border-color)',
                        background: selectedPresetId === preset.id ? 'rgba(255, 126, 33, 0.05)' : ''
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="code-editor-wrapper">
                <div className="code-editor-header">
                  <span style={{ fontSize: '12px', color: 'white', fontFamily: 'var(--mono)' }}>test_sandbox_run.js</span>
                  <span style={{ fontSize: '10px', color: 'var(--accent-orange)' }}>EDITABLE PLAYGROUND</span>
                </div>
                <textarea
                  value={customPlaygroundCode}
                  onChange={(e) => setCustomPlaygroundCode(e.target.value)}
                  className="code-textarea"
                  style={{ height: '240px', color: '#6ee7b7' }}
                />
              </div>

              {/* Resource slider row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Isolate Timeout Limit</span>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{simTimeLimit} ms</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={simTimeLimit}
                    onChange={(e) => setSimTimeLimit(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Heap Memory Bound</span>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{simMemoryLimit} MB</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="256"
                    step="16"
                    value={simMemoryLimit}
                    onChange={(e) => setSimMemoryLimit(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                  />
                </div>
              </div>

              <button
                onClick={runSimulatorVM}
                disabled={isSimRunning}
                className="btn-premium-primary"
                style={{ padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSimRunning ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Booting Sandbox VM...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Boot VM Isolate Sandbox</span>
                  </>
                )}
              </button>
            </div>

            {/* VM execution outputs */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={18} /> VM Telemetry Log
                </h3>
                <span className="badge badge-sui">isolate_v8.log</span>
              </div>

              <div className="terminal-block">
                {simLogs.map((log, index) => (
                  <div 
                    key={index}
                    style={{
                      marginBottom: '6px',
                      color: log.includes('✅') ? 'var(--accent-emerald)' : log.includes('ALERT') || log.includes('❌') ? '#f87171' : log.startsWith('[VM]') ? '#38bdf8' : '#e2e8f0'
                    }}
                  >
                    {log}
                  </div>
                ))}
                {simLogs.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
                    <Cpu size={32} style={{ marginBottom: '12px' }} />
                    <span style={{ fontSize: '11px' }}>Click "Boot VM Isolate Sandbox" to trace isolate execution.</span>
                  </div>
                )}
              </div>

              <div className="audit-list">
                <div className="audit-item">
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Restricted Callbacks</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>Disabled (Dry Run Only)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Register */}
        {activeTab === 'register' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>Link Walrus Blob to Sui Registry</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Call the on-chain Move contract method to register your code blob. Once registered, worker daemons will trigger execution when requests are submitted.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Sui Project Object ID
                  </label>
                  <input
                    type="text"
                    value={regProjId}
                    onChange={(e) => setRegProjId(e.target.value)}
                    className="input-premium"
                    placeholder="Enter on-chain Project ID..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Function Identifier / Name
                  </label>
                  <input
                    type="text"
                    value={regFuncName}
                    onChange={(e) => setRegFuncName(e.target.value)}
                    className="input-premium"
                    placeholder="e.g. Price Feed, Validator"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Walrus Blob Storage ID
                  </label>
                  <input
                    type="text"
                    value={regBlobId}
                    onChange={(e) => setRegBlobId(e.target.value)}
                    className="input-premium"
                    placeholder="Enter Walrus Storage Blob ID..."
                  />
                </div>

                {currentAccount ? (
                  <button
                    onClick={handleRegisterOnChain}
                    disabled={txSubmitting}
                    className="btn-premium-primary"
                    style={{ padding: '16px', borderRadius: '10px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  >
                    {txSubmitting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Sending Transaction...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        <span>Sign & Register Function</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{
                    marginTop: '12px',
                    padding: '20px',
                    background: 'rgba(255, 126, 33, 0.05)',
                    border: '1px solid rgba(255, 126, 33, 0.15)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <Lock size={24} style={{ color: 'var(--accent-orange)', marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Wallet Disconnected</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      You must connect your Sui wallet in the sidebar to invoke on-chain methods.
                    </p>
                  </div>
                )}

                {txSuccessDigest && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '10px',
                    color: '#a7f3d0',
                    fontSize: '13px'
                  }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
                      Move Function Registered Successfully!
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', marginTop: '6px', overflowWrap: 'break-word' }}>
                      Digest: {txSuccessDigest}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
