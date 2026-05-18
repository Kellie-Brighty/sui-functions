import React from 'react';

interface CodeWindowProps {
  filename?: string;
  className?: string;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({
  filename = 'handler.move',
  className = ''
}) => {
  return (
    <div className={`w-full bg-[#08090E] border border-brand-card-border rounded-2xl overflow-hidden shadow-card-glow ${className}`}>
      {/* Editor Header Tab Bar */}
      <div className="bg-[#0b0c14] px-5 py-3.5 border-b border-brand-card-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-[0_0_8px_rgba(255,95,86,0.3)]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-[0_0_8px_rgba(255,189,46,0.3)]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-[0_0_8px_rgba(39,201,63,0.3)]" />
        </div>
        <div className="flex items-center gap-1.5 bg-[#0f101a] px-3.5 py-1.5 rounded-lg border border-brand-card-border/50 text-xs font-semibold text-slate-200 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          {filename}
        </div>
        <div className="text-[10px] text-slate-350 font-bold tracking-widest font-mono select-none">
          SUI MOVE
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto text-[#ABB2BF] bg-[#07080D]">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">1</td>
              <td className="pl-5 text-slate-200">
                <span className="text-[#E06C75]">module</span>{' '}
                <span className="text-[#61AFEF]">usd_functions</span>::
                <span className="text-[#98C379]">kinetic_handler</span> {'{'}
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">2</td>
              <td className="pl-9 text-slate-200">
                <span className="text-[#C678DD]">use</span>{' '}
                <span className="text-[#ABB2BF]">sui::tx_context::</span>
                {'{'}<span className="text-[#D19A66]">Self</span>, <span className="text-[#E5C07B]">TxContext</span>{'}'};
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">3</td>
              <td className="pl-9 text-slate-200">
                <span className="text-[#C678DD]">use</span>{' '}
                <span className="text-[#ABB2BF]">sui::object::</span>
                {'{'}<span className="text-[#D19A66]">Self</span>, <span className="text-[#E5C07B]">UID</span>{'}'};
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">4</td>
              <td className="pl-5"></td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">5</td>
              <td className="pl-9 text-[#8A95A5] italic">
                // Zero-latency entry point
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">6</td>
              <td className="pl-9">
                <span className="text-[#E06C75]">public entry fun</span>{' '}
                <span className="text-[#61AFEF]">execute</span>(
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">7</td>
              <td className="pl-14">
                <span className="text-[#E5C07B]">ctx</span>: &amp;<span className="text-[#C678DD]">mut</span>{' '}
                <span className="text-[#E5C07B]">TxContext</span>
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">8</td>
              <td className="pl-9">
                ) {'{'}
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">9</td>
              <td className="pl-14 text-[#8A95A5] italic">
                // Process decentralized logic
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">10</td>
              <td className="pl-14">
                <span className="text-[#C678DD]">let</span>{' '}
                <span className="text-[#ABB2BF]">result</span> ={' '}
                <span className="text-[#61AFEF]">process_request</span>(ctx);
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">11</td>
              <td className="pl-14">
                <span className="text-[#61AFEF]">emit_event</span>(result);
              </td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">12</td>
              <td className="pl-9">{'}'}</td>
            </tr>
            <tr>
              <td className="w-8 select-none pr-4 text-slate-400 text-right text-xs align-top pt-1 border-r border-brand-card-border/30">13</td>
              <td className="pl-5">{'}'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
