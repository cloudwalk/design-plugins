import React, { useRef, useEffect } from 'react';
import styles from './Chip.module.css';

export interface ChipContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show scroll buttons when content overflows */
  showScrollButtons?: boolean;
  /** Whether to auto scroll to selected chip */
  autoScrollToSelected?: boolean;
  /** Optional data attribute for Figma */
  'data-figma-component'?: string;
}

/**
 * Container component for Chip components
 * Handles horizontal scrolling and chip organization
 * 
 * @example
 * <ChipContainer showScrollButtons>
 *   <Chip label="Option 1" />
 *   <Chip label="Option 2" isSelected />
 * </ChipContainer>
 */
export const ChipContainer = React.forwardRef<HTMLDivElement, ChipContainerProps>(({
  className = '',
  showScrollButtons = false,
  autoScrollToSelected = true,
  'data-figma-component': figmaComponent,
  children,
  ...props
}, forwardedRef) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle auto-scroll to selected chip
  useEffect(() => {
    if (autoScrollToSelected && scrollRef.current) {
      const selectedChip = scrollRef.current.querySelector('[aria-selected="true"]');
      if (selectedChip) {
        selectedChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [children, autoScrollToSelected]);

  // Prepare Figma metadata
  const figmaMetadata = {
    'data-figma-component': figmaComponent || 'chip-container',
    'data-show-scroll': showScrollButtons,
    'data-auto-scroll': autoScrollToSelected
  };

  return (
    <div
      ref={forwardedRef}
      className={styles.containerWrapper}
      role="tablist"
      {...figmaMetadata}
    >
      {showScrollButtons && (
        <button
          className={styles.scrollButton}
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
            }
          }}
          aria-label="Scroll left"
        >
          ←
        </button>
      )}
      
      <div
        ref={scrollRef}
        className={`${styles.container} ${className}`}
        {...props}
      >
        {children}
      </div>

      {showScrollButtons && (
        <button
          className={styles.scrollButton}
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
            }
          }}
          aria-label="Scroll right"
        >
          →
        </button>
      )}
    </div>
  );
});

ChipContainer.displayName = 'ChipContainer'; 