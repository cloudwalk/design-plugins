/**
 * @file Icon System Entry Point
 * This file exports all icons and types from the design system
 */

// Re-export all icons
export { Icon } from './Icon';
export type { IconProps } from './Icon';

// Interface icons
export { 
  User,
  Email,
  Phone,
  Document,
  Building,
  Text
} from './interface';

// DateTime icons
export {
  Calendar,
  Clock,
  WeekDays,
  Month
} from './datetime';

// Payment icons
export {
  CreditCard,
  Currency,
  Lock
} from './payment';

// Export base types
export type { IconName, IconBaseProps } from './types';

// Export utilities
export { createIcon } from './utils'; 