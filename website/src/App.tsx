import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
import { Play, CheckCircle2, Zap, Shield, Clock, Server, Code, Globe, HelpCircle, ArrowRight, Terminal, Users } from 'lucide-react';
import Dashboard from './Dashboard';
import { Header, Footer, Button, Card, CodeWindow } from './components/shared';

const App: React.FC = () => {
  const account = useCurrentAccount();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [demoStatus, setDemoStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // If wallet is connected, show the complete SUI Dashboard
  if (account) {
    return <Dashboard />;
  }

  const runDemo = () => {
    setDemoStatus('running');
    setLogs(['[System] Initializing Price Oracle deviation checker...']);
    setCurrentStep(0);
    
    setTimeout(() => {
      setLogs(prev => [...prev, '[Blockchain] SUI/USD Price deviation >0.1% detected. Emitting call_function() event...']);
      setCurrentStep(1);
    }, 1200);

    setTimeout(() => {
      setLogs(prev => [...prev, '[Storage] Pulling immutable \'sui_usd_oracle.js\' script from Walrus Blob: W7VwX...']);
      setCurrentStep(2);
    }, 2800);

    setTimeout(() => {
      setLogs(prev => [
        ...prev, 
        '[Sandbox] Booting Google V8 isolate VM (128MB Memory Heap cap)...',
        '[VM] ⚡ Execution Success! SUI Price: $2.45 USD. Submitting cryptographically signed result to Sui event bus...'
      ]);
      setCurrentStep(3);
      setDemoStatus('success');
    }, 4800);
  };

  const resetDemo = () => {
    setDemoStatus('idle');
    setLogs([]);
    setCurrentStep(-1);
  };

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBenefits = () => {
    document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-orange/30 selection:text-white overflow-x-hidden relative">
      {/* ═══ LAYERED AMBIENT BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base radial glow at top */}
        <div className="absolute inset-0 radial-glow-orange" />
        
        {/* Large floating orb - top right (orange) */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-brand-orange/20 to-transparent blur-[120px] animate-float-slow" />
        
        {/* Medium orb - mid left (blue) */}
        <div className="absolute top-[40%] -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-blue/20 to-transparent blur-[100px] animate-float-medium" />
        
        {/* Small orb - bottom right (orange/amber) */}
        <div className="absolute top-[70%] -right-24 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-amber-500/20 to-transparent blur-[100px] animate-float-reverse" />
        
        {/* Faint aurora sweep across center */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[600px] bg-gradient-to-r from-transparent via-brand-orange/15 to-transparent blur-[80px] rotate-[-8deg] animate-aurora" />
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />
      </div>
      
      {/* Content layer above background */}
      <div className="relative z-10">
      {/* Navbar Header */}
      <Header onDemoClick={scrollToDemo} onBenefitsClick={scrollToBenefits} onConnectClick={() => setShowConnectModal(true)} />

      {/* Main Container */}
      <main className="w-full px-6 lg:px-16 pt-12 pb-24">
        <div className="max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 lg:py-24">
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit text-white leading-[1.1] mb-6"
            >
              A Decentralized, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-[#F76707] text-shimmer">
                Serverless Lambda Platform
              </span>
            </motion.h1>

            {/* Paragraph */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-200 leading-relaxed mb-10 max-w-2xl font-medium"
            >
              Deploy verifiably secure, censorship-resistant serverless microservices powered by Sui's real-time events and Walrus's immutable storage. Run zero-trust VM isolates with zero central cloud dependencies.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              {/* High-fidelity custom connect button trigger */}
              <div className="relative flex justify-center">
                <Button 
                  onClick={() => setShowConnectModal(true)} 
                  variant="primary" 
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5"
                >
                  <span>Start Deploying</span>
                  <img src="/deploy.svg" alt="Deploy Icon" className="w-5 h-5 object-contain" />
                </Button>
              </div>
              <Button 
                onClick={scrollToDemo}
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto hover:bg-[#12131C]"
              >
                Explore Sandbox
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
              <div className="absolute inset-0 rounded-full bg-brand-orange/10 blur-[80px]" />
              <div className="absolute w-80 h-80 rounded-full border border-brand-orange/5 animate-pulse-slow" />
              <div className="absolute w-64 h-64 rounded-full border border-brand-orange/10 border-dashed" />
              
              {/* Orange 3D kinetic sphere image */}
              <img 
                src="/sui-func-logo.png" 
                alt="Sui-Functions 3D Mesh Sphere" 
                className="w-60 h-60 sm:w-80 sm:h-80 object-contain drop-shadow-[0_0_50px_rgba(255,126,33,0.4)] relative z-10"
              />
            </motion.div>
          </div>
        </section>

        {/* STATISTICS BAR */}
        <section className="mb-24">
          <Card hoverEffect={false} className="bg-brand-card/75 border-brand-card-border/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-brand-card-border/60">
              <div className="flex flex-col items-center md:items-start md:pl-4 pt-4 md:pt-0">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mb-1.5">Total Invocations</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-brand-orange font-outfit tracking-tight animate-pulse">1.2B+</span>
              </div>
              <div className="flex flex-col items-center md:items-start md:pl-8 pt-4 md:pt-0">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mb-1.5">Network Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
                  <span className="text-xl sm:text-2xl font-extrabold text-[#10B981] font-outfit tracking-tight">Operational</span>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start md:pl-8 pt-4 md:pt-0">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mb-1.5">Avg. Cold Start</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-outfit tracking-tight">&lt; 14ms</span>
              </div>
              <div className="flex flex-col items-center md:items-start md:pl-8 pt-4 md:pt-0">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mb-1.5">Active Workers</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">12,402</span>
              </div>
            </div>
          </Card>
        </section>

        {/* POWERED BY / CORE INFRASTRUCTURE SECTION */}
        <section className="mb-32 animate-fade-in-up">
          <div className="bg-[#050608]/50 backdrop-blur-md border border-brand-card-border/40 rounded-[24px] p-8 md:p-12 text-center relative overflow-hidden shadow-inner">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 w-96 h-20 bg-brand-orange/5 blur-[50px] pointer-events-none" />
            
            <span className="px-3.5 py-1.5 rounded-full bg-brand-orange-glow border border-brand-orange/20 text-[9px] font-mono font-bold uppercase tracking-widest text-brand-orange inline-block mb-6">
              Core Protocol Infrastructure
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4 font-outfit">
              Powered by the Sui Stack
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed font-medium mb-12">
              Sui-Functions merges next-generation layer-1 consensus with decentralized object storage to create a secure, serverless edge compute environment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Partner 1: Sui */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-[#0a0c10]/40 border border-brand-card-border/30 rounded-2xl hover:border-brand-blue/30 transition-all duration-300 text-left group">
                <div className="w-16 h-16 rounded-2xl bg-[#0d1624] border border-[#1e2f4d] flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://www.google.com/s2/favicons?domain=sui.io&sz=128" 
                    alt="Sui Network Logo" 
                    className="w-10 h-10 object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit mb-1.5 flex items-center gap-2">
                    Sui Network
                    <span className="px-2 py-0.5 rounded bg-brand-blue-glow border border-brand-blue/20 text-[8px] font-mono font-bold text-brand-blue uppercase">Coordination</span>
                  </h3>
                  <p className="text-slate-200 text-xs leading-relaxed font-medium">
                    Acts as our state coordinator and event bus. Move smart contracts manage the dynamic trigger registry and commit completed execution receipts securely on-chain.
                  </p>
                </div>
              </div>

              {/* Partner 2: Walrus */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-[#0a0c10]/40 border border-brand-card-border/30 rounded-2xl hover:border-brand-orange/30 transition-all duration-300 text-left group">
                <div className="w-16 h-16 rounded-2xl bg-[#2a1d12] border border-[#5a3a1e] flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(255,126,33,0.25)] group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://www.google.com/s2/favicons?domain=walrus.xyz&sz=128" 
                    alt="Walrus Protocol Logo" 
                    className="w-10 h-10 object-contain rounded-xl brightness-[1.8] contrast-[1.2]"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit mb-1.5 flex items-center gap-2">
                    Walrus Protocol
                    <span className="px-2 py-0.5 rounded bg-brand-orange-glow border border-brand-orange/20 text-[8px] font-mono font-bold text-brand-orange uppercase">Logic Library</span>
                  </h3>
                  <p className="text-slate-200 text-xs leading-relaxed font-medium">
                    Serves as our immutable logic repository. Script files are pinned permanently to Walrus storage nodes, uniquely identified by cryptographic content-addressed Blob IDs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (SPLIT-GRID INTERACTIVE ROW LAYOUT) */}
        <section id="network" className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column: Context & Sticky Title */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left">
              <span className="px-3.5 py-1.5 rounded-full bg-brand-orange-glow border border-brand-orange/20 text-[9px] font-mono font-bold uppercase tracking-widest text-brand-orange inline-block mb-4 self-start">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit leading-[1.15]">
                Engineered for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-[#F76707] text-shimmer">
                  Absolute Security
                </span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed font-medium mb-6 max-w-md">
                Sui-Functions decouples state, compute, and logic to deliver a trustless serverless execution environment without compromising execution speed.
              </p>
              <div className="flex items-center gap-3 text-brand-orange font-bold text-[10px] uppercase tracking-wider font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-ping" />
                Zero Trust Architecture Active
              </div>
            </div>

            {/* Right Column: High-fidelity stacked list elements */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Feature Item 1 */}
              <div className="flex gap-6 p-6 md:p-8 bg-[#07080c]/50 hover:bg-[#0a0c12]/70 border border-brand-card-border/30 hover:border-brand-orange/30 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden shadow-inner">
                {/* Accent glow line on top left */}
                <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-brand-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-brand-orange-glow border border-brand-orange/25 flex items-center justify-center text-brand-orange shadow-[0_4px_15px_rgba(255,126,33,0.15)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <Shield size={26} />
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit group-hover:text-brand-orange transition-colors duration-200">
                    Secure V8 Sandboxing
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    Execute code in secure Google V8 isolates. Enforces strict 128MB memory heap caps, 5s CPU execution limits, and robust filesystem-blocking security shims.
                  </p>
                </div>
              </div>

              {/* Feature Item 2 */}
              <div className="flex gap-6 p-6 md:p-8 bg-[#07080c]/50 hover:bg-[#0a0c12]/70 border border-brand-card-border/30 hover:border-brand-blue/30 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden shadow-inner">
                {/* Accent glow line on top left */}
                <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-brand-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-brand-blue-glow border border-brand-blue/25 flex items-center justify-center text-brand-blue shadow-[0_4px_15px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <Zap size={26} />
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit group-hover:text-brand-blue transition-colors duration-200">
                    On-Chain Trigger Bus
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    Decouple event-driven logic via high-speed Sui smart contracts. Dynamic execution registry controls strict actor permissions and commits verified results.
                  </p>
                </div>
              </div>

              {/* Feature Item 3 */}
              <div className="flex gap-6 p-6 md:p-8 bg-[#07080c]/50 hover:bg-[#0a0c12]/70 border border-brand-card-border/30 hover:border-brand-green/30 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden shadow-inner">
                {/* Accent glow line on top left */}
                <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-brand-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-brand-green-glow border border-brand-green/25 flex items-center justify-center text-brand-green shadow-[0_4px_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <Server size={26} />
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit group-hover:text-brand-green transition-colors duration-200">
                    Walrus Logic Library
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    Upload serverless edge code directly to the Walrus Storage Network as permanent, immutable, content-addressed and cryptographically secure storage blobs.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* THREE PILLARS ARCHITECTURE SECTION */}
        <section id="docs" className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-32 py-8">
          {/* Left: Info */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-outfit leading-tight mb-8">
              Three Pillars <br />
              <span className="text-brand-orange">Architecture</span>
            </h2>

            <div className="flex flex-col gap-8 w-full">
              {/* Bullet 1 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-brand-green-glow border border-brand-green/30 flex items-center justify-center text-brand-green flex-shrink-0 mt-1.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1.5 font-outfit">1. Trigger Event Bus (Sui Ledger)</h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    Move smart contracts manage a shared dynamic registry using Sui's high-speed tables, recording execution receipts securely on-chain.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-brand-green-glow border border-brand-green/30 flex items-center justify-center text-brand-green flex-shrink-0 mt-1.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1.5 font-outfit">2. Logic Library (Walrus Storage)</h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    Functions are stored permanently on Walrus as immutable, content-addressed blobs. Guarantees 100% logic integrity.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-brand-green-glow border border-brand-green/30 flex items-center justify-center text-brand-green flex-shrink-0 mt-1.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1.5 font-outfit">3. Isolated Workers (Secure Sandboxes)</h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    TypeScript worker daemons listen for triggers, assemble blobs, and run logic securely inside Google V8 runtime sandboxes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Window */}
          <div className="lg:col-span-7 flex justify-center items-center w-full">
            <CodeWindow filename="trigger.move" className="w-full max-w-2xl" />
          </div>
        </section>

        {/* SOVEREIGN DEVOPS & GOVERNANCE SECTION */}
        <section className="mb-32 py-12 relative overflow-hidden">
          {/* Decorative glowing background elements */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-orange/5 blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left: Interactive Visual Representation */}
            <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center items-center w-full">
              <div className="w-full max-w-lg bg-[#08090e]/90 border border-brand-card-border/80 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-brand-card-border pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">Upgrade Request Proposal</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-[9px]">AWAITING SIGS</span>
                </div>

                {/* Proposal Metadata */}
                <div className="flex flex-col gap-4 font-mono text-[11px] mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-brand-card-border/40">
                    <span className="text-slate-400">TARGET FUNCTION:</span>
                    <span className="text-white font-bold">sui_usd_oracle.js</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-brand-card-border/40">
                    <span className="text-slate-400">CURRENT BLOB ID:</span>
                    <span className="text-brand-blue font-bold select-all">K9YtZ1pL0L8q...</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-brand-card-border/40">
                    <span className="text-slate-400">PROPOSED BLOB ID:</span>
                    <span className="text-brand-orange font-bold select-all">W7VwX2jrIH5y...</span>
                  </div>
                </div>

                {/* Multi-Sig Approvals Track */}
                <div className="flex flex-col gap-3.5 mb-6">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Consensus Progress (2/3 Approved)</span>
                  
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-green/5 border border-brand-green/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green">✓</div>
                      <span className="text-[11px] font-mono font-medium text-slate-200">0x8a4c...4086 (Lead Dev)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-brand-green uppercase">APPROVED</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-green/5 border border-brand-green/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green">✓</div>
                      <span className="text-[11px] font-mono font-medium text-slate-200">0x2528...9832 (Security Auditor)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-brand-green uppercase">APPROVED</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono text-[9px] animate-pulse">●</span>
                      <span className="text-[11px] font-mono font-medium text-slate-300">0xf767...1104 (Sponsor Treasury)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-500 uppercase animate-pulse">PENDING</span>
                  </div>
                </div>

                {/* Explanatory visual note */}
                <div className="p-3 bg-brand-orange-glow border border-brand-orange/20 rounded-xl text-[10px] text-slate-300 leading-relaxed font-medium">
                  Sui layer-1 smart contracts natively block updates to edge runners until the registered Multisig object triggers a verified state change transaction.
                </div>
              </div>
            </div>

            {/* Right: Rich Explanatory Copy */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start text-left justify-center">
              <span className="px-3.5 py-1.5 rounded-full bg-brand-orange-glow border border-brand-orange/20 text-[10px] font-extrabold uppercase tracking-widest text-brand-orange mb-4 font-mono">
                Decentralized DevSecOps
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-outfit leading-tight mb-6">
                Sovereign Upgrade Governance <br />
                <span className="text-brand-orange">Controlled by Consensus</span>
              </h2>
              <p className="text-slate-200 text-sm leading-relaxed font-medium mb-6">
                Unlike traditional Web2 cloud functions, where a single hacked developer key or hijacked CI/CD pipeline can secretly poison serverless code, Sui-Functions introduces an unhackable deployment lifecycle.
              </p>
              
              <div className="flex flex-col gap-6 w-full mb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue-glow border border-brand-blue/30 flex items-center justify-center text-brand-blue flex-shrink-0">
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
                  <div className="w-10 h-10 rounded-xl bg-brand-green-glow border border-brand-green/30 flex items-center justify-center text-brand-green flex-shrink-0">
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
                  <div className="w-10 h-10 rounded-xl bg-brand-orange-glow border border-brand-orange/30 flex items-center justify-center text-brand-orange flex-shrink-0">
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
        </section>

        {/* INTERACTIVE DEMO / NETWORKING SANDBOX */}
        <section id="demo" className="mb-32">
          <div className="bg-[#08090E]/80 backdrop-blur-md border border-brand-card-border/80 rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-card-glow">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="px-3.5 py-1.5 rounded-full bg-brand-orange-glow border border-brand-orange/20 text-[10px] font-extrabold uppercase tracking-widest text-brand-orange inline-block mb-4 font-mono">
                  DeFi Price Oracle Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4 font-outfit">
                  Verifiable Price-Feed Sandbox
                </h2>
                <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                  Check SUI/USD off-chain prices dynamically. When deviation drifts, trigger a sandboxed oracle worker to pull the immutable script from Walrus and submit validated results back on-chain.
                </p>
              </div>

              {/* Main Demo Console Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-8">
                
                {/* Left side: Process steps timeline visualizer */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-[#040509] border border-brand-card-border/60 rounded-2xl p-6 relative">
                  <div className="absolute top-4 right-4 text-[9px] text-slate-350 font-extrabold uppercase tracking-wider font-mono">Process Pipeline</div>
                  <div className="flex flex-col gap-8 h-full justify-center">
                    
                    {/* Process Step 1 */}
                    <div className="flex items-center gap-4 relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold transition-all duration-500 ${
                        currentStep >= 1 ? 'bg-brand-green/20 text-brand-green border-brand-green' :
                        currentStep === 0 ? 'bg-brand-orange/20 text-brand-orange border-brand-orange animate-pulse' :
                        'bg-[#0C0D16] text-slate-300 border-brand-card-border'
                      }`}>
                        {currentStep >= 1 ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                      </div>
                      <div className="text-left">
                        <span className={`block text-xs font-bold uppercase tracking-wider ${currentStep >= 0 ? 'text-white' : 'text-slate-400'}`}>
                          Sui Trigger Event
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">Node consensus verification</span>
                      </div>
                      {/* Connector Line 1 */}
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-brand-card-border/60">
                        <div className={`w-full bg-brand-orange transition-all duration-[1000ms] ${currentStep >= 1 ? 'h-full' : 'h-0'}`} />
                      </div>
                    </div>

                    {/* Process Step 2 */}
                    <div className="flex items-center gap-4 relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold transition-all duration-500 ${
                        currentStep >= 2 ? 'bg-brand-green/20 text-brand-green border-brand-green' :
                        currentStep === 1 ? 'bg-brand-orange/20 text-brand-orange border-brand-orange animate-pulse' :
                        'bg-[#0C0D16] text-slate-300 border-brand-card-border'
                      }`}>
                        {currentStep >= 2 ? <CheckCircle2 size={20} /> : <Server size={20} />}
                      </div>
                      <div className="text-left">
                        <span className={`block text-xs font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-white' : 'text-slate-400'}`}>
                          Walrus Storage Fetch
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">Slices assembled &amp; decoded</span>
                      </div>
                      {/* Connector Line 2 */}
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-brand-card-border/60">
                        <div className={`w-full bg-brand-orange transition-all duration-[1000ms] ${currentStep >= 2 ? 'h-full' : 'h-0'}`} />
                      </div>
                    </div>

                    {/* Process Step 3 */}
                    <div className="flex items-center gap-4 relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold transition-all duration-500 ${
                        currentStep >= 3 ? 'bg-brand-green/20 text-brand-green border-brand-green shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                        currentStep === 2 ? 'bg-brand-orange/20 text-brand-orange border-brand-orange animate-pulse' :
                        'bg-[#0C0D16] text-slate-300 border-brand-card-border'
                      }`}>
                        {currentStep >= 3 ? <CheckCircle2 size={20} /> : <Code size={20} />}
                      </div>
                      <div className="text-left">
                        <span className={`block text-xs font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-white' : 'text-slate-400'}`}>
                          Sandboxed Execution
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">Isolated VM execution success</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side: Sleek Terminal display */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-[#040509] border border-brand-card-border/60 rounded-2xl overflow-hidden min-h-[300px]">
                  
                  {/* Console Header */}
                  <div className="bg-[#090A11] px-5 py-3 border-b border-brand-card-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    </div>
                    <span className="text-[10px] text-slate-200 font-extrabold font-mono uppercase tracking-wider select-none flex items-center gap-1">
                      <Terminal size={10} /> console_stream
                    </span>
                  </div>

                  {/* Console Logs Stream */}
                  <div className="p-6 font-mono text-xs leading-relaxed text-left flex-1 min-h-[200px] overflow-y-auto max-h-[220px]">
                    <AnimatePresence>
                      {logs.map((log, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`mb-2.5 flex items-start gap-3.5 ${
                            log.includes('[VM]') ? 'text-brand-green font-bold' : 
                            log.includes('[Blockchain]') ? 'text-[#ff9242] font-semibold' :
                            'text-slate-100'
                          }`}
                        >
                          <span className="text-slate-400 select-none text-[10px] mt-0.5">{index + 1}</span>
                          <span>{log}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {logs.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full opacity-60 py-12">
                        <Terminal size={24} className="mb-2.5 animate-pulse text-slate-300" />
                        <span className="text-xs font-semibold text-slate-300 font-mono">Waiting for client execution trigger...</span>
                      </div>
                    )}
                  </div>

                  {/* Console Trigger Bar */}
                  <div className="p-4 bg-[#090A11] border-t border-brand-card-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-left self-start sm:self-auto pl-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                      <div>
                        <div className="text-[10px] font-bold text-white font-mono">hello_world.js</div>
                        <div className="text-[8px] text-slate-300 font-extrabold font-mono uppercase">Walrus Blob ID: W7VwX...</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      {demoStatus === 'success' && (
                        <Button 
                          onClick={resetDemo}
                          variant="ghost"
                          size="sm"
                          className="h-10 text-[11px] text-slate-200 hover:text-white font-mono underline"
                        >
                          Reset Logs
                        </Button>
                      )}
                      <Button
                        onClick={runDemo}
                        variant="primary"
                        size="sm"
                        disabled={demoStatus === 'running'}
                        className="h-10 px-6 text-xs w-full sm:w-auto font-bold rounded-lg"
                      >
                        {demoStatus === 'idle' ? 'Execute Now' : demoStatus === 'running' ? 'Executing...' : 'Execution Success!'}
                      </Button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* LIVE DEMO SHOWCASE */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-orange/30 bg-brand-orange-glow text-brand-orange text-[10px] font-extrabold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(255,126,33,0.1)]">
              <Zap size={10} /> Dynamic Showcases
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-outfit">
              Sovereign Demo Ecosystem
            </h2>
            <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
              Explore dynamic, high-performance web applications powered entirely by secure V8 execution isolates and immutable Walrus data publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 max-w-xl mx-auto">
            {/* Card 1: SuiNode Storefront */}
            <div className="relative group rounded-3xl border border-[#161722]/80 bg-[#06070a]/90 p-8 hover:border-brand-blue/30 transition-all duration-300 shadow-lg flex flex-col justify-between">
              {/* Card Blue Flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-[50px] rounded-full group-hover:bg-brand-blue/10 transition-colors pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl border border-brand-blue/20 bg-brand-blue-glow flex items-center justify-center text-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Globe size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-brand-blue bg-brand-blue-glow/65 border border-brand-blue/30 px-2 py-1 rounded-full uppercase tracking-wider">
                    Live Demo
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white font-outfit mb-3 group-hover:text-brand-blue transition-colors">
                  SuiNode E-Commerce
                </h3>
                <p className="text-slate-200 text-xs leading-relaxed font-medium mb-6">
                  A high-end web3 storefront featuring live inventory valuations driven by real-time SUI price deviation oracles and decentralized promo validation scripts run in secure V8 sandboxes.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-[9px] font-mono text-slate-300 bg-[#0d0e15] border border-white/5 px-2 py-1 rounded-md">isolated-vm</span>
                  <span className="text-[9px] font-mono text-slate-300 bg-[#0d0e15] border border-white/5 px-2 py-1 rounded-md">Walrus Receipting</span>
                  <span className="text-[9px] font-mono text-slate-300 bg-[#0d0e15] border border-white/5 px-2 py-1 rounded-md">Sui Testnet</span>
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
                  className="w-full justify-center gap-2 border border-brand-blue/30 hover:bg-brand-blue/10 text-brand-blue hover:text-white font-bold h-11"
                >
                  <span>Launch Storefront</span>
                  <ArrowRight size={14} />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ENTERPRISE AVAILABILITY */}
        <section className="mb-32 relative rounded-[48px] overflow-hidden border border-[#161722]/50 bg-[#0a0b10]/60">
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
              Expanding the serverless compute boundary beyond Web3 to unlock massive global physical infrastructure and enterprise SaaS pipelines.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              
              {/* Regions Item */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border border-brand-orange/30 bg-brand-orange-glow flex items-center justify-center text-brand-orange mb-6 shadow-[0_0_20px_rgba(255,126,33,0.15)] hover:scale-105 transition-transform duration-300">
                  <Globe size={24} />
                </div>
                <h4 className="text-xl font-extrabold text-white font-outfit mb-1.5">IoT &amp; DePIN</h4>
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Dynamic Telemetry Auditing</span>
              </div>

              {/* Validators Item */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border border-brand-blue/30 bg-brand-blue-glow flex items-center justify-center text-brand-blue mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:scale-105 transition-transform duration-300">
                  <Server size={24} />
                </div>
                <h4 className="text-xl font-extrabold text-white font-outfit mb-1.5">Cloud Sovereignty</h4>
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Decentralized Execution Registry</span>
              </div>

              {/* Support Item */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border border-brand-green/30 bg-brand-green-glow flex items-center justify-center text-brand-green mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-105 transition-transform duration-300">
                  <Clock size={24} />
                </div>
                <h4 className="text-xl font-extrabold text-white font-outfit mb-1.5">B2B SaaS Glue</h4>
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Stripe &amp; Webhook Automations</span>
              </div>

            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="mb-24">
          <div className="relative rounded-[40px] border border-brand-card-border/80 overflow-hidden bg-brand-card/90 py-16 md:py-24 px-8 md:px-16 shadow-card-glow text-center">
            
            {/* CTA Orange Background radial flare */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 font-outfit">
                Build the Unstoppable Cloud
              </h2>
              <p className="text-slate-200 text-base leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
                Deploy mathematically secure, censorship-resistant serverless functions powered by Sui and Walrus. Eliminate the centralized cloud tax forever.
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
                  className="w-full sm:w-auto hover:bg-[#12131C] px-10"
                >
                  Explore Code Moat
                </Button>
              </div>
            </div>

          </div>
        </section>

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
