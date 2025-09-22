import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { CardContent } from './CardContent';
import { CardDescription } from './CardDescription';
import { CardFooter } from './CardFooter';
import { CardHeader } from './CardHeader';
import { CardTitle } from './CardTitle';

type CardVariant = 'default' | 'outline' | 'elevated' | 'filled';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Card title */
  title?: string | ReactNode;
  /** Card description */
  description?: string | ReactNode;
  /** Custom class name */
  className?: string;
  /** Card variant */
  variant?: CardVariant;
  /** Card size */
  size?: CardSize;
  /** Show loading state */
  loading?: boolean;
  /** Show header border */
  headerBorder?: boolean;
  /** Show footer border */
  footerBorder?: boolean;
  /** Card footer content */
  footer?: ReactNode;
  /** Card header actions */
  actions?: ReactNode;
  /** Card click handler */
  onClick?: () => void;
  /** Show hover effect */
  hoverable?: boolean;
  /** Show shadow */
  shadow?: boolean;
  /** Show border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Show full height */
  fullHeight?: boolean;
  /** Card header class name */
  headerClassName?: string;
  /** Card body class name */
  bodyClassName?: string;
  /** Card footer class name */
  footerClassName?: string;
  /** Show divider between header and body */
  divider?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  outline: 'bg-transparent border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-md',
  filled: 'bg-gray-50 dark:bg-gray-700',
};

const sizeStyles: Record<CardSize, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const headerSizeStyles: Record<CardSize, string> = {
  sm: 'px-4 py-3',
  md: 'px-6 py-4',
  lg: 'px-8 py-6',
};

const footerSizeStyles: Record<CardSize, string> = {
  sm: 'px-4 py-3',
  md: 'px-6 py-4',
  lg: 'px-8 py-6',
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * A flexible and reusable Card component
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  className = '',
  variant = 'default',
  size = 'md',
  loading = false,
  headerBorder = true,
  footerBorder = true,
  footer,
  actions,
  onClick,
  hoverable = false,
  shadow = true,
  rounded = 'lg',
  fullHeight = false,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  divider = false,
}) => {
  const hasHeader = !!title || !!description || !!actions;
  const hasFooter = !!footer;

  const cardClasses = twMerge(
    'overflow-hidden transition-all duration-200',
    variantStyles[variant],
    sizeStyles[size],
    roundedStyles[rounded],
    shadow && 'shadow-sm',
    hoverable && 'hover:shadow-md hover:-translate-y-0.5',
    fullHeight && 'h-full flex flex-col',
    className
  );

  const headerClasses = twMerge(
    'flex items-center justify-between',
    headerBorder && 'border-b border-gray-200 dark:border-gray-700',
    headerSizeStyles[size],
    headerClassName
  );

  const bodyClasses = twMerge(
    'flex-1',
    divider && hasHeader && 'border-t border-gray-200 dark:border-gray-700',
    bodyClassName
  );

  const footerClasses = twMerge(
    'bg-gray-50 dark:bg-gray-800/50',
    footerBorder && 'border-t border-gray-200 dark:border-gray-700',
    footerSizeStyles[size],
    footerClassName
  );

  const renderHeader = () => {
    if (!hasHeader) return null;

    return (
      <div className={headerClasses}>
        <div>
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    );
  };

  const renderBody = () => (
    <div className={bodyClasses}>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );

  const renderFooter = () => {
    if (!hasFooter) return null;
    return <div className={footerClasses}>{footer}</div>;
  };

  const cardContent = (
    <>
      {renderHeader()}
      {renderBody()}
      {renderFooter()}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={twMerge('text-left w-full', cardClasses)}
        onClick={onClick}
      >
        {cardContent}
      </button>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
};

export { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
};

export type { CardProps, CardVariant, CardSize };
