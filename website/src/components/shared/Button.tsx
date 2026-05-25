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
  const baseStyle = 'inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-sui/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-none';
  
  const variants = {
    primary: 'bg-[#E2E8F0] text-[#0A0F1A] border border-[#14304A] shadow-[4px_4px_0_0_#14304A] hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#14304A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
    secondary: 'bg-[#0A1225] text-slate-100 hover:bg-[#111C3A] border border-[#14304A]',
    outline: 'bg-transparent text-slate-100 hover:text-white border border-[#14304A] hover:border-slate-500',
    text: 'bg-transparent text-slate-400 hover:text-white',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 border border-transparent'
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-[11px]',
    lg: 'px-8 py-4 text-xs'
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
