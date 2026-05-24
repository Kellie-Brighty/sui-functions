import React from 'react';

interface CodeWindowProps {
  activePillar?: 'trigger' | 'logic' | 'worker';
  onPillarChange?: (pillar: 'trigger' | 'logic' | 'worker') => void;
  className?: string;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({
  activePillar = 'trigger',
  onPillarChange,
  className = ''
}) => {
  const tabs = [
    { id: 'trigger', label: 'trigger.move', lang: 'SUI MOVE' },
    { id: 'logic', label: 'logic_meta.json', lang: 'JSON' },
    { id: 'worker', label: 'worker.ts', lang: 'TYPESCRIPT' }
  ];

  const currentTab = tabs.find(t => t.id === activePillar) || tabs[0];

  return (
    <div className={`w-full bg-[#06070a] border border-[#1d2033] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col ${className}`}>
      {/* Editor Header Tab Bar */}
      <div className="bg-[#090b11] px-5 py-3 border-b border-[#141624] flex items-center justify-between flex-wrap gap-3 select-none">
        {/* Window Controls & Tabs */}
        <div className="flex items-center gap-6">
          {/* OS dots */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
          </div>

          {/* Clickable tabs */}
          <div className="flex gap-1.5 bg-[#030407] p-1 rounded-lg border border-[#141624]">
            {tabs.map((tab) => {
              const isActive = activePillar === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onPillarChange?.(tab.id as 'trigger' | 'logic' | 'worker')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#090b11] text-white border border-[#23263b] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#03192E]/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? (tab.id === 'trigger' ? 'bg-brand-sui' : tab.id === 'logic' ? 'bg-brand-indigo' : 'bg-brand-cyan') : 'bg-slate-600'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Label */}
        <div className="text-[10px] text-slate-400 font-bold tracking-widest font-mono select-none">
          {currentTab.lang}
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="p-6 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-[#ABB2BF] bg-[#030407] min-h-[360px] flex-grow select-text">
        {activePillar === 'trigger' && (
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">1</td>
                <td className="pl-5 text-slate-200">
                  <span className="text-[#E06C75]">module</span>{' '}
                  <span className="text-[#61AFEF]">usd_functions</span>::
                  <span className="text-[#98C379]">kinetic_handler</span> {'{'}
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">2</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#C678DD]">use</span>{' '}
                  <span className="text-[#ABB2BF]">sui::tx_context::</span>
                  {'{'}<span className="text-[#D19A66]">Self</span>, <span className="text-[#E5C07B]">TxContext</span>{'}'};
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">3</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#C678DD]">use</span>{' '}
                  <span className="text-[#ABB2BF]">sui::object::</span>
                  {'{'}<span className="text-[#D19A66]">Self</span>, <span className="text-[#E5C07B]">UID</span>{'}'};
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">4</td>
                <td className="pl-5"></td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">5</td>
                <td className="pl-9 text-[#5C6370] italic">
                  // Zero-latency entry point
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">6</td>
                <td className="pl-9">
                  <span className="text-[#E06C75]">public entry fun</span>{' '}
                  <span className="text-[#61AFEF]">execute</span>(
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">7</td>
                <td className="pl-14">
                  <span className="text-[#E5C07B]">ctx</span>: &amp;<span className="text-[#C678DD]">mut</span>{' '}
                  <span className="text-[#E5C07B]">TxContext</span>
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">8</td>
                <td className="pl-9">
                  ) {'{'}
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">9</td>
                <td className="pl-14 text-[#5C6370] italic">
                  // Process decentralized logic
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">10</td>
                <td className="pl-14">
                  <span className="text-[#C678DD]">let</span>{' '}
                  <span className="text-[#ABB2BF]">result</span> ={' '}
                  <span className="text-[#61AFEF]">process_request</span>(ctx);
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">11</td>
                <td className="pl-14">
                  <span className="text-[#61AFEF]">emit_event</span>(result);
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">12</td>
                <td className="pl-9">{'}'}</td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">13</td>
                <td className="pl-5">{'}'}</td>
              </tr>
            </tbody>
          </table>
        )}

        {activePillar === 'logic' && (
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">1</td>
                <td className="pl-5 text-slate-200">
                  <span className="text-[#ABB2BF]">{'{'}</span>
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">2</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"blob_id"</span>: <span className="text-[#98C379]">"0x5f71e98ba015cd92c730e7ef..."</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">3</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"name"</span>: <span className="text-[#98C379]">"usd_oracle_logic"</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">4</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"runtime"</span>: <span className="text-[#98C379]">"wasm32-wasi"</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">5</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"version"</span>: <span className="text-[#98C379]">"1.4.2"</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">6</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"immutable"</span>: <span className="text-[#D19A66]">true</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">7</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"permissions"</span>: <span className="text-[#ABB2BF]">{'{'}</span>
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">8</td>
                <td className="pl-14 text-slate-200">
                  <span className="text-[#E06C75]">"network_access"</span>: <span className="text-[#D19A66]">false</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">9</td>
                <td className="pl-14 text-slate-200">
                  <span className="text-[#E06C75]">"state_read"</span>: <span className="text-[#ABB2BF]">[</span><span className="text-[#98C379]">"0xSuiOracleFeed"</span><span className="text-[#ABB2BF]">]</span>
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">10</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#ABB2BF]">{'}'}</span>,
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">11</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#E06C75]">"checksum"</span>: <span className="text-[#98C379]">"sha256-4c7b8d...e2f3a4"</span>
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">12</td>
                <td className="pl-5 text-slate-200">
                  <span className="text-[#ABB2BF]">{'}'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activePillar === 'worker' && (
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">1</td>
                <td className="pl-5 text-slate-200">
                  <span className="text-[#C678DD]">import</span> <span className="text-[#ABB2BF]">{'{'}</span> <span className="text-[#E5C07B]">V8Sandbox</span> <span className="text-[#ABB2BF]">{'}'}</span> <span className="text-[#C678DD]">from</span> <span className="text-[#98C379]">"@sui-functions/runtime"</span>;
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">2</td>
                <td className="pl-5 text-slate-200">
                  <span className="text-[#C678DD]">import</span> <span className="text-[#ABB2BF]">{'{'}</span> <span className="text-[#E5C07B]">WalrusClient</span> <span className="text-[#ABB2BF]">{'}'}</span> <span className="text-[#C678DD]">from</span> <span className="text-[#98C379]">"@walrus/sdk"</span>;
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">3</td>
                <td className="pl-5"></td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">4</td>
                <td className="pl-5 text-[#5C6370] italic">
                  // TypeScript daemon listening for Sui triggers
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">5</td>
                <td className="pl-5 text-slate-200">
                  <span className="text-[#C678DD]">export async function</span> <span className="text-[#61AFEF]">startWorker</span>() {'{'}
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">6</td>
                <td className="pl-9 text-slate-200">
                  <span className="text-[#C678DD]">const</span> <span className="text-[#E5C07B]">client</span> = <span className="text-[#C678DD]">new</span> <span className="text-[#61AFEF]">WalrusClient</span>();
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">7</td>
                <td className="pl-9"></td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">8</td>
                <td className="pl-9 text-slate-200">
                  client.<span className="text-[#61AFEF]">onTrigger</span>(<span className="text-[#C678DD]">async</span> (event) =&gt; {'{'}
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">9</td>
                <td className="pl-14 text-[#5C6370] italic">
                  // 100% logic integrity guarantee
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">10</td>
                <td className="pl-14 text-slate-200">
                  <span className="text-[#C678DD]">const</span> <span className="text-[#E5C07B]">wasmBytes</span> = <span className="text-[#C678DD]">await</span> client.<span className="text-[#61AFEF]">getBlob</span>(event.blobId);
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">11</td>
                <td className="pl-14"></td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">12</td>
                <td className="pl-14 text-[#5C6370] italic">
                  // Run in isolated, zero-latency sandbox
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">13</td>
                <td className="pl-14 text-slate-200">
                  <span className="text-[#C678DD]">const</span> <span className="text-[#E5C07B]">result</span> = <span className="text-[#C678DD]">await</span> <span className="text-[#E5C07B]">V8Sandbox</span>.<span className="text-[#61AFEF]">execute</span>(wasmBytes, event.payload);
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">14</td>
                <td className="pl-14 text-slate-200">
                  <span className="text-[#C678DD]">await</span> client.<span className="text-[#61AFEF]">postReceipt</span>(event.txId, result);
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">15</td>
                <td className="pl-9 text-slate-200">
                  {'});'}
                </td>
              </tr>
              <tr>
                <td className="w-8 select-none pr-4 text-slate-500 text-right text-xs align-top pt-1 border-r border-[#141624]">16</td>
                <td className="pl-5 text-slate-200">{'}'}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
