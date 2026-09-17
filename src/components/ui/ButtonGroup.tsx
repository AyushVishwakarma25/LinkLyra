import React from 'react';
import {
  ButtonGroupContext,
  ButtonVariant,
  ButtonSize,
  ButtonOrientation,
} from './ButtonGroupContext';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation?: ButtonOrientation;
  fullWidth?: boolean;
  isDisabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonGroupSeparatorProps {
  className?: string;
}

const Separator: React.FC<ButtonGroupSeparatorProps> = ({ className = '' }) => {
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      className={`inline-block w-[1px] h-3.5 my-auto bg-current opacity-20 mx-1.5 shrink-0 select-none pointer-events-none ${className}`}
    />
  );
};

export const ButtonGroup: React.FC<ButtonGroupProps> & {
  Separator: typeof Separator;
} = ({
  variant = 'secondary',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  isDisabled = false,
  className = '',
  children,
  ...props
}) => {
  const contextValue = {
    variant,
    size,
    orientation,
    fullWidth,
    isDisabled,
    isInGroup: true,
  };

  const isVertical = orientation === 'vertical';

  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <div
        role="group"
        className={`
          inline-flex
          ${isVertical ? 'flex-col' : 'flex-row items-center'}
          ${fullWidth ? 'w-full' : ''}
          isolate
          rounded-lg
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
};

ButtonGroup.Separator = Separator;
ButtonGroup.displayName = 'ButtonGroup';
