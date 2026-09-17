import React from 'react';
import { HugeiconsIcon, HugeiconsIconProps } from '@hugeicons/react';

export interface HugeIconProps extends Omit<HugeiconsIconProps, 'icon'> {
  icon: any;
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

export const HugeIcon: React.FC<HugeIconProps> = ({
  icon,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => {
  if (!icon) return null;

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
};

export default HugeIcon;
