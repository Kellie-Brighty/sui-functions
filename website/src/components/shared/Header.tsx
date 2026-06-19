import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  onSectionClick?: (sectionId: string) => void;
  onConnectClick?: () => void;
  viewMode?: 'landing' | 'docs' | 'blueprint';
  onDocsClick?: () => void;
  onHomeClick?: () => void;
  onBlueprintClick?: () => void;
}

const navLinks = [
  { id: 'features', label: 'Features' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'nodes', label: 'Nodes' },
  { id: 'evolution', label: 'Evolution' },
];

export const Header: React.FC<HeaderProps> = ({ 
  onSectionClick,
  onConnectClick,
  viewMode = 'landing',
  onDocsClick,
  onHomeClick,
  onBlueprintClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      if (viewMode === 'docs') {
        setActiveSection('docs');
        return;
      }

      const sections = ['features', 'architecture', 'nodes', 'evolution'];
      const scrollPos = window.scrollY + 140; // Offset for header + safety
      
      let currentActive = '';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentActive = sectionId;
            break;
          }
        }
      }
      
      if (window.scrollY < 200) {
        currentActive = '';
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: 'home' | 'docs' | 'blueprint') => {
    e.preventDefault();
    if (target === 'home') {
      onHomeClick?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'docs') {
      onDocsClick?.();
    } else if (target === 'blueprint') {
      onBlueprintClick?.();
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-brand-dark/95 backdrop-blur-xl border-brand-card-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3' 
        : 'bg-brand-dark/40 backdrop-blur-md border-transparent py-5'
    } px-6 lg:px-16`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <a 
          href="/" 
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center gap-3.5 group"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-card border border-brand-card-border flex items-center justify-center group-hover:border-brand-sui/40 transition-colors duration-300">
            <img 
              src="/sui-func-logo.png" 
              alt="Sui-Functions Logo" 
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-sui transition-colors duration-300 font-outfit flex items-center">
            <span className="whitespace-nowrap">Sui-Functions</span>
          </span>
        </a>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSectionClick?.(link.id);
              }}
              className={`text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 ${
                activeSection === link.id
                  ? 'text-[#00FFAA] scale-105 drop-shadow-[0_0_8px_rgba(0,255,170,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            href="#blueprint" 
            onClick={(e) => handleNavClick(e, 'blueprint')}
            className={`text-sm font-bold transition-all duration-200 px-4 py-2 rounded-lg ${
              viewMode === 'blueprint' 
                ? 'text-[#00FFAA] bg-[#0B2027] border border-[#14304A]' 
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Blueprint
          </a>
          <a 
            href="#docs" 
            onClick={(e) => handleNavClick(e, 'docs')}
            className={`text-sm font-bold transition-all duration-200 px-4 py-2 rounded-lg ${
              viewMode === 'docs' 
                ? 'text-[#00FFAA] bg-[#0B2027] border border-[#14304A]' 
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Docs
          </a>
          <div className="relative">
            <Button 
              onClick={onConnectClick}
              variant="primary" 
              size="md"
              className="!px-5 !py-2.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,152,255,0.3)] hover:shadow-[0_0_30px_rgba(56,152,255,0.5)] transition-shadow"
            >
              <span>Get Started</span>
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
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-brand-dark/95 border-b border-brand-card-border/80 px-6 py-6 flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onSectionClick?.(link.id);
              }}
              className={`text-sm font-semibold py-1 transition-colors ${
                activeSection === link.id ? 'text-[#00FFAA]' : 'text-slate-200 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a 
            href="#blueprint" 
            onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, 'blueprint'); }}
            className={`text-sm font-semibold py-1 ${viewMode === 'blueprint' ? 'text-[#00FFAA]' : 'text-slate-200 hover:text-brand-sui'}`}
          >
            Blueprint
          </a>
          <a 
            href="#docs" 
            onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, 'docs'); }}
            className={`text-sm font-semibold py-1 ${viewMode === 'docs' ? 'text-[#00FFAA]' : 'text-slate-200 hover:text-brand-sui'}`}
          >
            Docs
          </a>
          <hr className="border-brand-card-border/60 my-1" />
          <div className="pt-1">
            <Button 
              onClick={() => { setMobileMenuOpen(false); onConnectClick?.(); }}
              variant="primary" 
              size="md"
              className="!w-full !justify-center !px-5 !py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(56,152,255,0.2)]"
            >
              <span>Get Started</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
