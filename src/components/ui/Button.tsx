import React from 'react';
import { useButtonGroup, ButtonVariant, ButtonSize } from './ButtonGroupContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1C1E22] text-white hover:bg-black active:bg-[#0E0F11] border border-transparent focus-visible:ring-2 focus-visible:ring-black/20',
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
    normal: 'h-7 px-2.5 text-xs gap-1.5 rounded-md font-medium',
    iconOnly: 'w-7 h-7 p-0 text-xs rounded-md',
  },
  md: {
    normal: 'h-9 px-3.5 text-xs sm:text-sm gap-2 rounded-lg font-semibold',
    iconOnly: 'w-9 h-9 p-0 text-sm rounded-lg',
  },
  lg: {
    normal: 'h-11 px-5 text-sm sm:text-base gap-2.5 rounded-xl font-bold',
    iconOnly: 'w-11 h-11 p-0 text-base rounded-xl',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant: explicitVariant,
      size: explicitSize,
      isIconOnly = false,
      isDisabled: explicitDisabled,
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
    const isDisabled = explicitDisabled ?? disabled ?? group.isDisabled ?? false;
    const fullWidth = explicitFullWidth ?? group.fullWidth ?? false;
    const isInGroup = group.isInGroup ?? false;
    const orientation = group.orientation ?? 'horizontal';

    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-colors duration-150 select-none outline-none focus-visible:outline-none';

    const stateClasses = isDisabled
      ? 'opacity-40 cursor-not-allowed pointer-events-none'
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
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
