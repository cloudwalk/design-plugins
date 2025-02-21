import { SVGProps } from 'react';

/**
 * Theme colors from Tailwind config
 * Keep in sync with tailwind.config.js
 */
export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'current';

/**
 * Plugin message types for Figma integration
 */
export type PluginMessageType = 
  | 'update-icon'
  | 'update-multiple-icons'
  | 'sync-with-figma'
  | 'export-to-figma';

/**
 * Plugin message structure
 */
export interface PluginMessage {
  type: PluginMessageType;
  payload: unknown;
}

/**
 * Base properties for all icon components
 * Extends SVG properties and adds custom icon-specific props
 */
export interface IconBaseProps extends SVGProps<SVGSVGElement> {
  /** Size of the icon (width and height) in pixels */
  size?: number;
  /** Theme color or custom color value */
  color?: ThemeColor | string;
  /** Custom stroke width (default: 1.5) */
  strokeWidth?: number;
  /** Tailwind CSS classes */
  className?: string;
  /** Optional Figma component reference */
  figmaRef?: string;
}

/**
 * Available icon categories in the design system
 * Keep this list synchronized with Figma components
 */
export type IconCategory = 'interface' | 'datetime' | 'payment';

/**
 * Available icon names in the design system
 * Organized by category for better maintainability
 */
export type IconName =
  // Interface icons
  | 'User'
  | 'Email'
  | 'Phone'
  | 'Document'
  | 'Building'
  // DateTime icons
  | 'Calendar'
  | 'Clock'
  | 'WeekDays'
  | 'Month'
  // Payment icons
  | 'Currency'
  | 'CreditCard'
  | 'Lock';

/**
 * Icon size variants
 * Follows Tailwind's size scale
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/**
 * Icon metadata for Figma sync
 */
export interface IconMetadata {
  name: IconName;
  category: IconCategory;
  variant: 'filled' | 'outlined';
  figmaComponent?: string;
}
