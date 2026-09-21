import React from 'react';
import { useButtonGroup, ButtonVariant, ButtonSize } from './ButtonGroupContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1C1E22] text-white hover:bg-black active:bg-[#0E0F11] border border-transparent shadow-xs focus-visible:ring-2 focus-visible:ring-black/20',
  secondary:
    'bg-white text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 border border-black/10 shadow-2xs focus-visible:ring-2 focus-visible:ring-black/10',
  tertiary:
    'bg-black/5 text-[#1C1E22] hover:bg-black/10 active:bg-black/15 border border-transparent focus-visible:ring-2 focus-visible:ring-black/10',
  outline:
    'bg-transparent text-[#1C1E22] hover:bg-black/5 active:bg-black/10 border border-black/15 focus-visible:ring-2 focus-visible:ring-black/10',
  ghost:
    'bg-transparent text-[#555962] hover:text-[#1C1E22] hover:bg-black/5 active:bg-black/10 border border-transparent focus-visible:ring-2 focus-visible:ring-black/10',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent focus-visible:ring-2 focus-visible:ring-rose-500/20',
};

const sizeStyles: Record<ButtonSize, { normal: string; iconOnly: string }> = {
  sm: {
    normal: 'h-8 px-3 text-xs gap-1.5 rounded-lg font-semibold min-h-[32px]',
    iconOnly: 'w-8 h-8 min-w-[32px] min-h-[32px] p-0 text-xs rounded-lg',
  },
  md: {
    normal: 'h-[38px] px-3.5 text-xs sm:text-sm gap-2 rounded-xl font-semibold min-h-[38px]',
    iconOnly: 'w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 text-sm rounded-xl',
  },
  lg: {
    normal: 'h-11 px-5 text-sm sm:text-base gap-2.5 rounded-xl font-bold min-h-[44px]',
    iconOnly: 'w-11 h-11 min-w-[44px] min-h-[44px] p-0 text-base rounded-xl',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant: explicitVariant,
      size: explicitSize,
      isIconOnly = false,
      isDisabled: explicitDisabled,
      isLoading = false,
      fullWidth: explicitFullWidth,
      isSelected = false,
      className = '',
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const group = useButtonGroup();

    const variant = explicitVariant ?? group.variant ?? 'secondary';
    const size = explicitSize ?? group.size ?? 'md';
    const isDisabled = explicitDisabled ?? disabled ?? group.isDisabled ?? isLoading ?? false;
    const fullWidth = explicitFullWidth ?? group.fullWidth ?? false;
    const isInGroup = group.isInGroup ?? false;
    const orientation = group.orientation ?? 'horizontal';

    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-all duration-150 select-none outline-none focus-visible:outline-none';

    const stateClasses = isDisabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : 'active:scale-[0.98]';

    const groupClasses = isInGroup
      ? orientation === 'horizontal'
        ? 'first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none -ml-px first:ml-0'
        : 'first:rounded-b-none last:rounded-t-none [&:not(:first-child):not(:last-child)]:rounded-none -mt-px first:mt-0'
      : '';

    const selectedClasses = isSelected
      ? '!bg-[#1C1E22] !text-white !border-transparent shadow-xs'
      : '';

    const appliedSize = isIconOnly ? sizeStyles[size].iconOnly : sizeStyles[size].normal;
    const appliedVariant = variantStyles[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        aria-pressed={isSelected ? 'true' : undefined}
        className={`
          ${baseClasses}
          ${appliedVariant}
          ${appliedSize}
          ${fullWidth ? 'w-full' : ''}
          ${groupClasses}
          ${stateClasses}
          ${selectedClasses}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current opacity-75"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
