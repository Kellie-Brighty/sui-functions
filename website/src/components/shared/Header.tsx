import React, { useState } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  onDemoClick?: () => void;
  onBenefitsClick?: () => void;
  onConnectClick?: () => void;
  viewMode?: 'landing' | 'docs';
  onDocsClick?: () => void;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onDemoClick, 
  onBenefitsClick, 
  onConnectClick,
  viewMode = 'landing',
  onDocsClick,
  onHomeClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: 'home' | 'docs', callback?: () => void) => {
    e.preventDefault();
    if (target === 'home') {
      onHomeClick?.();
    } else if (target === 'docs') {
      onDocsClick?.();
    }
    if (callback) {
      // Give a tiny timeout if switching viewMode to allow target section to mount before scrolling
      setTimeout(() => callback(), 50);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-dark/80 backdrop-blur-xl border-b border-brand-card-border/50 px-6 lg:px-16 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <a 
          href="/" 
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center gap-3.5 group"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-card border border-brand-card-border flex items-center justify-center group-hover:border-brand-orange/40 transition-colors duration-300">
            <img 
              src="/sui-func-logo.png" 
              alt="Sui-Functions Logo" 
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-orange transition-colors duration-300 font-outfit flex items-center">
            <span className="whitespace-nowrap">Sui-Functions</span>
          </span>
        </a>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            href="#docs" 
            onClick={(e) => handleNavClick(e, 'docs')}
            className={`text-sm font-bold transition-all duration-200 px-4 py-2 rounded-lg ${viewMode === 'docs' ? 'text-brand-orange bg-brand-orange/10 border border-brand-orange/20' : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            Docs
          </a>
          <div className="relative">
            <Button 
              onClick={onConnectClick}
              variant="primary" 
              size="md"
              className="!px-5 !py-2.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,126,33,0.3)] hover:shadow-[0_0_30px_rgba(255,126,33,0.5)] transition-shadow"
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
            href="#docs" 
            onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, 'docs'); }}
            className={`text-lg font-semibold py-1 ${viewMode === 'docs' ? 'text-brand-orange' : 'text-slate-200 hover:text-brand-orange'}`}
          >
            Docs
          </a>
          <hr className="border-brand-card-border/60 my-1" />
          <div className="pt-2">
            <Button 
              onClick={() => { setMobileMenuOpen(false); onConnectClick?.(); }}
              variant="primary" 
              size="md"
              className="!w-full !justify-center !px-5 !py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(255,126,33,0.2)]"
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
