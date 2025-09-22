import React from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'outline'
  | 'subtle';

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The visual style of the badge */
  variant?: BadgeVariant;
  /** The size of the badge */
  size?: BadgeSize;
  /** Whether to show a dot before the badge content */
  withDot?: boolean;
  /** Custom dot color (overrides variant color) */
  dotColor?: string;
  /** Whether the badge should be rounded full */
  roundedFull?: boolean;
  /** Custom class name */
  className?: string;
  /** Whether the badge is interactive (hover/active states) */
  interactive?: boolean;
  /** Whether the badge should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether to show a close button */
  onClose?: () => void;
  /** Custom close button */
  closeButton?: React.ReactNode;
  /** Custom close button class name */
  closeButtonClassName?: string;
  /** Whether the badge is selected */
  selected?: boolean;
  /** Whether the badge is disabled */
  disabled?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  outline: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  subtle: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const dotSizeClasses: Record<BadgeSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

const dotMarginClasses: Record<BadgeSize, string> = {
  xs: 'mr-1',
  sm: 'mr-1.5',
  md: 'mr-1.5',
  lg: 'mr-2',
};

const closeButtonClasses: Record<BadgeSize, string> = {
  xs: 'ml-0.5 -mr-0.5',
  sm: 'ml-1 -mr-0.5',
  md: 'ml-1 -mr-1',
  lg: 'ml-1.5 -mr-1',
};

/**
 * A versatile badge component for displaying status, tags, and other small pieces of information
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      withDot = false,
      dotColor,
      roundedFull = true,
      className = '',
      interactive = false,
      fullWidth = false,
      onClose,
      closeButton,
      closeButtonClassName = '',
      selected = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const dotClass = twMerge(
      'inline-block rounded-full',
      dotSizeClasses[size],
      dotMarginClasses[size],
      dotColor || variantClasses[variant].split(' ')[0],
      dotColor ? '' : 'opacity-80'
    );

    const badgeClasses = twMerge(
      'inline-flex items-center font-medium whitespace-nowrap',
      variantClasses[variant],
      sizeClasses[size],
      roundedFull ? 'rounded-full' : 'rounded-md',
      interactive && 'hover:opacity-90 active:opacity-100 cursor-pointer transition-opacity',
      fullWidth && 'w-full justify-center',
      selected && 'ring-2 ring-offset-1 ring-current',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    );

    const renderCloseButton = () => {
      if (!onClose && !closeButton) return null;
      
      if (closeButton) {
        return (
          <span 
            className={twMerge('inline-flex items-center', closeButtonClasses[size], closeButtonClassName)}
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          >
            {closeButton}
          </span>
        );
      }

      return (
        <button
          type="button"
          className={twMerge(
            'inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-current',
            closeButtonClasses[size],
            closeButtonClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          disabled={disabled}
          aria-label="Remove"
        >
          <svg
            className={twMerge(
              'h-3 w-3',
              size === 'lg' && 'h-3.5 w-3.5',
              disabled ? 'opacity-50' : 'opacity-70 hover:opacity-100'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      );
    };

    return (
      <span
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {withDot && <span className={dotClass} aria-hidden="true" />}
        {children}
        {(onClose || closeButton) && renderCloseButton()}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
