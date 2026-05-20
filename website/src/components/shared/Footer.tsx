import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#030407] border-t border-brand-card-border/60 py-16 px-6 lg:px-16 overflow-hidden radial-glow-footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        
        {/* Left Side: Brand and Copy */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-brand-card border border-brand-card-border flex items-center justify-center">
              <img 
                src="/sui-func-logo.png" 
                alt="Sui-Functions Logo" 
                className="w-4 h-4 object-contain"
              />
            </div>
            <span className="text-base font-bold text-white tracking-tight font-outfit">
              Sui-Functions
            </span>
          </div>
          <p className="text-xs text-slate-300 text-center md:text-left leading-relaxed max-w-md font-medium">
            © 2026 Sui-Functions. Architectural Precision in Decentralized Execution.<br />
            <span className="text-[11px] text-slate-400 block mt-1.5 font-normal">Built for the Sui Overflow 2026 Hackathon. The future is unstoppable.</span>
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
          <a 
            href="https://x.com/sui_functions?s=20" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-bold text-slate-300 hover:text-brand-orange transition-colors flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            Follow on X
          </a>
        </div>

      </div>
    </footer>
  );
};
