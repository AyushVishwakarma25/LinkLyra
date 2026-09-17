import { createContext, useContext } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupContextValue {
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation?: ButtonOrientation;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isInGroup?: boolean;
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue>({
  isInGroup: false,
});

export const useButtonGroup = () => useContext(ButtonGroupContext);
