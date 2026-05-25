import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Code, 
  ShoppingCart, 
  LogOut, 
  Plus, 
  Cpu, 
  User, 
  Activity, 
  Globe, 
  Zap, 
  Terminal, 
  Play, 
  UploadCloud, 
  Trash2, 
  CheckCircle, 
  Folder, 
  Settings, 
  Bell, 
  HelpCircle, 
  ArrowUpRight, 
  AlertTriangle, 
  HardDrive, 
  RefreshCw, 
  Sliders, 
  ChevronDown, 
  Search, 
  Download, 
  Sparkles,
  Info,
  Check,
  X,
  Menu,
  Shield,
  Copy,
  BookOpen,
  Wallet,
  Server,
  ShieldCheck
} from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, PROTOCOL_TREASURY_ID, ADMIN_CAP_TYPE, PUBLIC_POOL_REGISTRY_ID } from './constants';
import { DocsView } from './components/DocsView';
import { Button } from './components/shared/Button';

interface SearchItem {
  title: string;
  description: string;
  tab: string;
  anchorId: string;
  keywords: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    title: "Cluster Health",
    description: "Check status and health of Sui-Functions operator nodes",
    tab: "1",
    anchorId: "metric-cluster-health",
    keywords: ["health", "status", "cluster", "operator", "operational", "stable", "nodes"]
  },
  {
    title: "Execution Latency",
    description: "P99 round-trip telemetry lag on live executions",
    tab: "1",
    anchorId: "metric-avg-latency",
    keywords: ["latency", "p99", "speed", "lag", "time", "performance", "metric"]
  },
  {
    title: "Success Rate",
    description: "Success percentage of dynamic verification runs",
    tab: "1",
    anchorId: "metric-success-rate",
    keywords: ["success", "rate", "completions", "errors", "ok", "validation", "metric"]
  },
  {
    title: "Total Invocations",
    description: "Total count of on-chain compute events triggered",
    tab: "1",
    anchorId: "metric-total-invocations",
    keywords: ["invocations", "total", "calls", "triggers", "traffic", "metric"]
  },
  {
    title: "Execution Volume Chart",
    description: "Visual breakdown of Sui vs. Walrus workload telemetry",
    tab: "1",
    anchorId: "overview-execution-volume",
    keywords: ["volume", "chart", "graph", "workload", "sui", "walrus", "telemetry"]
  },
  {
    title: "Active Incident Alerts",
    description: "View real-time security warnings and audit failures",
    tab: "1",
    anchorId: "overview-active-alerts",
    keywords: ["alerts", "warnings", "incidents", "errors", "severity", "audit", "security"]
  },
  {
    title: "Top Performing Functions",
    description: "Analytics table of active registered functions",
    tab: "1",
    anchorId: "overview-top-functions",
    keywords: ["top", "performance", "table", "functions", "verified", "active"]
  },
  {
    title: "Registered Functions",
    description: "View and manage functions uploaded to Walrus storage",
    tab: "2",
    anchorId: "functions-header",
    keywords: ["functions", "register", "upload", "sync", "delete", "list", "my functions"]
  },
  {
    title: "Deploy & Register Function",
    description: "Upload code scripts to Walrus and publish to Sui registry",
    tab: "2",
    anchorId: "functions-controls",
    keywords: ["upload", "new", "deploy", "register", "create", "add"]
  },
  {
    title: "Execution Sandbox Logs",
    description: "Real-time VM logs console and audit trail",
    tab: "3",
    anchorId: "logs-terminal",
    keywords: ["logs", "terminal", "console", "sandbox", "audit", "output", "stream"]
  },
  {
    title: "Live Execution Sandbox Controller",
    description: "Manually execute functions with custom JSON payload blocks",
    tab: "3",
    anchorId: "logs-controller",
    keywords: ["execute", "trigger", "run", "payload", "json", "controller", "sandbox"]
  },
  {
    title: "Compute Specifications",
    description: "VM runner configuration details, heap limits, and timeouts",
    tab: "4",
    anchorId: "compute-header",
    keywords: ["compute", "memory", "cpu", "vm", "specs", "limits", "allocation"]
  },
  {
    title: "VM Isolation Audits",
    description: "V8 isolate core startup performance logs",
    tab: "4",
    anchorId: "compute-performance",
    keywords: ["isolation", "v8", "auditing", "engine", "sandbox", "mitigation", "vm"]
  },
  {
    title: "Walrus Storage Layer",
    description: "Immutable storage publisher settings and epoch policies",
    tab: "5",
    anchorId: "storage-header",
    keywords: ["storage", "walrus", "immutable", "blob", "publisher", "epoch"]
  },
  {
    title: "Active Blob Cache",
    description: "Active script cache table stored across decentralized storage shards",
    tab: "5",
    anchorId: "storage-blob-cache",
    keywords: ["cache", "blob", "shards", "registry", "persistent", "epoch"]
  },
  {
    title: "Developer Documentation Guide",
    description: "API global reference manual and V8 restrictions",
    tab: "6",
    anchorId: "docs-portal",
    keywords: ["docs", "documentation", "guide", "api", "reference", "manual", "help"]
  }
];

