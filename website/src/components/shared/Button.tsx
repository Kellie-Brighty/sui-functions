import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-orange to-[#F76707] text-white shadow-[0_4px_20px_rgba(255,126,33,0.3)] hover:shadow-[0_6px_24px_rgba(255,126,33,0.45)] hover:brightness-110 border border-brand-orange/20',
    secondary: 'bg-[#12131C] text-slate-100 hover:bg-[#1A1C28] border border-[#232536] hover:border-slate-700',
    outline: 'bg-transparent text-slate-100 hover:text-white border border-[#232536] hover:border-slate-500',
    text: 'bg-transparent text-slate-400 hover:text-white',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 border border-transparent'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base rounded-2xl'
  };

  return (
    <motion.button
      whileHover={{ y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
