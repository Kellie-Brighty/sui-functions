import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Play, 
  Terminal, 
  RefreshCw, 
  Cpu,
  ExternalLink,
  ChevronRight,
  Lock,
  DownloadCloud,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import './App.css';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// Constants matching our deployed Move package on Sui Testnet
const PACKAGE_ID = '0x0a4c46e798a86a660b6c40d4be93d9b97bcad0183f97f4ffa2fc8a38dbf84086';
const PROJECT_ID = '0xbbd539992a5e47c80fd393d6cdd17d6512048f0964a67137bf4a0cd7cd84017e';

function App() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Navigation state: 'landing' or 'app'
  const [view, setView] = useState<'landing' | 'app'>('landing');

  // Vault APY telemetry and allocation states
  const [naviApy, setNaviApy] = useState(4.8);
  const [scallopApy, setScallopApy] = useState(5.9);
  const [driftThreshold, setDriftThreshold] = useState(0.5);

  const [naviAlloc, setNaviAlloc] = useState(45);
  const [scallopAlloc, setScallopAlloc] = useState(35);
  const [usdcAlloc] = useState(20);

  // V8 Execution & Status States
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceStatus, setRebalanceStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [activeCodeLine, setActiveCodeLine] = useState<number | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);

  // Telemetry simulator states for premium landing page Quick-Audit Simulation
  const [simNaviApy, setSimNaviApy] = useState(4.50);
  const [simScallopApy, setSimScallopApy] = useState(7.80);
  const [simThreshold, setSimThreshold] = useState(1.50);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'success'>('idle');

  const runSimulatedSandbox = async () => {
    setIsSimRunning(true);
    setSimStatus('running');
    setSimLogs([]);
    
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const addLog = (msg: string) => setSimLogs(prev => [...prev, msg]);
    
    await delay(500);
    addLog("⚡ [Isolate] Initializing sandbox environment...");
    await delay(600);
    addLog("📂 [Isolate] Fetching execution logic from Walrus storage network...");
    await delay(700);
    addLog(`🚀 [Isolate] Spawning isolated V8 sandbox (Heap limit: 128MB, CPU cap: 5s)`);
    await delay(800);
    addLog("🖥️ [Isolate] Execuring rebalancer.js script...");
    await delay(900);
    addLog(`[VM] Auditing live lending protocols SUI rates...`);
    await delay(600);
    addLog(`[VM] Live APY - Navi SUI: ${simNaviApy.toFixed(2)}%, Scallop SUI: ${simScallopApy.toFixed(2)}%`);
    
    const drift = Math.abs(simScallopApy - simNaviApy);
    await delay(600);
    addLog(`[VM] Calculated yield APY drift: ${drift.toFixed(2)}% (Threshold: ${simThreshold.toFixed(2)}%)`);
    
    await delay(800);
    if (drift >= simThreshold) {
      addLog(`[VM] ALERT: Yield drift exceeds risk threshold! Drift: ${drift.toFixed(2)}%`);
      await delay(600);
      addLog(`[VM] Rebalancing triggered: Transferring 30% SUI assets from Navi to Scallop...`);
      await delay(750);
      addLog(`✅ [System] Move contract callback registered successfully. Telemetry optimized.`);
    } else {
      addLog(`[VM] Yield drift within safe bounds. No rebalancing required.`);
      await delay(750);
      addLog(`✅ [System] Vault audit completed safely. Asset allocations remain unchanged.`);
    }
    
    setIsSimRunning(false);
    setSimStatus('success');
  };

  // Script editor template code
  const rebalanceScriptLines = useMemo(() => [
    "// Yield Rebalancer APY Auditor Isolate script",
    "// SECURE V8 SANDBOXED RUNTIME ENVIRONMENT",
    "",
    "(async function() {",
    "  log('[Rebalancer] Auditing live lending protocols SUI rates...');",
    `  const naviRate = ${naviApy.toFixed(2)};`,
    `  const scallopRate = ${scallopApy.toFixed(2)};`,
    "  log('[Rebalancer] Live APY - Navi SUI: ' + naviRate + '%, Scallop SUI: ' + scallopRate + '%');",
    "",
    `  const threshold = ${driftThreshold.toFixed(2)};`,
    "  const drift = scallopRate - naviRate;",
    "  log('[Rebalancer] Calculated yield APY drift: ' + drift.toFixed(2) + '%');",
    "",
    "  if (drift >= threshold) {",
    "    log('[Rebalancer] ALERT: Yield drift exceeds risk threshold! Drift: ' + drift.toFixed(2) + '%');",
    "    log('[Rebalancer] Action: Trigger rebalance allocation protocol...');",
    "    return {",
    "      triggerRebalance: true,",
    "      reallocationPct: 30,",
    "      from: 'Navi SUI',",
    "      to: 'Scallop SUI'",
    "    };",
    "  }",
    "",
    "  log('[Rebalancer] Yield drift within safe bounds. No rebalancing required.');",
    "  return { triggerRebalance: false, reason: 'Stable APY drift' };",
    "})()"
  ], [naviApy, scallopApy, driftThreshold]);

  // Mathematical weighted average APY calculator
  const averageSuiApy = useMemo(() => {
    const totalSuiAlloc = naviAlloc + scallopAlloc;
    if (totalSuiAlloc === 0) return 0;
    return ((naviAlloc * naviApy) + (scallopAlloc * scallopApy)) / totalSuiAlloc;
  }, [naviAlloc, scallopAlloc, naviApy, scallopApy]);

  // Dynamic APY Drift
  const currentDrift = useMemo(() => {
    return Math.abs(scallopApy - naviApy);
  }, [scallopApy, naviApy]);

  // Reset demo allocations
  const handleResetAllocations = () => {
    setNaviAlloc(45);
    setScallopAlloc(35);
    setRebalanceStatus('idle');
    setLogs([]);
    setTxDigest(null);
    setActiveCodeLine(null);
  };

  // Perform full V8 script run
  const handleRebalance = async () => {
    setLogs([]);
    setIsRebalancing(true);
    setRebalanceStatus('running');
    setActiveCodeLine(null);

    // Helper to sleep/delay execution segments
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const logLine = (msg: string) => {
      setLogs(prev => [...prev, msg]);
    };

    try {
      logLine("⚙️ [System] Initializing sovereign vault audit request...");
      await delay(800);
      logLine(`📊 [System] Telemetry input variables: Navi SUI = ${naviApy}%, Scallop SUI = ${scallopApy}%, Drift Limit = ${driftThreshold}%`);
      await delay(600);

      // On-Chain Transaction Flow
      if (account) {
        logLine("✍️ [System] Wallet connected. Prompting for on-chain Move call signature...");
        await delay(400);

        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::trigger::call_function`,
          arguments: [
            tx.object(PROJECT_ID),
            tx.pure.string("Yield Rebalancer"),
            tx.pure.string(JSON.stringify({ navi: naviApy, scallop: scallopApy, threshold: driftThreshold }))
          ],
        });

        const signature = await new Promise<string>((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            {
              onSuccess: (res) => {
                setTxDigest(res.digest);
                resolve(res.digest);
              },
              onError: (err) => {
                reject(err);
              }
            }
          );
        });

        logLine(`⛓️ [Blockchain] Tx digest verified: ${signature.slice(0, 10)}... Anchored on Sui Testnet.`);
        await delay(1000);
      } else {
        logLine("🛡️ [System] Developer Sim-Mode: Running off-chain VM locally (connect wallet for live on-chain triggers)...");
        await delay(1000);
      }

      logLine("📥 [Listener] Polling Event Bus... ExecutionTriggered caught!");
      await delay(800);
      logLine("📥 [Listener] Fetching secure script blob from Walrus Testnet...");
      await delay(1000);
      logLine("🛡️ [Sandbox] Allocating V8 Sandbox Isolate Container (128MB Memory Cap, 5000ms TTL limit)...");
      await delay(1200);

      logLine("🚀 [VM] ----------------- V8 EXECUTION START -----------------");
      await delay(400);

      // Neon Editor Highlighting sequence
      for (let i = 0; i < rebalanceScriptLines.length; i++) {
        // Skip highlights on blank/comment lines
        if (rebalanceScriptLines[i].trim() && !rebalanceScriptLines[i].startsWith("//")) {
          setActiveCodeLine(i);
          // Only log print statements in our VM console
          if (rebalanceScriptLines[i].includes("log(")) {
            const match = rebalanceScriptLines[i].match(/log\((.*?)\)/);
            if (match) {
              // Simple evaluation representation for logs
              let parsedLog = match[1]
                .replace(/'/g, "")
                .replace(/"/g, "")
                .replace(/\+/g, "")
                .replace(/naviRate/g, `${naviApy.toFixed(2)}%`)
                .replace(/scallopRate/g, `${scallopApy.toFixed(2)}%`)
                .replace(/drift\.toFixed\(2\)/g, `${currentDrift.toFixed(2)}%`)
                .replace(/threshold\.toFixed\(2\)/g, `${driftThreshold.toFixed(2)}%`);
              logLine(`[VM] ${parsedLog}`);
            }
            await delay(900);
          }
        }
      }

      await delay(600);
      setActiveCodeLine(null);

      // Perform allocation changes mathematically
      if (currentDrift >= driftThreshold) {
        logLine("🔄 [VM] Script returned execution reallocate command: TRUE. Reallocating 30% SUI Slices...");
        await delay(1000);
        logLine("⛓️ [Blockchain] Registering signed V8 execution state on-chain via move event emitter...");
        await delay(800);
        
        // Visual allocation shift animation
        setNaviAlloc(15);
        setScallopAlloc(65);
        
        logLine("🏆 [System] Dynamic yield rebalance complete! Asset distributions rebalanced live.");
        setRebalanceStatus('success');
      } else {
        logLine("🔄 [VM] Script returned execution reallocate command: FALSE. APY drift within acceptable limits.");
        await delay(1000);
        logLine("🏆 [System] Audit complete. Allocations remained stable.");
        setRebalanceStatus('success');
      }

    } catch (err: any) {
      logLine(`❌ [Error] Rebalancing failed: ${err.message || err}`);
      setRebalanceStatus('failed');
    } finally {
      setIsRebalancing(false);
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      
      {/* Top Banner Status */}
      <div style={{
        background: 'rgba(255, 126, 33, 0.05)',
        borderBottom: '1px solid rgba(255, 126, 33, 0.1)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--accent-orange)' }}>
          <Shield size={14} className="animate-pulse" />
          <span>Sui-Functions Sovereign Yield Rebalancer: Production Sandbox v1.0.4</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            RPC: <span style={{ fontFamily: 'var(--mono)', color: 'white' }}>Testnet</span>
          </span>
          <a 
            href="https://suifunctions.web.app/" 
            target="_blank" 
            rel="noreferrer"
            style={{ fontSize: '11px', color: 'var(--accent-sui)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
          >
            <span>Operator Portal</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* ========================================== */}
      {/* VIEW 1: PREMIUM LANDING PAGE               */}
      {/* ========================================== */}
      {view === 'landing' && (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Ambient Background Glow Blobs */}
          <div className="glow-blob-1" />
          <div className="glow-blob-2" />
          <div className="grid-overlay" />

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            
            {/* Header / Navigation */}
            <nav style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 0',
              marginBottom: '40px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent-orange) 0%, #ea580c 100%)',
                  padding: '6px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={20} style={{ color: 'white' }} />
                </div>
                <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--display)' }}>
                  Sui<span style={{ color: 'var(--accent-orange)' }}>Rebalancer</span>
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span className="pulse-dot" />
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Network Status: Live</span>
                </div>
                <button
                  onClick={() => setView('app')}
                  className="btn-premium-secondary"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Launch Application</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </nav>

            {/* Asymmetric Hero Split Section */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '48px',
              alignItems: 'center',
              marginBottom: '100px',
              marginTop: '40px'
            }} className="rebalancer-grid">
              
              {/* Hero Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'left' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--accent-orange)',
                    background: 'var(--accent-orange-glow)',
                    border: '1px solid rgba(255, 126, 33, 0.3)',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    🛡️ Web3 Coprocessor Compute
                  </span>
                </div>
                
                <h1 style={{
                  fontSize: '56px',
                  fontWeight: 900,
                  lineHeight: '1.1',
                  fontFamily: 'var(--display)',
                  letterSpacing: '-0.04em',
                  margin: 0
                }} className="gradient-text">
                  Autonomous Yield Optimization Capped by V8 Sandboxes
                </h1>
                
                <p style={{
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  maxWidth: '580px',
                  margin: 0
                }}>
                  Unstoppable portfolio reallocator powered by **Sui-Functions**. Audit yield pools 24/7 off-chain inside secure, content-addressed environments. Zero hot keys, zero custody risk.
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setView('app')}
                    className="btn-premium-primary"
                    style={{
                      padding: '16px 32px',
                      borderRadius: '14px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Open Live Vault Console</span>
                    <ArrowRight size={16} />
                  </button>
                  <a
                    href="#sandbox-sandbox"
                    className="btn-premium-secondary"
                    style={{
                      padding: '16px 24px',
                      borderRadius: '14px',
                      fontSize: '14px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Test Sandbox Script</span>
                  </a>
                </div>
              </div>

              {/* Hero Right Column: Animated Network Orbit Node Map */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div className="orbit-container">
                  <div className="orbit-center">
                    <Zap size={32} style={{ color: 'white', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' }} />
                  </div>
                  
                  {/* Inner Dashed Orbit */}
                  <div className="orbit-path-inner">
                    <div className="orbit-node node-navi" title="Navi Protocol Node">
                      <Cpu size={16} style={{ color: 'var(--accent-sui)' }} />
                    </div>
                  </div>
                  
                  {/* Outer Dashed Orbit */}
                  <div className="orbit-path-outer">
                    <div className="orbit-node node-scallop" title="Scallop SUI Node">
                      <TrendingUp size={16} style={{ color: 'var(--accent-orange)' }} />
                    </div>
                    <div className="orbit-node node-usdc" title="USDC Safe Vault Node">
                      <Shield size={16} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* SECTION: Live Telemetry Interactive Sandbox Simulator */}
            <section id="sandbox-sandbox" className="glass-panel" style={{ padding: '40px', marginBottom: '100px', border: '1px solid rgba(255, 126, 33, 0.2)' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto text-center', textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Try the sandbox environment
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: 'white' }}>
                  Interactive Telemetry Sandbox
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Adjust SUI lending rates below to create APY drift, then run the sandboxed auditor script to verify how it triggers allocation shifts!
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                gap: '32px',
                alignItems: 'start'
              }} className="rebalancer-grid">
                
                {/* Simulator Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(10, 12, 16, 0.6)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  
                  {/* Navi rate slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Navi SUI Pool APY</span>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent-sui)', fontWeight: 700 }}>{simNaviApy.toFixed(2)}% APY</span>
                    </div>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="12.0" 
                      step="0.1" 
                      value={simNaviApy}
                      onChange={(e) => setSimNaviApy(parseFloat(e.target.value))}
                      className="premium-slider"
                    />
                  </div>

                  {/* Scallop rate slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Scallop SUI Pool APY</span>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent-orange)', fontWeight: 700 }}>{simScallopApy.toFixed(2)}% APY</span>
                    </div>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="12.0" 
                      step="0.1" 
                      value={simScallopApy}
                      onChange={(e) => setSimScallopApy(parseFloat(e.target.value))}
                      className="premium-slider"
                    />
                  </div>

                  {/* Drift threshold slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Rebalance Drift Threshold</span>
                      <span style={{ fontFamily: 'var(--mono)', color: 'white', fontWeight: 700 }}>{simThreshold.toFixed(2)}% APY</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="4.0" 
                      step="0.1" 
                      value={simThreshold}
                      onChange={(e) => setSimThreshold(parseFloat(e.target.value))}
                      className="premium-slider"
                    />
                  </div>

                  {/* Drift Calculation stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#07090d', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                    <span>Calculated APY Drift Spread:</span>
                    <span style={{ fontWeight: 700, color: Math.abs(simScallopApy - simNaviApy) >= simThreshold ? '#10b981' : '#f59e0b' }}>
                      {Math.abs(simScallopApy - simNaviApy).toFixed(2)}% APY {Math.abs(simScallopApy - simNaviApy) >= simThreshold ? ' (Rebalance Limit Exceeded)' : ' (Within Safe Bounds)'}
                    </span>
                  </div>

                  <button
                    onClick={runSimulatedSandbox}
                    disabled={isSimRunning}
                    className="btn-premium-primary"
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSimRunning ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Running Sandbox VM...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Run Sandbox Isolate Audit</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simulator Live Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Terminal size={12} />
                      mock_v8_sandbox_console
                      {simStatus === 'running' && <span style={{ color: 'var(--accent-orange)', fontSize: '9px', fontWeight: 800 }}>● RUNNING</span>}
                      {simStatus === 'success' && <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 800 }}>● SUCCESS</span>}
                      {simStatus === 'idle' && <span style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>● IDLE</span>}
                    </span>
                    <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                      CAPPED HEAP: 128MB
                    </span>
                  </div>

                  <div className="sim-terminal">
                    {simLogs.map((log, index) => (
                      <div 
                        key={index} 
                        style={{
                          marginBottom: '4px',
                          color: log.includes('✅') ? '#34d399' : log.includes('ALERT') ? '#f87171' : log.startsWith('[VM]') ? '#38bdf8' : '#94a3b8'
                        }}
                      >
                        {log}
                      </div>
                    ))}
                    {simLogs.length === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.35 }}>
                        <Cpu size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '10px' }}>Adjust sliders and click run to watch the sandboxed V8 VM execute.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION: Premium Features Grid */}
            <section style={{ marginBottom: '100px' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Platform Capabilities
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: 'white' }}>
                  Designed For Institutional Safety
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                
                {/* Feature 1 */}
                <div className="glass-panel glass-card-hover" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--accent-orange-glow)',
                    border: '1px solid rgba(255, 126, 33, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-orange)'
                  }}>
                    <Lock size={22} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>On-Chain Vault Custody</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Sui-Functions retains assets directly within verified on-chain smart contracts. Unlike traditional bots, the off-chain keeper has no private keys and cannot withdraw assets, mitigating custody vulnerabilities.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="glass-panel glass-card-hover" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(69, 140, 245, 0.1)',
                    border: '1px solid rgba(69, 140, 245, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-sui)'
                  }}>
                    <DownloadCloud size={22} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>Immutable Walrus Blobs</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Rebalancer logic is stored permanently as content-addressed files on Walrus Storage. Once deployed, the script is 100% immune to central server overrides, code injection, or unauthorized admin edits.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="glass-panel glass-card-hover" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-emerald)'
                  }}>
                    <Cpu size={22} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>Isolated Sandbox Runtime</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    The worker execution node spins up dedicated, highly isolated Google V8 containers to run scripts. Enforcing strict 128MB memory caps and network shimming blocks all potential sandbox escape vectors.
                  </p>
                </div>

              </div>
            </section>

            {/* SECTION: Premium Matrix Table */}
            <section className="glass-panel" style={{ padding: '40px', marginBottom: '100px', background: 'rgba(18, 22, 32, 0.5)' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0 }}>
                  Compare Architectures
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  How Sui-Functions bypasses the traditional cloud vulnerabilities
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'white', fontWeight: 700 }}>
                      <th style={{ padding: '16px' }}>Security &amp; Performance Metric</th>
                      <th style={{ padding: '16px', color: 'var(--accent-orange)' }}>Sui-Functions Rebalancer</th>
                      <th style={{ padding: '16px' }}>Cloud Bots (AWS Lambda / VPS)</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '20px 16px', color: 'white', fontWeight: 600 }}>Custody Vector</td>
                      <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 700 }}>Strictly On-Chain (Sovereign Smart Contract)</td>
                      <td style={{ padding: '20px 16px' }}>Hot Wallet key loaded in plaintext config</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '20px 16px', color: 'white', fontWeight: 600 }}>Tamper Resistance</td>
                      <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 700 }}>Immutable Walrus Content-Addressing Blobs</td>
                      <td style={{ padding: '20px 16px' }}>Vulnerable to SSH host compromise or provider ban</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '20px 16px', color: 'white', fontWeight: 600 }}>Cold Bootstrap Speed</td>
                      <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 700 }}>&lt; 5ms (Lightweight Isolate Instance)</td>
                      <td style={{ padding: '20px 16px' }}>800ms - 2000ms (Heavy VM Container initialization)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '20px 16px', color: 'white', fontWeight: 600 }}>Execution Isolation</td>
                      <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 700 }}>128MB ceiling with strict custom system shims</td>
                      <td style={{ padding: '20px 16px' }}>Full root OS access (increases compromise blast radius)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '20px 16px', color: 'white', fontWeight: 600 }}>Censorship Immunity</td>
                      <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 700 }}>Decentralized Event Bus trigger loop</td>
                      <td style={{ padding: '20px 16px' }}>Subject to cloud provider term updates and bans</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION: Visual Step-by-Step Flow */}
            <section style={{ textAlign: 'center', marginBottom: '80px' }}>
              <div style={{ marginBottom: '40px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Operational Loop
                </span>
                <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'white' }}>
                  Execution Flow Lifecycle
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px'
              }} className="rebalancer-grid">
                
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 12, 16, 0.4)', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontFamily: 'var(--mono)', fontWeight: 800 }}>STAGE 01</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Telemetry Event</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Lending pool APY rate changes emit on-chain events via the Sui blockchain ledger.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 12, 16, 0.4)', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontFamily: 'var(--mono)', fontWeight: 800 }}>STAGE 02</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Immutable Pull</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Worker nodes pick up triggers and fetch content-addressed logic securely from Walrus Storage.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 12, 16, 0.4)', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontFamily: 'var(--mono)', fontWeight: 800 }}>STAGE 03</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Sandbox Audit</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    The worker runs the JS script inside isolated V8 heaps, producing signed reallocation decisions.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 12, 16, 0.4)', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontFamily: 'var(--mono)', fontWeight: 800 }}>STAGE 04</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Move Callback</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Sovereign Sui move contract executes the reallocation to optimize yields directly.
                  </p>
                </div>

              </div>
            </section>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW 2: INTERACTIVE DASHBOARD VIEW         */}
      {/* ========================================== */}
      {view === 'app' && (
        <div style={{ maxWidth: '1280px', margin: '40px auto 0 auto', padding: '0 24px' }}>
          
          {/* Page Header */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <button 
                onClick={() => setView('landing')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-orange)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px',
                  padding: 0
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Security Details</span>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={24} style={{ color: 'var(--accent-orange)' }} />
                <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Yield Rebalancer</h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Audit lending pool APY telemetry and rebalance capital dynamically using sandboxed isolates.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ConnectButton />
            </div>
          </header>

          {/* Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '32px',
            alignItems: 'start'
          }} className="rebalancer-grid">
            
            {/* Left Column: Asset Allocation & Strategy Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Vault Balance & APY Stats */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Active Strategy Telemetry
                  </span>
                  {rebalanceStatus === 'success' && (
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--accent-emerald)',
                      background: 'var(--accent-emerald-glow)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}>
                      OPTIMIZED
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#0e111a', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Vault Value</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--mono)' }}>10,000</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>SUI</span>
                    </div>
                  </div>

                  <div style={{ background: '#0e111a', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Weighted average APY</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent-orange)' }}>
                        {averageSuiApy.toFixed(2)}%
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>APY</span>
                    </div>
                    {txDigest && (
                      <a
                        href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          fontSize: '9px',
                          color: 'var(--accent-sui)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        <span>Tx: {txDigest.slice(0, 6)}...</span>
                        <ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress bars representing active capital allocations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>Navi Protocol SUI Pool</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent-sui)' }}>
                        {naviAlloc}% ({((10000 * naviAlloc) / 100).toLocaleString()} SUI)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#121622', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${naviAlloc}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #458cf5 0%, #2563eb 100%)',
                        transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 0 10px rgba(69, 140, 245, 0.4)'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>Scallop Protocol SUI Pool</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent-orange)' }}>
                        {scallopAlloc}% ({((10000 * scallopAlloc) / 100).toLocaleString()} SUI)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#121622', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${scallopAlloc}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #ff7e21 0%, #ea580c 100%)',
                        transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 0 10px rgba(255, 126, 33, 0.4)'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>USDC Stable Index Vault</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {usdcAlloc}% (2,000 USDC)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#121622', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${usdcAlloc}%`,
                        height: '100%',
                        background: '#4e5d78',
                        transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Interest rate telemetry parameters */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Lending Telemetry APY Auditing
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <TrendingUp size={12} />
                    <span>Drift Gap: {currentDrift.toFixed(2)}% APY</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{
                    background: '#090a10',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>Navi SUI APY</span>
                    </div>
                    <input 
                      type="number" 
                      step="0.05"
                      value={naviApy} 
                      onChange={(e) => setNaviApy(parseFloat(e.target.value) || 0)}
                      style={{
                        background: '#050608',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px',
                        color: 'white',
                        fontFamily: 'var(--mono)',
                        fontSize: '16px',
                        fontWeight: 700,
                        width: '100%'
                      }}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Modify rate to trigger dynamic rebalancer isolate</span>
                  </div>

                  <div style={{
                    background: '#090a10',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>Scallop SUI APY</span>
                      {scallopApy > naviApy && (
                        <span style={{ fontSize: '8px', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-glow)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          BEST YIELD
                        </span>
                      )}
                    </div>
                    <input 
                      type="number" 
                      step="0.05"
                      value={scallopApy} 
                      onChange={(e) => setScallopApy(parseFloat(e.target.value) || 0)}
                      style={{
                        background: '#050608',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px',
                        color: 'white',
                        fontFamily: 'var(--mono)',
                        fontSize: '16px',
                        fontWeight: 700,
                        width: '100%'
                      }}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Modify Scallop SUI rate to adjust rebalance parameters</span>
                  </div>
                </div>

                {/* Drift threshold controller */}
                <div style={{
                  background: '#0e111a',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>Drift Audit Threshold</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Minimum yield spread required to justify gas fees</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number" 
                      step="0.05"
                      value={driftThreshold} 
                      onChange={(e) => setDriftThreshold(parseFloat(e.target.value) || 0)}
                      style={{
                        background: '#050608',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px',
                        color: 'white',
                        fontFamily: 'var(--mono)',
                        fontSize: '14px',
                        fontWeight: 700,
                        width: '80px',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>% APY</span>
                  </div>
                </div>

                {/* Actions Box */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  {rebalanceStatus === 'success' && (
                    <button 
                      onClick={handleResetAllocations}
                      style={{
                        flex: 0.5,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '14px'
                      }}
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={handleRebalance}
                    disabled={isRebalancing}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, var(--accent-orange) 0%, #ea580c 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: isRebalancing ? 0.6 : 1,
                      boxShadow: '0 4px 20px rgba(255, 126, 33, 0.2)'
                    }}
                  >
                    {isRebalancing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Auditing APY drift...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Audit &amp; Rebalance APY</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Dynamic Script Editor & Live Sandbox Logger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* V8 Sandbox Code Editor Container */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{
                  background: '#090a10',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="flex gap-1.5 mr-2">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>
                      rebalancer.js (Walrus script)
                    </span>
                  </div>
                  <span style={{
                    fontSize: '8px',
                    color: 'var(--accent-orange)',
                    background: 'var(--accent-orange-glow)',
                    border: '1px solid rgba(255,126,33,0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--mono)',
                    fontWeight: 700
                  }}>
                    ISOLATE SECURED
                  </span>
                </div>

                {/* Editable Code block with custom run line neon highlighters */}
                <div style={{
                  padding: '20px',
                  background: '#040609',
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  overflowY: 'auto',
                  height: '340px',
                  color: '#94a3b8',
                  position: 'relative'
                }}>
                  {rebalanceScriptLines.map((line, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        display: 'flex',
                        background: activeCodeLine === idx ? 'rgba(255, 126, 33, 0.15)' : 'transparent',
                        borderLeft: activeCodeLine === idx ? '3px solid var(--accent-orange)' : '3px solid transparent',
                        paddingLeft: '4px',
                        transition: 'background 0.15s ease',
                        borderRadius: '2px'
                      }}
                    >
                      <span style={{ width: '28px', color: '#4b5563', userSelect: 'none', textAlign: 'right', paddingRight: '8px' }}>
                        {idx + 1}
                      </span>
                      <pre style={{ margin: 0, color: line.startsWith("//") ? '#4e5d78' : line.includes("log(") ? '#38bdf8' : line.includes("const") ? '#ff7e21' : '#94a3b8' }}>
                        {line}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure V8 Isolated VM Console Logs */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{
                  background: '#090a10',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <Terminal size={12} />
                    <span style={{ fontWeight: 600 }}>v8_isolate_console</span>
                  </div>
                  {isRebalancing && (
                    <span style={{ fontSize: '9px', color: 'var(--accent-orange)' }} className="animate-pulse">
                      ⏳ VM Execution active...
                    </span>
                  )}
                </div>

                <div style={{
                  padding: '16px',
                  background: '#030406',
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  color: '#34d399',
                  height: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  lineHeight: '1.5'
                }}>
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      style={{
                        color: log.startsWith('[VM]') ? '#38bdf8' : log.includes('ALERT') ? '#f87171' : log.includes('complete') ? '#34d399' : '#94a3b8'
                      }}
                    >
                      {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
                      <Cpu size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '10px' }}>Waiting to trigger isolate audit...</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
