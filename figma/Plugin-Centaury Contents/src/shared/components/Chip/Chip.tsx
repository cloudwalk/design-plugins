import React from 'react';
import styles from './Chip.module.css';

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Text label to display in the chip */
  label: string;
  /** Whether the chip is in selected state */
  isSelected?: boolean;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional variant style */
  variant?: 'default' | 'primary' | 'secondary';
  /** Optional data attribute for Figma */
  'data-figma-component'?: string;
}

/**
 * Chip component for selections and filters
 * 
 * @example
 * // Basic usage
 * <Chip label="Filter" />
 * 
 * // Selected state with icon
 * <Chip 
 *   label="Active"
 *   isSelected
 *   icon={<Icon name="Check" size="sm" />}
 * />
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(({
  label,
  isSelected = false,
  icon,
  size = 'md',
  variant = 'default',
  className = '',
  'data-figma-component': figmaComponent,
  ...props
}, ref) => {
  // Combine classes based on props
  const chipClasses = [
    styles.chip,
    styles[size],
    styles[variant],
    isSelected ? styles.selected : styles.default,
    className
  ].filter(Boolean).join(' ');

  const textClass = isSelected ? styles.selectedText : styles.defaultText;

  // Prepare Figma metadata
  const figmaMetadata = {
    'data-figma-component': figmaComponent || `chip/${variant}/${size}`,
    'data-chip-selected': isSelected,
    'data-chip-variant': variant,
    'data-chip-size': size
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-pressed={isSelected}
      className={chipClasses}
      {...figmaMetadata}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={`${styles.label} ${textClass}`}>
        {label}
      </span>
    </button>
  );
});

Chip.displayName = 'Chip';
