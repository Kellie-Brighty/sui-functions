import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
import { Play, CheckCircle2, Zap, Shield, Clock, Server, Code, Globe, HelpCircle, ArrowRight, Terminal, Users, Loader2, Wallet, Layers, ShieldCheck } from 'lucide-react';
import Dashboard from './Dashboard';
import { Header, Footer, Button, Card, CodeWindow } from './components/shared';
import { DocsView } from './components/DocsView';

const App: React.FC = () => {
  const account = useCurrentAccount();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'docs'>('landing');
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

  // If wallet is connected, show the complete SUI Dashboard
  if (account) {
    return <Dashboard />;
  }

  const scrollToDemo = () => {
    document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBenefits = () => {
    document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' });
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
      </div>

      {/* Content layer above background */}
      <div className="relative z-10">
        {/* Navbar Header */}
        <Header
          onDemoClick={scrollToDemo}
          onBenefitsClick={scrollToBenefits}
          onConnectClick={() => setShowConnectModal(true)}
          viewMode={viewMode}
          onDocsClick={() => setViewMode('docs')}
          onHomeClick={() => setViewMode('landing')}
        />

        {/* Main Container */}
        <main className="w-full px-6 lg:px-16 pt-12 pb-24">
          <div className="max-w-7xl mx-auto">

            {viewMode === 'docs' ? (
              <DocsView onBackToLanding={() => setViewMode('landing')} />
            ) : (
              <>
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 lg:py-24">
                  <div className="lg:col-span-7 flex flex-col items-start text-left">

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
                      Sui-Functions is a production-ready, globally distributed compute layer built entirely on the Sui Network and Walrus Protocol. Replacing fragile Web2 middleware with a massive network of independent Node Operators.
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
                        Start Deploying
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
                    
                    <span className="px-3 py-1 rounded-full bg-[#090C15] border border-[#14304A] text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 inline-block mb-6">
                      Core Protocol Infrastructure
                    </span>

                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-outfit">
                      Powered by the <span className="text-slate-400">Sui Stack</span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-normal mb-16">
                      Sui-Functions merges next-generation layer-1 consensus with decentralized object storage to create a secure, sovereign edge compute backbone for autonomous agentic workflows.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch relative">
                      {/* Connection Line & Dot */}
                      <div className="hidden md:block absolute top-[40%] left-[45%] w-[10%] h-[1px] bg-[#14304A] z-0" />
                      <div className="hidden md:flex absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-[#14304A] bg-[#050608] items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      </div>

                      {/* Partner 1: Sui */}
                      <div className="flex flex-col justify-between p-8 bg-[#090C15] border border-[#14304A] rounded-xl text-left relative z-10">
                        <div>
                          <div className="flex items-start justify-between mb-8">
                            <div className="w-10 h-10 border border-[#14304A] rounded-lg flex items-center justify-center bg-[#050608]">
                              <svg width="14" height="18" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C8 0 0 8.9543 0 14.3214C0 18.7397 3.58172 20 8 20C12.4183 20 16 18.7397 16 14.3214C16 8.9543 8 0 8 0ZM8 17.5C5.51472 17.5 3.5 15.4853 3.5 13C3.5 11.2335 4.54215 9.71556 6.00287 9.01898C5.97544 9.35165 6.03544 9.68233 6.18243 9.97233C6.73243 11.0557 8.04159 11.4557 9.0768 10.8256C8.8893 12.0156 8.16335 12.8953 7.15174 13.255C7.42082 13.3323 7.70582 13.375 8 13.375C9.933 13.375 11.5 11.808 11.5 9.875C11.5 8.93245 11.1352 8.0772 10.5363 7.44754C11.9054 8.79979 12.75 10.7061 12.75 12.8214C12.75 16.0355 10.6274 17.5 8 17.5Z" fill="#E2E8F0"/>
                              </svg>
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
                              <svg width="16" height="18" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 0L0 5V15L9 20L18 15V5L9 0ZM16 14.1L9 18.2L2 14.1V5.9L9 1.8L16 5.9V14.1ZM9 4L4 7V13L9 16L14 13V7L9 4ZM9 14.5L5.5 12.5V7.5L9 5.5L12.5 7.5V12.5L9 14.5Z" fill="#E2E8F0"/>
                                <circle cx="9" cy="10" r="1.5" fill="#E2E8F0"/>
                              </svg>
                            </div>
                            <span className="px-2 py-1 rounded border border-[#14304A] text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Logic Registry</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-[#E2E8F0] font-outfit mb-3">
                            Walrus Protocol
                          </h3>
                          <p className="text-slate-400 text-[13px] leading-relaxed font-normal mb-10">
                            We utilize Walrus as our primary Logic Registry, setting a new standard for content-addressed, immutable code distribution via cryptographic Blob IDs.
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
                    </div>
                  </div>
                </motion.section>

                {/* FEATURES SECTION (SPLIT-GRID INTERACTIVE ROW LAYOUT) */}
                <section id="network" className="mb-32">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left Column: Context & Sticky Title */}
                    <div className="lg:col-span-5 flex flex-col justify-center text-left">
                      <span className="px-3.5 py-1.5 rounded-full bg-brand-sui-glow border border-brand-sui/20 text-[9px] font-mono font-bold uppercase tracking-widest text-brand-sui inline-block mb-4 self-start">
                        Core Capabilities
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit leading-[1.15]">
                        Engineered for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sui via-cyan-400 to-[#6FB7B7] text-shimmer">
                          Zero Downtime
                        </span>
                      </h2>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium mb-6 max-w-md">
                        By incentivizing a decentralized pool of operators, Sui-Functions delivers a trustless, sovereign execution environment that never crashes.
                      </p>
                      <div className="flex items-center gap-3 text-brand-sui font-bold text-[10px] uppercase tracking-wider font-mono">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-sui animate-ping" />
                        Zero Trust Architecture Active
                      </div>
                    </div>

                    {/* Right Column: High-fidelity stacked list elements */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                      {/* Feature Item 1 */}
                      <div className="flex gap-6 p-6 md:p-8 bg-[#07080c]/50 hover:bg-[#0a0c12]/70 border border-brand-card-border/30 hover:border-brand-sui/30 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden shadow-inner">
                        {/* Accent glow line on top left */}
                        <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-brand-sui to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Icon Container */}
                        <div className="w-14 h-14 rounded-2xl bg-brand-sui-glow border border-brand-sui/25 flex items-center justify-center text-brand-sui shadow-[0_4px_15px_rgba(56,152,255,0.15)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                          <Shield size={26} />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 font-outfit group-hover:text-brand-sui transition-colors duration-200">
                            Secure V8 Sandboxing
                          </h3>
                          <p className="text-slate-200 text-sm leading-relaxed font-medium">
                            Execute code in secure Google V8 isolates. Enforces strict 128MB memory heap caps, 5s CPU execution limits, and robust filesystem-blocking security shims.
                          </p>
                        </div>
                      </div>

                      {/* Feature Item 2 */}
                      <div className="flex gap-6 p-6 md:p-8 bg-[#07080c]/50 hover:bg-[#0a0c12]/70 border border-brand-card-border/30 hover:border-brand-indigo/30 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden shadow-inner">
                        {/* Accent glow line on top left */}
                        <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-brand-indigo to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Icon Container */}
                        <div className="w-14 h-14 rounded-2xl bg-brand-indigo-glow border border-brand-indigo/25 flex items-center justify-center text-brand-indigo shadow-[0_4px_15px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                          <Zap size={26} />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 font-outfit group-hover:text-brand-indigo transition-colors duration-200">
                            On-Chain Trigger Bus
                          </h3>
                          <p className="text-slate-200 text-sm leading-relaxed font-medium">
                            Decouple event-driven logic via high-speed Sui smart contracts. Dynamic execution registry controls strict actor permissions and commits verified results.
                          </p>
                        </div>
                      </div>

                      {/* Feature Item 3 */}
                      <div className="flex gap-6 p-6 md:p-8 bg-[#07080c]/50 hover:bg-[#0a0c12]/70 border border-brand-card-border/30 hover:border-brand-cyan/30 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden shadow-inner">
                        {/* Accent glow line on top left */}
                        <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-brand-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Icon Container */}
                        <div className="w-14 h-14 rounded-2xl bg-brand-cyan-glow border border-brand-cyan/25 flex items-center justify-center text-brand-cyan shadow-[0_4px_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                          <Server size={26} />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 font-outfit group-hover:text-brand-cyan transition-colors duration-200">
                            Walrus Logic Registry
                          </h3>
                          <p className="text-slate-200 text-sm leading-relaxed font-medium">
                            Upload agentic logic and edge code directly to the Walrus Storage Network as permanent, immutable, content-addressed, and cryptographically secure storage blobs.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* THREE PILLARS ARCHITECTURE SECTION */}
                <motion.section
                  id="docs"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col mb-32 py-12"
                >
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-left">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-outfit leading-tight mb-3">
                        Three Pillars <span className="text-brand-sui">Architecture</span>
                      </h2>
                      <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                        Experience the decentralized agentic execution cycle step-by-step: from fast blockchain triggers to immutable storage retrieval and secure sandbox execution.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-[#090A10]/60 px-4 py-2 border border-[#1A1C29] rounded-xl self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-sui animate-pulse" />
                      SYSTEM PROTOCOL STATUS: OPERATIONAL
                    </div>
                  </div>

                  {/* Horizontal Step Pipeline (3 Columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 relative select-none">
                    {/* Visual connector line behind steps (MD and above) */}
                    <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-brand-sui via-brand-indigo to-brand-cyan opacity-15 -translate-y-1/2 hidden md:block z-0" />

                    {/* Step 1 Tab Card */}
                    <button
                      onClick={() => setActivePillar('trigger')}
                      className={`relative z-10 p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-3 group ${activePillar === 'trigger'
                          ? 'border-brand-sui/45 bg-[#0b0705] shadow-[0_0_25px_rgba(56,152,255,0.1)] scale-[1.01]'
                          : 'border-[#1A1C29] bg-[#07080d]/60 hover:border-slate-800 hover:bg-[#090a10]/80'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Step 01</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activePillar === 'trigger' ? 'bg-brand-sui/15 text-brand-sui scale-105' : 'bg-[#090A10] border border-[#1A1C29] text-slate-400 group-hover:scale-105'
                          }`}>
                          <Zap size={14} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-outfit mb-1">Trigger Event Bus</h4>
                        <p className="text-xs text-slate-455 leading-relaxed">Sui Ledger Move smart contracts orchestrate and verify execution receipts on-chain.</p>
                      </div>
                    </button>

                    {/* Step 2 Tab Card */}
                    <button
                      onClick={() => setActivePillar('logic')}
                      className={`relative z-10 p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-3 group ${activePillar === 'logic'
                          ? 'border-brand-indigo/45 bg-[#05070c] shadow-[0_0_25px_rgba(59,130,246,0.1)] scale-[1.01]'
                          : 'border-[#1A1C29] bg-[#07080d]/60 hover:border-slate-800 hover:bg-[#090a10]/80'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Step 02</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activePillar === 'logic' ? 'bg-brand-indigo/15 text-brand-indigo scale-105' : 'bg-[#090A10] border border-[#1A1C29] text-slate-400 group-hover:scale-105'
                          }`}>
                          <Server size={14} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-outfit mb-1">Logic Library</h4>
                        <p className="text-xs text-slate-455 leading-relaxed">Permanent, content-addressed WebAssembly code blobs stored cryptographically on Walrus.</p>
                      </div>
                    </button>

                    {/* Step 3 Tab Card */}
                    <button
                      onClick={() => setActivePillar('worker')}
                      className={`relative z-10 p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-3 group ${activePillar === 'worker'
                          ? 'border-brand-cyan/45 bg-[#050c08] shadow-[0_0_25px_rgba(16,185,129,0.1)] scale-[1.01]'
                          : 'border-[#1A1C29] bg-[#07080d]/60 hover:border-slate-800 hover:bg-[#090a10]/80'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Step 03</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activePillar === 'worker' ? 'bg-brand-cyan/15 text-brand-cyan scale-105' : 'bg-[#090A10] border border-[#1A1C29] text-slate-400 group-hover:scale-105'
                          }`}>
                          <Shield size={14} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-outfit mb-1">Isolated Workers</h4>
                        <p className="text-xs text-slate-455 leading-relaxed">TypeScript worker daemons invoke highly secure, airgapped Google V8 isolates dynamically.</p>
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
                  {/* Decorative glowing background elements */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-sui/5 blur-[120px] pointer-events-none" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Interactive Visual Representation */}
                    <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center items-center w-full">
                      <div className="w-full max-w-lg bg-[#040508]/90 border border-[#1A1C29] rounded-[24px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
                        {/* Visual Header */}
                        <div className="flex items-center justify-between border-b border-[#1A1C29] pb-4 mb-6">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Upgrade Request Proposal</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold text-[9px] uppercase tracking-wider">Awaiting Sigs</span>
                        </div>

                        {/* Proposal Metadata */}
                        <div className="flex flex-col gap-0 font-mono text-[12px] mb-6 border border-[#1A1C29] rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center px-4 py-3 bg-[#0A0C13] border-b border-[#1A1C29]">
                            <span className="text-slate-500 font-bold">TARGET FUNCTION:</span>
                            <span className="text-white font-bold">sui_usd_oracle.js</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-[#07080D] border-b border-[#1A1C29]">
                            <span className="text-slate-500 font-bold">CURRENT BLOB ID:</span>
                            <span className="text-brand-indigo font-bold select-all">K9YtZ1pL0L8q...</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-[#07080D]">
                            <span className="text-slate-500 font-bold">PROPOSED BLOB ID:</span>
                            <span className="text-brand-sui font-bold select-all">W7VwX2jrIH5y...</span>
                          </div>
                        </div>

                        {/* Multi-Sig Approvals Track */}
                        <div className="flex flex-col gap-3.5 mb-6">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 pl-1">Consensus Progress (2/3 Approved)</span>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090A10] border border-[#1A1C29]">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]">✓</div>
                              <span className="text-[12px] font-mono font-medium text-slate-300">0x8a4c...4086 (Lead Dev)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase">Approved</span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090A10] border border-[#1A1C29]">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]">✓</div>
                              <span className="text-[12px] font-mono font-medium text-slate-300">0x2528...9832 (Security Auditor)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase">Approved</span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0C13] border border-[#1A1C29]">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center text-cyan-500 font-mono text-[10px] animate-pulse">●</span>
                              <span className="text-[12px] font-mono font-medium text-slate-400">0xf767...1104 (Sponsor Treasury)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase animate-pulse">Pending</span>
                          </div>
                        </div>

                        {/* Explanatory visual note */}
                        <div className="p-4 bg-brand-sui/5 border border-brand-sui/20 rounded-xl text-[11px] text-slate-400 leading-relaxed font-medium">
                          Sui layer-1 smart contracts natively block updates to edge runners until the registered Multisig object triggers a verified state change transaction.
                        </div>
                      </div>
                    </div>

                    {/* Right: Rich Explanatory Copy */}
                    <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start text-left justify-center">
                      <span className="px-3.5 py-1.5 rounded-full bg-brand-sui-glow border border-brand-sui/20 text-[10px] font-extrabold uppercase tracking-widest text-brand-sui mb-4 font-mono">
                        Decentralized DevSecOps
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-outfit leading-tight mb-6">
                        Sovereign Upgrade Governance <br />
                        <span className="text-brand-sui">Controlled by Consensus</span>
                      </h2>
                      <p className="text-slate-200 text-sm leading-relaxed font-medium mb-6">
                        Unlike traditional Web2 cloud functions, where a single hacked developer key or hijacked CI/CD pipeline can secretly poison hosted code, Sui-Functions introduces an unhackable deployment lifecycle for agentic logic.
                      </p>

                      <div className="flex flex-col gap-6 w-full mb-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-indigo-glow border border-brand-indigo/30 flex items-center justify-center text-brand-indigo flex-shrink-0">
                            <Shield size={20} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white mb-1 font-outfit">Content-Addressed Integrity</h4>
                            <p className="text-slate-200 text-xs leading-relaxed font-medium">
                              Scripts are pinned permanently to Walrus using cryptographic Blob IDs. If a single character is altered, the Blob hash changes, completely neutralizing supply-chain injection attacks.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-cyan-glow border border-brand-cyan/30 flex items-center justify-center text-brand-cyan flex-shrink-0">
                            <Users size={20} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white mb-1 font-outfit">Consensus-Gated Deployments</h4>
                            <p className="text-slate-200 text-xs leading-relaxed font-medium">
                              Ownership of deployment projects can be held by on-chain multisigs or community DAO smart contracts. Upgrades demand cryptographic consensus before code can execute.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-sui-glow border border-brand-sui/30 flex items-center justify-center text-brand-sui flex-shrink-0">
                            <CheckCircle2 size={20} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white mb-1 font-outfit">100% Provable & Auditable</h4>
                            <p className="text-slate-200 text-xs leading-relaxed font-medium">
                              The active code mapped to any function is recorded transparently on the public Sui ledger. Anyone can download the exact matching script, auditable down to the byte.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* VAULT & BILLING SYSTEM */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="mb-32 relative"
                >
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-sui/30 bg-brand-sui-glow text-brand-sui text-[10px] font-extrabold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(56,152,255,0.1)]">
                      <Wallet size={10} /> Economics
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit">
                      Decentralized Compute Billing
                    </h2>
                    <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                      Sponsor your agentic workflows with on-chain project vaults. Let your users interact with your dApps gas-free while you manage compute economics centrally.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <div className="bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-8 hover:border-brand-sui/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-brand-sui-glow border border-brand-sui/20 flex items-center justify-center text-brand-sui mb-6">
                        <Wallet size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white font-outfit mb-3">Project Vaults</h3>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Each workspace gets its own smart contract vault. Deposit SUI upfront to sponsor compute for all your registered functions.
                      </p>
                    </div>

                    <div className="bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-8 hover:border-brand-sui/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-brand-sui-glow border border-brand-sui/20 flex items-center justify-center text-brand-sui mb-6">
                        <Zap size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white font-outfit mb-3">Pay-Per-Execution</h3>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Flat fee of 0.007 SUI per successful execution. You only pay for what you use, and funds are automatically deducted from your vault.
                      </p>
                    </div>

                    <div className="bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-8 hover:border-brand-sui/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-brand-sui-glow border border-brand-sui/20 flex items-center justify-center text-brand-sui mb-6">
                        <Server size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white font-outfit mb-3">Runner Incentives</h3>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        85% of your compute fee goes directly to the decentralized node runners executing your code. Run your own node to save costs!
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* DEPIN COMPUTE MINER (COMING SOON) */}
                <section className="mb-32 relative py-12">
                  {/* Decorative glowing background elements */}
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-sui/5 blur-[120px] pointer-events-none" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Content */}
                    <div className="lg:col-span-6 text-left relative z-10">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-sui/40 bg-brand-sui-glow text-brand-sui text-[10px] font-extrabold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(56,152,255,0.2)] animate-pulse">
                        <Wallet size={10} /> DePIN Miner Economy
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 font-outfit">
                        Run a Node. <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sui to-cyan-400">Earn SUI.</span>
                      </h2>
                      <p className="text-slate-200 text-base leading-relaxed mb-8 max-w-lg font-medium">
                        Sui-Functions is building a completely decentralized compute economy. Anyone can now download our decentralized runner engine, stake SUI, and earn passive income by executing agentic workloads securely on their own hardware.
                      </p>
                      
                      <ul className="flex flex-col gap-3 font-mono text-[11px] text-slate-400">
                        <li className="flex items-center gap-2">
                          <span className="text-brand-sui">✓</span> Zero DevOps — Just run the CLI command
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-brand-sui">✓</span> Hardware agnostic (Mac, Linux, Windows)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-brand-sui">✓</span> Mathematically secure V8 isolation
                        </li>
                      </ul>
                    </div>

                    {/* Right: Terminal Visual */}
                    <div className="lg:col-span-6 relative z-10 w-full">
                      <div className="bg-[#030407] border border-[#141624] rounded-2xl p-6 md:p-8 font-mono text-[11px] md:text-xs text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-left w-full relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-sui opacity-60" />
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                          <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-brand-sui" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Node Setup Terminal</span>
                          </div>
                          <span className="text-[9px] text-brand-cyan font-bold px-2 py-1 bg-brand-cyan/10 rounded border border-brand-cyan/20">LIVE NOW</span>
                        </div>
                        <div className="space-y-3">
                          <div className="text-slate-400"># 1. Connect your private key to the global network</div>
                          <div className="text-white font-semibold">export OPERATOR_KEY_PATH="~/.sui-functions/operator.json"</div>
                          <div className="h-3"></div>
                          <div className="text-slate-400"># 2. Boot the decentralized runtime engine directly from Walrus</div>
                          <div className="text-white font-semibold">npx sui-functions-node --core \</div>
                          <div className="text-white font-semibold pl-6">OWhic3rdiAIoOzAZe9GgZve4GE_ZjrRRLMthRhf3bGo</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* TRUE DECENTRALIZATION - TEE CONTRAST */}
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

                {/* LIVE DEMO SHOWCASE */}
                <section className="mb-32">
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-sui/30 bg-brand-sui-glow text-brand-sui text-[10px] font-extrabold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(56,152,255,0.1)]">
                      <Zap size={10} /> Use Case
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit">
                      Use Cases
                    </h2>
                    <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                      Explore dynamic, high-performance web applications powered entirely by secure V8 execution isolates and immutable Walrus data publishing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 max-w-xl mx-auto">
                    {/* Card 1: SuiNode Storefront */}
                    <div className="relative group rounded-3xl border border-[#161722]/80 bg-[#06070a]/90 p-8 hover:border-brand-indigo/30 transition-all duration-300 shadow-lg flex flex-col justify-between">
                      {/* Card Blue Flare */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/5 blur-[50px] rounded-full group-hover:bg-brand-indigo/10 transition-colors pointer-events-none" />

                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl border border-brand-indigo/20 bg-brand-indigo-glow flex items-center justify-center text-brand-indigo shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <Globe size={20} />
                          </div>
                          <span className="text-[9px] font-mono font-extrabold text-brand-indigo bg-brand-indigo-glow/65 border border-brand-indigo/30 px-2 py-1 rounded-full uppercase tracking-wider">
                            Live Demo
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white font-outfit mb-3 group-hover:text-brand-indigo transition-colors">
                          Autonomous DeFi Agent
                        </h3>
                        <p className="text-slate-200 text-xs leading-relaxed font-medium mb-6">
                          A protocol showcase of an autonomous DeFi agent utilizing on-chain triggers to audit live inventory valuations and evaluate market deviations within secure V8 sandboxes.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          <span className="text-[9px] font-mono text-slate-300 bg-[#0d0e15] border border-white/5 px-2 py-1 rounded-md">Agentic Web</span>
                          <span className="text-[9px] font-mono text-slate-300 bg-[#0d0e15] border border-white/5 px-2 py-1 rounded-md">Walrus Logic Registry</span>
                          <span className="text-[9px] font-mono text-slate-300 bg-[#0d0e15] border border-white/5 px-2 py-1 rounded-md">Sui Event Bus</span>
                        </div>
                      </div>

                      <a
                        href="https://sui-inventory.web.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full animate-none"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center gap-2 border border-brand-indigo/30 hover:bg-brand-indigo/10 text-brand-indigo hover:text-white font-bold h-11"
                        >
                          <span>Launch Agent Showcase</span>
                          <ArrowRight size={14} />
                        </Button>
                      </a>
                    </div>
                  </div>
                </section>

                {/* ENTERPRISE AVAILABILITY */}
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

                {/* ROADMAP SECTION */}
                <section id="roadmap" className="mb-32 relative">
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

                {/* CALL TO ACTION */}
                <section className="mb-24">
                  <div className="relative rounded-[40px] border border-brand-card-border/80 overflow-hidden bg-brand-card/90 py-16 md:py-24 px-8 md:px-16 shadow-card-glow text-center">

                    {/* CTA Orange Background radial flare */}
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-sui/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 font-outfit">
                        Power the Agentic Web
                      </h2>
                      <p className="text-slate-200 text-base leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
                        Deploy mathematically secure, censorship-resistant agentic logic powered by Sui and Walrus. Eliminate the centralized cloud tax forever.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <div className="relative">
                          <Button
                            onClick={() => setShowConnectModal(true)}
                            variant="primary"
                            size="lg"
                            className="w-full sm:w-auto px-10 flex items-center justify-center gap-2.5"
                          >
                            <span>Start Deploying</span>
                            <img src="/deploy.svg" alt="Deploy Icon" className="w-5 h-5 object-contain" />
                          </Button>
                        </div>
                        <Button
                          onClick={() => window.open('https://github.com/Kellie-Brighty/sui-functions', '_blank')}
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto hover:bg-[#082035] px-10"
                        >
                          Explore Code Moat
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
    </div>
  );
};

export default App;
