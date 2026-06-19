import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
import { Play, CheckCircle2, Zap, Shield, Clock, Server, Code, Globe, HelpCircle, ArrowRight, Terminal, Users, Loader2, Wallet, Layers, ShieldCheck, Hexagon, ArrowUp } from 'lucide-react';
import Dashboard from './Dashboard';
import { Header, Footer, Button, Card, CodeWindow } from './components/shared';
import { DocsView } from './components/DocsView';
import { BlueprintView } from './components/BlueprintView';
import { LATEST_RUNNER_BLOB_ID } from './constants';

const App: React.FC = () => {
  const account = useCurrentAccount();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'docs' | 'blueprint'>('landing');
  const [activePillar, setActivePillar] = useState<'trigger' | 'logic' | 'worker'>('trigger');

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  const logsMap = {
    trigger: [
      '🚀 Connecting to Sui Event Bus on Mainnet...',
      '📡 Listening for tx triggers on usd_functions::kinetic_handler...',
      '📥 RECEIVED: Transaction Trigger event emitted.',
      '🔗 TX DIGEST: 0x9b1b7...a3f4e (Gas: 0.0012 SUI)',
      '📦 DISPATCH: Forwarding execution request to Walrus blob: 0x5f71e...'
    ],
    logic: [
      '🔍 Querying Walrus Storage Network for blob metadata...',
      '📂 FOUND blob: "usd_oracle_logic" (Size: 43.5 KB)',
      '🛡️ INTEGRITY: Verifying cryptographic hash sha256-4c7b8d...',
      '✅ MATCH: Cryptographic integrity confirmed (100% logic safety).',
      '💾 CACHE: Loaded compiled WebAssembly blob into memory isolate.'
    ],
    worker: [
      '⚡ Initializing worker daemon in secure sandbox...',
      '🔒 Google V8 isolate container started (Heap Limit: 128MB, net: isolated)',
      '⚙️ Executing entrypoint: usd_oracle_logic::main() in WASM runtime...',
      '🕒 RUNTIME: Executed successfully in 2.14ms.',
      '📝 POST: Transaction receipt submitted back to Sui Event Bus.'
    ]
  };

  useEffect(() => {
    setIsSimulating(false);
    setSimulationLogs([]);
    setLogIndex(0);
  }, [activePillar]);

  useEffect(() => {
    if (!isSimulating) return;

    const currentLogs = logsMap[activePillar];
    if (logIndex < currentLogs.length) {
      const delay = logIndex === 0 ? 300 : 700;
      const timer = setTimeout(() => {
        setSimulationLogs((prev) => [...prev, currentLogs[logIndex]]);
        setLogIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsSimulating(false);
    }
  }, [isSimulating, logIndex, activePillar]);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    setLogIndex(0);
  };

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If wallet is connected, show the complete SUI Dashboard
  if (account) {
    return <Dashboard />;
  }

  const handleSectionScroll = (sectionId: string) => {
    if (viewMode !== 'landing') {
      setViewMode('landing');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-sui/30 selection:text-white overflow-x-hidden relative">
      {/* ═══ LAYERED AMBIENT BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base radial glow at top */}
        <div className="absolute inset-0 radial-glow-sui" />

        {/* Large floating orb - top right (orange) */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-brand-sui/20 to-transparent blur-[120px] animate-float-slow" />

        {/* Medium orb - mid left (blue) */}
        <div className="absolute top-[40%] -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-indigo/20 to-transparent blur-[100px] animate-float-medium" />

        {/* Small orb - bottom right (orange/amber) */}
        <div className="absolute top-[70%] -right-24 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-cyan-500/20 to-transparent blur-[100px] animate-float-reverse" />

        {/* Faint aurora sweep across center */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[600px] bg-gradient-to-r from-transparent via-brand-sui/15 to-transparent blur-[80px] rotate-[-8deg] animate-aurora" />

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />

        {/* Modern Hex Network Sweep (Left) */}
        <div className="absolute top-0 bottom-0 left-0 w-[300px] lg:w-[500px] overflow-hidden pointer-events-none opacity-40 mix-blend-screen" style={{ maskImage: 'linear-gradient(to right, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, black, transparent)' }}>
          {/* Rotating Base hex grid */}
          <div className="absolute inset-[-50%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBMMzcuMzIgMTBWMzBMMjAgNDBMMi42OCAzMFYxMEwyMCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU2LDE1MiwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] bg-[length:60px_60px] animate-spin-slow" style={{ animationDuration: '120s' }} />
          {/* Vertical sweep light revealing the grid */}
          <div className="absolute left-0 w-[400px] h-[100vh] bg-gradient-to-b from-transparent via-[#3898FF]/30 to-transparent animate-flow-vertical blur-[60px]" style={{ animationDuration: '10s' }} />
        </div>

        {/* Modern Hex Network Sweep (Right) */}
        <div className="absolute top-0 bottom-0 right-0 w-[300px] lg:w-[500px] overflow-hidden pointer-events-none opacity-40 mix-blend-screen" style={{ maskImage: 'linear-gradient(to left, black, transparent)', WebkitMaskImage: 'linear-gradient(to left, black, transparent)' }}>
          {/* Rotating Base hex grid */}
          <div className="absolute inset-[-50%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBMMzcuMzIgMTBWMzBMMjAgNDBMMi42OCAzMFYxMEwyMCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjU1LDE3MCwwLjIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-[length:60px_60px] animate-spin-slow" style={{ animationDuration: '180s', animationDirection: 'reverse' }} />
          {/* Vertical sweep light revealing the grid */}
          <div className="absolute right-0 w-[400px] h-[100vh] bg-gradient-to-b from-transparent via-[#00FFAA]/30 to-transparent animate-flow-vertical-reverse blur-[60px]" style={{ animationDuration: '14s' }} />
        </div>
      </div>

      {/* Content layer above background */}
      <div className="relative z-10">
        {/* Navbar Header */}
        <Header
          onSectionClick={handleSectionScroll}
          onConnectClick={() => setShowConnectModal(true)}
          viewMode={viewMode}
          onDocsClick={() => setViewMode('docs')}
          onBlueprintClick={() => setViewMode('blueprint')}
          onHomeClick={() => setViewMode('landing')}
        />

        {/* Main Container */}
        <main className="w-full px-6 lg:px-16 pt-12 pb-24">
          <div className="max-w-7xl mx-auto">

            {viewMode === 'docs' ? (
              <DocsView onBackToLanding={() => setViewMode('landing')} />
            ) : viewMode === 'blueprint' ? (
              <BlueprintView onBackToLanding={() => setViewMode('landing')} />
            ) : (
              <>
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 lg:py-24">
                  <div className="lg:col-span-7 flex flex-col items-start text-left">

                    {/* FHE Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      New: Native Paillier FHE Support
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="text-5xl sm:text-6xl lg:text-[72px] font-bold tracking-tight text-[#E2E8F0] leading-[1.05] mb-6 font-outfit"
                    >
                      The Zero-Downtime <br />
                      <span className="text-slate-400">
                        Compute Economy
                      </span>
                    </motion.h1>

                    {/* Paragraph */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-base text-slate-400 leading-relaxed mb-10 max-w-lg font-normal"
                    >
                      Sui-Functions is a decentralized, zero-trust compute and verifiable memory platform for AI agents. Built on Sui and Walrus to replace fragile cloud middleware with a stateful, permissionless execution economy.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
                    >
                      <Button
                        onClick={() => setShowConnectModal(true)}
                        variant="primary"
                        size="md"
                        className="w-full sm:w-auto"
                      >
                        Become an Operator
                      </Button>
                      <Button
                        onClick={() => setShowConnectModal(true)}
                        variant="secondary"
                        size="md"
                        className="w-full sm:w-auto"
                      >
                        Deploy your Agent
                      </Button>
                    </motion.div>
                  </div>

                  {/* Glowing copper rotating 3D asset graphic */}
                  <div className="lg:col-span-5 flex justify-center items-center relative py-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center animate-float"
                    >
                      {/* Glowing decorative rings */}
                      <div className="absolute inset-0 rounded-full bg-brand-sui/10 blur-[80px]" />
                      <div className="absolute w-80 h-80 rounded-full border border-brand-sui/5 animate-pulse-slow" />
                      <div className="absolute w-64 h-64 rounded-full border border-brand-sui/10 border-dashed" />

                      {/* Orange 3D kinetic sphere image */}
                      <img
                        src="/sui-func-logo.png"
                        alt="Sui-Functions 3D Mesh Sphere"
                        className="w-60 h-60 sm:w-80 sm:h-80 object-contain drop-shadow-[0_0_50px_rgba(56,152,255,0.4)] relative z-10"
                      />
                    </motion.div>
                  </div>
                </section>

                {/* STATISTICS GRID */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="mb-32 border-y border-[#14304A] py-10"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#14304A]">
                    <div className="flex flex-col items-start md:pl-6 pt-4 md:pt-0">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Asset Density</span>
                      <span className="text-3xl font-bold text-[#E2E8F0] tracking-tight mb-1">4.2M+ <span className="text-[10px] text-slate-500 ml-1">SUI</span></span>
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest">Total SUI Staked</span>
                    </div>
                    <div className="flex flex-col items-start md:pl-10 pt-4 md:pt-0">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Reliability Matrix</span>
                      <span className="text-3xl font-bold text-[#E2E8F0] tracking-tight mb-1">100%</span>
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest">Uptime SLA Guaranteed</span>
                    </div>
                    <div className="flex flex-col items-start md:pl-10 pt-4 md:pt-0">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Node Distribution</span>
                      <span className="text-3xl font-bold text-[#E2E8F0] tracking-tight mb-1">1,402</span>
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest">Active Node Operators</span>
                    </div>
                    <div className="flex flex-col items-start md:pl-10 pt-4 md:pt-0">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Network Yield</span>
                      <span className="text-3xl font-bold text-[#E2E8F0] tracking-tight mb-1">18.4%</span>
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest">Estimated Annual APY</span>
                    </div>
                  </div>
                </motion.section>

                {/* POWERED BY / CORE INFRASTRUCTURE SECTION */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="mb-32"
                >
                  <div className="bg-[#050608] rounded-2xl p-8 md:p-14 text-center relative border border-[#14304A]">
                    
                    <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2 mb-6">
                      <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                      CORE PROTOCOL INFRASTRUCTURE
                    </span>

                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-outfit">
                      Powered by the <span className="text-slate-400">Sui Stack</span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-normal mb-16">
                      Sui-Functions merges next-generation layer-1 consensus with decentralized object storage to create a secure, sovereign edge compute backbone for autonomous agentic workflows.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch relative">
                      {/* Partner 1: Sui */}
                      <div className="flex flex-col justify-between p-8 bg-[#090C15] border border-[#14304A] rounded-xl text-left relative z-10">
                        <div>
                          <div className="flex items-start justify-between mb-8">
                            <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#050608]">
                              <img src="/sui.png" alt="Sui Network Logo" className="w-5 h-5 object-contain opacity-90" />
                            </div>
                            <span className="px-2 py-1 rounded border border-[#14304A] text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Coordination</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-[#E2E8F0] font-outfit mb-3">
                            Sui Network
                          </h3>
                          <p className="text-slate-400 text-[13px] leading-relaxed font-normal mb-10">
                            Acts as our state coordinator and event bus. Move smart contracts manage the dynamic trigger registry and commit completed execution receipts securely on-chain.
                          </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-[#14304A] pt-6 mt-auto">
                          <div className="w-1/2 h-[2px] bg-[#14304A] rounded-full overflow-hidden">
                            <div className="w-2/3 h-full bg-slate-500 rounded-full" />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Sync_Ready</span>
                        </div>
                      </div>

                      {/* Partner 2: Walrus */}
                      <div className="flex flex-col justify-between p-8 bg-[#090C15] border border-[#14304A] rounded-xl text-left relative z-10">
                        <div>
                          <div className="flex items-start justify-between mb-8">
                            <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#050608]">
                              <img src="/walrus.png" alt="Walrus Protocol Logo" className="w-5 h-5 object-contain opacity-90" />
                            </div>
                            <span className="px-2 py-1 rounded border border-[#14304A] text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Logic Registry</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-[#E2E8F0] font-outfit mb-3">
                            Walrus Protocol
                          </h3>
                          <p className="text-slate-400 text-[13px] leading-relaxed font-normal mb-10">
                            We utilize Walrus as our underlying logic registry, establishing content-addressed, immutable script distribution for the node operators.
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-[#14304A] pt-6 mt-auto">
                          <div className="w-1/2 h-[2px] bg-[#14304A] rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-slate-500 rounded-full" />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Blob_Verified</span>
                        </div>
                      </div>

                      {/* Partner 3: Seal Proxy */}
                      <div className="flex flex-col justify-between p-8 bg-[#090C15] border border-[#14304A] rounded-xl text-left relative z-10 shadow-[0_0_30px_rgba(56,152,255,0.05)] hover:shadow-[0_0_40px_rgba(56,152,255,0.1)] transition-shadow">
                        <div>
                          <div className="flex items-start justify-between mb-8">
                            <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#050608] overflow-hidden">
                              <img src="/seal.png" alt="Seal Logo" className="w-6 h-6 object-contain opacity-90 drop-shadow-[0_0_10px_rgba(56,152,255,0.4)]" />
                            </div>
                            <span className="px-2 py-1 rounded border border-[#14304A] text-[8px] font-mono font-bold text-[#3898FF] uppercase tracking-widest bg-[#3898FF]/10">Proxy Layer</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-[#E2E8F0] font-outfit mb-3">
                            Seal
                          </h3>
                          <p className="text-slate-400 text-[13px] leading-relaxed font-normal mb-10">
                            Our proprietary, secure proxy layer acts as the bridge between Web2 APIs and the decentralized compute network, ensuring data is cryptographically attested before on-chain submission.
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-[#14304A] pt-6 mt-auto">
                          <div className="w-1/2 h-[2px] bg-[#14304A] rounded-full overflow-hidden">
                            <div className="w-full h-full bg-[#3898FF] rounded-full shadow-[0_0_10px_rgba(56,152,255,0.8)]" />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-[#3898FF] uppercase tracking-widest animate-pulse">Attestation_Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* FEATURES SECTION (SPLIT-GRID INTERACTIVE ROW LAYOUT) */}
                <section id="features" className="scroll-mt-24 mb-32">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left Column: Context & Sticky Title */}
                    <div className="lg:col-span-5 flex flex-col justify-center text-left">
                      <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2 mb-4 self-start">
                        <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                        CORE CAPABILITIES
                      </span>
                      <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-outfit leading-[1.15]">
                        Engineered for <br />
                        <span className="text-slate-400">
                          Zero Downtime
                        </span>
                      </h2>
                      <p className="text-slate-400 text-[13px] leading-relaxed font-normal mb-8 max-w-sm">
                        By incentivizing a decentralized pool of operators, Sui-Functions delivers a trustless, sovereign execution environment that never crashes.
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1.5 border border-[#14304A] bg-[#0A1225] text-slate-400 font-bold text-[8px] uppercase tracking-widest font-mono w-max">
                        <span className="w-1.5 h-1.5 bg-[#3898FF]" />
                        ZERO TRUST ARCHITECTURE ACTIVE
                      </div>
                    </div>

                    {/* Right Column: High-fidelity stacked list elements */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                      {/* Feature Item 1 */}
                      <div className="flex gap-6 p-6 md:p-8 bg-[#050608] border border-[#14304A] rounded-xl text-left shadow-[4px_4px_0_0_#14304A]">
                        {/* Icon Container */}
                        <div className="w-12 h-12 rounded-lg border border-[#14304A] bg-[#090C15] flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Shield size={20} />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-bold text-[#E2E8F0] mb-2 font-outfit">
                            Secure V8 Sandboxing
                          </h3>
                          <p className="text-slate-500 text-[13px] leading-relaxed font-normal">
                            Execute code in secure Google V8 isolates. Enforces strict 128MB memory heap caps, 5s CPU execution limits, and robust filesystem-blocking security shims.
                          </p>
                        </div>
                      </div>



                      {/* Feature Item 2 */}
                      <div className="flex gap-6 p-6 md:p-8 bg-[#050608] border border-[#14304A] rounded-xl text-left shadow-[4px_4px_0_0_#14304A]">
                        {/* Icon Container */}
                        <div className="w-12 h-12 rounded-lg border border-[#14304A] bg-[#090C15] flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Zap size={20} />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-bold text-[#E2E8F0] mb-2 font-outfit">
                            On-Chain Trigger Bus
                          </h3>
                          <p className="text-slate-500 text-[13px] leading-relaxed font-normal">
                            Decouple event-driven logic via high-speed Sui smart contracts. Dynamic execution registry controls strict actor permissions and commits verified results.
                          </p>
                        </div>
                      </div>

                      {/* Feature Item 3 */}
                      <div className="flex gap-6 p-6 md:p-8 bg-[#050608] border border-[#14304A] rounded-xl text-left shadow-[4px_4px_0_0_#14304A]">
                        {/* Icon Container */}
                        <div className="w-12 h-12 rounded-lg border border-[#14304A] bg-[#090C15] flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Server size={20} />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-bold text-[#E2E8F0] mb-2 font-outfit">
                            Walrus Logic Protocol
                          </h3>
                          <p className="text-slate-500 text-[13px] leading-relaxed font-normal">
                            Store dynamic execution logic and scripts securely on the Walrus Protocol, creating decentralized, content-addressed software distribution for the node operators.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* MASSIVE FHE BANNER */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="mb-32"
                >
                  <div className="bg-[#040D09] border border-emerald-500/30 rounded-3xl p-8 md:p-14 text-left relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)]">
                    {/* Glow Effects */}
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold font-mono uppercase tracking-wider mb-6">
                          <ShieldCheck size={14} />
                          Zero-Trust Execution
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 font-outfit leading-tight">
                          Unstoppable Compute with <span className="text-emerald-400">Two Pillars of Zero-Trust.</span>
                        </h2>
                        <div className="space-y-4 mb-8">
                          <div className="flex gap-3">
                            <span className="text-emerald-400 mt-0.5 font-mono font-bold">1.</span>
                            <div>
                              <strong className="text-white block mb-1 text-sm">Sui-functions Proxy</strong>
                              <p className="text-emerald-100/70 text-xs leading-relaxed max-w-sm">Route external API requests (Stripe, OpenAI) through our managed proxy. This keeps your sensitive plaintext API keys entirely out of the decentralized node memory, and guarantees data integrity by signing the exact API responses.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-emerald-400 mt-0.5 font-mono font-bold">2.</span>
                            <div>
                              <strong className="text-white block mb-1 text-sm">Output Authenticity Auditor</strong>
                              <p className="text-emerald-100/70 text-xs leading-relaxed max-w-sm">Node Operators must submit the proxy's Ed25519 signatures alongside the final execution result. Our Sui Smart Contract strictly verifies these signatures on-chain, making it mathematically impossible for operators to forge or tamper with the web2 data.</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => { setViewMode('docs'); setTimeout(() => handleSectionScroll('zero-knowledge-fhe'), 100); }}
                          variant="primary"
                          size="md"
                          className="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-900 border-none shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                          View @sui-functions/sdk Docs
                        </Button>
                      </div>
                      
                      {/* Code Block Visual */}
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 font-mono text-xs overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#14304A] pb-4">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                          <span className="ml-2 text-[#8A95A5] text-[10px] uppercase tracking-widest font-bold">Proxy Attestation & On-Chain Audit</span>
                        </div>
                        <div className="text-[#ABB2BF] leading-loose">
                          <div><span className="text-[#8A95A5] italic">// 1. Trusted Proxy fetches API & Signs Data</span></div>
                          <div><span className="text-[#C678DD]">const</span> response = <span className="text-[#C678DD]">await</span> fetch(<span className="text-[#98C379]">'https://api.openai.com/...'</span>);</div>
                          <div><span className="text-[#C678DD]">const</span> signature = proxyKeypair.sign(response.bytes);</div>
                          <br />
                          <div><span className="text-[#8A95A5] italic">// 2. Node Operator Submits Payload</span></div>
                          <div><span className="text-[#C678DD]">await</span> submit_execution(response.bytes, signature);</div>
                          <br />
                          <div><span className="text-[#8A95A5] italic">// 3. Smart Contract Auditor Validates</span></div>
                          <div><span className="text-[#C678DD]">public fun</span> <span className="text-[#61AFEF]">submit_result</span>(data: <span className="text-[#E5C07B]">vector</span>&lt;<span className="text-[#E5C07B]">u8</span>&gt;, sig: <span className="text-[#E5C07B]">vector</span>&lt;<span className="text-[#E5C07B]">u8</span>&gt;) {'{'}</div>
                          <div className="ml-4"><span className="text-[#8A95A5] italic">// Aborts if Node Operator tampered with data</span></div>
                          <div className="ml-4"><span className="text-[#E5C07B]">assert!</span>(ed25519_verify(sig, PROXY_PUBKEY, data), <span className="text-[#D19A66]">401</span>);</div>
                          <div className="ml-4">...</div>
                          <div>{'}'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* THREE PILLARS ARCHITECTURE SECTION */}
                <motion.section
                  id="architecture"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="scroll-mt-24 flex flex-col mb-32 py-12"
                >
                  {/* Section Header */}
                  <div className="flex flex-col items-center text-center mb-16 gap-4">
                    <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                      CORE PROTOCOL LOGIC PIPELINE
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-outfit leading-tight">
                      Three Pillars Architecture
                    </h2>
                    <p className="text-slate-400 text-[13px] max-w-xl mx-auto leading-relaxed">
                      Experience the decentralized agentic execution cycle step-by-step: from fast blockchain triggers to immutable storage retrieval and secure sandbox execution.
                    </p>
                  </div>

                  {/* Horizontal Step Pipeline (3 Columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 relative select-none">
                    
                    {/* Visual vertical separators for desktop (optional, based on design) */}
                    <div className="hidden md:block absolute top-10 bottom-10 left-[33%] w-[1px] bg-[#14304A] z-0" />
                    <div className="hidden md:block absolute top-10 bottom-10 left-[66%] w-[1px] bg-[#14304A] z-0" />

                    {/* Step 1 Tab Card */}
                    <button
                      onClick={() => setActivePillar('trigger')}
                      className={`relative z-10 p-8 rounded-none border-y sm:border-y-0 sm:border-l-0 text-left transition-all duration-300 flex flex-col gap-6 group ${activePillar === 'trigger'
                          ? 'bg-[#050608] border-[#14304A]'
                          : 'bg-transparent border-transparent hover:bg-[#050608]'
                        }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Step 01</span>
                      <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#090C15] text-[#3898FF]">
                        <Zap size={16} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white font-outfit mb-3">Trigger Event Bus</h4>
                        <p className="text-[13px] text-slate-500 leading-relaxed font-normal">Sui Ledger Move smart contracts orchestrate and verify execution receipts on-chain.</p>
                      </div>
                    </button>

                    {/* Step 2 Tab Card */}
                    <button
                      onClick={() => setActivePillar('logic')}
                      className={`relative z-10 p-8 rounded-none border-y sm:border-y-0 sm:border-l-0 text-left transition-all duration-300 flex flex-col gap-6 group ${activePillar === 'logic'
                          ? 'bg-[#050608] border-[#14304A]'
                          : 'bg-transparent border-transparent hover:bg-[#050608]'
                        }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Step 02</span>
                      <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#090C15] text-slate-300">
                        <Server size={16} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white font-outfit mb-3">Logic Library</h4>
                        <p className="text-[13px] text-slate-500 leading-relaxed font-normal">Permanent, content-addressed WebAssembly code blobs stored cryptographically in Walrus.</p>
                      </div>
                    </button>

                    {/* Step 3 Tab Card */}
                    <button
                      onClick={() => setActivePillar('worker')}
                      className={`relative z-10 p-8 rounded-none border-y sm:border-y-0 sm:border-l-0 text-left transition-all duration-300 flex flex-col gap-6 group ${activePillar === 'worker'
                          ? 'bg-[#050608] border-[#14304A]'
                          : 'bg-transparent border-transparent hover:bg-[#050608]'
                        }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Step 03</span>
                      <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#090C15] text-cyan-400">
                        <Shield size={16} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white font-outfit mb-3">Isolated Workers</h4>
                        <p className="text-[13px] text-slate-500 leading-relaxed font-normal">Sui-Functions worker daemons invoke highly secure, VM-based Google v8 isolates dynamically.</p>
                      </div>
                    </button>
                  </div>

                  {/* Lower Grid: Editor + Telemetry Panel (12-Cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full text-left">
                    {/* Left: Code Editor (8/12) */}
                    <div className="lg:col-span-8 flex flex-col w-full">
                      <CodeWindow
                        activePillar={activePillar}
                        onPillarChange={setActivePillar}
                        className="w-full h-full flex-grow"
                      />
                    </div>

                    {/* Right: Diagnostics & Console Widget (4/12) */}
                    <div className="lg:col-span-4 flex w-full">
                      <div className="w-full bg-[#06070a] border border-[#1d2033] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden">
                        {/* Panel Header */}
                        <div>
                          <div className="flex items-center justify-between border-b border-[#141624] pb-4 mb-6 select-none">
                            <div className="flex items-center gap-2">
                              <Terminal size={14} className={activePillar === 'trigger' ? 'text-brand-sui' : activePillar === 'logic' ? 'text-brand-indigo' : 'text-brand-cyan'} />
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Diagnostics Console</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase tracking-wider ${isSimulating
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                                : activePillar === 'trigger'
                                  ? 'bg-brand-sui/10 text-brand-sui border-brand-sui/20'
                                  : activePillar === 'logic'
                                    ? 'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20'
                                    : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20'
                              }`}>
                              {isSimulating ? 'Active' : 'Idle'}
                            </span>
                          </div>

                          {/* Dynamic Metric Parameters */}
                          <div className="grid grid-cols-2 gap-3 mb-6 select-none">
                            {activePillar === 'trigger' && (
                              <>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Network</span>
                                  <span className="text-xs font-bold text-white">Sui Mainnet</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Consensus</span>
                                  <span className="text-xs font-bold text-white">Mysticeti</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Throughput</span>
                                  <span className="text-xs font-bold text-white">100K+ TPS</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Tx Latency</span>
                                  <span className="text-xs font-bold text-brand-sui">~390ms</span>
                                </div>
                              </>
                            )}

                            {activePillar === 'logic' && (
                              <>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Storage</span>
                                  <span className="text-xs font-bold text-white">Walrus Blob</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Blob Integrity</span>
                                  <span className="text-xs font-bold text-white">SHA-256</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Logic Size</span>
                                  <span className="text-xs font-bold text-white">43.5 KB (wasm)</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Model</span>
                                  <span className="text-xs font-bold text-brand-indigo">Permanent Store</span>
                                </div>
                              </>
                            )}

                            {activePillar === 'worker' && (
                              <>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Isolate Engine</span>
                                  <span className="text-xs font-bold text-white">Google V8</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Cold Start</span>
                                  <span className="text-xs font-bold text-white">~0ms</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Isolation</span>
                                  <span className="text-xs font-bold text-white">Airgapped VM</span>
                                </div>
                                <div className="p-3.5 bg-[#030407] border border-[#141624] rounded-xl flex flex-col gap-1">
                                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Isolate Heap</span>
                                  <span className="text-xs font-bold text-brand-cyan">128 MB Limit</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Terminal Log Screen inside Panel */}
                          <div className="bg-[#010204] border border-[#141624] p-4 font-mono text-[11px] h-48 rounded-xl overflow-y-auto leading-relaxed flex flex-col justify-start">
                            {simulationLogs.length === 0 && !isSimulating ? (
                              <div className="text-slate-650 italic select-none flex items-center justify-center h-full text-center">
                                Click "SIMULATE PROCESS" below to verify the runtime environment logs.
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {simulationLogs.map((log, index) => {
                                  let colorClass = 'text-slate-400';
                                  if (log.includes('🚀') || log.includes('🔍') || log.includes('⚡')) colorClass = 'text-cyan-400';
                                  if (log.includes('✅') || log.includes('OK') || log.includes('SUCCESS')) colorClass = 'text-brand-cyan';
                                  if (log.includes('RECEIVED:') || log.includes('FOUND') || log.includes('🔒')) colorClass = 'text-sky-400';

                                  return (
                                    <div key={index} className={`${colorClass} flex items-start gap-1 font-mono`}>
                                      <span className="text-slate-700 flex-shrink-0 select-none">&gt;</span>
                                      <span>{log}</span>
                                    </div>
                                  );
                                })}
                                {isSimulating && (
                                  <div className="text-brand-sui flex items-center gap-1 select-none font-mono">
                                    <span className="text-slate-700 flex-shrink-0">&gt;</span>
                                    <span className="w-1.5 h-3 bg-brand-sui animate-pulse inline-block" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Simulated Trigger action button */}
                        <button
                          onClick={startSimulation}
                          disabled={isSimulating}
                          className={`w-full mt-6 py-3.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 select-none ${isSimulating
                              ? 'bg-slate-800/40 text-slate-500 border border-slate-700/20 cursor-not-allowed'
                              : activePillar === 'trigger'
                                ? 'bg-brand-sui/10 hover:bg-brand-sui/20 text-brand-sui border border-brand-sui/20 shadow-[0_0_15px_rgba(56,152,255,0.08)]'
                                : activePillar === 'logic'
                                  ? 'bg-brand-indigo/10 hover:bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]'
                                  : 'bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                            }`}
                        >
                          {isSimulating ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>SIMULATING SYSTEM FLOW...</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} fill="currentColor" />
                              <span>SIMULATE PROCESS</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* SOVEREIGN DEVOPS & GOVERNANCE SECTION */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="mb-32 py-12 relative overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Interactive Visual Representation */}
                    <div className="lg:col-span-6 order-2 lg:order-1 relative z-10 w-full">
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative text-left w-full">
                        {/* Visual Header */}
                        <div className="flex items-center justify-between border-b border-[#14304A] pb-4 mb-6">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00FFAA] animate-pulse"></span>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Upgrade Request Proposal</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-[#0B2027] border border-[#14304A] text-[#00FFAA] font-mono font-bold text-[9px] uppercase tracking-wider">Awaiting Sigs</span>
                        </div>

                        {/* Proposal Metadata */}
                        <div className="flex flex-col gap-0 font-mono text-[12px] mb-6 border border-[#14304A] rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center px-4 py-3 bg-[#090C15] border-b border-[#14304A]">
                            <span className="text-slate-500 font-bold">TARGET FUNCTION:</span>
                            <span className="text-white font-bold">sui_usd_oracle.js</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-[#050608] border-b border-[#14304A]">
                            <span className="text-slate-500 font-bold">CURRENT BLOB ID:</span>
                            <span className="text-slate-300 font-bold select-all">K9YtZ1pL0L8q...</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-[#050608]">
                            <span className="text-slate-500 font-bold">PROPOSED BLOB ID:</span>
                            <span className="text-[#3898FF] font-bold select-all">W7VwX2jrIH5y...</span>
                          </div>
                        </div>

                        {/* Multi-Sig Approvals Track */}
                        <div className="flex flex-col gap-3.5 mb-6">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 pl-1">Consensus Progress (2/3 Approved)</span>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090C15] border border-[#14304A]">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-[#0B2027] border border-[#14304A] flex items-center justify-center text-[#00FFAA] font-bold">✓</div>
                              <span className="text-[12px] font-mono font-medium text-slate-300">0x8a4c...4086 (Lead Dev)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#00FFAA] uppercase">Approved</span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090C15] border border-[#14304A]">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-[#0B2027] border border-[#14304A] flex items-center justify-center text-[#00FFAA] font-bold">✓</div>
                              <span className="text-[12px] font-mono font-medium text-slate-300">0x2528...9832 (Security Auditor)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#00FFAA] uppercase">Approved</span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090C15] border border-[#14304A]">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-[#050608] border border-[#14304A] flex items-center justify-center text-[#00FFAA] font-mono text-[10px] animate-pulse">●</span>
                              <span className="text-[12px] font-mono font-medium text-slate-500">0xf767...1104 (Sponsor Treasury)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase animate-pulse">Pending</span>
                          </div>
                        </div>

                        {/* Explanatory visual note */}
                        <div className="p-4 bg-[#090C15] border border-[#14304A] rounded-xl text-[11px] text-slate-400 leading-relaxed font-medium">
                          Sui layer-1 smart contracts natively block updates to edge runners until the registered Multisig object triggers a verified state change transaction.
                        </div>
                      </div>
                    </div>

                    {/* Right: Rich Explanatory Copy */}
                    <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start text-left justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                        IMMUTABLE REGISTRY
                      </span>
                      <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-outfit leading-tight mb-6">
                        Sovereign Upgrade Governance <br />
                        <span className="text-[#00FFAA]">Controlled by Consensus</span>
                      </h2>
                      <p className="text-slate-400 text-[13px] leading-relaxed font-normal mb-8">
                        Unlike traditional Web2 cloud functions, where a single hacked developer key or hijacked CI/CD pipeline can secretly poison hosted code, Sui-Functions introduces an unhackable deployment lifecycle for agentic logic.
                      </p>

                      <div className="flex flex-col gap-6 w-full">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA] flex-shrink-0">
                            <Shield size={16} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white mb-2 font-outfit">Content-Addressed Integrity</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-normal">
                              Scripts are pinned permanently to Walrus using cryptographic Blob IDs. If a single character is altered, the Blob hash changes, completely neutralizing supply-chain injection attacks.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA] flex-shrink-0">
                            <Users size={16} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white mb-2 font-outfit">Consensus-Gated Deployments</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-normal">
                              Ownership of deployment projects can be held by on-chain multisigs or community DAO smart contracts. Upgrades demand cryptographic consensus before code can execute.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA] flex-shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white mb-2 font-outfit">100% Provable & Auditable</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-normal">
                              The active code mapped to any function is recorded transparently on the public Sui ledger. Anyone can download the exact matching script, auditable down to the byte.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* DEPIN COMPUTE MINER (COMING SOON) */}
                <section id="nodes" className="scroll-mt-24 mb-32 relative">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Content */}
                    <div className="lg:col-span-6 text-left relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] mb-6">
                        <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                        NODE RUNNER ECONOMY
                      </div>
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6 font-outfit">
                        Run a Node.<br />
                        <span className="text-[#00FFAA]">Earn SUI.</span>
                      </h2>
                      <p className="text-slate-400 text-[13px] leading-relaxed mb-8 max-w-lg">
                        Sui-Functions is building a completely decentralized compute economy. Anyone can now download our decentralized runner engine, stake SUI, and earn passive income by executing agentic workloads securely on their own hardware.
                      </p>
                      
                      <ul className="flex flex-col gap-4 font-mono text-[10px] text-slate-300 uppercase font-bold tracking-wide mb-10">
                        <li className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <Terminal size={12} />
                          </div>
                          Zero DevOps — Just run the CLI command
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <Globe size={12} />
                          </div>
                          Hardware agnostic (Mac, Linux, Windows)
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <ShieldCheck size={12} />
                          </div>
                          Mathematically secure V8 isolation
                        </li>
                      </ul>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button
                          variant="primary"
                          className="w-full sm:w-auto"
                        >
                          BECOME A MINER
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#14304A] text-white hover:bg-[#090C15] w-full sm:w-auto"
                        >
                          READ DOCUMENTATION
                        </Button>
                      </div>
                    </div>

                    {/* Right: Terminal Visual */}
                    <div className="lg:col-span-6 relative z-10 w-full">
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 md:p-8 font-mono text-[10px] text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-left w-full relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-[#14304A] pb-4">
                          <div className="flex items-center gap-2">
                            <Terminal size={12} className="text-slate-500" />
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Node Setup Terminal</span>
                          </div>
                          <span className="text-[8px] text-[#00FFAA] font-bold px-2 py-1 bg-[#00FFAA]/10 rounded border border-[#00FFAA]/20">LIVE NOW</span>
                        </div>
                        <div className="space-y-3 leading-relaxed">
                          <div className="text-slate-500"># 1. Connect your private key to the global network</div>
                          <div className="text-[#00FFAA] font-semibold">export OPERATOR_KEY_PATH="~/.sui-functions/operator.json"</div>
                          <div className="h-3"></div>
                          <div className="text-slate-500"># 2. Boot the decentralized runtime engine directly from Walrus</div>
                          <div className="text-white font-semibold">npx sui-functions-node --core \</div>
                          <div className="text-white font-semibold pl-6">{LATEST_RUNNER_BLOB_ID}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* LIVE DEMO SHOWCASE (USE CASES) */}
                <section className="mb-32">
                  <div className="flex flex-col items-center text-center mb-16 gap-4">
                    <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                      AGENT SHOWCASES
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-outfit leading-tight">
                      Use Cases
                    </h2>
                    <p className="text-slate-400 text-[13px] max-w-2xl mx-auto leading-relaxed">
                      Explore dynamic, high-performance web applications powered entirely by secure V8 execution isolates and immutable Walrus data publishing.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 w-full">
                    {/* Featured Large Card */}
                    <div className="bg-[#050608] border border-[#14304A] rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                      <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Left Content */}
                        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center text-left">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] text-[9px] font-mono font-bold uppercase tracking-widest mb-8 w-fit">
                            <Globe size={10} /> AGENT SHOWCASE
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white font-outfit mb-4">
                            Autonomous DeFi Agent
                          </h3>
                          <p className="text-slate-400 text-[13px] leading-relaxed mb-8 max-w-md">
                            Utilizing on-chain triggers to audit live inventory valuations and evaluate market deviations within secure V8 sandboxes. This agent executes automatically, maintaining consensus criteria independently of traditional off-chain scripts.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-10">
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#090C15] border border-[#14304A] px-2.5 py-1.5 rounded uppercase tracking-wider">Agentic Web</span>
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#090C15] border border-[#14304A] px-2.5 py-1.5 rounded uppercase tracking-wider">Walrus Logic Registry</span>
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#090C15] border border-[#14304A] px-2.5 py-1.5 rounded uppercase tracking-wider">Sui Event Bus</span>
                          </div>
                          <a
                            href="https://sui-inventory.web.app/"
                            target="_blank"
                            rel="noreferrer"
                            className="w-fit inline-block"
                          >
                            <Button
                              variant="primary"
                              className="flex items-center gap-2 px-6"
                            >
                              <span>LAUNCH AGENT SHOWCASE</span>
                              <ArrowRight size={14} />
                            </Button>
                          </a>
                        </div>
                        {/* Right Decorative Visual */}
                        <div className="lg:col-span-6 bg-[#030407] border-t lg:border-t-0 lg:border-l border-[#14304A] p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
                          {/* Ambient glow */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00FFAA]/5 blur-[80px] rounded-full pointer-events-none" />
                          
                          <div className="w-full max-w-md border border-[#14304A] rounded-2xl bg-[#090C15] p-6 shadow-2xl relative z-10">
                            <div className="flex flex-col gap-4 mb-8">
                              <div className="h-1.5 w-full bg-[#14304A] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00FFAA] w-[85%] rounded-full shadow-[0_0_10px_#00FFAA]"></div>
                              </div>
                              <div className="h-1.5 w-full bg-[#14304A] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00FFAA] w-[60%] rounded-full shadow-[0_0_10px_#00FFAA]"></div>
                              </div>
                              <div className="h-1.5 w-full bg-[#14304A] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00FFAA] w-[40%] rounded-full shadow-[0_0_10px_#00FFAA]"></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t border-[#14304A] pt-6">
                              <div className="flex flex-col items-center justify-center text-center">
                                <span className="text-[#00FFAA] font-mono font-bold text-lg">1.2s</span>
                                <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">LATENCY</span>
                              </div>
                              <div className="flex flex-col items-center justify-center border-l border-[#14304A] text-center">
                                <span className="text-white font-mono font-bold text-lg">+$200</span>
                                <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">PROFIT</span>
                              </div>
                              <div className="flex flex-col items-center justify-center border-l border-[#14304A] text-center">
                                <span className="text-white font-mono font-bold text-lg">98ms</span>
                                <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">EXECUTION</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Smaller Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      {/* Card 1 */}
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 hover:border-[#3898FF]/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#3898FF]">
                            <Layers size={16} />
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 mt-2 border border-[#14304A] px-2 py-1 rounded bg-[#090C15]">
                            COMING SOON
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-outfit mb-3">Dynamic NFT's</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-normal">
                          Unlock dynamically changing NFT traits updated programmatically by agentic workflows running on-chain.
                        </p>
                      </div>
                      
                      {/* Card 2 */}
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 hover:border-[#3898FF]/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <Wallet size={16} />
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 mt-2 border border-[#14304A] px-2 py-1 rounded bg-[#090C15]">
                            COMING SOON
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-outfit mb-3">Secure Dex Trade</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-normal">
                          Autonomous dex trading execution bots leveraging secure hardware enclaves to validate complex logic flows.
                        </p>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 hover:border-[#3898FF]/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-purple-400">
                            <Server size={16} />
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 mt-2 border border-[#14304A] px-2 py-1 rounded bg-[#090C15]">
                            COMING SOON
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-outfit mb-3">Knowledge Base</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-normal">
                          Interactive, decentralized agents that automate data indexing and knowledge management for web3 protocols.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* VAULT & BILLING SYSTEM */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="mb-32 relative"
                >
                  <div className="flex flex-col items-center text-center mb-16 gap-4">
                    <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                      ECONOMICS
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-outfit leading-tight">
                      Decentralized Compute Billing
                    </h2>
                    <p className="text-slate-400 text-[13px] max-w-xl mx-auto leading-relaxed">
                      Sponsor your agentic workflows with on-chain project vaults. Let your users interact with your dApps gas-free while you manage compute economics centrally.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {/* Card 1 */}
                    <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 hover:border-[#3898FF]/30 transition-all duration-300 flex flex-col justify-between h-full text-left">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <Wallet size={16} />
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 mt-2">
                            TOTAL VAULTS
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white font-outfit mb-3">Project Vaults</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-normal mb-8">
                          Each workspace gets its own smart contract vault. Deposit SUI upfront to sponsor compute for all your registered functions.
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-[#14304A] mt-auto">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">ON-CHAIN SMART</span>
                        <Hexagon size={12} className="text-slate-600" />
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 hover:border-[#3898FF]/30 transition-all duration-300 flex flex-col justify-between h-full text-left">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <Zap size={16} />
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 mt-2">
                            POOL BALANCE
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white font-outfit mb-3">Pay-Per-Execution</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-normal mb-8">
                          Flat fee of 0.007 SUI per successful execution. You only pay for what you use, and funds are automatically deducted from your vault.
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-[#14304A] mt-auto">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">PROTOCOL TREASURY</span>
                        <Hexagon size={12} className="text-slate-600" />
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 hover:border-[#3898FF]/30 transition-all duration-300 flex flex-col justify-between h-full text-left">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-[#00FFAA]">
                            <Server size={16} />
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 mt-2">
                            NODE OPERATORS
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white font-outfit mb-3">Runner Incentives</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-normal mb-8">
                          85% of your compute fee goes directly to the decentralized node runners executing your code. Run your own node to save costs!
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-[#14304A] mt-auto">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">CAPITAL EFFICIENT</span>
                        <Hexagon size={12} className="text-slate-600" />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* TRUE DECENTRALIZATION - TEE CONTRAST */}
                {false && (
                <section className="mb-32 relative py-12">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Terminal Visual representing TEE pain */}
                    <div className="lg:col-span-6 relative z-10 w-full order-2 lg:order-1">
                      <div className="bg-[#030407] border border-[#141624] rounded-2xl p-6 md:p-8 font-mono text-[11px] md:text-xs text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-left w-full relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-indigo opacity-60" />
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                          <div className="flex items-center gap-2">
                            <Layers size={14} className="text-brand-indigo" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">The Legacy TEE Approach</span>
                          </div>
                          <span className="text-[9px] text-red-400 font-bold px-2 py-1 bg-red-500/10 rounded border border-red-500/20">AWS DEPENDENT</span>
                        </div>
                        <div className="space-y-3 opacity-60">
                          <div className="text-red-400">ERROR: Hardware Enclave Not Found</div>
                          <div className="text-slate-400"># Traditional off-chain compute requires proprietary hardware</div>
                          <div className="text-slate-500">aws ec2 run-instances --instance-type m5.xlarge --enclave-options Enabled=true</div>
                          <div className="text-slate-400 mt-4"># Result: Centralized cloud provider dependency (Web2.5)</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Content */}
                    <div className="lg:col-span-6 text-left relative z-10 order-1 lg:order-2">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-indigo/40 bg-brand-indigo/10 text-brand-indigo text-[10px] font-extrabold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <ShieldCheck size={10} /> True Decentralization
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 font-outfit">
                        Zero Cloud Lock-in. <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-cyan-400">Hardware Agnostic.</span>
                      </h2>
                      <p className="text-slate-200 text-base leading-relaxed mb-8 max-w-lg font-medium">
                        Other off-chain compute networks force you to rent expensive, centralized AWS Nitro Enclaves. Sui-Functions uses mathematically secure V8 Sandboxing, meaning our network is truly decentralized, and you can deploy your logic in 10 seconds with our beautiful UI—no complex CLI required.
                      </p>
                      
                      <ul className="flex flex-col gap-3 font-mono text-[11px] text-slate-400">
                        <li className="flex items-center gap-2">
                          <span className="text-brand-indigo">✓</span> No proprietary AWS hardware required
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-brand-indigo">✓</span> 1-Click Dashboard Deploy vs Raw SDKs
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-brand-indigo">✓</span> A true DePIN economy, not a rented server
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
                )}

                {/* ENTERPRISE AVAILABILITY */}
                {false && (
                <section className="mb-32 relative rounded-[48px] overflow-hidden border border-[#161722]/50 bg-[#0A1C2E]/60">
                  {/* Enterprise map image background */}
                  <div className="absolute inset-0 bg-[url('/enterprice-bg.png')] bg-cover bg-center opacity-70 pointer-events-none" />
                  {/* Custom dark overlay with low opacity backdrop blur */}
                  <div className="absolute inset-0 bg-[#05060a]/85 backdrop-blur-[1px] pointer-events-none" />
                  <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

                  <div className="relative z-10 text-center py-12 md:py-20">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit">
                      Ubiquitous Sovereign Compute
                    </h2>
                    <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
                      Expanding the sovereign compute boundary beyond Web3 to unlock massive global physical infrastructure and enterprise SaaS pipelines.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">

                      {/* Regions Item */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full border border-brand-sui/30 bg-brand-sui-glow flex items-center justify-center text-brand-sui mb-6 shadow-[0_0_20px_rgba(56,152,255,0.15)] hover:scale-105 transition-transform duration-300">
                          <Globe size={24} />
                        </div>
                        <h4 className="text-xl font-extrabold text-white font-outfit mb-1.5">IoT &amp; DePIN</h4>
                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Dynamic Telemetry Auditing</span>
                      </div>

                      {/* Validators Item */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full border border-brand-indigo/30 bg-brand-indigo-glow flex items-center justify-center text-brand-indigo mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:scale-105 transition-transform duration-300">
                          <Server size={24} />
                        </div>
                        <h4 className="text-xl font-extrabold text-white font-outfit mb-1.5">Cloud Sovereignty</h4>
                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Decentralized Execution Registry</span>
                      </div>

                      {/* Support Item */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full border border-brand-cyan/30 bg-brand-cyan-glow flex items-center justify-center text-brand-cyan mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-105 transition-transform duration-300">
                          <Clock size={24} />
                        </div>
                        <h4 className="text-xl font-extrabold text-white font-outfit mb-1.5">B2B SaaS Glue</h4>
                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Stripe &amp; Webhook Automations</span>
                      </div>

                    </div>
                  </div>
                </section>
                )}

                {/* ROADMAP SECTION */}
                {false && (
                <section id="roadmap" className="scroll-mt-24 mb-32 relative">
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-sui/30 bg-brand-sui-glow text-brand-sui text-[10px] font-extrabold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(56,152,255,0.1)]">
                      <Clock size={10} /> Development Roadmap
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit">
                      The Path to Verifiable Off-Chain Compute
                    </h2>
                    <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                      Scaling our isolated execution nodes to support heavy compute architectures, cryptographic proof generation, and confidential enclaves.
                    </p>
                  </div>

                  <div className="relative max-w-5xl mx-auto mt-24 px-6 md:px-12">
                    {/* The vertical timeline line (centered on desktop, left-aligned on mobile) */}
                    <div className="absolute left-[24px] lg:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-brand-sui via-brand-indigo to-brand-cyan/20 -translate-x-[1px] lg:-translate-x-1/2 z-0 opacity-40" />

                    <div className="space-y-24 relative z-10">

                      {/* Phase 1 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left Side: Content */}
                        <div className="pl-12 lg:pl-0 lg:pr-16 text-left lg:text-right relative">
                          {/* Timeline node icon */}
                          <div className="absolute top-1 left-[-42px] lg:left-auto lg:right-[-52px] lg:translate-x-1/2 w-10 h-10 rounded-full bg-[#06070a] border-2 border-brand-sui flex items-center justify-center shadow-[0_0_15px_rgba(56,152,255,0.4)] z-20">
                            <CheckCircle2 size={16} className="text-brand-sui" />
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full bg-brand-sui/5 border border-brand-sui/20 text-[9px] font-mono font-bold text-brand-sui uppercase tracking-wider mb-3">
                            Phase 1 (Live) • V8 Isolate Compute
                          </span>
                          <h3 className="text-2xl font-bold text-white font-outfit mb-3">
                            Edge Isolates
                          </h3>
                          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Event-driven TypeScript/JavaScript execution environments with strict V8 heap allocations and execution limits. Deployed and monitored natively via Sui contracts and Walrus blobs.
                          </p>
                          <ul className="inline-flex flex-col gap-2.5 font-mono text-[10px] text-slate-400 text-left">
                            <li className="flex items-center gap-2">
                              <span className="text-brand-sui">✓</span> V8 sandboxed environments
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-sui">✓</span> On-chain trigger coordination
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-sui">✓</span> Immutable Walrus logic library
                            </li>
                          </ul>
                        </div>

                        {/* Right Side: Visual terminal */}
                        <div className="pl-12 lg:pl-16">
                          <div className="bg-[#050608]/90 border border-brand-sui/15 rounded-2xl p-5 font-mono text-[10px] text-slate-300 shadow-[0_15px_40px_rgba(0,0,0,0.4)] text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-brand-sui opacity-40" />
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand-sui animate-pulse" />
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Isolate Daemon Log</span>
                              </div>
                              <span className="text-[8px] text-slate-600 font-mono">active</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-brand-sui font-semibold">[init] Google V8 Isolate initialized</div>
                              <div className="text-slate-400">[mem] Heap limit set to 128MB</div>
                              <div className="text-slate-400">[exec] Running script blob 0x5f71e...</div>
                              <div className="text-brand-cyan font-semibold">[done] Execution success: 2.14ms</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase 2 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left Side: Visual terminal */}
                        <div className="pl-12 lg:pl-0 lg:pr-16 order-2 lg:order-1">
                          <div className="bg-[#050608]/90 border border-brand-indigo/15 rounded-2xl p-5 font-mono text-[10px] text-slate-300 shadow-[0_15px_40px_rgba(0,0,0,0.4)] text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-brand-indigo opacity-40" />
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand-indigo animate-pulse" />
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">zkVM &amp; Market Terminal</span>
                              </div>
                              <span className="text-[8px] text-slate-600 font-mono">in_dev</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-brand-indigo font-semibold">[market] Purchasing function 0x4f12...</div>
                              <div className="text-slate-400">[fees] Routing: 95% operator, 5% protocol treasury</div>
                              <div className="text-slate-400">[proof] Executing SP1 zkVM cycle count</div>
                              <div className="text-brand-cyan font-semibold">[verify] Execution verified &amp; payout settled</div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="pl-12 lg:pl-16 text-left order-1 lg:order-2 relative">
                          {/* Timeline node icon */}
                          <div className="absolute top-1 left-[-42px] lg:left-[-52px] lg:-translate-x-1/2 w-10 h-10 rounded-full bg-[#06070a] border-2 border-brand-indigo flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] z-20">
                            <div className="w-3 h-3 rounded-full bg-brand-indigo animate-ping opacity-75 absolute" />
                            <div className="w-2 h-2 rounded-full bg-brand-indigo relative z-10" />
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full bg-brand-indigo/5 border border-brand-indigo/20 text-[9px] font-mono font-bold text-brand-indigo uppercase tracking-wider mb-3">
                            Phase 2 (Q3 2026) • Compute Marketplace
                          </span>
                          <h3 className="text-2xl font-bold text-white font-outfit mb-3">
                            Compute &amp; Functions Marketplace
                          </h3>
                          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Native compilation support for Rust/Go Wasm scripts. Launch of the Sui-Functions Marketplace enabling developers to deploy verified compute blocks for sale, backed by automatic protocol fee routing and shared runner compensation splits.
                          </p>
                          <ul className="inline-flex flex-col gap-2.5 font-mono text-[10px] text-slate-400 text-left">
                            <li className="flex items-center gap-2">
                              <span className="text-brand-indigo">●</span> Compiled WebAssembly runtimes
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-indigo">●</span> RISC Zero / SP1 zkVM proofs
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-indigo">●</span> Verified Functions Marketplace
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-indigo">●</span> Protocol fee &amp; operator rewards
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Phase 3 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left Side: Content */}
                        <div className="pl-12 lg:pl-0 lg:pr-16 text-left lg:text-right relative">
                          {/* Timeline node icon */}
                          <div className="absolute top-1 left-[-42px] lg:left-auto lg:right-[-52px] lg:translate-x-1/2 w-10 h-10 rounded-full bg-[#06070a] border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 z-20">
                            <Zap size={16} />
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                            Phase 3 (Q4 2026) • UX Abstraction
                          </span>
                          <h3 className="text-2xl font-bold text-white font-outfit mb-3">
                            Native Gas Sponsoring
                          </h3>
                          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Built-in Sui Sponsored Transactions and zkLogin integration. Allow developers to pay the network gas and compute fees automatically from their pre-funded workspace balance, delivering a 100% Web2-like experience for end-users interacting with autonomous agents.
                          </p>
                          <ul className="inline-flex flex-col gap-2.5 font-mono text-[10px] text-slate-400 text-left">
                            <li className="flex items-center gap-2">
                              <span className="text-cyan-400">●</span> Zero-wallet onboarding (zkLogin)
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-cyan-400">●</span> Pre-funded workspace vaults
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-cyan-400">●</span> Seamless B2B2C agentic compute
                            </li>
                          </ul>
                        </div>

                        {/* Right Side: Visual terminal */}
                        <div className="pl-12 lg:pl-16">
                          <div className="bg-[#050608]/90 border border-cyan-500/15 rounded-2xl p-5 font-mono text-[10px] text-slate-300 shadow-[0_15px_40px_rgba(0,0,0,0.4)] text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 opacity-40" />
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Gas Station Relay</span>
                              </div>
                              <span className="text-[8px] text-slate-600 font-mono">planned</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-cyan-400 font-semibold">[relay] Intercepting execution request...</div>
                              <div className="text-slate-400">[auth] Verified zkLogin payload</div>
                              <div className="text-slate-400">[vault] Deducting 0.007 SUI from workspace balance</div>
                              <div className="text-brand-cyan font-semibold">[sponsor] Network gas paid &amp; tx committed successfully</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase 4 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left Side: Visual terminal */}
                        <div className="pl-12 lg:pl-0 lg:pr-16 order-2 lg:order-1">
                          <div className="bg-[#050608]/90 border border-purple-500/15 rounded-2xl p-5 font-mono text-[10px] text-slate-300 shadow-[0_15px_40px_rgba(0,0,0,0.4)] text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500 opacity-40" />
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">zkVM Prover Terminal</span>
                              </div>
                              <span className="text-[8px] text-slate-600 font-mono">future</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-purple-400 font-semibold">[prove] Generating RISC Zero receipt...</div>
                              <div className="text-slate-400">[compute] 250M cycle count reached</div>
                              <div className="text-slate-400">[verify] Publishing Groth16 proof to Sui</div>
                              <div className="text-brand-cyan font-semibold">[chain] Execution mathematically verified</div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="pl-12 lg:pl-16 text-left order-1 lg:order-2 relative">
                          {/* Timeline node icon */}
                          <div className="absolute top-1 left-[-42px] lg:left-[-52px] lg:-translate-x-1/2 w-10 h-10 rounded-full bg-[#06070a] border-2 border-purple-500/30 flex items-center justify-center text-purple-400 z-20">
                            <Server size={16} />
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full bg-purple-500/5 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-3">
                            Phase 4 (Q1 2027) • zkVM Integration
                          </span>
                          <h3 className="text-2xl font-bold text-white font-outfit mb-3">
                            Verifiable Heavy Compute
                          </h3>
                          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Native compilation support for Rust/Go Wasm scripts. Integration with zkVM systems (RISC Zero / SP1) to generate execution proofs that are verified in Sui Move contracts, offloading massive compute requirements.
                          </p>
                          <ul className="inline-flex flex-col gap-2.5 font-mono text-[10px] text-slate-400 text-left">
                            <li className="flex items-center gap-2">
                              <span className="text-purple-400">●</span> Compiled WebAssembly runtimes
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-purple-400">●</span> RISC Zero / SP1 zkVM proofs
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-purple-400">●</span> Mathematical verifiability
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Phase 5 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left Side: Content */}
                        <div className="pl-12 lg:pl-0 lg:pr-16 text-left lg:text-right relative">
                          {/* Timeline node icon */}
                          <div className="absolute top-1 left-[-42px] lg:left-auto lg:right-[-52px] lg:translate-x-1/2 w-10 h-10 rounded-full bg-[#06070a] border-2 border-brand-cyan/30 flex items-center justify-center text-brand-cyan z-20">
                            <Shield size={16} />
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 text-[9px] font-mono font-bold text-brand-cyan uppercase tracking-wider mb-3">
                            Phase 5 (Q2 2027) • Confidential TEE Enclaves
                          </span>
                          <h3 className="text-2xl font-bold text-white font-outfit mb-3">
                            Sovereign Enclaves
                          </h3>
                          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Integrate execution worker nodes inside Hardware TEEs (AWS Nitro / Intel SGX). Match Nautilus compute capabilities but offer one-click secure deployments to store private API keys and agent models safely.
                          </p>
                          <ul className="inline-flex flex-col gap-2.5 font-mono text-[10px] text-slate-400 text-left">
                            <li className="flex items-center gap-2">
                              <span className="text-brand-cyan">●</span> Hardware-isolated enclaves
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-cyan">●</span> Encrypted environment variables
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-brand-cyan">●</span> Native Nautilus parity
                            </li>
                          </ul>
                        </div>

                        {/* Right Side: Visual terminal */}
                        <div className="pl-12 lg:pl-16">
                          <div className="bg-[#050608]/90 border border-brand-cyan/15 rounded-2xl p-5 font-mono text-[10px] text-slate-300 shadow-[0_15px_40px_rgba(0,0,0,0.4)] text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-brand-cyan opacity-40" />
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Secure Enclave Monitor</span>
                              </div>
                              <span className="text-[8px] text-slate-600 font-mono">future</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-brand-cyan font-semibold">[tee] AWS Nitro Enclave handshakes active</div>
                              <div className="text-slate-400">[env] Loading encrypted environment variables</div>
                              <div className="text-slate-400">[key] Ephemeral key generated in hardware memory</div>
                              <div className="text-brand-cyan font-semibold">[secure] Isolated execution pipeline sealed</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>
                )}

                {/* EVOLUTION OF OFF-CHAIN COMPUTE */}
                <motion.section
                  id="evolution"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="scroll-mt-24 mb-32 relative"
                >
                  <div className="flex flex-col items-center text-center mb-16 gap-4">
                    <span className="px-3 py-1.5 rounded-full bg-[#0B2027] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00FFAA] rounded-full"></span>
                      THE EVOLUTION
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-outfit leading-tight">
                      Beyond Verification.<br />
                      <span className="text-[#00FFAA]">Into a Compute Economy.</span>
                    </h2>
                    <p className="text-slate-400 text-[13px] max-w-2xl mx-auto leading-relaxed">
                      Nautilus pioneered verifiable off-chain compute with TEEs. Sui-Functions extends that vision into a fully decentralized, incentivized execution network — where anyone can participate, earn, and build.
                    </p>
                  </div>

                  {/* Evolution Timeline */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
                    {/* Left: Nautilus (Foundation) */}
                    <div className="lg:col-span-5 text-left">
                      <div className="bg-[#050608] border border-[#14304A] rounded-2xl p-6 md:p-8 h-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-600 to-slate-700"></div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#14304A] flex items-center justify-center text-slate-400">
                            <Shield size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block">The Foundation</span>
                            <h4 className="text-lg font-bold text-slate-300 font-outfit">Nautilus TEEs</h4>
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6 font-normal">
                          Groundbreaking framework that introduced cryptographic attestations for off-chain compute on Sui — proving code ran correctly inside secure hardware enclaves.
                        </p>
                        <div className="flex flex-col gap-3 font-mono text-[10px]">
                          <div className="flex items-center gap-3 text-slate-400">
                            <CheckCircle2 size={12} className="text-slate-500 flex-shrink-0" />
                            <span>TEE-based verification (AWS Nitro / Intel SGX)</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400">
                            <CheckCircle2 size={12} className="text-slate-500 flex-shrink-0" />
                            <span>Cryptographic attestation proofs</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400">
                            <CheckCircle2 size={12} className="text-slate-500 flex-shrink-0" />
                            <span>Move smart contract verification</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center: Arrow */}
                    <div className="lg:col-span-2 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="hidden lg:block w-px h-12 bg-gradient-to-b from-transparent to-[#14304A]"></div>
                        <div className="w-14 h-14 rounded-full bg-[#090C15] border-2 border-[#00FFAA]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,170,0.1)]">
                          <ArrowRight size={20} className="text-[#00FFAA]" />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#00FFAA] uppercase tracking-widest">Evolves Into</span>
                        <div className="hidden lg:block w-px h-12 bg-gradient-to-b from-[#14304A] to-transparent"></div>
                      </div>
                    </div>

                    {/* Right: Sui-Functions (Evolution) */}
                    <div className="lg:col-span-5 text-left">
                      <div className="bg-[#050608] border border-[#00FFAA]/20 rounded-2xl p-6 md:p-8 h-full relative overflow-hidden shadow-[0_0_40px_rgba(0,255,170,0.03)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FFAA] to-[#3898FF]"></div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-[#090C15] border border-[#00FFAA]/20 flex items-center justify-center text-[#00FFAA]">
                            <Zap size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FFAA] block">The Evolution</span>
                            <h4 className="text-lg font-bold text-white font-outfit">Sui-Functions</h4>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6 font-normal">
                          Takes verified off-chain compute and wraps it in a fully decentralized economic layer — with staking, billing, operator incentives, and a one-command developer experience.
                        </p>
                        <div className="flex flex-col gap-3 font-mono text-[10px]">
                          <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 size={12} className="text-[#00FFAA] flex-shrink-0" />
                            <span>Everything in Nautilus, plus...</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 size={12} className="text-[#00FFAA] flex-shrink-0" />
                            <span>Decentralized node operator marketplace</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 size={12} className="text-[#00FFAA] flex-shrink-0" />
                            <span>On-chain billing vaults & pay-per-execution</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 size={12} className="text-[#00FFAA] flex-shrink-0" />
                            <span>Immutable code registry on Walrus</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 size={12} className="text-[#00FFAA] flex-shrink-0" />
                            <span>One-command node setup (npx)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Comparison Table */}
                  <div className="bg-[#050608] border border-[#14304A] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Capability</span>
                      </div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Nautilus</span>
                      </div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00FFAA]">Sui-Functions</span>
                      </div>
                    </div>

                    {/* Row: Execution Verification */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">Execution Verification</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] text-xs text-slate-400">TEE Attestation</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-white font-medium">V8 Sandbox + Staking</div>
                    </div>

                    {/* Row: Node Setup */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">Node Operator Setup</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] text-xs text-slate-400">AWS Nitro + Docker Config</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-white font-medium">Single CLI Command</div>
                    </div>

                    {/* Row: Hardware Requirements */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">Hardware Requirements</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] text-xs text-slate-400">Specialized TEE CPU</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-white font-medium">Any Consumer Hardware</div>
                    </div>

                    {/* Row: Compute Economy */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">Compute Economy</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A]">
                        <span className="text-slate-600 text-[10px] font-mono">—</span>
                      </div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-[#00FFAA] font-medium">Stake & Earn SUI</div>
                    </div>

                    {/* Row: On-Chain Billing */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">On-Chain Billing</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A]">
                        <span className="text-slate-600 text-[10px] font-mono">—</span>
                      </div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-[#00FFAA] font-medium">Smart Contract Vaults</div>
                    </div>

                    {/* Row: Developer Dashboard */}
                    <div className="grid grid-cols-3 border-b border-[#14304A]">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">Developer Dashboard</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A]">
                        <span className="text-slate-600 text-[10px] font-mono">—</span>
                      </div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-[#00FFAA] font-medium">Full Visual Workspace</div>
                    </div>

                    {/* Row: Code Registry */}
                    <div className="grid grid-cols-3">
                      <div className="p-4 md:p-6 text-left text-xs text-slate-300 font-medium">Immutable Code Registry</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] text-xs text-slate-400">Self-Managed</div>
                      <div className="p-4 md:p-6 text-center border-l border-[#14304A] bg-[#00FFAA]/[0.02] text-xs text-[#00FFAA] font-medium">Walrus Content-Addressed</div>
                    </div>
                  </div>

                  {/* Bottom Note */}
                  <div className="mt-8 text-center">
                    <p className="text-slate-500 text-[11px] font-mono leading-relaxed max-w-2xl mx-auto">
                      Nautilus laid the groundwork for trustworthy off-chain compute on Sui. Sui-Functions builds the decentralized economic layer on top — making verifiable compute accessible, incentivized, and permissionless for the entire network.
                    </p>
                  </div>
                </motion.section>

                {/* CALL TO ACTION */}
                <section className="mb-24">
                  <div className="relative py-24 text-center overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00FFAA]/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto px-6">
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 font-outfit">
                        Power the Agentic Web
                      </h2>
                      <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
                        Launch decentralized services, orchestrate intelligent agents, and build on a network without cloud lock-in.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Button
                          onClick={() => setShowConnectModal(true)}
                          variant="primary"
                          className="w-full sm:w-auto px-10 h-12 flex items-center justify-center gap-2 uppercase tracking-wider text-[11px]"
                        >
                          <span>START BUILDING</span>
                          <ArrowRight size={14} />
                        </Button>
                        <Button
                          onClick={() => window.open('https://github.com/Kellie-Brighty/sui-functions', '_blank')}
                          variant="outline"
                          className="w-full sm:w-auto px-10 h-12 border border-[#14304A] hover:bg-[#090C15] text-slate-300 font-bold flex items-center justify-center uppercase tracking-wider text-[11px]"
                        >
                          READ DOCUMENTATION
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>{/* end content z-10 wrapper */}

      {/* Controlled Wallet Connect Modal */}
      <ConnectModal
        trigger={<button className="hidden" />}
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
      />

      {/* Back to top FAB */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-[#050608]/90 border border-[#00FFAA]/30 flex items-center justify-center text-[#00FFAA] backdrop-blur-md shadow-[0_0_20px_rgba(0,255,170,0.15)] hover:shadow-[0_0_30px_rgba(0,255,170,0.4)] hover:bg-[#00FFAA] hover:text-black transition-all duration-300 group"
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={20} className="group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
