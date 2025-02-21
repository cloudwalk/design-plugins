import React from 'react';
import { IconBaseProps, IconSize, IconMetadata } from './types';

/**
 * Default properties for all icons
 * Following the Figma design system specifications
 */
export const defaultProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
} as const;

/**
 * Maps icon size variants to pixel values
 * Follows Tailwind's size scale
 */
export const sizeMap: Record<Exclude<IconSize, number>, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

/**
 * Converts size variant to pixel value
 */
export const getIconSize = (size: IconSize): number => {
  if (typeof size === 'number') return size;
  return sizeMap[size];
};

/**
 * Sends a message to the Figma plugin
 */
export const sendToFigma = (type: string, payload: unknown): void => {
  parent.postMessage({ pluginMessage: { type, payload } }, '*');
};

/**
 * Creates metadata for icon synchronization
 */
export const createIconMetadata = (
  name: string, 
  category: string, 
  variant: 'filled' | 'outlined' = 'outlined'
): IconMetadata => ({
  name: name as IconMetadata['name'],
  category: category as IconMetadata['category'],
  variant,
  figmaComponent: `icon/${name.toLowerCase()}/${variant}`
});

/**
 * Creates a reusable icon component from SVG path data
 * @param path - SVG path data string or object containing multiple paths
 * @param customStrokeWidth - Optional custom stroke width for the icon
 * @param metadata - Optional metadata for Figma integration
 * @returns A memoized React component that renders the icon
 * 
 * @example
 * // Single path icon
 * const UserIcon = createIcon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z");
 * 
 * // Multiple paths icon with metadata
 * const ComplexIcon = createIcon(
 *   {
 *     body: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z",
 *     decoration: "M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
 *   },
 *   2,
 *   createIconMetadata('User', 'interface')
 * );
 */
export const createIcon = (
  path: string | { [key: string]: string }, 
  customStrokeWidth?: number,
  metadata?: IconMetadata
) => {
  const IconComponent = React.memo(React.forwardRef<SVGSVGElement, IconBaseProps>((props, ref) => {
    const finalStrokeWidth = customStrokeWidth || props.strokeWidth || defaultProps.strokeWidth;
    const allProps = { 
      ...defaultProps, 
      ...props, 
      strokeWidth: finalStrokeWidth,
      className: `inline-block align-middle ${props.className || ''}`.trim(),
      ref 
    };

    // Add Figma metadata if available
    if (metadata) {
      Object.assign(allProps, {
        'data-figma-component': metadata.figmaComponent,
        'data-icon-name': metadata.name,
        'data-icon-category': metadata.category,
        'data-icon-variant': metadata.variant
      });
    }

    if (typeof path === 'string') {
      return React.createElement('svg', allProps, 
        React.createElement('path', { d: path })
      );
    }

    return React.createElement('svg', allProps,
      Object.entries(path).map(([key, d]) => 
        React.createElement('path', { key, d })
      )
    );
  }));

  IconComponent.displayName = metadata?.name || 'Icon';
  return IconComponent;
};