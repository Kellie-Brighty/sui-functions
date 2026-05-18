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
            href="https://status.sui-functions.network" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-slate-200 hover:text-brand-orange transition-colors"
          >
            Status
          </a>
          <a 
            href="https://twitter.com/SuiFunctions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-slate-200 hover:text-brand-orange transition-colors"
          >
            Twitter
          </a>
          <a 
            href="https://github.com/Kellie-Brighty/sui-functions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-slate-200 hover:text-brand-orange transition-colors"
          >
            GitHub
          </a>
          <a 
            href="https://discord.gg/suifunctions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-slate-200 hover:text-brand-orange transition-colors"
          >
            Discord
          </a>
          <a 
            href="#terms" 
            className="text-xs font-semibold text-slate-200 hover:text-brand-orange transition-colors"
          >
            Terms
          </a>
          <a 
            href="#privacy" 
            className="text-xs font-semibold text-slate-200 hover:text-brand-orange transition-colors"
          >
            Privacy
          </a>
        </div>

      </div>
    </footer>
  );
};