const OperatorDashboardUI = ({ account, showToast, activeMenu }: { account: any, showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, hash?: string) => void, activeMenu?: string }) => {
  const [isStaked, setIsStaked] = React.useState(false);
  const [runnerAddress, setRunnerAddress] = React.useState("");
  const [isLinked, setIsLinked] = React.useState(false);
  const [isStaking, setIsStaking] = React.useState(false);
  const [copiedCommand, setCopiedCommand] = React.useState(false);
  const [fundAmount, setFundAmount] = React.useState("");
  const [isFundingRunner, setIsFundingRunner] = React.useState(false);
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Fetch Runner SUI Balance
  const { data: runnerBalanceData, refetch: refetchRunnerBalance } = useSuiClientQuery(
    'getBalance',
    { owner: runnerAddress as string },
    { enabled: !!runnerAddress && isLinked, refetchInterval: 10000 }
  );

  const runnerSuiBalance = runnerBalanceData ? (Number(runnerBalanceData.totalBalance) / 1e9).toFixed(4) : "0.0000";

  // Check if user already has a NodeOperator object
  const { data: operatorObjects } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address || '',
    filter: { StructType: `${PACKAGE_ID}::trigger::NodeOperator` },
    options: { showContent: true }
  }, {
    enabled: !!account,
    refetchInterval: 5000,
  });

  React.useEffect(() => {
    if (operatorObjects && operatorObjects.data.length > 0) {
      setIsStaked(true);
      // Optional: Check if runner address is already linked in the object content
      const content = operatorObjects.data[0].data?.content as any;
      if (content && content.fields && content.fields.runner_address !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
         setIsLinked(true);
         setRunnerAddress(content.fields.runner_address);
      }
    } else {
      setIsStaked(false);
      setIsLinked(false);
      setRunnerAddress("");
    }
  }, [operatorObjects]);

  const handleStakeSui = () => {
    if (!account) return showToast('warning', 'Wallet Required', 'Please connect wallet first');
    
    setIsStaking(true);
    try {
      const tx = new Transaction();
      
      // 0.5 SUI (500_000_000 MIST) minimum stake
      const stakeCoin = tx.splitCoins(tx.gas, [500_000_000]);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::trigger::stake_node`,
        arguments: [stakeCoin],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Stake Successful!", result);
            setIsStaked(true);
            setIsStaking(false);
            showToast('success', 'Staking Successful', 'You have successfully staked 0.5 SUI.');
          },
          onError: (error) => {
            console.error("Stake Failed", error);
            showToast('error', 'Staking Failed', error.message);
            setIsStaking(false);
          }
        }
      );
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Error', e.message);
      setIsStaking(false);
    }
  };

  const handleLinkRunner = () => {
    if (!account) return showToast('warning', 'Wallet Required', 'Please connect wallet first');
    if (!operatorObjects || operatorObjects.data.length === 0) return showToast('warning', 'Operator Not Found', 'No staked node operator found');
    if (!runnerAddress) return showToast('warning', 'Input Required', 'Please enter a runner address');

    try {
      const tx = new Transaction();
      const operatorId = operatorObjects.data[0].data?.objectId;

      tx.moveCall({
        target: `${PACKAGE_ID}::trigger::link_runner_address`,
        arguments: [
          tx.object(operatorId!),
          tx.pure.address(runnerAddress),
          tx.object(PUBLIC_POOL_REGISTRY_ID),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Link Successful!", result);
            setIsLinked(true);
            showToast('success', 'Runner Linked', 'Your runner address has been successfully linked to your node.');
          },
          onError: (error) => {
            console.error("Link Failed", error);
            showToast('error', 'Linking Failed', error.message);
          }
        }
      );
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Error', e.message);
    }
  };

  const handleFundRunner = () => {
    if (!runnerAddress || !fundAmount) return;
    setIsFundingRunner(true);
    try {
      const tx = new Transaction();
      const amountInMist = parseFloat(fundAmount) * 1e9;
      
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Math.floor(amountInMist))]);
      tx.transferObjects([coin], tx.pure.address(runnerAddress));
      
      signAndExecute({ transaction: tx }, {
        onSuccess: () => {
          setIsFundingRunner(false);
          setFundAmount("");
          refetchRunnerBalance();
          showToast('success', 'Funding Successful', `Successfully sent ${fundAmount} SUI to Runner.`);
        },
        onError: (err) => {
          setIsFundingRunner(false);
          showToast('error', 'Funding Failed', err.message);
        }
      });
    } catch(e: any) {
       setIsFundingRunner(false);
       showToast('error', 'Error', e.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Operator-1: Overview */}
      {(!activeMenu || activeMenu === 'operator-1') && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-bold text-white font-outfit">Node Operator Workspace</h2>
            <button className="bg-transparent border border-[#212E40] hover:bg-[#212E40]/50 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
              <Download size={14} /> Export Data
            </button>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            {/* Card 1: Cluster Health */}
            <div className="bg-[#111722] border border-[#212E40] rounded-xl p-5 shadow-lg relative">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cluster Health</h4>
                <Activity size={14} className="text-emerald-400" />
              </div>
              <div className="text-4xl font-bold text-white font-outfit mb-2">100.00%</div>
              <div className="text-emerald-400 text-xs font-mono mb-6 flex items-center gap-1"><Check size={12}/> Operator nodes operational</div>
              <div className="flex gap-2">
                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>

            {/* Card 2: Avg Latency */}
            <div className="bg-[#111722] border border-[#212E40] rounded-xl p-5 shadow-lg relative">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Latency (P99)</h4>
                <Cpu size={14} className="text-brand-sui" />
              </div>
              <div className="text-4xl font-bold text-white font-outfit mb-2">5010 ms</div>
              <div className="text-brand-sui text-xs font-mono mb-6 flex items-center gap-1"><ArrowUpRight size={12}/> Live round-trip runner lag</div>
              <div className="flex gap-1 h-3 items-end">
                <div className="w-full bg-[#1A3150] rounded-t-sm h-full relative"><div className="absolute inset-0 bg-gradient-to-t from-brand-sui/40 to-brand-sui/10 rounded-t-sm"></div></div>
                <div className="w-full bg-[#1A3150] rounded-t-sm h-2/3 relative"><div className="absolute inset-0 bg-gradient-to-t from-brand-sui/40 to-brand-sui/10 rounded-t-sm"></div></div>
                <div className="w-full bg-[#1A3150] rounded-t-sm h-1/2 relative"><div className="absolute inset-0 bg-gradient-to-t from-brand-sui/40 to-brand-sui/10 rounded-t-sm"></div></div>
              </div>
            </div>

            {/* Card 3: Success Rate */}
            <div className="bg-[#111722] border border-[#212E40] rounded-xl p-5 shadow-lg relative">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Success Rate</h4>
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div className="text-4xl font-bold text-white font-outfit mb-2">100.0%</div>
              <div className="text-emerald-400 text-xs font-mono mb-6 flex items-center gap-1"><Check size={12}/> Dynamic execution validation</div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">OK: <span className="text-white">3</span></span>
                <span className="text-slate-400">ERR: <span className="text-red-400">0</span></span>
              </div>
            </div>

            {/* Card 4: Total Invocations */}
            <div className="bg-[#111722] border border-[#212E40] rounded-xl p-5 shadow-lg relative">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Invocations</h4>
                <Zap size={14} className="text-brand-sui" />
              </div>
              <div className="text-4xl font-bold text-white font-outfit mb-2">{isStaked ? '3' : '0'}</div>
              <div className="text-brand-sui text-xs font-mono mb-6 flex items-center gap-1">▲ On-chain events queried</div>
              <div className="h-1.5 w-full bg-[#1A3150] rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-4/5 bg-brand-cyan shadow-[0_0_10px_rgba(56,152,255,0.8)]"></div>
              </div>
            </div>
          </div>

          {/* Middle Section: Chart & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            
            {/* Chart Area */}
            <div className="md:col-span-2 bg-[#111722] border border-[#212E40] rounded-xl p-6 shadow-lg relative min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Execution Volume (Global)</h4>
                <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#304B76]"></div> SUI EVENT BUS</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-sui"></div> WALRUS WORKERS</div>
                </div>
              </div>
              
              <div className="flex-1 flex items-end justify-between px-4 relative z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">15:33</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">15:48</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">16:03</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">16:18</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">16:33</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">16:48</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">17:03</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  <span className="text-[10px] text-slate-400 font-mono">17:18</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {isStaked ? (
                    <div className="w-10 flex flex-col justify-end h-32 gap-[1px]">
                      <div className="w-full bg-[#1A3150] h-1/2 border border-[#304B76] rounded-t-sm"></div>
                      <div className="w-full bg-[#142642] h-1/2 border border-[#304B76]"></div>
                    </div>
                  ) : (
                     <div className="w-10 h-1 bg-brand-sui shadow-[0_0_12px_rgba(56,152,255,0.8)] rounded-t-sm"></div>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">17:33</span>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-[#111722] border border-[#212E40] rounded-xl p-0 shadow-lg flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-[#212E40]">
                <h4 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Active Alerts</h4>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold">5 ACTIVE</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <div className="bg-[#141A26] border border-[#2A3B52] rounded-lg p-4 relative group hover:border-brand-sui/50 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-sui rounded-l-lg opacity-50 group-hover:opacity-100"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                      <Info size={14} className="text-brand-sui" /> VM Isolate Completed
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">17:33</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Executed 'Hello world' successfully inside V8 sandbox. Output: Function executed successfully
                  </p>
                  <button className="text-[9px] font-bold text-slate-300 uppercase tracking-wider hover:text-white">Acknowledge</button>
                </div>

                <div className="bg-[#141A26] border border-[#2A3B52] rounded-lg p-4 relative group hover:border-brand-sui/50 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-sui rounded-l-lg opacity-50 group-hover:opacity-100"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                      <Info size={14} className="text-brand-sui" /> VM Isolate Completed
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">17:30</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Executed 'Hello world' successfully inside V8 sandbox. Output: Function executed successfully
                  </p>
                  <button className="text-[9px] font-bold text-slate-300 uppercase tracking-wider hover:text-white">Acknowledge</button>
                </div>

                <div className="bg-[#141A26] border border-[#2A3B52] rounded-lg p-4 relative group hover:border-brand-sui/50 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-sui rounded-l-lg opacity-50 group-hover:opacity-100"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                      <Info size={14} className="text-brand-sui" /> VM Isolate Completed
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">17:24</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Data Table */}
          <div className="w-full bg-[#111722] border border-[#212E40] rounded-xl shadow-lg">
            <div className="p-5 flex justify-between items-center border-b border-[#212E40]">
              <h4 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Top Performing Functions</h4>
              <button className="text-xs text-brand-sui font-bold hover:text-brand-cyan transition-colors">View Performance Suite</button>
            </div>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#212E40]">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Function Name</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Invocations</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Success Rate</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Latency</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Trigger</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#212E40]/50 hover:bg-[#141A26] transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-white">Hello world</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{isStaked ? '3' : '0'}</td>
                    <td className="px-6 py-4 text-sm font-mono text-emerald-400">100.0%</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">5010 ms</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">Manual</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle size={10} /> VERIFIED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-transparent border border-[#304B76] text-[#304B76] group-hover:text-brand-sui group-hover:border-brand-sui px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors">
                        Edit Trigger
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
      
      {/* Operator-2: Node Logs */}
      {activeMenu === 'operator-2' && (
        <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 h-[calc(100vh-140px)] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h3 className="text-white font-bold font-outfit text-lg mb-4 flex items-center gap-2 shrink-0">
            <Terminal size={18} className="text-brand-sui animate-pulse" /> Live Workload Feed
          </h3>
          <div className="bg-[#05060a] border border-[#141624] rounded-xl p-6 md:p-8 text-left text-slate-300 text-sm font-mono flex-1 overflow-y-auto relative shadow-inner">
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex gap-4">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-emerald-400">INFO</span>
                <span>Node initialized. Connected to Sui Network.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-brand-sui">SYNC</span>
                <span>{isStaked ? (isLinked ? "Node linked and active! Listening for workloads..." : "Awaiting runner address linkage...") : "Awaiting node registration..."}</span>
              </div>
              {isLinked && (
                <>
                  <div className="flex gap-4 opacity-50 mt-4">
                    <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-slate-400">WAIT</span>
                    <span className="animate-pulse">Polling mempool for assigned tasks...</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operator-3: Performance */}
      {activeMenu === 'operator-3' && (
        <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-10 text-center flex flex-col items-center justify-center h-96 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Activity size={48} className="text-[#14304A] mb-4" />
          <h3 className="text-white font-bold font-outfit text-xl mb-2">Performance Analytics</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">Detailed hardware utilization and execution latency metrics are coming in the next update.</p>
        </div>
      )}

      {/* Operator-4: Runner Vault */}
      {activeMenu === 'operator-4' && (
        <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-[#14304A]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-sui/10 border border-brand-sui/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Wallet size={28} className="text-brand-sui" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-outfit">Runner Vault</h2>
                <p className="text-slate-400 text-sm">Manage your validator node's stake and gas funds.</p>
              </div>
            </div>
          </div>

          {!isStaked ? (
            <div className="bg-[#141624] border border-[#14304A] rounded-xl p-8 text-center flex flex-col items-center shadow-inner">
              <Shield size={48} className="text-brand-cyan mb-4 opacity-50" />
              <h3 className="text-white font-bold text-lg mb-2">Register Validator Node</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md">Stake a minimum of 0.5 SUI to register your node on the network and start processing Web3 workloads.</p>
              
              <button 
                onClick={handleStakeSui}
                disabled={isStaking}
                className="bg-gradient-to-r from-brand-cyan to-emerald-500 text-white font-bold py-3.5 px-10 rounded-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isStaking ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />} 
                {isStaking ? "Staking 0.5 SUI..." : "Stake 0.5 SUI & Register"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Registration Success Block */}
              <div className="w-full bg-[#05060a] border border-brand-cyan/30 rounded-xl p-6 md:p-8 text-left animate-in zoom-in-95 duration-300 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/5 blur-[60px] rounded-full"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h4 className="text-brand-cyan font-bold flex items-center gap-2 text-lg">
                    <ShieldCheck size={20} /> Node Registered
                  </h4>
                  <span className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-3 py-1 rounded-md text-xs font-bold font-mono shadow-sm">0.5 SUI Staked</span>
                </div>
                
                <p className="text-slate-300 text-sm mb-4 relative z-10 leading-relaxed">
                  To boot the decentralized execution engine locally, run this exact command in your terminal. It will download the container and connect to Walrus.
                </p>
                <div className="bg-[#0A1C2E] border border-[#14304A] rounded-lg p-4 font-mono text-xs md:text-sm text-brand-sui select-all flex justify-between items-center group relative z-10 shadow-inner">
                  <span>npx sui-functions-node --core OWhic3rdiAIoOzAZe9GgZve4GE_ZjrRRLMthRhf3bGo</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("npx sui-functions-node --core OWhic3rdiAIoOzAZe9GgZve4GE_ZjrRRLMthRhf3bGo");
                      setCopiedCommand(true);
                      setTimeout(() => setCopiedCommand(false), 2000);
                    }}
                    className="text-slate-500 hover:text-white transition-colors p-2 bg-[#05060a] rounded-md border border-[#14304A]"
                    title="Copy Command"
                  >
                    {copiedCommand ? <Check size={16} className="text-brand-cyan" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Linking and Funding block */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#141624] border border-[#14304A] rounded-xl p-6 md:p-8 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Terminal size={64}/></div>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-lg"><Terminal size={18} className="text-brand-sui"/> Link Runner Address</h4>
                  <p className="text-slate-400 text-sm mb-5 leading-relaxed max-w-2xl">
                    When your terminal boots, it will generate a unique Runner Address. Paste it here to authorize that runner to process workloads using your node's stake.
                  </p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="0x..." 
                      value={runnerAddress}
                      onChange={(e) => setRunnerAddress(e.target.value)}
                      disabled={isLinked}
                      className="flex-1 bg-[#0A1C2E] border border-[#14304A] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-brand-sui disabled:opacity-50 transition-colors shadow-inner"
                    />
                    <button 
                      onClick={handleLinkRunner}
                      disabled={isLinked || !runnerAddress}
                      className="bg-brand-sui hover:bg-brand-sui/80 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_15px_rgba(56,152,255,0.2)] md:w-auto w-full whitespace-nowrap"
                    >
                      {isLinked ? 'Linked ✓' : 'Authorize Node'}
                    </button>
                  </div>
                </div>

                {isLinked && (
                  <div className="bg-[#141624] border border-[#14304A] rounded-xl p-6 md:p-8 shadow-inner animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={64}/></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-5 gap-4 relative z-10">
                      <div>
                        <h4 className="text-white font-bold flex items-center gap-2 text-lg mb-2"><Zap size={18} className="text-emerald-400"/> Fund Runner Gas</h4>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                          Your runner needs a small amount of SUI to pay for gas fees when publishing workload results back to the blockchain. We recommend keeping at least 0.05 SUI funded.
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-sm font-mono bg-[#0A1C2E] border border-[#14304A] shadow-inner rounded-xl px-4 py-2.5 text-emerald-400 flex items-center gap-2 font-bold">
                          <Wallet size={16}/> {runnerSuiBalance} SUI
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3 relative z-10">
                      <input 
                        type="number" 
                        placeholder="Amount (SUI)" 
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        disabled={isFundingRunner}
                        className="flex-1 bg-[#0A1C2E] border border-[#14304A] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors shadow-inner"
                      />
                      <button 
                        onClick={handleFundRunner}
                        disabled={isFundingRunner || !fundAmount}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#05060a] px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.3)] md:w-auto w-full whitespace-nowrap"
                      >
                        {isFundingRunner ? <Activity className="animate-spin" size={16} /> : <ArrowUpRight size={16} />}
                        {isFundingRunner ? 'Sending...' : 'Fund Runner'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

const Dashboard: React.FC = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Multi-Project States
  const [myProjects, setMyProjects] = useState<{id: string, name: string, description: string, runnerAddress: string, auditorBlobId: string, vault: string}[]>([]);
  const [activeProject, setActiveProject] = useState<{id: string, name: string, description: string, runnerAddress: string, auditorBlobId: string, vault: string} | null>(null);
  const [globalComputeFee, setGlobalComputeFee] = useState<number>(0.007);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Settings States
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsRunnerAddress, setSettingsRunnerAddress] = useState("");
  const [isCustomRunner, setIsCustomRunner] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [deletingFunctionName, setDeletingFunctionName] = useState<string | null>(null);
  
  // Audit Warning Modal States
  const [isAuditWarningModalOpen, setIsAuditWarningModalOpen] = useState(false);
  const [auditWarningFnName, setAuditWarningFnName] = useState("");
  const [auditWarningStatus, setAuditWarningStatus] = useState<'Pending Audit' | 'Rejected'>('Pending Audit');
  const [auditWarningBlobId, setAuditWarningBlobId] = useState("");
  const [isRequestingVerification, setIsRequestingVerification] = useState<string | null>(null);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'delete_project' | 'delete_function' | 'admin_delete_workspace' | null;
    targetName: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: null,
    targetName: ''
  });
  
  // Custom Form States
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [registerFunctionName, setRegisterFunctionName] = useState("");
  const [registerBlobId, setRegisterBlobId] = useState("");
  const [registerTriggerType, setRegisterTriggerType] = useState<number>(0);
  const [registerTriggerConfig, setRegisterTriggerConfig] = useState<string>("{}");

  // Edit Trigger Config States
  const [isEditTriggerModalOpen, setIsEditTriggerModalOpen] = useState(false);
  const [editTriggerFunctionName, setEditTriggerFunctionName] = useState("");
  const [editTriggerType, setEditTriggerType] = useState<number>(0);
  const [editTriggerConfig, setEditTriggerConfig] = useState<string>("{}");
  const [isUpdatingTrigger, setIsUpdatingTrigger] = useState(false);

  // Dashboard Stats & Logs States
  const [executionCount, setExecutionCount] = useState(0);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([
    `[System] Sui-Functions Operator runner fleet initialized successfully.`,
    `[System] Awaiting on-chain transaction events...`
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isBlobIdLocked, setIsBlobIdLocked] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [activeMenu, setActiveMenu] = useState('1'); // 1 = Overview, 2 = Functions, 3 = Logs, 4 = Compute, 5 = Storage
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [triggerFunctionName, setTriggerFunctionName] = useState("");
  const [triggerInputJson, setTriggerInputJson] = useState("{}");
  const [persona, setPersona] = useState<'developer' | 'operator'>('developer');
  
  const handleUpdateComputeFee = async () => {
    if (!adminCapId || !newComputeFee) return;
    
    setIsUpdatingFee(true);
    try {
      const feeInMist = Math.floor(parseFloat(newComputeFee) * 1e9);
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::trigger::update_compute_fee`,
        arguments: [
          tx.object(adminCapId),
          tx.object(PROTOCOL_TREASURY_ID),
          tx.pure.u64(feeInMist)
        ]
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            showToast('success', 'Fee Updated Successfully', `New base compute fee set to ${newComputeFee} SUI`, result.digest);
            setGlobalComputeFee(parseFloat(newComputeFee));
            setNewComputeFee("");
            setIsUpdatingFee(false);
          },
          onError: (error) => {
            showToast('error', 'Update Failed', error.message.split('}')[0] + '}');
            setIsUpdatingFee(false);
          }
        }
      );
    } catch (e: any) {
      showToast('error', 'Invalid Format', 'Please enter a valid number for the fee');
      setIsUpdatingFee(false);
    }
  };

  // In-App SEO Search Bar State
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return SEARCH_ITEMS.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  useEffect(() => {
    if (scrollTarget) {
      const element = document.getElementById(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setScrollTarget(null);
      } else {
        const timer = setTimeout(() => {
          const el = document.getElementById(scrollTarget);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setScrollTarget(null);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [scrollTarget, activeMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item: SearchItem) => {
    setActiveMenu(item.tab);
    setScrollTarget(item.anchorId);
    setSearchQuery("");
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case '1': return 'Overview';
      case '2': return 'Functions';
      case '3': return 'Logs';
      case '4': return 'Compute';
      case '5': return 'Storage';
      case '6': return 'Docs';
      default: return 'Tab';
    }
  };
  
  // My Functions State
  const [myFunctions, setMyFunctions] = useState<{name: string, blobId: string, version: string, status: number, triggerType: number, triggerConfig: string}[]>([]);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(false);

  // Toast State & Notification helper
  interface ToastItem {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    txDigest?: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (
    type: ToastItem['type'],
    title: string,
    message: string,
    txDigest?: string,
    duration = 6000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, txDigest }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  // Help & Notification state
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  // Active Alerts state
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "SUI/USD Oracle Deviation Triggered",
      time: "2m ago",
      desc: "SUI/USD price deviation exceeded the 0.1% threshold, automatically dispatching an on-chain transaction calling trigger::call_function().",
      severity: "high"
    },
    {
      id: 2,
      title: "Walrus Storage Node Cache Verified",
      time: "14m ago",
      desc: "Immutable script blob 'sui_usd_oracle.js' successfully fetched and cached on isolated edge runner.",
      severity: "warning"
    },
    {
      id: 3,
      title: "Sui RPC Testnet Gateway Timeout",
      time: "42m ago",
      desc: "Latency spike (>500ms) detected on Sui Testnet JSON-RPC validator node. Failing over to backup fullnode.",
      severity: "error"
    }
  ]);

  const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5";

  // Fetch SUI Balance
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    { owner: account?.address as string },
    { enabled: !!account?.address, refetchInterval: 10000 }
  );

  const suiBalance = balanceData ? (Number(balanceData.totalBalance) / 1e9).toFixed(2) : "0.00";

  // Check if user is Admin
  const { data: adminCaps } = useSuiClientQuery(
    'getOwnedObjects',
    { owner: account?.address as string, filter: { StructType: ADMIN_CAP_TYPE } },
    { enabled: !!account?.address, refetchInterval: 30000 }
  );
  
  const isAdmin = adminCaps && adminCaps.data && adminCaps.data.length > 0;
  const adminCapId = isAdmin ? adminCaps.data[0].data?.objectId : null;

  // Admin states
  const [allProjects, setAllProjects] = useState<{id: string, name: string, description: string, owner: string, vault: string}[]>([]);
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [newComputeFee, setNewComputeFee] = useState("");

  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // Fetch Shared/Owned Projects
  const fetchMyProjects = async () => {
    if (!client || !account) return;
    setIsLoadingProjects(true);
    try {
      // 1. Query ProjectCreated events to locate project IDs created by this user
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::trigger::ProjectCreated`
        },
        order: 'descending',
        limit: 100
      });

      const myProjectIds = events.data
        .filter((event: any) => event.parsedJson?.owner === account.address)
        .map((event: any) => event.parsedJson?.project_id as string);

      // De-duplicate project IDs
      const uniqueProjectIds = Array.from(new Set(myProjectIds));

      if (uniqueProjectIds.length === 0) {
        setMyProjects([]);
        setActiveProject(null);
        return;
      }

      // 2. Fetch object details for each project to filter out deleted ones
      const projectObjects = await client.multiGetObjects({
        ids: uniqueProjectIds,
        options: {
          showContent: true
        }
      });

      // Filter out deleted projects (where data is null/undefined or status is not exists)
      const projectsList = projectObjects
        .filter(obj => obj.data !== null && obj.data !== undefined)
        .map(obj => {
          const fields = (obj.data?.content as any)?.fields;
          const vaultStr = fields?.vault || "0";
          const vaultValue = (Number(vaultStr) / 1e9).toFixed(2);
          return {
            id: obj.data?.objectId as string,
            name: fields?.name || "Unnamed Project",
            description: fields?.description || "",
            runnerAddress: fields?.runner_address || "",
            auditorBlobId: fields?.auditor_blob_id || "",
            vault: vaultValue
          };
        });

      setMyProjects(prev => {
        const missingInFetch = prev.filter(p => !projectsList.some(pl => pl.id === p.id));
        return [...projectsList, ...missingInFetch];
      });
      
      try {
        const treasuryObj = await client.getObject({
          id: PROTOCOL_TREASURY_ID,
          options: { showContent: true }
        });
        const fields = (treasuryObj.data?.content as any)?.fields;
        if (fields?.base_compute_fee) {
          setGlobalComputeFee(Number(fields.base_compute_fee) / 1e9);
        }
      } catch (e) {
        console.warn("Failed to fetch global compute fee", e);
      }

      setActiveProject(prev => {
        if (prev) {
          const found = projectsList.find(p => p.id === prev.id);
          if (found) return found;
          // Optimistic state retention
          return prev;
        }
        return projectsList[0] || null;
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchAllProjects = async () => {
    if (!client || !isAdmin) return;
    try {
      const events = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::trigger::ProjectCreated` },
        order: 'descending',
        limit: 100
      });
      const allProjectIds = Array.from(new Set(events.data.map((e: any) => e.parsedJson?.project_id as string)));
      if (allProjectIds.length === 0) return setAllProjects([]);
      const projectObjects = await client.multiGetObjects({
        ids: allProjectIds,
        options: { showContent: true }
      });
      const projectsList = projectObjects
        .filter(obj => obj.data !== null && obj.data !== undefined)
        .map(obj => {
          const fields = (obj.data?.content as any)?.fields;
          return {
            id: obj.data?.objectId as string,
            name: fields?.name || "Unnamed",
            description: fields?.description || "",
            owner: fields?.owner || "",
            vault: fields?.vault ? (Number(fields.vault) / 1e9).toFixed(2) : "0"
          };
        });
      setAllProjects(projectsList);

      const treasuryObj = await client.getObject({
        id: PROTOCOL_TREASURY_ID,
        options: { showContent: true }
      });
      if (treasuryObj.data) {
        const tFields = (treasuryObj.data.content as any)?.fields;
        if (tFields && tFields.balance) {
          setTreasuryBalance((Number(tFields.balance) / 1e9).toFixed(4));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (account && client) {
      fetchMyProjects();
      if (isAdmin) {
        fetchAllProjects();
      }
    }
  }, [account?.address, client, isAdmin]);

  useEffect(() => {
    if (activeProject) {
      const runner = activeProject.runnerAddress || "";
      const defaultRunner = "0x66e2384110dfebe33a817f76f8f7916bdd92b1046b7ac699b59701f2c965a875";
      const isZeroAddress = !runner || runner === "0x0" || /^0x0+$/.test(runner);
      
      if (isZeroAddress) {
        setSettingsRunnerAddress(defaultRunner);
        setIsCustomRunner(false);
      } else {
        setSettingsRunnerAddress(runner);
        setIsCustomRunner(runner.toLowerCase() !== defaultRunner.toLowerCase());
      }
    }
  }, [activeProject]);

  // Handle wallet connection loading sequence
  const prevAccountRef = useRef<any>(null);
  useEffect(() => {
    if (account && !prevAccountRef.current) {
      setIsDashboardLoading(true);
      const timer = setTimeout(() => {
        setIsDashboardLoading(false);
      }, 1600);
      return () => clearTimeout(timer);
    }
    prevAccountRef.current = account;
  }, [account]);

  const getTriggerLabel = (type: number, configStr: string) => {
    try {
      const config = JSON.parse(configStr || "{}");
      if (type === 0) return "Manual";
      if (type === 1) return `Cron (${config.interval || 60}s)`;
      if (type === 2) return `Sui Event (${config.eventName || "Event"})`;
      if (type === 3) return `Price Drift (${(Number(config.drift_threshold || 0.001) * 100).toFixed(2)}%)`;
    } catch (e) {
      return "JSON Config";
    }
    return "Manual";
  };

  // Fetch functions from Active Project Table
  const fetchMyFunctions = async () => {
    if (!client || !account || !activeProject) {
      setMyFunctions([]);
      return;
    }
    setIsLoadingFunctions(true);
    try {
      const projectObj = await client.getObject({
        id: activeProject.id,
        options: { showContent: true }
      });
      
      const content = projectObj.data?.content as any;
      const tableId = content?.fields?.functions?.fields?.id?.id;
      
      if (!tableId) {
        setMyFunctions([]);
        setIsLoadingFunctions(false);
        return;
      }

      const dynamicFields = await client.getDynamicFields({
        parentId: tableId
      });

      const functionsList: {name: string, blobId: string, version: string, status: number, triggerType: number, triggerConfig: string}[] = [];
      for (const field of dynamicFields.data) {
        const fieldObj = await client.getDynamicFieldObject({
          parentId: tableId,
          name: field.name
        });
        
        const fieldContent = fieldObj.data?.content as any;
        const metadata = fieldContent?.fields?.value?.fields;
        
        if (metadata) {
          functionsList.push({
            name: field.name.value as string,
            blobId: metadata.walrus_blob_id,
            version: metadata.version,
            status: metadata.status !== undefined ? Number(metadata.status) : 1,
            triggerType: metadata.trigger_type !== undefined ? Number(metadata.trigger_type) : 0,
            triggerConfig: metadata.trigger_config as string || "{}"
          });
        }
      }
      
      setMyFunctions(prev => {
        const missingInFetch = prev.filter(f => !functionsList.some(fl => fl.name === f.name));
        return [...functionsList, ...missingInFetch];
      });
    } catch (error) {
      console.error("Error fetching functions:", error);
    } finally {
      setIsLoadingFunctions(false);
    }
  };

  useEffect(() => {
    if (activeMenu === '2' || activeProject) {
      fetchMyFunctions();
    }
  }, [activeMenu, activeProject, account, client]);

  useEffect(() => {
    if (triggerFunctionName === "sui_usd_oracle.js" || triggerFunctionName === "sui_usd_oracle") {
      setTriggerInputJson(JSON.stringify({ asset: "SUI/USD", deviation: 0.001 }, null, 2));
    } else if (triggerFunctionName === "hello_world.js" || triggerFunctionName === "hello_world") {
      setTriggerInputJson(JSON.stringify({ user: "0x2e8f5c31ad3a89e2c45f4d8a571ea38de1f4c718" }, null, 2));
    } else if (triggerFunctionName === "test_upload.js" || triggerFunctionName === "test_upload") {
      setTriggerInputJson(JSON.stringify({ test: true, timestamp: Date.now() }, null, 2));
    } else {
      setTriggerInputJson("{}");
    }
  }, [triggerFunctionName]);

  // Polling for events matching our package triggers
  useEffect(() => {
    if (!client) return;
    
    let cursor: any = null;
    let isInitialLoad = true;
    let seenDigests = new Set();

    const pollInterval = setInterval(async () => {
      try {
        const { data, nextCursor } = await client.queryEvents({
          query: { MoveModule: { package: PACKAGE_ID, module: 'trigger' } },
          cursor,
          order: 'ascending',
        });

        if (data.length > 0) {
          setAllEvents(prev => {
            const merged = [...prev];
            data.forEach(e => {
              if (!merged.some(m => m.id.txDigest === e.id.txDigest)) {
                merged.push(e);
              }
            });
            return merged;
          });

          const newLogs: string[] = [];
          
          data.forEach(event => {
            if (!seenDigests.has(event.id.txDigest)) {
              seenDigests.add(event.id.txDigest);
              const funcName = (event.parsedJson as any).function_name;
              const projId = (event.parsedJson as any).project_id;

              if (event.type.includes('ExecutionTriggered')) {
                newLogs.push(`[Blockchain] Event: ${event.id.txDigest.slice(0, 10)}... (Trigger "${funcName}" for Project: ${projId.slice(0, 6)}...)`);
              } else if (event.type.includes('ExecutionCompleted')) {
                const result = (event.parsedJson as any).result_data;
                newLogs.push(`[Blockchain] Success: ${funcName} in ${projId.slice(0, 6)}... -> ${result.slice(0, 30)}${result.length > 30 ? '...' : ''}`);
              }
            }
          });

          if (newLogs.length > 0) {
            setLogs(prev => [...newLogs.reverse(), ...prev]);
          }
          
          cursor = nextCursor;
        }
        isInitialLoad = false;
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [client]);

  // Create on-chain Project object
  const handleCreateProject = () => {
    if (!account || !newProjectName.trim()) return;
    
    setIsCreatingProject(true);
    const tx = new Transaction();
    
    const [projectFee] = tx.splitCoins(tx.gas, [tx.pure.u64(100_000_000)]);
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::create_project`,
      arguments: [
        tx.pure.string(newProjectName),
        tx.pure.string(newProjectDescription || ""),
        tx.object(PROTOCOL_TREASURY_ID),
        projectFee
      ]
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          const savedName = newProjectName;
          const savedDesc = newProjectDescription;
          showToast('success', 'Workspace Created', `Workspace "${savedName}" has been successfully created on-chain!`, result.digest);
          setLogs(prev => [`[Transaction] Workspace Minted: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsCreatingProject(false);
          setIsCreateProjectModalOpen(false);
          setNewProjectName("");
          setNewProjectDescription("");
          
          try {
            // Wait 1 second to ensure RPC indexers have processed transaction block
            await new Promise(resolve => setTimeout(resolve, 1000));
            const txDetails = await client.getTransactionBlock({
              digest: result.digest,
              options: { showObjectChanges: true }
            });
            
            let newProjectId = "";
            if (txDetails.objectChanges) {
              for (const change of txDetails.objectChanges) {
                if (change.type === 'created' && change.objectType.endsWith('::trigger::Project')) {
                  newProjectId = change.objectId;
                  break;
                }
              }
            }
            
            if (newProjectId) {
              // Fetch the newly created project object directly to bypass indexer lag
              const projectObj = await client.getObject({
                id: newProjectId,
                options: { showContent: true }
              });
              
              const fields = (projectObj.data?.content as any)?.fields;
              const vaultStr = fields?.vault || "0";
              const vaultValue = (Number(vaultStr) / 1e9).toFixed(2);
              const newProj = {
                id: newProjectId,
                name: fields?.name || savedName,
                description: fields?.description || savedDesc,
                runnerAddress: fields?.runner_address || "",
                auditorBlobId: fields?.auditor_blob_id || "",
                vault: vaultValue
              };
              
              setMyProjects(prevProjects => {
                if (prevProjects.some(p => p.id === newProjectId)) return prevProjects;
                const updated = [...prevProjects, newProj];
                return updated;
              });
              setActiveProject(newProj);
              setLogs(prev => [`[System] Project "${newProj.name}" successfully created and activated!`, ...prev]);
            }
          } catch (err: any) {
            console.error("Error fetching minted project details:", err);
          }
          
          // Poll in background for safety
          fetchMyProjects();
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            fetchMyProjects();
            if (attempts >= 4) {
              clearInterval(interval);
            }
          }, 1500);
        },
        onError: (err) => {
          showToast('error', 'Workspace Creation Failed', err.message);
          setIsCreatingProject(false);
        }
      }
    );
  };

  // Save Settings for active project (Runner Address)
  const handleSaveSettings = () => {
    if (!account || !activeProject) return;
    if (!settingsRunnerAddress.trim()) {
      showToast('warning', 'Input Required', 'Runner address is required');
      return;
    }
    
    setIsSavingSettings(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::set_runner_address`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.address(settingsRunnerAddress)
      ]
    });

    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::update_execution_mode`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.u8(isCustomRunner ? 1 : 0)
      ]
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          showToast('success', 'Settings Saved', 'Runner address has been updated successfully!', result.digest);
          setLogs(prev => [`[Transaction] Workspace Settings Configured: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsSavingSettings(false);
          setIsSettingsModalOpen(false);
          
          // Apply local state updates instantly to bypass indexer lag
          const updatedRunner = settingsRunnerAddress;
          
          setActiveProject(prev => {
            if (!prev) return null;
            return {
              ...prev,
              runnerAddress: updatedRunner
            };
          });
          
          setMyProjects(prevProjects => 
            prevProjects.map(p => {
              if (p.id === activeProject.id) {
                return {
                  ...p,
                  runnerAddress: updatedRunner
                };
              }
              return p;
            })
          );
          
          // Poll to handle RPC indexer lag
          fetchMyProjects();
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            fetchMyProjects();
            if (attempts >= 4) {
              clearInterval(interval);
            }
          }, 1500);
        },
        onError: (err) => {
          showToast('error', 'Settings Update Failed', err.message);
          setIsSavingSettings(false);
        }
      }
    );
  };

  // Delete Workspace Project Click Trigger
  const handleDeleteProjectClick = () => {
    if (!account || !activeProject) return;

    if (myFunctions.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: "Cannot Delete Workspace",
        message: "Please delete all registered functions in this workspace first before destroying the project. Sui dynamic tables cannot be destroyed on-chain while they contain active items.",
        actionType: null,
        targetName: ""
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Workspace Project",
      message: "Are you sure you want to permanently delete this workspace project? This will destroy the project container object on-chain and recover your SUI storage rebate.",
      actionType: "delete_project",
      targetName: ""
    });
  };

  // Execute actual Project Deletion on-chain
  const executeDeleteProject = () => {
    if (!account || !activeProject) return;

    setIsDeletingProject(true);
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::delete_project`,
      arguments: [
        tx.object(activeProject.id)
      ]
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setLogs(prev => [`[Transaction] Workspace Destroyed: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsDeletingProject(false);
          setIsSettingsModalOpen(false);

          // Update local state
          const remainingProjects = myProjects.filter(p => p.id !== activeProject.id);
          setMyProjects(remainingProjects);
          setActiveProject(remainingProjects[0] || null);

          // Refresh list from chain
          fetchMyProjects();
        },
        onError: (err) => {
          setConfirmModal({
            isOpen: true,
            title: "Workspace Deletion Failed",
            message: `Transaction failed: ${err.message}`,
            actionType: null,
            targetName: ""
          });
          setIsDeletingProject(false);
        }
      }
    );
  };

  // Delete Function Click Trigger
  const handleDeleteFunctionClick = (functionName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account || !activeProject) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Function Registry",
      message: `Are you sure you want to permanently delete function "${functionName}" from the blockchain registry? This will reclaim the associated storage rebate.`,
      actionType: "delete_function",
      targetName: functionName
    });
  };

  // Execute actual Function Deletion on-chain
  const executeDeleteFunction = (functionName: string) => {
    if (!account || !activeProject) return;

    setDeletingFunctionName(functionName);
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::delete_function`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.string(functionName)
      ]
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setLogs(prev => [`[Transaction] Function "${functionName}" deleted: ${result.digest.slice(0, 10)}...`, ...prev]);
          setDeletingFunctionName(null);

          // Remove from local state instantly to bypass RPC indexing delay
          setMyFunctions(prev => prev.filter(f => f.name !== functionName));

          // Refresh list from chain
          fetchMyFunctions();
        },
        onError: (err) => {
          setConfirmModal({
            isOpen: true,
            title: "Function Deletion Failed",
            message: `Transaction failed: ${err.message}`,
            actionType: null,
            targetName: ""
          });
          setDeletingFunctionName(null);
        }
      }
    );
  };

  const handleWithdraw = () => {
    if (!account || !adminCapId || !withdrawAmount) return;
    setIsWithdrawing(true);
    const tx = new Transaction();
    // amount in MIST
    const amountInMist = parseFloat(withdrawAmount) * 1e9;
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::withdraw_fees`,
      arguments: [
        tx.object(adminCapId),
        tx.object(PROTOCOL_TREASURY_ID),
        tx.pure.u64(Math.floor(amountInMist))
      ]
    });
    signAndExecute({ transaction: tx }, {
      onSuccess: () => {
        setIsWithdrawing(false);
        setWithdrawAmount("");
        fetchAllProjects();
        showToast('success', 'Withdrawal successful!', 'Treasury funds withdrawn to your wallet.');
      },
      onError: (err) => {
        setIsWithdrawing(false);
        showToast('error', 'Withdrawal failed', err.message);
      }
    });
  };

  const handleDeposit = () => {
    if (!activeProject || !depositAmount) return;
    setIsDepositing(true);
    const tx = new Transaction();
    const amountInMist = parseFloat(depositAmount) * 1e9;
    
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Math.floor(amountInMist))]);
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::deposit_funds`,
      arguments: [
        tx.object(activeProject.id),
        coin
      ]
    });
    
    signAndExecute({ transaction: tx }, {
      onSuccess: () => {
        setIsDepositing(false);
        setDepositAmount("");
        fetchAllProjects();
        showToast('success', 'Deposit Successful', `Successfully deposited ${depositAmount} SUI to vault.`);
      },
      onError: (err) => {
        setIsDepositing(false);
        showToast('error', 'Deposit Failed', err.message);
      }
    });
  };

  const handleAdminDeleteProject = (projectId: string) => {
    if (!account || !adminCapId) return;
    setConfirmModal({
      isOpen: true,
      title: 'Force Delete Workspace',
      message: 'Are you sure you want to FORCE DELETE this workspace? This action is permanent and refunds the vault to the owner.',
      actionType: 'admin_delete_workspace',
      targetName: projectId
    });
  };

  const executeAdminDeleteProject = (projectId: string) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::admin_delete_workspace`,
      arguments: [
        tx.object(adminCapId!),
        tx.object(projectId)
      ]
    });
    signAndExecute({ transaction: tx }, {
      onSuccess: () => {
        showToast('success', 'Workspace Deleted', 'Workspace forcefully deleted and vault refunded.');
        fetchAllProjects();
      },
      onError: (err) => {
        showToast('error', 'Deletion Failed', err.message);
      }
    });
  };

  // Register Function inside Active Project
  const handleRegister = () => {
    if (!account || !activeProject || !registerFunctionName.trim() || !registerBlobId.trim()) {
      showToast('warning', 'Input Required', 'Missing function registration details');
      return;
    }
    
    setIsRegistering(true);
    const tx = new Transaction();
    
    const [deployFee] = tx.splitCoins(tx.gas, [tx.pure.u64(50_000_000)]);
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::register_function`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.string(registerFunctionName),
        tx.pure.string(registerBlobId),
        tx.pure.u8(registerTriggerType),
        tx.pure.string(registerTriggerConfig),
        tx.object(PROTOCOL_TREASURY_ID),
        deployFee,
        tx.object(PUBLIC_POOL_REGISTRY_ID),
        tx.object("0x6") // SUI Clock
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          showToast('success', 'Function Registered', `Function "${registerFunctionName}" has been successfully registered!`, result.digest);
          setLogs(prev => [`[Transaction] Function Registered: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsRegistering(false);
          setIsRegisterModalOpen(false);
          setRegisterFunctionName("");
          setRegisterBlobId("");
          setRegisterTriggerType(0);
          setRegisterTriggerConfig("{}");
          setIsBlobIdLocked(false);
          setUploadedFileName("");
          
          // Poll to handle RPC indexer lag
          fetchMyFunctions();
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            fetchMyFunctions();
            if (attempts >= 4) {
              clearInterval(interval);
            }
          }, 1500);
        },
        onError: (err) => {
          showToast('error', 'Registration Failed', err.message);
          setIsRegistering(false);
        }
      }
    );
  };

  // Request On-Chain Verification / Retrying Audit
  const handleRequestVerification = (functionName: string) => {
    if (!account) {
      showToast('warning', 'Wallet Required', 'Please connect your wallet first.');
      return;
    }
    if (!activeProject) {
      showToast('warning', 'Workspace Required', 'Please select a workspace project first.');
      return;
    }
    
    setIsRequestingVerification(functionName);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::request_verification`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.string(functionName),
        tx.object(PUBLIC_POOL_REGISTRY_ID),
        tx.object("0x6") // SUI Clock
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          showToast('success', 'Audit Requested', `Auditor safety review has been requested for "${functionName}"!`, result.digest);
          setLogs(prev => [`[Transaction] Verification Request Dispatched: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsRequestingVerification(null);
          setIsAuditWarningModalOpen(false);
          
          // Poll to refresh the functions status on-chain
          let count = 0;
          const interval = setInterval(() => {
            count++;
            fetchMyFunctions();
            if (count >= 4) clearInterval(interval);
          }, 1500);
        },
        onError: (err) => {
          showToast('error', 'Verification Request Failed', err.message);
          setIsRequestingVerification(null);
        }
      }
    );
  };

  // Update Trigger configuration of a function
  const handleUpdateTrigger = () => {
    if (!account || !activeProject || !editTriggerFunctionName) {
      showToast('warning', 'Input Required', 'Missing wallet, project, or function details.');
      return;
    }
    
    setIsUpdatingTrigger(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::update_trigger_config`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.string(editTriggerFunctionName),
        tx.pure.u8(editTriggerType),
        tx.pure.string(editTriggerConfig)
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          showToast('success', 'Trigger Updated', `Trigger configuration for "${editTriggerFunctionName}" updated successfully!`, result.digest);
          setLogs(prev => [`[Transaction] Trigger configuration updated: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsUpdatingTrigger(false);
          setIsEditTriggerModalOpen(false);
          setEditTriggerFunctionName("");
          setEditTriggerType(0);
          setEditTriggerConfig("{}");
          
          // Poll to refresh the functions on-chain
          fetchMyFunctions();
          let count = 0;
          const interval = setInterval(() => {
            count++;
            fetchMyFunctions();
            if (count >= 4) clearInterval(interval);
          }, 1500);
        },
        onError: (err) => {
          showToast('error', 'Trigger Update Failed', err.message);
          setIsUpdatingTrigger(false);
        }
      }
    );
  };

  // Manual Trigger calling call_function inside Active Project
  const handleTrigger = (functionName: string) => {
    if (!activeProject) {
      showToast('warning', 'Workspace Required', 'Please select or create a project first.');
      return;
    }

    if (!account) {
      showToast('warning', 'Wallet Required', 'Please connect your wallet to execute triggers.');
      return;
    }

    const targetFn = myFunctions.find(f => f.name === functionName);
    if (targetFn && targetFn.status !== 1) {
      setAuditWarningFnName(functionName);
      setAuditWarningStatus(targetFn.status === 0 ? "Pending Audit" : "Rejected");
      setAuditWarningBlobId(targetFn.blobId || "");
      setIsAuditWarningModalOpen(true);
      return;
    }

    if (Number(activeProject.vault) < globalComputeFee) {
      showToast('error', 'Insufficient Vault Balance', `Please deposit at least ${globalComputeFee} SUI in the Billing tab to run this function.`);
      return;
    }
    
    setIsExecuting(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::call_function`,
      arguments: [
        tx.object(activeProject.id),
        tx.pure.string(functionName),
        tx.pure.string(triggerInputJson || "{}"),
        tx.object(PUBLIC_POOL_REGISTRY_ID),
        tx.object("0x6") // SUI Clock
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          showToast('success', 'Function Triggered', `Function "${functionName}" has been manually executed on-chain!`, result.digest);
          setLogs(prev => [`[Transaction] Trigger Emitted: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsExecuting(false);
        },
        onError: (err) => {
          showToast('error', 'Execution Failed', err.message);
          setIsExecuting(false);
        }
      }
    );
  };

  const handleWalrusUpload = (file: File) => {
    setIsUploading(true);
    setUploadPercentage(0);

    let currentVisualPercent = 0;
    let targetPercent = 0;

    const visualInterval = setInterval(() => {
      if (currentVisualPercent < targetPercent) {
        currentVisualPercent += 5 + Math.floor(Math.random() * 8); 
        if (currentVisualPercent > targetPercent) {
          currentVisualPercent = targetPercent;
        }
        setUploadPercentage(currentVisualPercent);
      }
    }, 30);

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', WALRUS_PUBLISHER, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        targetPercent = Math.floor((e.loaded / e.total) * 99);
      }
    };

    xhr.onload = () => {
      clearInterval(visualInterval);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          setUploadPercentage(100);
          
          const result = JSON.parse(xhr.responseText);
          const blobId = result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId;
          
          if (!blobId) {
            throw new Error("Could not extract Blob ID from Walrus response");
          }

          setRegisterBlobId(blobId);
          setIsBlobIdLocked(true);
          setUploadedFileName(file.name);
          showToast('success', 'Walrus Upload Complete', `Successfully uploaded script to Walrus nodes!`);
        } catch (error: any) {
          console.error("Walrus response parsing error:", error);
          showToast('error', 'Walrus Upload Failed', error.message);
        }
      } else {
        showToast('error', 'Walrus Upload Failed', `Upload failed with status ${xhr.status}`);
      }
      setIsUploading(false);
    };

    xhr.onerror = () => {
      clearInterval(visualInterval);
      showToast('error', 'Walrus Upload Failed', 'Network error occurred during Walrus upload.');
      setIsUploading(false);
    };

    xhr.send(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleWalrusUpload(file);
    }
  };

  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);
  const acknowledgeAlert = (id: string) => {
    setAcknowledgedAlertIds(prev => [...prev, id]);
  };

  // 1. Filter events relevant to activeProject
  const projectEvents = useMemo(() => {
    if (!activeProject) return [];
    return allEvents.filter(e => {
      const projId = (e.parsedJson as any)?.project_id;
      return projId === activeProject.id;
    });
  }, [allEvents, activeProject]);

  // 2. Count executions and triggers
  const projectInvocations = useMemo(() => {
    return projectEvents.filter(e => e.type.includes('ExecutionTriggered'));
  }, [projectEvents]);

  const projectCompletions = useMemo(() => {
    return projectEvents.filter(e => e.type.includes('ExecutionCompleted'));
  }, [projectEvents]);

  const totalInvocations = projectInvocations.length;
  const totalCompletions = projectCompletions.length;

  // 3. Compute Latencies
  const latencies = useMemo(() => {
    const list: number[] = [];
    projectCompletions.forEach(comp => {
      const compTime = Number(comp.timestampMs);
      const funcName = (comp.parsedJson as any).function_name;
      // find closest preceding trigger for this function
      const trigger = projectInvocations
        .filter(trig => (trig.parsedJson as any).function_name === funcName && Number(trig.timestampMs) <= compTime)
        .sort((a, b) => Number(b.timestampMs) - Number(a.timestampMs))[0];
      if (trigger) {
        const diff = compTime - Number(trigger.timestampMs);
        if (diff > 0 && diff < 30000) {
          list.push(diff);
        }
      }
    });
    return list;
  }, [projectCompletions, projectInvocations]);

  const avgLatencyVal = latencies.length > 0 
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
    : 0;

  const avgLatency = avgLatencyVal > 0 ? `${avgLatencyVal} ms` : "0 ms";

  const successRateString = totalInvocations > 0 
    ? ((totalCompletions / totalInvocations) * 100).toFixed(1) + "%" 
    : "100.0%";

  const clusterHealthString = totalInvocations > 0 
    ? ((totalCompletions / totalInvocations) * 100).toFixed(2) + "%" 
    : "100.00%";

  // 4. Dynamic alert feed
  const activeAlerts = useMemo(() => {
    const alertsList: any[] = [];
    
    // Scan dynamic fields/functions to alert if empty
    if (activeProject && myFunctions.length === 0) {
      alertsList.push({
        id: "no-func",
        title: "Workspace is Empty",
        time: "Now",
        desc: "Deploy a custom JavaScript script (e.g. sui_usd_oracle.js) to Walrus to register your first function module.",
        severity: "warning"
      });
    }

    // Scan recent triggers
    projectInvocations.slice(-2).forEach((trig, idx) => {
      const funcName = (trig.parsedJson as any).function_name;
      const timeString = new Date(Number(trig.timestampMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      alertsList.push({
        id: `trig-${idx}`,
        title: `Keeper Execution Dispatched`,
        time: timeString,
        desc: `Intercepted event trigger for '${funcName}'. Sandbox allocated in runner.`,
        severity: "warning"
      });
    });

    // Scan recent completions
    projectCompletions.slice(-3).forEach((comp, idx) => {
      const funcName = (comp.parsedJson as any).function_name;
      const resultStr = (comp.parsedJson as any).result_data;
      const timeString = new Date(Number(comp.timestampMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let isError = false;
      let displayResult = resultStr;
      
      try {
        const parsed = JSON.parse(resultStr);
        if (parsed && parsed.status === 'error') {
          isError = true;
          displayResult = parsed.error || resultStr;
        } else if (parsed && parsed.status === 'success' && parsed.message) {
          displayResult = parsed.message;
        } else if (parsed && typeof parsed !== 'string') {
          displayResult = JSON.stringify(parsed);
        }
      } catch(e) {
        // Not valid JSON or stringified differently, leave as is
      }

      if (isError) {
        alertsList.push({
          id: `comp-${idx}`,
          title: `Execution Failed`,
          time: timeString,
          desc: `Sandbox crashed while running '${funcName}'. Error: ${displayResult.slice(0, 80)}${displayResult.length > 80 ? '...' : ''}`,
          severity: "error"
        });
      } else {
        alertsList.push({
          id: `comp-${idx}`,
          title: `VM Isolate Completed`,
          time: timeString,
          desc: `Executed '${funcName}' successfully inside V8 sandbox. Output: ${displayResult.slice(0, 45)}${displayResult.length > 45 ? '...' : ''}`,
          severity: "info"
        });
      }
    });

    return alertsList.reverse().filter(a => !acknowledgedAlertIds.includes(a.id));
  }, [activeProject, myFunctions, projectInvocations, projectCompletions, acknowledgedAlertIds]);

  // 5. Dynamic Chart dataset mapping
  const chartData = useMemo(() => {
    const latestEventTime = projectEvents.length > 0 
      ? Math.max(...projectEvents.map(e => Number(e.timestampMs) || Date.now())) 
      : Date.now();
      
    // Set baseTime to either the latest event time or current system time
    const baseTime = latestEventTime > 0 ? latestEventTime : Date.now();

    // 1. Gather raw counts for all 9 bins going backward from baseTime
    const rawBins = [];
    for (let i = 8; i >= 0; i--) {
      const binTime = new Date(baseTime - i * 15 * 60 * 1000);
      const label = binTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const startTime = baseTime - (i + 1) * 15 * 60 * 1000;
      const endTime = baseTime - i * 15 * 60 * 1000;
      
      const windowEvents = projectEvents.filter(e => {
        const t = Number(e.timestampMs);
        return t >= startTime && t <= endTime;
      });
      
      const suiTriggers = windowEvents.filter(e => e.type.includes('ExecutionTriggered')).length;
      const walrusDownloads = windowEvents.filter(e => e.type.includes('ExecutionCompleted')).length;
      
      rawBins.push({
        label,
        suiTriggers,
        walrusDownloads
      });
    }

    // 2. Find maximum counts to auto-scale the height proportions beautifully
    const maxSui = Math.max(...rawBins.map(b => b.suiTriggers)) || 1;
    const maxWalrus = Math.max(...rawBins.map(b => b.walrusDownloads)) || 1;

    // 3. Map to final percentage heights and return
    return rawBins.map(b => {
      // Use minimum active height of 6% so single invocation events are easily visible
      const suiPercent = b.suiTriggers > 0 
        ? Math.max(6, (b.suiTriggers / maxSui) * 44) 
        : 0;
      const walrusPercent = b.walrusDownloads > 0 
        ? Math.max(6, (b.walrusDownloads / maxWalrus) * 44) 
        : 0;

      return {
        label: b.label,
        sui: suiPercent,
        walrus: walrusPercent,
        rawSui: b.suiTriggers,
        rawWalrus: b.walrusDownloads
      };
    });
  }, [projectEvents]);

  // Export dynamically captured on-chain event telemetry as formatted JSON
  const handleExportData = () => {
    if (!projectEvents || projectEvents.length === 0) return;
    
    const exportData = projectEvents.map(e => {
      const parsed = e.parsedJson as any;
      return {
        txDigest: e.id.txDigest,
        eventType: e.type,
        timestamp: new Date(Number(e.timestampMs)).toISOString(),
        timestampMs: e.timestampMs,
        functionName: parsed?.function_name || "N/A",
        projectId: parsed?.project_id || "N/A",
        caller: parsed?.caller || "N/A",
        resultData: parsed?.result_data || "N/A"
      };
    });

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `sui_functions_telemetry_${activeProject?.name?.toLowerCase().replace(/\s+/g, '_') || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-100 flex flex-col font-sans select-none relative">
      
      {/* Dynamic Sovereign Synchronization Loader */}
      {isDashboardLoading && (
        <div className="fixed inset-0 z-[100] bg-[#05060a] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 select-none">
          <div className="relative flex flex-col items-center max-w-sm w-full text-center">
            {/* Spinning Glowing Orb */}
            <div className="relative w-24 h-24 mb-8">
              {/* Outer Pulse */}
              <div className="absolute inset-0 rounded-full border border-brand-sui/30 animate-ping opacity-60"></div>
              {/* Spinning Track */}
              <div className="absolute inset-0 rounded-full border-4 border-[#161824] border-t-brand-sui animate-spin"></div>
              {/* Inner Glow */}
              <div className="absolute inset-4 rounded-full bg-brand-sui/5 border border-brand-sui/20 flex items-center justify-center shadow-[0_0_20px_rgba(56,152,255,0.15)]">
                <Cpu size={24} className="text-brand-sui animate-pulse" />
              </div>
            </div>

            {/* Glowing Text telemetry */}
            <h3 className="text-base font-extrabold text-white mb-2 tracking-wide font-outfit uppercase">
              Establishing Sovereign Tunnel
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium mb-6">
              Syncing Sui Event Bus triggers & cached Walrus Blobs on edge nodes...
            </p>

            {/* Futuristic Progress bar */}
            <div className="w-full h-1.5 bg-[#161824] rounded-full overflow-hidden border border-[#14304A]">
              <div className="h-full bg-gradient-to-r from-brand-sui to-[#6FB7B7] animate-pulse-width rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-[9px] font-mono font-bold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SECURE RPC TUNNEL ONLINE
            </div>
          </div>
        </div>
      )}
      
      {/* 1. Global Header Bar */}
      <header className="h-16 w-full border-b border-[#14304A] px-2.5 sm:px-6 flex items-center justify-between bg-[#08090d]/65 backdrop-blur-xl sticky top-0 z-40">
        {isMobileSearchOpen ? (
          <div ref={searchRef} className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search size={16} className="text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search functions, logs, metrics..." 
                value={searchQuery}
                autoFocus
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#041829]/70 border border-[#14304A] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#041829]/95 border border-[#14304A] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 max-h-80 overflow-y-auto font-mono text-[11px] divide-y divide-[#14304A]/50">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                      className={`p-3 cursor-pointer transition-colors flex items-center justify-between gap-3 text-left ${
                        idx === selectedSuggestionIndex ? 'bg-white/5 text-white border-l-2 border-brand-sui' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-200">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{item.description}</span>
                      </div>
                      <span className="bg-[#14304A] text-[9px] font-black uppercase px-2 py-0.5 rounded text-slate-300 shrink-0">
                        {getTabLabel(item.tab)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 border border-[#14304A]/60 hover:border-brand-sui/40 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Brand Logo & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-white/5 border border-[#14304A]/60 hover:border-brand-sui/40 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-brand-dark border border-[#14304A] flex items-center justify-center shrink-0">
                <img src="/sui-func-logo.png" alt="Sui-Functions Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white font-outfit select-none flex items-center">
                <span className="max-[360px]:hidden whitespace-nowrap">Sui</span>
                <span className="hidden min-[480px]:inline whitespace-nowrap">-Functions</span>
              </span>
            </div>

            {/* Global Search */}
            <div ref={searchRef} className="hidden md:flex items-center relative w-96 shrink-0">
              <Search size={16} className="text-slate-300 absolute left-3.5" />
              <input 
                type="text" 
                placeholder="Search functions, logs, or metrics..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#041829]/70 border border-[#14304A] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#041829]/95 border border-[#14304A] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 max-h-80 overflow-y-auto font-mono text-[11px] divide-y divide-[#14304A]/50">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                      className={`p-3 cursor-pointer transition-colors flex items-center justify-between gap-3 text-left ${
                        idx === selectedSuggestionIndex ? 'bg-white/5 text-white border-l-2 border-brand-sui' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-200">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{item.description}</span>
                      </div>
                      <span className="bg-[#14304A] text-[9px] font-black uppercase px-2 py-0.5 rounded text-slate-300 shrink-0">
                        {getTabLabel(item.tab)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Persona Toggle */}
            <div className="hidden lg:flex bg-[#0A1C2E] p-1 rounded-[14px] border border-[#14304A] items-center shadow-[0_0_15px_rgba(0,0,0,0.3)] mx-4 shrink-0">
              <button
                onClick={() => { setPersona('developer'); setActiveMenu('1'); }}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 flex items-center gap-2 ${
                  persona === 'developer'
                    ? 'bg-gradient-to-r from-brand-sui/20 to-[#6FB7B7]/10 text-brand-sui border border-brand-sui/30 shadow-[inset_0_0_10px_rgba(56,152,255,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent bg-transparent hover:bg-white/5 cursor-pointer'
                }`}
              >
                <Code size={14} /> Developer Workspace
              </button>
              <button
                onClick={() => { setPersona('operator'); setActiveMenu('operator-1'); }}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 flex items-center gap-2 ${
                  persona === 'operator'
                    ? 'bg-gradient-to-r from-[#6FB7B7]/20 to-brand-sui/10 text-[#6FB7B7] border border-[#6FB7B7]/30 shadow-[inset_0_0_10px_rgba(111,183,183,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent bg-transparent hover:bg-white/5 cursor-pointer'
                }`}
              >
                <HardDrive size={14} /> Node Operator Yield
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-3 relative shrink-0">
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-1.5 text-slate-300 hover:text-white hover:bg-white/5 border border-[#14304A]/60 hover:border-brand-sui/40 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Open Search"
              >
                <Search size={16} />
              </button>

              <button 
                onClick={() => setIsNotificationDropdownOpen(prev => !prev)}
                className="p-1.5 text-slate-200 hover:text-white transition-colors relative border-none bg-transparent cursor-pointer shrink-0"
              >
                <Bell size={18} />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-sui shadow-[0_0_8px_#3898FF]"></span>
                )}
              </button>
          
          <button 
            onClick={() => setIsHelpModalOpen(prev => !prev)}
            className="hidden sm:block p-1.5 text-slate-200 hover:text-white transition-colors border-none bg-transparent cursor-pointer shrink-0"
          >
            <HelpCircle size={18} />
          </button>

          {/* Active Connected User Profile SUI gas balance pill */}
          <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-[#14304A] shrink-0">
            <div className="flex items-center gap-1 px-1.5 py-1 sm:gap-1.5 sm:px-2.5 sm:py-1.5 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/30 rounded-xl transition-all duration-300 shrink-0">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center font-black text-[8px] text-white shrink-0">
                S
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-300 select-all whitespace-nowrap">
                {suiBalance}
                <span className="hidden min-[400px]:inline"> SUI</span>
              </span>
            </div>
          </div>

          {/* Active Notifications Dropdown */}
          {isNotificationDropdownOpen && (
            <div className="absolute right-0 top-12 w-80 bg-[#0d0e15] border border-[#14304A] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-4 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-[#14304A] pb-2.5 mb-3">
                <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[10px]">Active Notifications</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-sui/15 text-brand-sui font-bold text-[9px]">
                  {activeAlerts.length} Active
                </span>
              </div>
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {activeAlerts.length === 0 ? (
                  <div className="text-slate-400 py-6 text-center text-xs">
                    No active alerts. All operations settled.
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="p-2.5 rounded-xl bg-[#141622]/60 border border-[#14304A]/60 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px] truncate">{alert.title}</span>
                        <span className="text-[9px] text-slate-400 text-right shrink-0 ml-1">{alert.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-normal">{alert.desc}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAcknowledgedAlertIds(prev => [...prev, alert.id]);
                        }}
                        className="mt-1 text-[9px] font-bold text-brand-sui hover:text-blue-400 text-left border-none bg-transparent p-0 cursor-pointer self-start transition-colors"
                      >
                        Acknowledge Alert
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
        </>
      )}
    </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-[280px] max-w-[80vw] h-full bg-[#05060a] border-r border-[#14304A] flex flex-col justify-between p-5 animate-in slide-in-from-left duration-300 shadow-[5px_0_30px_rgba(0,0,0,0.8)] overflow-y-auto">
            {/* Drawer Header with Title and close button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#14304A]/60 mb-4">
              <span className="text-sm font-bold text-white font-outfit">Navigation</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent rounded-lg cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col flex-1 min-h-0 gap-6">
              {/* Active Workspace Block */}
              <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-4 relative group shrink-0">
                <div className="text-[10px] font-bold uppercase text-slate-300 tracking-wider mb-2">Sovereign Compute</div>
                
                {isLoadingProjects ? (
                  <div className="text-xs text-slate-300 font-semibold py-1 animate-pulse">Syncing smart contracts...</div>
                ) : myProjects.length === 0 ? (
                  <button 
                    onClick={() => {
                      setIsCreateProjectModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-[#14304A] text-slate-300 hover:text-brand-sui hover:border-brand-sui/40 py-2.5 rounded-xl text-xs font-bold transition-all bg-white/5"
                  >
                    <Plus size={14} /> Create Project
                  </button>
                ) : persona === 'operator' ? (
                  <>
                    <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-4 relative group shrink-0">
                      <div className="text-[10px] font-bold uppercase text-slate-300 tracking-wider mb-2">Node Operator Hub</div>
                      <div className="flex items-center gap-2 mt-2 bg-[#05060a] border border-[#14304A] rounded-xl p-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-sui/10 flex items-center justify-center">
                          <Server size={16} className="text-brand-sui" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">Sui Validator</span>
                          <span className="text-[9px] text-brand-sui font-mono">Operational</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <select
                        value={activeProject?.id || ''}
                        onChange={(e) => {
                          const proj = myProjects.find(p => p.id === e.target.value);
                          if (proj) setActiveProject(proj);
                        }}
                        className="w-full bg-[#041829] border border-[#14304A] text-white rounded-xl h-10 pl-3 pr-8 font-bold text-xs cursor-pointer hover:border-brand-sui/40 transition-colors focus:outline-none appearance-none"
                      >
                        {myProjects.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-950 text-slate-200 font-semibold text-xs">
                            {p.name.length > 20 ? `${p.name.slice(0, 20)}...` : p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="text-slate-300 absolute right-3 top-3 pointer-events-none" />
                    </div>
                    
                    {/* Package and Project IDs for quick copy */}
                    <div className="flex flex-col gap-1.5 mt-1 pt-1.5 border-t border-[#14304A]/40">
                      <div className="flex items-center justify-between bg-[#07080c] border border-[#14304A]/40 rounded-lg p-1.5 px-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Package ID</span>
                          <span className="text-[10px] font-mono text-slate-200 mt-0.5">{PACKAGE_ID.slice(0, 6)}...{PACKAGE_ID.slice(-4)}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(PACKAGE_ID);
                            showToast('success', 'Package ID Copied', 'Package ID has been copied to your clipboard.');
                          }}
                          title="Copy Package ID"
                          className="text-slate-400 hover:text-brand-sui p-1 transition-colors hover:bg-white/5 rounded-md cursor-pointer"
                        >
                          <Copy size={11} />
                        </button>
                      </div>

                      {activeProject && (
                        <div className="flex items-center justify-between bg-[#07080c] border border-[#14304A]/40 rounded-lg p-1.5 px-2">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Project ID</span>
                            <span className="text-[10px] font-mono text-slate-200 mt-0.5">{activeProject.id.slice(0, 6)}...{activeProject.id.slice(-4)}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeProject.id);
                              showToast('success', 'Project ID Copied', 'Project ID has been copied to your clipboard.');
                            }}
                            title="Copy Project ID"
                            className="text-slate-400 hover:text-brand-sui p-1 transition-colors hover:bg-white/5 rounded-md cursor-pointer"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setIsCreateProjectModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 border border-dashed border-brand-sui/40 hover:border-brand-sui text-brand-sui hover:bg-brand-sui/5 py-2.5 rounded-xl text-xs font-bold transition-all bg-transparent mt-1 cursor-pointer shadow-sm shadow-brand-sui/5"
                    >
                      <Plus size={14} /> New Workspace
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation list */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-[#14304A] scrollbar-track-transparent">
                {persona === 'operator' ? (
                  <nav className="flex flex-col gap-1.5">
                    <button onClick={() => setActiveMenu('operator-1')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-1' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <LayoutDashboard size={16} /> Overview
                    </button>
                    <button onClick={() => setActiveMenu('operator-2')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-2' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Terminal size={16} /> Node Logs
                    </button>
                    <button onClick={() => setActiveMenu('operator-3')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-3' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Activity size={16} /> Performance
                    </button>
                    <button onClick={() => setActiveMenu('operator-4')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-4' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Wallet size={16} /> Runner Vault
                    </button>
                  </nav>
                ) : (
                <nav className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => { setActiveMenu('1'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeMenu === '1' 
                        ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                        : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>

                  <button 
                    onClick={() => { setActiveMenu('2'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeMenu === '2' 
                        ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                        : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Code size={16} />
                    Functions
                  </button>

                  <button 
                    onClick={() => { setActiveMenu('3'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeMenu === '3' 
                        ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                        : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Terminal size={16} />
                    Logs
                  </button>

                  <button 
                    onClick={() => { setActiveMenu('4'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeMenu === '4' 
                        ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                        : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Cpu size={16} />
                    Compute
                  </button>

                  <button 
                    onClick={() => { setActiveMenu('5'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeMenu === '5' 
                        ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                        : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <HardDrive size={16} />
                    Storage
                  </button>


                  <button 
                    onClick={() => { setActiveMenu('7'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeMenu === '7' 
                        ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                        : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Wallet size={16} />
                    Billing & Vault
                  </button>
                </nav>
                )}
              </div>
            </div>

            {/* Sidebar Footer Operations */}
            <div className="flex flex-col gap-4 border-t border-[#14304A]/60 pt-4 shrink-0 mt-4">
              {persona === 'operator' ? (
                <>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] text-slate-300 hover:text-white">
                    <BookOpen size={16} /> Operator Documentation
                  </button>
                </>
              ) : (
                <>
              <button 
                onClick={() => {
                  if (!activeProject) {
                    alert("Create or select a workspace first!");
                    return;
                  }
                  setIsRegisterModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                disabled={!activeProject}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> Deploy New Function
              </button>

              <button 
                onClick={() => { setActiveMenu('6'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeMenu === '6' 
                    ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                    : 'bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen size={16} /> Documentation
              </button>

              <button 
                onClick={() => {
                  setIsSettingsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                disabled={!activeProject}
                className="w-full flex items-center justify-center gap-2 bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] hover:border-brand-sui/30 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Settings size={14} className="text-slate-300 group-hover:text-white" /> Workspace Settings
              </button>

              {isAdmin && (
                <button 
                  onClick={() => {
                    setActiveMenu('8');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 bg-[#041829]/60 hover:bg-red-500/5 border border-[#14304A] hover:border-red-500/30 text-slate-300 hover:text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeMenu === '8' ? 'border-red-500/30 text-red-400 bg-red-500/5' : ''
                  }`}
                >
                  <Shield size={14} className={activeMenu === '8' ? 'text-red-500' : 'text-slate-300 group-hover:text-red-400'} /> Admin Panel
                </button>
              )}
              </>
              )}

              {/* Wallet Connector Details */}
              <div className="bg-[#0A1C2E] border border-[#14304A] rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <span className="text-xs text-slate-200 font-bold font-mono truncate w-36">
                    {account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "Disconnected"}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsDisconnectModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-950/20 hover:bg-red-900/30 border border-red-900/35 hover:border-red-500 text-red-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm shadow-red-900/10 mt-1"
                >
                  <LogOut size={12} /> Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
          {/* Overlay background to tap-to-close */}
          <div className="flex-1 h-full" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-1">
        
        {/* 2. Left Navigation Sider */}
        <aside className="w-[260px] bg-[#05060a] border-r border-[#14304A]/60 hidden lg:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-64px)] z-30">
          
          <div className="flex flex-col flex-1 min-h-0 gap-6">
            {persona === 'developer' ? (
              <>
                {/* Active Workspace Block (Fixed at Top) */}
                <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-4 relative group shrink-0">
              <div className="text-[10px] font-bold uppercase text-slate-300 tracking-wider mb-2">Sovereign Compute</div>
              
              {isLoadingProjects ? (
                <div className="text-xs text-slate-300 font-semibold py-1 animate-pulse">Syncing smart contracts...</div>
              ) : myProjects.length === 0 ? (
                <button 
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-[#14304A] text-slate-300 hover:text-brand-sui hover:border-brand-sui/40 py-2.5 rounded-xl text-xs font-bold transition-all bg-white/5"
                >
                  <Plus size={14} /> Create Project
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <select
                      value={activeProject?.id || ''}
                      onChange={(e) => {
                        const proj = myProjects.find(p => p.id === e.target.value);
                        if (proj) setActiveProject(proj);
                      }}
                      className="w-full bg-[#041829] border border-[#14304A] text-white rounded-xl h-10 pl-3 pr-8 font-bold text-xs cursor-pointer hover:border-brand-sui/40 transition-colors focus:outline-none appearance-none"
                    >
                      {myProjects.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-950 text-slate-200 font-semibold text-xs">
                          {p.name.length > 20 ? `${p.name.slice(0, 20)}...` : p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="text-slate-300 absolute right-3 top-3 pointer-events-none" />
                  </div>
                  
                  {/* Package and Project IDs for quick copy */}
                  <div className="flex flex-col gap-1.5 mt-1 pt-1.5 border-t border-[#14304A]/40">
                    <div className="flex items-center justify-between bg-[#07080c] border border-[#14304A]/40 rounded-lg p-1.5 px-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Package ID</span>
                        <span className="text-[10px] font-mono text-slate-200 mt-0.5">{PACKAGE_ID.slice(0, 6)}...{PACKAGE_ID.slice(-4)}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(PACKAGE_ID);
                          showToast('success', 'Package ID Copied', 'Package ID has been copied to your clipboard.');
                        }}
                        title="Copy Package ID"
                        className="text-slate-400 hover:text-brand-sui p-1 transition-colors hover:bg-white/5 rounded-md cursor-pointer"
                      >
                        <Copy size={11} />
                      </button>
                    </div>

                    {activeProject && (
                      <div className="flex items-center justify-between bg-[#07080c] border border-[#14304A]/40 rounded-lg p-1.5 px-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Project ID</span>
                          <span className="text-[10px] font-mono text-slate-200 mt-0.5">{activeProject.id.slice(0, 6)}...{activeProject.id.slice(-4)}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeProject.id);
                            showToast('success', 'Project ID Copied', 'Project ID has been copied to your clipboard.');
                          }}
                          title="Copy Project ID"
                          className="text-slate-400 hover:text-brand-sui p-1 transition-colors hover:bg-white/5 rounded-md cursor-pointer"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 border border-dashed border-brand-sui/40 hover:border-brand-sui text-brand-sui hover:bg-brand-sui/5 py-2.5 rounded-xl text-xs font-bold transition-all bg-transparent mt-1 cursor-pointer shadow-sm shadow-brand-sui/5"
                  >
                    <Plus size={14} /> New Workspace
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Main Menus Section */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-[#14304A] scrollbar-track-transparent">
              <nav className="flex flex-col gap-1.5">
                <button 
                  onClick={() => setActiveMenu('1')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === '1' 
                      ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                      : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>

                <button 
                  onClick={() => setActiveMenu('2')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === '2' 
                      ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                      : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Code size={16} />
                  Functions
                </button>

                <button 
                  onClick={() => setActiveMenu('3')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === '3' 
                      ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                      : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Terminal size={16} />
                  Logs
                </button>

                <button 
                  onClick={() => setActiveMenu('4')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === '4' 
                      ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                      : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Cpu size={16} />
                  Compute
                </button>

                <button 
                  onClick={() => setActiveMenu('5')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === '5' 
                      ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                      : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <HardDrive size={16} />
                  Storage
                </button>


                <button 
                  onClick={() => setActiveMenu('7')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === '7' 
                      ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                      : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Wallet size={16} />
                  Billing & Vault
                </button>
              </nav>
            </div>
              </>
            ) : (
              <>
                <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-4 relative group shrink-0">
                  <div className="text-[10px] font-bold uppercase text-slate-300 tracking-wider mb-2">Node Operator Hub</div>
                  <div className="flex items-center gap-2 mt-2 bg-[#05060a] border border-[#14304A] rounded-xl p-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-sui/10 flex items-center justify-center">
                      <Server size={16} className="text-brand-sui" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Sui Validator</span>
                      <span className="text-[9px] text-brand-sui font-mono">Operational</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-[#14304A] scrollbar-track-transparent">
                  <nav className="flex flex-col gap-1.5">
                    <button onClick={() => setActiveMenu('operator-1')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-1' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <LayoutDashboard size={16} /> Overview
                    </button>
                    <button onClick={() => setActiveMenu('operator-2')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-2' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Terminal size={16} /> Node Logs
                    </button>
                    <button onClick={() => setActiveMenu('operator-3')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-3' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Activity size={16} /> Performance
                    </button>
                    <button onClick={() => setActiveMenu('operator-4')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-4' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Wallet size={16} /> Runner Vault
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Footer Operations (Fixed at Bottom) */}
          <div className="flex flex-col gap-4 border-t border-[#14304A]/60 pt-4 shrink-0 mt-4">
            

            
            {persona === 'developer' ? (
              <>
                {/* Deploy New Function Trigger */}
                <button 
                  onClick={() => {
                if (!activeProject) {
                  alert("Create or select a workspace first!");
                  return;
                }
                setIsRegisterModalOpen(true);
              }}
              disabled={!activeProject}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Deploy New Function
            </button>

            <button 
              onClick={() => setActiveMenu('6')}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeMenu === '6' 
                  ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' 
                  : 'bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen size={16} /> Documentation
            </button>

            {/* Workspace Settings */}
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              disabled={!activeProject}
              className="w-full flex items-center justify-center gap-2 bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] hover:border-brand-sui/30 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Settings size={14} className="text-slate-300 group-hover:text-white" /> Workspace Settings
            </button>

            {isAdmin && (
              <button 
                onClick={() => setActiveMenu('8')}
                className={`w-full flex items-center justify-center gap-2 bg-[#041829]/60 hover:bg-red-500/5 border border-[#14304A] hover:border-red-500/30 text-slate-300 hover:text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeMenu === '8' ? 'border-red-500/30 text-red-400 bg-red-500/5' : ''
                }`}
              >
                <Shield size={14} className={activeMenu === '8' ? 'text-red-500' : 'text-slate-300 group-hover:text-red-400'} /> Admin Panel
              </button>
            )}
              </>
            ) : (
              <>
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer">
                  <Plus size={16} /> Register Validator Node
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] text-slate-300 hover:text-white">
                  <BookOpen size={16} /> Operator Documentation
                </button>
              </>
            )}

            {/* Wallet Connector Details */}
            <div className="bg-[#0A1C2E] border border-[#14304A] rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <span className="text-xs text-slate-200 font-bold font-mono truncate w-36">
                  {account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "Disconnected"}
                </span>
              </div>
              <button 
                onClick={() => setIsDisconnectModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 bg-red-950/20 hover:bg-red-900/30 border border-red-900/35 hover:border-red-500 text-red-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm shadow-red-900/10 mt-1"
              >
                <LogOut size={12} /> Disconnect Wallet
              </button>
            </div>
          </div>
        </aside>

        {/* 3. Main Operational Workplate */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          
          {/* Mobile Persona Toggle */}
          <div className="flex lg:hidden justify-center mb-2">
            <div className="bg-[#0A1C2E] p-1.5 rounded-2xl border border-[#14304A] flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => { setPersona('developer'); setActiveMenu('1'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  persona === 'developer'
                    ? 'bg-gradient-to-r from-brand-sui/20 to-[#6FB7B7]/10 text-brand-sui border border-brand-sui/30 shadow-[0_0_15px_rgba(56,152,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent bg-transparent hover:bg-white/5 cursor-pointer'
                }`}
              >
                <Code size={14} /> Developer Workspace
              </button>
              <button
                onClick={() => { setPersona('operator'); setActiveMenu('operator-1'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  persona === 'operator'
                    ? 'bg-gradient-to-r from-[#6FB7B7]/20 to-brand-sui/10 text-[#6FB7B7] border border-[#6FB7B7]/30 shadow-[0_0_15px_rgba(111,183,183,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent bg-transparent hover:bg-white/5 cursor-pointer'
                }`}
              >
                <HardDrive size={14} /> Node Operator Yield
              </button>
            </div>
          </div>
          
          {persona === 'operator' ? (
            <OperatorDashboardUI account={account} showToast={showToast} activeMenu={activeMenu} />
          ) : (
            <>
              {/* Global Unconfigured Runner Alert */}
          {activeProject && (!activeProject.runnerAddress || activeProject.runnerAddress === "0x0" || activeProject.runnerAddress === "0x0000000000000000000000000000000000000000000000000000000000000000" || /^0x0+$/.test(activeProject.runnerAddress)) && (
            <div className="bg-amber-950/15 border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(6,182,212,0.05)] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-outfit">Action Required: Authorize a Runner</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1 text-left">
                    This project does not have an authorized runner configured yet. Off-chain execution and on-chain result write-backs will be skipped until you authorize a runner in the project settings.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Configure Workspace Runner
              </button>
            </div>
          )}
          
          {/* Menu Panel 1: Overview */}
          {activeMenu === '1' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              
              {/* Header Status & Filters Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    {activeProject ? activeProject.name : "Operational Overview"}
                  </h1>

                </div>

                {/* Export Telemetry Button */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExportData}
                    disabled={!projectEvents || projectEvents.length === 0}
                    className="flex items-center gap-1.5 bg-[#041829] border border-[#14304A] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download size={12} />
                    Export Data
                  </button>
                </div>
              </div>

              {/* Top Row: 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                
                {/* 1. Cluster Health */}
                <div id="metric-cluster-health" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-5 relative group hover:border-brand-sui/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-200 font-bold uppercase tracking-wider">Cluster Health</span>
                    <Activity size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white font-outfit">{clusterHealthString}</h3>
                  <div className="text-xs text-emerald-400 font-bold font-mono mt-1 flex items-center gap-1">
                    <span>✓</span> Operator nodes operational
                  </div>
                  
                  {/* Segment Health bar visualizations */}
                  <div className="flex gap-[4px] mt-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div 
                      key={s} 
                      className={`h-1.5 flex-1 rounded-full ${
                        totalInvocations > 0 && totalCompletions === 0 && s === 5 ? 'bg-cyan-500/20' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* 2. Avg Latency */}
                <div id="metric-avg-latency" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-5 relative group hover:border-brand-sui/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-200 font-bold uppercase tracking-wider">Avg Latency (P99)</span>
                    <Cpu size={16} className="text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white font-outfit">{avgLatency}</h3>
                  <div className="text-xs text-blue-400 font-bold font-mono mt-1 flex items-center gap-1">
                    <span>⚡</span> Live round-trip runner lag
                  </div>

                  {/* Micro mini bar chart visualization */}
                  <div className="flex items-end gap-[3px] mt-4 h-5">
                    {(latencies.length > 0 ? latencies.slice(-7) : [1200, 1800, 1400, 2500, 2000, 1500, 2200]).map((val, i, arr) => {
                      const maxVal = Math.max(...arr, 1000);
                      const heightVal = Math.min(100, Math.max(25, (val / maxVal) * 100));
                      return (
                        <div 
                        key={i} 
                        style={{ height: `${heightVal}%` }} 
                        className="w-full rounded-sm bg-gradient-to-t from-blue-500/20 to-blue-400/80 hover:to-blue-300 transition-all duration-300"
                        ></div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Success Rate */}
                <div id="metric-success-rate" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-5 relative group hover:border-brand-sui/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-200 font-bold uppercase tracking-wider">Success Rate</span>
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white font-outfit">{successRateString}</h3>
                  <div className="text-xs text-emerald-400 font-bold font-mono mt-1 flex items-center gap-1">
                    <span>✓</span> Dynamic execution validation
                  </div>
                  <div className="flex items-center justify-between border-t border-[#14304A]/60 pt-3 mt-4 text-xs text-slate-300 font-mono">
                    <div>OK: <span className="text-white font-bold">{totalCompletions}</span></div>
                    <div>ERR: <span className="text-red-400 font-bold">{totalInvocations - totalCompletions}</span></div>
                  </div>
                </div>

                {/* 4. Total Invocations */}
                <div id="metric-total-invocations" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-5 relative group hover:border-brand-sui/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-200 font-bold uppercase tracking-wider">Total Invocations</span>
                    <Sparkles size={16} className="text-brand-sui" />
                  </div>
                  <h3 className="text-3xl font-black text-white font-outfit">
                    {totalInvocations}
                  </h3>
                  <div className="text-xs text-brand-sui font-bold font-mono mt-1 flex items-center gap-1">
                    <span>▲</span> On-chain events queried
                  </div>

                  {/* Horizontal visual progress uploader bar */}
                  <div className="w-full bg-[#14304A] h-1.5 rounded-full mt-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-sui to-[#6FB7B7] rounded-full shadow-[0_0_8px_#3898FF]"
                      style={{ width: successRateString }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Middle Section: Global Volume stacked bar chart & Active Alerts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Stacked Chart container */}
                <div id="overview-execution-volume" className="xl:col-span-2 bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-outfit">
                      Execution Volume (Global)
                    </span>
                    {/* Legends */}
                    <div className="flex items-center gap-4 text-xs text-slate-200 font-bold font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500/40 border border-blue-400/50"></span>
                        SUI EVENT BUS
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-sui/40 border border-brand-sui/50"></span>
                        WALRUS WORKERS
                      </div>
                    </div>
                  </div>

                  {/* High fidelity pure CSS bar chart component */}
                  <div className="flex items-end justify-between h-[280px] pt-6 pb-2 border-b border-[#14304A]/70">
                    {chartData.map((data, i) => {
                      const suiHeight = `${data.sui}%`;
                      const walrusHeight = `${data.walrus}%`;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 group">
                          <div className="relative w-7 sm:w-10 h-[220px] flex flex-col justify-end gap-[2px] transition-all duration-300 group-hover:scale-y-[1.03] origin-bottom cursor-pointer">
                            {/* Premium Pure-CSS Hover Tooltip */}
                            <div className="absolute bottom-[230px] left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#0d0e15] border border-[#14304A] px-3.5 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.95)] z-50 text-[10px] min-w-[130px] pointer-events-none transition-all duration-200 select-none">
                              <span className="font-mono text-slate-400 font-bold mb-1.5">{data.label} Window</span>
                              <div className="flex items-center justify-between w-full gap-3 text-blue-400 font-bold mb-1">
                                <span>Sui Triggers:</span>
                                <span>{data.rawSui}</span>
                              </div>
                              <div className="flex items-center justify-between w-full gap-3 text-brand-sui font-bold">
                                <span>Walrus Execs:</span>
                                <span>{data.rawWalrus}</span>
                              </div>
                              {/* Bottom CSS Pointer Triangle */}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0d0e15] border-r border-b border-[#14304A] rotate-45"></div>
                            </div>
                            {/* Top stack: Sui workload */}
                            <div 
                              style={{ height: suiHeight }}
                              className="w-full bg-blue-500/20 border-l border-r border-blue-500/40 rounded-t-[4px] relative group-hover:bg-blue-500/30 transition-colors duration-200"
                            >
                              <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-400/60 shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                            {/* Bottom stack: Walrus workload */}
                            <div 
                              style={{ height: walrusHeight }}
                              className="w-full bg-brand-sui/20 border-l border-r border-brand-sui/40 rounded-b-[4px] relative group-hover:bg-brand-sui/30 transition-colors duration-200"
                            >
                              <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-sui/60 shadow-[0_-2px_10px_rgba(56,152,255,0.5)]"></div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-200 font-mono font-bold mt-3 select-none">{data.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Alerts Widget */}
                <div id="overview-active-alerts" className="xl:col-span-1 bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">
                      Active Alerts
                    </span>
                    {activeAlerts.length > 0 && (
                      <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                        {activeAlerts.length} ACTIVE
                      </span>
                    )}
                  </div>

                  {/* List of alert items */}
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[280px] pr-1">
                    {activeAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 border rounded-xl flex gap-3 relative transition-all group ${
                          alert.severity === 'high' || alert.severity === 'error'
                            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                            : alert.severity === 'info'
                            ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                            : 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40'
                        }`}
                      >
                        {alert.severity === 'info' ? (
                          <Info 
                            size={16} 
                            className="mt-0.5 flex-shrink-0 text-blue-400"
                          />
                        ) : (
                          <AlertTriangle 
                            size={16} 
                            className={`mt-0.5 flex-shrink-0 ${
                              alert.severity === 'high' || alert.severity === 'error' 
                                ? 'text-red-400' 
                                : 'text-cyan-500'
                            }`} 
                          />
                        )}
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200">{alert.title}</span>
                            <span className="text-[10px] text-slate-300 font-mono font-bold flex-shrink-0">{alert.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-200 leading-relaxed mt-1 font-medium">{alert.desc}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <button 
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-[9px] font-black uppercase text-slate-200 hover:text-white transition-colors tracking-wider border-none bg-transparent cursor-pointer"
                            >
                              Acknowledge
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeAlerts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 opacity-60 my-auto">
                        <CheckCircle size={32} className="text-emerald-400 mb-2.5" />
                        <span className="text-xs font-bold text-slate-200">All Systems Stable</span>
                        <span className="text-[10px] text-slate-300 font-bold">No active incidents detected.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Section: Top Performing Functions Table */}
              <div id="overview-top-functions" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-outfit">
                    Top Performing Functions
                  </span>
                  <button className="text-xs font-bold text-brand-sui hover:underline bg-transparent border-none">
                    View Performance Suite
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#14304A]/70 text-xs text-slate-200 font-bold uppercase tracking-wider">
                        <th className="pb-3.5 pl-2">Function Name</th>
                        <th className="pb-3.5">Invocations</th>
                        <th className="pb-3.5">Success Rate</th>
                        <th className="pb-3.5">Latency</th>
                        <th className="pb-3.5">Trigger</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-300 font-medium divide-y divide-[#14304A]/50">
                      {/* 1. Dynamic Functions from Sui if exist */}
                      {myFunctions.map((fn, idx) => {
                        // Count triggers
                        const fnTriggers = projectInvocations.filter(e => (e.parsedJson as any).function_name === fn.name);
                        const fnInvocations = fnTriggers.length;
                        
                        // Count completions
                        const fnCompletions = projectCompletions.filter(e => (e.parsedJson as any).function_name === fn.name);
                        
                        // Calculate success rate
                        const fnRate = fnInvocations > 0 
                          ? ((fnCompletions.length / fnInvocations) * 100).toFixed(1) + "%" 
                          : "100.0%";
                          
                        // Calculate average latency specifically for this function
                        const fnLatencies: number[] = [];
                        fnCompletions.forEach(comp => {
                          const compTime = Number(comp.timestampMs);
                          const trigger = fnTriggers
                            .filter(trig => Number(trig.timestampMs) <= compTime)
                            .sort((a, b) => Number(b.timestampMs) - Number(a.timestampMs))[0];
                          if (trigger) {
                            const diff = compTime - Number(trigger.timestampMs);
                            if (diff > 0 && diff < 30000) fnLatencies.push(diff);
                          }
                        });
                        
                        const fnAvgLatencyVal = fnLatencies.length > 0 
                          ? Math.round(fnLatencies.reduce((a, b) => a + b, 0) / fnLatencies.length) 
                          : 0;
                        const fnAvgLatency = fnAvgLatencyVal > 0 ? `${fnAvgLatencyVal} ms` : "0 ms";

                        return (
                          <tr 
                            key={`sui-${idx}`} 
                            onClick={() => {
                              if (fn.status !== 1) {
                                setAuditWarningFnName(fn.name);
                                setAuditWarningStatus(fn.status === 0 ? "Pending Audit" : "Rejected");
                                setAuditWarningBlobId(fn.blobId || "");
                                setIsAuditWarningModalOpen(true);
                                return;
                              }
                              setTriggerFunctionName(fn.name);
                              setActiveMenu('4'); // Transition to Compute section to execute it!
                            }}
                            className={`group transition-colors ${fn.status === 1 ? 'hover:bg-white/5 cursor-pointer' : 'opacity-85 hover:bg-red-500/5 cursor-not-allowed'}`}
                          >
                            <td className="py-4 pl-2 font-mono font-bold text-white group-hover:text-brand-sui transition-colors">
                              {fn.name}
                            </td>
                            <td className="py-4 font-mono">{fnInvocations.toLocaleString()}</td>
                            <td className="py-4 text-emerald-400 font-mono font-bold">{fnRate}</td>
                            <td className="py-4 font-mono">{fnAvgLatency}</td>
                            <td className="py-4 font-mono text-[11px] text-slate-400">
                              {getTriggerLabel(fn.triggerType || 0, fn.triggerConfig || "{}")}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                {fn.status === 0 && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                                    Pending Audit
                                  </span>
                                )}
                                {fn.status === 1 && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                                    <CheckCircle size={10} className="text-emerald-400" />
                                    Verified
                                  </span>
                                )}
                                {fn.status === 2 && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 border border-red-500/20 text-red-400">
                                      <AlertTriangle size={10} className="text-red-400" />
                                      Rejected
                                    </span>
                                    <a 
                                      href="https://publisher.walrus.site/TJgeWW4t-MOv1K2klEsC0eDTDZbmcUu610eHptXD9mA"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[9px] font-black uppercase text-brand-sui hover:text-blue-400 hover:underline transition-colors flex items-center gap-0.5"
                                    >
                                      Auditor <ArrowUpRight size={10} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-right pr-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditTriggerFunctionName(fn.name);
                                  setEditTriggerType(fn.triggerType || 0);
                                  setEditTriggerConfig(fn.triggerConfig || "{}");
                                  setIsEditTriggerModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-[#14304A] hover:bg-[#343850] text-brand-sui hover:text-white transition-all cursor-pointer border border-brand-sui/20"
                              >
                                Edit Trigger
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {myFunctions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-medium font-outfit">
                            No functions registered in this workspace yet. Navigate to "Functions" to upload and register one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Menu Panel 2: Registered Functions */}
          {activeMenu === '2' && (
            <div id="functions-header" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 md:p-8 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">My Registered Functions</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Function entities deployed securely inside Walrus and registered on the Sui Ledger dynamic registry table.
                  </p>
                </div>
                
                <div id="functions-controls" className="flex items-center gap-3">
                  <button 
                    onClick={fetchMyFunctions} 
                    disabled={!activeProject}
                    className="flex items-center gap-1.5 bg-[#041829] border border-[#14304A] hover:text-white rounded-xl px-4 py-2 text-xs font-bold text-slate-300 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw size={14} className={isLoadingFunctions ? "animate-spin" : ""} />
                    Sync Registry
                  </button>
                  <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    disabled={!activeProject}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-[0_4px_12px_rgba(56,152,255,0.2)] transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Plus size={14} />
                    Register Function
                  </button>
                </div>
              </div>

              {!activeProject ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-80">
                  <Folder size={44} className="text-slate-200 mb-3.5 animate-pulse" />
                  <span className="text-sm font-extrabold text-slate-100">No active workspace selected</span>
                  <span className="text-xs text-slate-200 mt-1 font-medium">Select a workspace project from the sidebar to audit functions.</span>
                </div>
              ) : isLoadingFunctions ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-80">
                  <div className="w-10 h-10 border-2 border-[#14304A] border-t-brand-sui rounded-full animate-spin mb-4" />
                  <span className="text-xs font-extrabold text-slate-200">Reading dynamic tables...</span>
                </div>
              ) : myFunctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#041829] border border-[#14304A] rounded-2xl border-dashed">
                  <Code size={40} className="text-slate-200 mb-3" />
                  <span className="text-xs font-bold text-slate-200">No Custom Functions Deployed Yet</span>
                  <span className="text-xs text-slate-200 mt-1 max-w-sm text-center leading-relaxed font-medium">
                    Deploy your script (e.g. `sui_usd_oracle.js`) to Walrus and hook it to Sui event triggers to get started.
                  </span>
                  <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="mt-4 bg-[#14304A] hover:bg-[#2d3047] text-brand-sui px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-brand-sui/30"
                  >
                    Upload first function
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myFunctions.map((fn, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setTriggerFunctionName(fn.name);
                        setActiveMenu('3');
                      }}
                      className="p-5 border border-[#14304A] rounded-xl bg-[#041829] hover:border-brand-sui/40 hover:bg-[#041829]/80 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white/5 border border-[#14304A] rounded-xl flex items-center justify-center group-hover:border-brand-sui/20 transition-colors">
                            <Code size={16} className="text-brand-sui" />
                          </div>
                          <span className="font-bold text-sm text-white group-hover:text-brand-sui transition-colors font-mono">{fn.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-brand-sui/20 border border-brand-sui/30 text-brand-sui text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                            VERSION {fn.version}
                          </span>
                          <button
                            onClick={(e) => handleDeleteFunctionClick(fn.name, e)}
                            disabled={deletingFunctionName === fn.name}
                            className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900/40 hover:border-red-500/50 text-red-400 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete from registry"
                          >
                            <Trash2 size={12} className={deletingFunctionName === fn.name ? "animate-pulse" : ""} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-[#05060a] p-3 rounded-lg border border-[#14304A]/60 flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-300 font-mono truncate mr-4">Blob ID: {fn.blobId}</span>
                        <Play size={12} className="text-slate-300 group-hover:text-brand-sui transition-colors flex-shrink-0" />
                      </div>

                      <div className="bg-[#05060a]/60 p-3 rounded-lg border border-[#14304A]/40 flex items-center justify-between mb-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Sliders size={12} className="text-brand-sui" />
                          <span className="font-semibold text-slate-400">Trigger:</span>
                          <span className="font-mono text-white text-[11px]">
                            {getTriggerLabel(fn.triggerType || 0, fn.triggerConfig || "{}")}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTriggerFunctionName(fn.name);
                            setEditTriggerType(fn.triggerType || 0);
                            setEditTriggerConfig(fn.triggerConfig || "{}");
                            setIsEditTriggerModalOpen(true);
                          }}
                          className="text-[10px] text-brand-sui hover:text-blue-400 font-bold uppercase transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1"
                        >
                          <Settings size={10} /> Edit Trigger
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#14304A]/30">
                        <div className="flex items-center gap-1.5">
                          {fn.status === 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                              Pending Audit
                            </span>
                          )}
                          {fn.status === 1 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <CheckCircle size={10} className="text-emerald-400" />
                              Verified & Active
                            </span>
                          )}
                          {fn.status === 2 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 border border-red-500/20 text-red-400">
                              <AlertTriangle size={10} className="text-red-400" />
                              Audit Rejected
                            </span>
                          )}
                        </div>

                        {fn.status !== 1 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestVerification(fn.name);
                            }}
                            disabled={isRequestingVerification !== null}
                            className="text-[9px] font-black uppercase bg-[#14304A] hover:bg-[#2d3047] text-brand-sui hover:text-blue-400 border border-brand-sui/20 px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isRequestingVerification === fn.name ? (
                              <>
                                <span className="w-2.5 h-2.5 border-2 border-brand-sui/20 border-t-brand-sui rounded-full animate-spin"></span>
                                Requesting...
                              </>
                            ) : (
                              <>
                                Request Audit <RefreshCw size={9} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Panel 3: Terminal Sandbox & Execution Logs */}
          {activeMenu === '3' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              
              {/* Massive Logs Terminal */}
              <div id="logs-terminal" className="xl:col-span-2">
                <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-outfit flex items-center gap-2">
                      <Terminal size={14} className="text-brand-sui" />
                      Live Execution Sandbox Terminal
                    </span>
                    {/* Indicator dots */}
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    </div>
                  </div>

                  {/* Terminal Area */}
                  <div className="bg-[#05060a] rounded-xl p-5 h-[500px] flex flex-col font-mono text-xs shadow-inner relative border border-[#14304A]/60">
                    <div className="flex-1 overflow-y-auto pr-1">
                      {logs.map((log, i) => (
                        <div key={i} className="mb-2.5 flex gap-4 animate-in fade-in slide-in-from-left-2 duration-150">
                          <span className="text-slate-300 select-none w-5 text-right font-bold">{logs.length - i}</span>
                          <span className={`
                            ${log.includes('Event') || log.includes('Trigger') ? 'text-blue-400 font-medium' : ''}
                            ${log.includes('Success') || log.includes('Registered') ? 'text-emerald-400 font-bold' : ''}
                            ${log.includes('[Transaction]') ? 'text-brand-sui font-medium' : ''}
                            ${!log.includes('Event') && !log.includes('Success') && !log.includes('[Transaction]') ? 'text-slate-200' : ''}
                          `}>
                            {log}
                          </span>
                        </div>
                      ))}

                      {logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-60 py-20">
                          <Activity size={32} className="mb-3.5 animate-pulse text-brand-sui" />
                          <span className="text-xs font-bold text-slate-200">Awaiting blockchain events...</span>
                          <span className="text-xs text-slate-300 mt-1 max-w-xs text-center leading-relaxed">
                            Simulate or trigger execution on the right panel to boot V8 sandbox isolates and read compute logs.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Trigger Sandbox controller */}
              <div id="logs-controller" className="xl:col-span-1">
                <div className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-white font-outfit uppercase tracking-wider mb-2">Live Execution Controller</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    Dispatch a live trigger transaction to your Sui smart contract. The Sui-Functions operator runner fleet will intercept the event, download your script from Walrus, and execute it within a secure V8 isolation sandbox.
                  </p>

                  <div className="flex flex-col gap-4 mb-6">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Target Function Name</label>
                      <div className="relative">
                        <Code size={14} className="text-slate-300 absolute left-3.5 top-3.5" />
                        <input 
                          type="text" 
                          value={triggerFunctionName}
                          onChange={(e) => setTriggerFunctionName(e.target.value)}
                          placeholder="e.g., sui_usd_oracle.js"
                          className="w-full bg-[#041829] border border-[#14304A] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Execution Payload (JSON)</label>
                      <textarea 
                        rows={5}
                        value={triggerInputJson}
                        onChange={(e) => setTriggerInputJson(e.target.value)}
                        className="w-full bg-[#041829] border border-[#14304A] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleTrigger(triggerFunctionName)}
                    disabled={!activeProject || isExecuting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white py-3.5 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play size={14} fill="currentColor" />
                    {isExecuting ? "Executing VM Isolate..." : "Execute Now"}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Menu Panel 4: Compute Sandbox Settings */}
          {activeMenu === '4' && (
            <div id="compute-header" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 md:p-8 animate-in fade-in duration-300 flex flex-col gap-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">Sovereign Worker Compute Specs</h2>
                <p className="text-xs text-slate-300 mt-1">
                  VM runner allocation, CPU caps, and memory structures for your isolated execution runtimes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Memory caps */}
                <div className="bg-[#041829] border border-[#14304A] rounded-xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-2">Memory Allocation</div>
                  <h4 className="text-xl font-bold text-white">128 MB</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">Memory heap cap allocated to each isolated Google V8 context thread.</p>
                </div>

                {/* 2. CPU Caps */}
                <div className="bg-[#041829] border border-[#14304A] rounded-xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-2">CPU Execution Cap</div>
                  <h4 className="text-xl font-bold text-white">5,000 ms</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">Maximum execution CPU runtime allowed before isolation thread termination.</p>
                </div>

                {/* 3. Package system shims */}
                <div className="bg-[#041829] border border-[#14304A] rounded-xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-2">Allowed Modules</div>
                  <h4 className="text-xl font-bold text-emerald-400">Strict Sandboxed</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">Blocked file system and system subprocess queries. Pure fetch and crypto shims.</p>
                </div>

              </div>

              <div id="compute-performance" className="bg-[#041829] border border-[#14304A] rounded-xl p-6">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-outfit block mb-4">
                  VM Isolation Performance Auditing
                </span>
                <div className="bg-[#05060a] border border-[#14304A]/60 p-4 rounded-xl font-mono text-[11px] text-slate-200 flex flex-col gap-2">
                  <div>[VM Engine] Google V8 Core v12.4.254 initialization... <span className="text-emerald-400 font-bold">Success</span></div>
                  <div>[VM Engine] Thread limits configured: 128MB Heap, 5s timeout.</div>
                  <div>[VM Engine] Registered custom fetch shim handler.</div>
                  <div>[VM Engine] Secure context wrapper enabled (Anti-Side Channel Leak mitigation).</div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Panel 5: Walrus Storage Details */}
          {activeMenu === '5' && (
            <div id="storage-header" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 md:p-8 animate-in fade-in duration-300 flex flex-col gap-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">Walrus Immutable Storage Layer</h2>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  Blob storage registries, content-addressed uploading details, and immutability checkpoints.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Publisher address config */}
                <div className="bg-[#041829] border border-[#14304A] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-2">Walrus Publisher Endpoint</div>
                    <span className="text-xs font-mono font-bold text-brand-sui block truncate mb-3">
                      {WALRUS_PUBLISHER}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Decentralized publisher gateway used to upload immutable scripts directly to the Walrus Testnet storage nodes.
                  </p>
                </div>

                {/* Storage caching statistics */}
                <div className="bg-[#041829] border border-[#14304A] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-2">Blob Cache Life</div>
                    <h4 className="text-lg font-black text-white font-mono">1 Epoch (Persistent)</h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mt-4 font-medium">
                    Blobs are stored in decentralized network shards. Workers pull and cache script chunks dynamically on event execution.
                  </p>
                </div>

              </div>

              <div id="storage-blob-cache" className="bg-[#041829] border border-[#14304A] rounded-xl p-6">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-outfit block mb-4">
                  Active Blob Registry Cache
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#14304A]/70 text-slate-200 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Script Name</th>
                        <th className="pb-3">Walrus Blob ID</th>
                        <th className="pb-3">Epoch Quota</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-200 font-mono divide-y divide-[#14304A]/40">
                      <tr>
                        <td className="py-3 pl-2 text-white font-bold font-mono">sui_usd_oracle.js</td>
                        <td className="py-3 text-slate-200">W7VwX2jrIH5yP0t4qLm...</td>
                        <td className="py-3 text-brand-sui">Permanent</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-2 text-white font-bold font-mono">hello_world.js</td>
                        <td className="py-3 text-slate-200">K9YtZ1plOL8qX2wrTm5...</td>
                        <td className="py-3 text-brand-sui">Permanent</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-2 text-white font-bold font-mono">test_upload.js</td>
                        <td className="py-3 text-slate-200">A3BxV7qwER9zX1lrYt6...</td>
                        <td className="py-3 text-brand-sui">Permanent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Menu Panel 6: Documentation Portal */}
          {activeMenu === '6' && (
            <div id="docs-portal" className="bg-[#0A1C2E] border border-[#14304A] rounded-2xl p-6 md:p-8 animate-in fade-in duration-300 flex flex-col gap-6">
              <DocsView isDashboardView={true} />
            </div>
          )}

          {/* Menu Panel 7: Billing & Vault */}
          {activeMenu === '7' && (
            <div id="billing-vault" className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white font-outfit mb-1 tracking-wide">Workspace Vault & Billing</h2>
                  <p className="text-xs text-slate-400 max-w-lg">Manage your project's pre-funded SUI balance to sponsor compute executions for your users.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sui/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-brand-sui/10 transition-colors duration-700 pointer-events-none" />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet size={16} className="text-brand-sui" />
                        <h3 className="text-sm font-bold text-white tracking-wide uppercase font-outfit">Current Balance</h3>
                        <button 
                          onClick={() => {
                            fetchMyProjects();
                            showToast('info', 'Refreshing', 'Fetching latest vault balance...');
                          }}
                          disabled={isLoadingProjects}
                          className="ml-auto text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Refresh Balance"
                        >
                          <RefreshCw size={14} className={isLoadingProjects ? "animate-spin text-brand-sui" : ""} />
                        </button>
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-outfit">{activeProject?.vault || "0.00"}</span>
                        <span className="text-lg text-brand-sui font-bold font-mono pb-1">SUI</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Estimated {activeProject ? Math.floor(parseFloat(activeProject.vault || "0") / globalComputeFee).toLocaleString() : 0} executions remaining</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Deposit Amount</div>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="e.g. 5.0"
                            className="w-full bg-[#050608] border border-[#14304A] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-sui/50 transition-colors"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">SUI</div>
                        </div>
                      </div>
                      <button 
                        disabled={isDepositing || !depositAmount}
                        onClick={handleDeposit}
                        className="mt-5 bg-brand-sui hover:bg-[#6FB7B7] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(56,152,255,0.3)] hover:shadow-[0_6px_20px_rgba(56,152,255,0.4)] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {isDepositing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={16} /> Deposit Funds
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-center">
                    <h4 className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3">Fee Structure</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-sui/10 border border-brand-sui/30 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-sui" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{globalComputeFee} SUI / Exec</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Compute Runner Fee (85%)</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 opacity-50">
                        <div className="w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">Network Gas <span className="px-1.5 py-0.5 rounded border border-brand-sui/30 bg-brand-sui/10 text-brand-sui text-[8px] font-extrabold tracking-wider uppercase">Coming Soon</span></div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Sponsored by Gas Station</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Protocol Cut</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Treasury (15%)</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Admin Panel (Menu 8) */}
          {activeMenu === '8' && isAdmin && (
            <div id="admin-panel" className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white font-outfit mb-1 tracking-wide">Platform Administration</h2>
                  <p className="text-xs text-slate-400 max-w-lg">Manage all active workspaces, oversee network operations, and process treasury withdrawals.</p>
                </div>
              </div>

              {/* Stats & Withdraw */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-white tracking-wide uppercase font-outfit flex items-center gap-2"><Shield size={16} className="text-red-500" /> Treasury Balance</h3>
                     <button 
                       onClick={() => {
                         fetchAllProjects();
                         showToast('info', 'Refreshing', 'Fetching latest treasury balance...');
                       }}
                       className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                       title="Refresh Treasury Balance"
                     >
                       <RefreshCw size={14} />
                     </button>
                   </div>
                   <div className="flex items-end gap-3 mb-6">
                     <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-outfit">{treasuryBalance}</span>
                     <span className="text-lg text-red-500 font-bold font-mono pb-1">SUI</span>
                   </div>
                   <div className="pt-4 border-t border-white/5 mt-auto space-y-3">
                     <div className="relative">
                       <input 
                         type="number" 
                         value={withdrawAmount}
                         onChange={(e) => setWithdrawAmount(e.target.value)}
                         placeholder="Withdraw Amount (SUI)"
                         className="w-full bg-[#050608] border border-[#14304A] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
                       />
                     </div>
                     <button 
                       disabled={isWithdrawing || !withdrawAmount}
                       onClick={handleWithdraw}
                       className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                     >
                       {isWithdrawing ? "Processing..." : "Withdraw Fees"}
                     </button>
                   </div>
                </div>

                <div className="md:col-span-1 bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col">
                   <h3 className="text-sm font-bold text-white tracking-wide uppercase font-outfit mb-4 flex items-center gap-2"><Settings size={16} className="text-blue-500" /> Compute Fee Settings</h3>
                   <div className="flex items-end gap-3 mb-6">
                     <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-outfit">{globalComputeFee}</span>
                     <span className="text-lg text-blue-500 font-bold font-mono pb-1">SUI</span>
                   </div>
                   <div className="pt-4 border-t border-white/5 mt-auto space-y-3">
                     <div className="relative">
                       <input 
                         type="number" 
                         value={newComputeFee}
                         onChange={(e) => setNewComputeFee(e.target.value)}
                         placeholder="New Fee (e.g. 0.007)"
                         className="w-full bg-[#050608] border border-[#14304A] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                       />
                     </div>
                     <button 
                       disabled={isUpdatingFee || !newComputeFee}
                       onClick={handleUpdateComputeFee}
                       className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                     >
                       {isUpdatingFee ? "Updating..." : "Update Fee"}
                     </button>
                   </div>
                </div>

                <div className="md:col-span-1 bg-[#041829]/70 backdrop-blur-md border border-[#14304A] rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-outfit mb-4">All Platform Workspaces ({allProjects.length})</h3>
                  <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-[#14304A] scrollbar-track-transparent pr-2 space-y-3">
                    {allProjects.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-sm">No workspaces found.</div>
                    ) : (
                      allProjects.map(project => (
                        <div key={project.id} className="bg-[#05060a] border border-[#14304A] p-4 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{project.name}</h4>
                            <p className="text-xs text-slate-400 mt-1 truncate">{project.id}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                              <span>Owner: {project.owner.slice(0,6)}...{project.owner.slice(-4)}</span>
                              <span>Vault: {project.vault} SUI</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        )}

        </main>

      </div>

      {/* ============================================================== */}
      {/* 4. Custom Premium Portal Modals */}

      {/* WALLET DISCONNECT CONFIRMATION MODAL */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 bg-[#040507]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1C2E] border border-[#14304A] w-full max-w-[440px] rounded-3xl p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <LogOut size={20} className="text-red-400" />
              </div>
              <span className="text-base font-extrabold text-white font-outfit">Disconnect Wallet</span>
            </div>

            {/* Content Body */}
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
              Are you sure you want to disconnect? Your deployed functions will <strong className="text-white font-black">continue to trigger and execute autonomously on-chain 24/7</strong>. Disconnecting simply signs your browser out of the dashboard view, pausing your active UI telemetry feed.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDisconnectModalOpen(false)}
                className="flex-1 bg-[#141622] hover:bg-[#1a1d2e] border border-[#14304A] text-slate-200 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  disconnect();
                  setIsDisconnectModalOpen(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(239,68,68,0.25)] transition-all cursor-pointer border-none"
              >
                Yes, Disconnect
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HELP & ONBOARDING MODAL */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-[#040507]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1C2E] border border-[#14304A] w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative shadow-[0_20px_60px_rgba(0,0,0,0.85)] max-h-[85vh] overflow-y-auto select-none">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-300 hover:text-white bg-[#141622] hover:bg-[#1a1d2e] border border-[#14304A] p-2 rounded-xl transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6 border-b border-[#14304A] pb-5">
              <div className="w-10 h-10 rounded-2xl bg-brand-sui/10 border border-brand-sui/20 flex items-center justify-center">
                <HelpCircle size={22} className="text-brand-sui" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white font-outfit">Sui-Functions Guide</h2>
                <p className="text-xs text-slate-300 font-medium">Learn how to build and operate secure, trustless decentralized Lambdas.</p>
              </div>
            </div>

            {/* Core Documentation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              {/* Column 1: Core Concepts */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-sui font-mono">1. Operational Core</h3>
                
                <div className="p-3.5 rounded-2xl bg-[#041829] border border-[#14304A]/70 flex flex-col gap-1.5">
                  <span className="font-bold text-slate-200">Decentralized Lambdas</span>
                  <p className="text-slate-300">Sui-Functions lets you run standard JavaScript scripts in isolated, gas-efficient V8 sandboxes. Execution is triggered completely trustlessly by Sui smart contract events.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#041829] border border-[#14304A]/70 flex flex-col gap-1.5">
                  <span className="font-bold text-slate-200">Walrus Protocol Storage</span>
                  <p className="text-slate-300">Rather than central servers, function code blobs are stored immutably on the Walrus storage network, loaded dynamically by runners on demand, and executed securely.</p>
                </div>
              </div>

              {/* Column 2: Dashboard Telemetry */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 font-mono">2. Telemetry Overview</h3>

                <div className="p-3.5 rounded-2xl bg-[#041829] border border-[#14304A]/70 flex flex-col gap-1.5">
                  <span className="font-bold text-slate-200">Sui Event Bus (Blue Stack)</span>
                  <p className="text-slate-300">Represents live on-chain triggers emitted by contracts, signifying active compute calls requested by clients across the network.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#041829] border border-[#14304A]/70 flex flex-col gap-1.5">
                  <span className="font-bold text-slate-200">Walrus Workers (Orange Stack)</span>
                  <p className="text-slate-300">Displays real-time script downloads and final transaction settlements executed and written back to Sui in under 6 seconds.</p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-8 pt-5 border-t border-[#14304A] flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono font-bold">Network: Testnet v1.4.2</span>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2.5 bg-brand-sui hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-[0_4px_15px_rgba(56,152,255,0.3)] transition-all cursor-pointer border-none"
              >
                Acknowledge & Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* A. CREATE PROJECT WORKSPACE MODAL */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div 
            className="bg-[#041829] border border-[#14304A] rounded-3xl p-6 w-full max-w-[480px] shadow-[0_10px_45px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#14304A]/60 mb-6">
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-brand-sui" />
                <span className="text-base font-bold text-white font-outfit">Create Workspace Project</span>
              </div>
              <button 
                onClick={() => {
                  setIsCreateProjectModalOpen(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                className="text-slate-300 hover:text-white transition-colors bg-transparent border-none text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Project / Workspace Name</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., E-Commerce Suite, DeFi Oracle Network"
                  className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Workspace Description</label>
                <textarea 
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="e.g., Powers order verification, checkout authentication, and notifications..."
                  className="w-full bg-[#05060a] border border-[#14304A] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-sans resize-none"
                />
              </div>

              <div className="flex items-center justify-between bg-brand-sui/10 border border-brand-sui/20 rounded-xl px-4 py-3">
                <span className="text-xs text-brand-sui/90 font-medium">Workspace Creation Fee</span>
                <span className="text-sm font-mono text-brand-sui font-bold">0.1 SUI</span>
              </div>

              <button 
                onClick={handleCreateProject}
                disabled={isCreatingProject || !newProjectName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white py-3.5 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isCreatingProject ? "Minting Workspace..." : "Confirm Project Creation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE SETTINGS MODAL */}
      {isSettingsModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div 
            className="bg-[#041829] border border-[#14304A] rounded-3xl p-6 w-full max-w-[480px] shadow-[0_10px_45px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#14304A]/60 mb-6">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-brand-sui animate-spin-slow" />
                <div>
                  <span className="text-base font-bold text-white block font-outfit">Workspace Settings</span>
                  <span className="text-[10px] text-slate-300 font-mono mt-0.5 block truncate max-w-[340px]">{activeProject.name}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-300 hover:text-white transition-colors bg-transparent border-none text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* RUNNER OPTION SELECTOR */}
              <div className="bg-[#141622]/40 border border-[#14304A]/60 p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase text-slate-200 tracking-wider">Execution Environment</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRunner(false);
                      setSettingsRunnerAddress("0x66e2384110dfebe33a817f76f8f7916bdd92b1046b7ac699b59701f2c965a875");
                    }}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !isCustomRunner
                        ? "bg-brand-sui/10 border-brand-sui/50 shadow-[0_0_12px_rgba(56,152,255,0.1)] text-white"
                        : "bg-[#05060a]/50 border-[#14304A] hover:border-[#2d3047] text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold font-outfit">Public Compute Pool</span>
                    <span className="text-[9px] leading-normal opacity-85">Free decentralized execution fleet.</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRunner(true);
                    }}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCustomRunner
                        ? "bg-brand-sui/10 border-brand-sui/50 shadow-[0_0_12px_rgba(56,152,255,0.1)] text-white"
                        : "bg-[#05060a]/50 border-[#14304A] hover:border-[#2d3047] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold font-outfit text-white">Dedicated Runner</span>
                      <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-sui/20 border border-brand-sui text-brand-sui leading-none shrink-0 font-mono">Paid</span>
                    </div>
                    <span className="text-[9px] leading-normal opacity-85 font-medium">Lease a dedicated Node Operator with an SLA.</span>
                  </button>
                </div>
              </div>

              {!isCustomRunner ? (
                <div className="bg-[#141622]/30 border border-[#14304A]/60 p-4 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-sui/10 flex items-center justify-center text-brand-sui text-[10px] shrink-0 mt-0.5 font-bold">ℹ</div>
                  <div className="text-[10px] text-slate-300 leading-relaxed font-medium">
                    <strong className="text-white block mb-1">Public Serverless Mode Active</strong>
                    Your serverless functions execute inside our decentralized, isolated V8 sandboxes. Any staked node operator can pick up and run your workloads for free.
                    <div className="mt-2 text-[9px] font-mono text-slate-400 break-all select-all font-bold">
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">Private Runner Address</label>
                      <span className="text-[9px] text-slate-300 font-mono font-bold">Must sign transactions</span>
                    </div>
                    <input 
                      type="text" 
                      value={settingsRunnerAddress}
                      onChange={(e) => setSettingsRunnerAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono"
                    />
                  </div>
                  
                  <div className="bg-amber-950/10 border border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
                    <span className="text-cyan-500 font-bold text-xs shrink-0 mt-0.5">⚠️</span>
                    <div className="text-[10px] text-slate-300 leading-relaxed font-medium">
                      Only the Node Operator running with the Runner Address below will be allowed to pick up and execute your functions. Ensure you have coordinated with them.
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings || !settingsRunnerAddress.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white py-3.5 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isSavingSettings ? "Configuring On-Chain Specs..." : "Save Workspace Configurations"}
              </button>

              <div className="border-t border-[#14304A]/60 pt-4 mt-2">
                <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider block mb-2">Danger Zone</span>
                <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-300 leading-normal font-medium">
                    Destroy this workspace on-chain to reclaim your storage deposit. Ensure all functions are deleted first.
                  </div>
                  <button
                    onClick={handleDeleteProjectClick}
                    disabled={isDeletingProject || myFunctions.length > 0}
                    type="button"
                    className="flex-shrink-0 bg-red-900/40 hover:bg-red-800/60 text-red-200 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-red-900/60 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isDeletingProject ? "Destroying..." : "Delete Workspace"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div 
            className="bg-[#041829] border border-[#14304A] rounded-3xl p-6 w-full max-w-[480px] shadow-[0_10px_45px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#14304A]/60 mb-6">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-brand-sui" />
                <span className="text-base font-bold text-white font-outfit">Register New Function</span>
              </div>
              <button 
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  setIsBlobIdLocked(false);
                  setUploadedFileName("");
                  setRegisterFunctionName("");
                  setRegisterBlobId("");
                }}
                className="text-slate-300 hover:text-white transition-colors bg-transparent border-none text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Scope Workspace Info */}
              <div className="bg-[#05060a] border border-[#14304A] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Target Project Workspace</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1 font-mono">
                    <Folder size={12} className="text-brand-sui" /> {activeProject?.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Function Name</label>
                <input 
                  type="text" 
                  value={registerFunctionName}
                  onChange={(e) => setRegisterFunctionName(e.target.value)}
                  placeholder="e.g., sui_usd_oracle"
                  className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-sans"
                />
              </div>

              {/* Drag and Drop Walrus code publisher */}
              {uploadedFileName ? (
                <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40">
                      <Code size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block truncate w-56 font-mono">{uploadedFileName}</span>
                      <span className="text-xs text-emerald-400 font-semibold">Uploaded to Walrus Nodes</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setUploadedFileName("");
                      setRegisterBlobId("");
                      setIsBlobIdLocked(false);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Upload Script to Walrus</label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#14304A] hover:border-brand-sui/40 rounded-2xl cursor-pointer bg-[#05060a] hover:bg-[#041829]/50 transition-all">
                    <input 
                      type="file" 
                      accept=".js,.ts"
                      onChange={onFileChange}
                      className="hidden" 
                    />
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="w-10 h-10 border-2 border-[#14304A] border-t-brand-sui rounded-full animate-spin mb-3" />
                        <span className="text-xs font-bold text-white">Uploading Blob... {uploadPercentage}%</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={24} className="text-slate-200 mb-2" />
                        <span className="text-xs font-bold text-slate-100">Click to upload script</span>
                        <span className="text-xs text-slate-200 mt-1 font-medium">Supports single JS/TS files up to 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}

               <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">Walrus Blob ID</label>
                  <span className="text-[10px] text-brand-sui font-bold font-mono">✓ Auto-Generated</span>
                </div>
                <input 
                  type="text" 
                  value={registerBlobId}
                  disabled={true}
                  readOnly={true}
                  placeholder="Awaiting script upload above..."
                  className="w-full bg-[#161824]/65 border border-[#14304A] text-brand-sui rounded-xl px-4 py-3 text-xs focus:outline-none transition-all font-mono cursor-not-allowed font-extrabold shadow-inner"
                />
                <span className="text-[9px] text-slate-400 font-medium block mt-1.5 leading-normal">
                  Lock secured. The immutable Blob ID is cryptographically calculated by Walrus nodes post script compilation.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Automation Trigger Type</label>
                <select 
                  value={registerTriggerType}
                  onChange={(e) => {
                    const type = Number(e.target.value);
                    setRegisterTriggerType(type);
                    if (type === 0) {
                      setRegisterTriggerConfig("{}");
                    } else if (type === 1) {
                      setRegisterTriggerConfig(JSON.stringify({ interval: 60 }, null, 2));
                    } else if (type === 2) {
                      setRegisterTriggerConfig(JSON.stringify({ packageId: "0x...", eventName: "SwapEvent" }, null, 2));
                    } else if (type === 3) {
                      setRegisterTriggerConfig(JSON.stringify({ drift_threshold: 0.001 }, null, 2));
                    }
                  }}
                  className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-sans"
                >
                  <option value={0}>Manual Trigger (On-Demand)</option>
                  <option value={1}>Cron Trigger (Periodic execution)</option>
                  <option value={2}>Sui Event Trigger (On event match)</option>
                  <option value={3}>Drift Trigger (On price movement)</option>
                </select>
              </div>

              {registerTriggerType > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Trigger Configuration (JSON)</label>
                  <textarea 
                    value={registerTriggerConfig}
                    onChange={(e) => setRegisterTriggerConfig(e.target.value)}
                    rows={4}
                    placeholder="Enter configuration JSON parameters..."
                    className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-between bg-brand-sui/10 border border-brand-sui/20 rounded-xl px-4 py-3">
                <span className="text-xs text-brand-sui/90 font-medium">Deployment Fee</span>
                <span className="text-sm font-mono text-brand-sui font-bold">0.05 SUI</span>
              </div>

              <button 
                onClick={handleRegister}
                disabled={isRegistering || !registerFunctionName.trim() || !registerBlobId.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white py-3.5 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isRegistering ? "Syncing smart contracts..." : "Confirm Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditTriggerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <div 
            className="bg-[#041829] border border-[#14304A] rounded-3xl p-6 w-full max-w-[480px] shadow-[0_10px_45px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#14304A]/60 mb-6">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-brand-sui" />
                <span className="text-base font-bold text-white font-outfit">Edit Automation Trigger</span>
              </div>
              <button 
                onClick={() => {
                  setIsEditTriggerModalOpen(false);
                  setEditTriggerFunctionName("");
                  setEditTriggerType(0);
                  setEditTriggerConfig("{}");
                }}
                className="text-slate-300 hover:text-white transition-colors bg-transparent border-none text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-[#05060a] border border-[#14304A] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Function Name</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1 font-mono">
                     {editTriggerFunctionName}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Automation Trigger Type</label>
                <select 
                  value={editTriggerType}
                  onChange={(e) => {
                    const type = Number(e.target.value);
                    setEditTriggerType(type);
                    if (type === 0) {
                      setEditTriggerConfig("{}");
                    } else if (type === 1) {
                      setEditTriggerConfig(JSON.stringify({ interval: 60 }, null, 2));
                    } else if (type === 2) {
                      setEditTriggerConfig(JSON.stringify({ packageId: "0x...", eventName: "SwapEvent" }, null, 2));
                    } else if (type === 3) {
                      setEditTriggerConfig(JSON.stringify({ drift_threshold: 0.001 }, null, 2));
                    }
                  }}
                  className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-sans"
                >
                  <option value={0}>Manual Trigger (On-Demand)</option>
                  <option value={1}>Cron Trigger (Periodic execution)</option>
                  <option value={2}>Sui Event Trigger (On event match)</option>
                  <option value={3}>Drift Trigger (On price movement)</option>
                </select>
              </div>

              {editTriggerType > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-200 tracking-wider block mb-2">Trigger Configuration (JSON)</label>
                  <textarea 
                    value={editTriggerConfig}
                    onChange={(e) => setEditTriggerConfig(e.target.value)}
                    rows={4}
                    placeholder="Enter configuration JSON parameters..."
                    className="w-full bg-[#05060a] border border-[#14304A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-sui/40 focus:ring-1 focus:ring-brand-sui/20 transition-all font-mono"
                  />
                </div>
              )}

              <button 
                onClick={handleUpdateTrigger}
                disabled={isUpdatingTrigger}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isUpdatingTrigger ? "Syncing smart contracts..." : "Save Trigger Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#041829] border border-[#14304A] rounded-3xl p-6 w-full max-w-[440px] shadow-[0_10px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-[#14304A]/60 mb-5">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400 animate-pulse" />
              </div>
              <div>
                <span className="text-base font-bold text-white block font-outfit">{confirmModal.title}</span>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5 uppercase tracking-wider">Blockchain Registry Confirmation</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed font-medium mb-6 font-outfit">
              {confirmModal.message}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-bold border border-[#14304A] transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              {confirmModal.actionType ? (
                <button 
                  onClick={() => {
                    if (confirmModal.actionType === 'delete_project') {
                      executeDeleteProject();
                    } else if (confirmModal.actionType === 'delete_function') {
                      executeDeleteFunction(confirmModal.targetName);
                    } else if (confirmModal.actionType === 'admin_delete_workspace') {
                      executeAdminDeleteProject(confirmModal.targetName);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(220,38,38,0.25)] transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              ) : (
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUDIT SAFETY WARNING MODAL */}
      {isAuditWarningModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#041829] border border-[#14304A] rounded-3xl p-6 w-full max-w-[460px] shadow-[0_10px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-[#14304A]/60 mb-5">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl flex items-center justify-center">
                <Shield size={18} className="text-cyan-500 animate-pulse" />
              </div>
              <div>
                <span className="text-base font-bold text-white block font-outfit">Verification Required</span>
                <span className="text-[9px] text-cyan-400 font-mono block mt-0.5 uppercase tracking-wider font-bold">V8 Sandbox Safety Check</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed font-medium mb-6 font-outfit flex flex-col gap-4 text-left">
              <p>
                The execution trigger for <strong className="text-white">"{auditWarningFnName}"</strong> was aborted. Every function registered on-chain must pass a sandboxed safety audit before it can be triggered.
              </p>
              
              <div className="bg-[#141622]/50 border border-[#14304A]/60 rounded-2xl p-4 flex flex-col gap-2 font-mono text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className={`font-bold ${auditWarningStatus === 'Rejected' ? 'text-red-400' : 'text-cyan-400'}`}>{auditWarningStatus}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">WALRUS BLOB ID:</span>
                  <span className="text-slate-300 break-all select-all bg-[#05060a] border border-[#14304A] px-2 py-1.5 rounded-lg mt-1 font-bold">{auditWarningBlobId}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                You can run this static and dynamic safety audit using the Walrus Auditor platform. Once verified, the runner fleet will confirm the safety payload on-chain.
              </p>
            </div>

             <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => handleRequestVerification(auditWarningFnName)}
                disabled={isRequestingVerification !== null}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-[#4f46e5] hover:brightness-110 text-white py-3.5 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(79,70,229,0.25)] transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingVerification === auditWarningFnName ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Submitting On-Chain Request...
                  </>
                ) : (
                  <>
                    Request On-Chain Audit <Shield size={14} />
                  </>
                )}
              </button>
              <a 
                href="http://localhost:5175" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] hover:brightness-110 text-white py-3.5 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] transition-all cursor-pointer text-center"
              >
                Launch Walrus Auditor (Local) <ArrowUpRight size={14} />
              </a>

              <a 
                href="https://publisher.walrus.site/TJgeWW4t-MOv1K2klEsC0eDTDZbmcUu610eHptXD9mA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#141622]/40 hover:bg-[#141622]/70 text-slate-300 py-3 rounded-xl text-xs font-bold border border-[#14304A] transition-all cursor-pointer text-center"
              >
                Launch Walrus Auditor (Decentralized) <ArrowUpRight size={12} />
              </a>

              <button 
                onClick={() => setIsAuditWarningModalOpen(false)}
                className="w-full bg-transparent hover:bg-white/5 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border bg-slate-950/90 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'border-emerald-500/35 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'border-red-500/35 shadow-red-950/20'
                : toast.type === 'warning'
                ? 'border-cyan-500/35 shadow-amber-950/20'
                : 'border-[#14304A] shadow-black/40'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle size={18} className="text-red-400" />}
              {toast.type === 'warning' && <AlertTriangle size={18} className="text-cyan-500" />}
              {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-outfit">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal font-medium font-sans">{toast.message}</p>
              {toast.txDigest && (
                <a
                  href={`https://suiscan.xyz/testnet/tx/${toast.txDigest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] text-brand-sui hover:text-blue-400 transition-colors font-semibold"
                >
                  View Transaction <ArrowUpRight size={10} />
                </a>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
