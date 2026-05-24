import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  glowColor?: 'orange' | 'blue' | 'green' | 'none';
  hoverEffect?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  glowColor = 'none',
  hoverEffect = true,
  className = '',
  children,
  onClick
}) => {
  const glowStyles = {
    orange: 'hover:border-brand-sui/40 hover:shadow-[0_0_30px_rgba(56,152,255,0.15)] border-l-2 border-l-brand-sui/60',
    blue: 'hover:border-brand-indigo/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] border-l-2 border-l-brand-indigo/60',
    green: 'hover:border-brand-cyan/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] border-l-2 border-l-brand-cyan/60',
    none: 'hover:border-[#183B5E] border-l border-l-[#102A44]'
  };

  const Component = hoverEffect ? motion.div : 'div';
  const hoverProps = hoverEffect
    ? {
        whileHover: { y: -4 },
        transition: { duration: 0.3, ease: 'easeOut' }
      }
    : {};

  return (
    <Component
      {...hoverProps}
      onClick={onClick}
      className={`bg-brand-card/90 backdrop-blur-md border border-brand-card-border rounded-2xl p-6 transition-all duration-300 ${glowStyles[glowColor]} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
};
