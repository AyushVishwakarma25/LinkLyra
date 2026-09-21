import React from 'react';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  variant?: 'light' | 'dark' | 'neutral';
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'neutral',
  fullWidth = false,
  className = '',
  ariaLabel = 'Switch view',
}: SegmentedControlProps<T>) {
  const containerSizeStyles = {
    sm: 'p-0.5 rounded-xl gap-0.5 text-xs',
    md: 'p-1 rounded-xl gap-1 text-xs sm:text-sm',
  };

  const itemSizeStyles = {
    sm: 'min-h-[30px] h-[30px] px-2.5 rounded-lg gap-1.5 font-medium',
    md: 'min-h-[34px] h-[34px] px-3.5 rounded-lg gap-2 font-semibold',
  };

  const containerVariantStyles = {
    neutral: 'bg-black/5 border border-black/5',
    light: 'bg-white/95 border border-black/10 shadow-xs backdrop-blur-md',
    dark: 'bg-[#1C1E22] border border-white/10 shadow-xs',
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`
        inline-flex items-center select-none
        ${containerVariantStyles[variant]}
        ${containerSizeStyles[size]}
        ${fullWidth ? 'w-full flex' : ''}
        ${className}
      `}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        const activeStyles =
          variant === 'dark'
            ? 'bg-white text-[#1C1E22] shadow-xs font-bold'
            : 'bg-[#1C1E22] text-white shadow-xs font-bold';

        const inactiveStyles =
          variant === 'dark'
            ? 'text-white/60 hover:text-white hover:bg-white/10'
            : 'text-[#737882] hover:text-[#1C1E22] hover:bg-black/5';

        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            title={option.title}
            className={`
              inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-all duration-150 outline-none
              ${itemSizeStyles[size]}
              ${isSelected ? activeStyles : inactiveStyles}
              ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
              ${fullWidth ? 'flex-1' : ''}
            `}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge && <span className="shrink-0">{option.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
