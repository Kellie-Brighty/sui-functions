import React, { useState } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  onDemoClick?: () => void;
  onBenefitsClick?: () => void;
  onConnectClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDemoClick, onBenefitsClick, onConnectClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-dark/80 backdrop-blur-xl border-b border-brand-card-border/50 px-6 lg:px-16 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <a href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-card border border-brand-card-border flex items-center justify-center group-hover:border-brand-orange/40 transition-colors duration-300">
            <img 
              src="/sui-func-logo.png" 
              alt="Sui-Functions Logo" 
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-orange transition-colors duration-300 font-outfit">
            Sui-Functions
          </span>
        </a>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#network" 
            onClick={onBenefitsClick}
            className="text-sm font-semibold text-slate-200 hover:text-brand-orange transition-colors duration-200"
          >
            Network
          </a>
          <a 
            href="#docs" 
            className="text-sm font-semibold text-slate-200 hover:text-brand-orange transition-colors duration-200"
          >
            Docs
          </a>
          <a 
            href="#security" 
            className="text-sm font-semibold text-slate-200 hover:text-brand-orange transition-colors duration-200"
          >
            Security
          </a>
          <a 
            href="#scaling" 
            onClick={onDemoClick}
            className="text-sm font-semibold text-slate-200 hover:text-brand-orange transition-colors duration-200"
          >
            Scaling
          </a>
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Button 
              onClick={onConnectClick}
              variant="primary" 
              size="md"
              className="!px-5 !py-2.5 flex items-center justify-center gap-2"
            >
              <span>Deploy Now</span>
              <img src="/deploy.svg" alt="Deploy Icon" className="w-4 h-4 object-contain" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[73px] left-0 w-full bg-brand-dark/95 border-b border-brand-card-border/80 px-6 py-6 flex flex-col gap-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <a 
            href="#network" 
            onClick={() => { setMobileMenuOpen(false); onBenefitsClick?.(); }}
            className="text-lg font-semibold text-slate-200 hover:text-brand-orange py-1"
          >
            Network
          </a>
          <a 
            href="#docs" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-semibold text-slate-200 hover:text-brand-orange py-1"
          >
            Docs
          </a>
          <a 
            href="#security" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-semibold text-slate-200 hover:text-brand-orange py-1"
          >
            Security
          </a>
          <a 
            href="#scaling" 
            onClick={() => { setMobileMenuOpen(false); onDemoClick?.(); }}
            className="text-lg font-semibold text-slate-200 hover:text-brand-orange py-1"
          >
            Scaling
          </a>
          <hr className="border-brand-card-border/60 my-1" />
          <div className="pt-2">
            <Button 
              onClick={() => { setMobileMenuOpen(false); onConnectClick?.(); }}
              variant="primary" 
              size="md"
              className="!w-full !justify-center !px-5 !py-3 flex items-center gap-2"
            >
              <span>Deploy Now</span>
              <img src="/deploy.svg" alt="Deploy Icon" className="w-4 h-4 object-contain" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
