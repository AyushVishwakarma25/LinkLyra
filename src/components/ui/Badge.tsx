import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'pro' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-black/5 text-[#1C1E22] border-transparent',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-[#5E4BF7]/10 text-[#5E4BF7] border-[#5E4BF7]/20',
    pro: 'bg-[#F8BA38]/15 text-[#8F6106] border-[#F8BA38]/30 font-bold',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-0.5 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
