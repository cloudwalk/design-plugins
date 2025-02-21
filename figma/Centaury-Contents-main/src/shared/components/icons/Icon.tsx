import React, { forwardRef } from 'react';
import { IconBaseProps } from './types';

// Re-export all icons by category
import * as InterfaceIcons from './interface';
import * as DateTimeIcons from './datetime';
import * as PaymentIcons from './payment';

// Combine all icons
const Icons = {
  ...InterfaceIcons,
  ...DateTimeIcons,
  ...PaymentIcons
} as const;

// Icon names type
export type IconName = keyof typeof Icons;

// Icon component props
export interface IconProps extends Omit<IconBaseProps, 'size'> {
  /** Name of the icon from the design system */
  name: IconName;
  /** Size of the icon (in pixels) - defaults to 24 */
  size?: number;
  /** Additional Tailwind classes */
  className?: string;
  /** Whether the icon should spin */
  spin?: boolean;
  /** Whether the icon should pulse */
  pulse?: boolean;
  /** Custom color - overrides Tailwind text color */
  color?: string;
  /** Custom stroke width - defaults to 1.5 */
  strokeWidth?: number;
  /** Optional variant - filled or outlined */
  variant?: 'filled' | 'outlined';
  /** Optional data attribute for Figma */
  'data-figma-component'?: string;
}

/**
 * Universal icon component that renders any icon from the design system
 * Synchronized with Figma components for consistent design
 * 
 * @example
 * // Basic usage
 * <Icon name="User" />
 * 
 * // With custom size and color
 * <Icon name="Calendar" size={32} className="text-primary-500" />
 * 
 * // With animation
 * <Icon name="Clock" spin />
 * 
 * // With variant and Figma component name
 * <Icon 
 *   name="Lock" 
 *   variant="filled" 
 *   className="text-success-500"
 *   data-figma-component="icon/lock/filled" 
 * />
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(({
  name,
  size = 24,
  className = '',
  spin = false,
  pulse = false,
  variant = 'outlined',
  color,
  strokeWidth,
  style,
  'data-figma-component': figmaComponent,
  ...props
}, ref) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in design system`);
    return null;
  }

  const animationClass = spin ? 'animate-spin' : pulse ? 'animate-pulse' : '';
  const variantClass = variant === 'filled' ? 'fill-current' : 'fill-none';
  const combinedClassName = `${variantClass} ${className} ${animationClass}`.trim();

  // Prepare Figma metadata
  const figmaMetadata = {
    'data-figma-component': figmaComponent || `icon/${name.toLowerCase()}/${variant}`,
    'data-icon-name': name,
    'data-icon-variant': variant,
    'data-icon-size': size
  };

  return (
    <IconComponent
      ref={ref}
      width={size}
      height={size}
      className={combinedClassName}
      style={{ ...style, color: color }}
      strokeWidth={strokeWidth}
      {...figmaMetadata}
      {...props}
    />
  );
});
