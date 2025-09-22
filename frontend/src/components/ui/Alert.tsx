import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';
type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps {
  /** The main message to display */
  message: ReactNode;
  /** The title of the alert */
  title?: string;
  /** The variant of the alert */
  variant?: AlertVariant;
  /** The size of the alert */
  size?: AlertSize;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback when the alert is dismissed */
  onDismiss?: () => void;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Additional actions to display in the alert */
  actions?: ReactNode;
  /** Whether the alert should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether the alert is bordered */
  bordered?: boolean;
  /** Whether the alert has a solid background */
  solid?: boolean;
  /** Whether the alert is elevated */
  elevated?: boolean;
  /** Custom close button */
  closeButton?: ReactNode;
  /** Custom close button class name */
  closeButtonClassName?: string;
  /** Whether the alert is rounded */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const variantClasses: Record<AlertVariant, { bg: string; text: string; border: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
    icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
    icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
  },
};

const sizeClasses: Record<AlertSize, { padding: string; text: string; title: string }> = {
  sm: {
    padding: 'p-2',
    text: 'text-xs',
    title: 'text-sm font-medium',
  },
  md: {
    padding: 'p-3',
    text: 'text-sm',
    title: 'text-base font-medium',
  },
  lg: {
    padding: 'p-4',
    text: 'text-base',
    title: 'text-lg font-semibold',
  },
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * A flexible alert component for displaying important messages
 */
export const Alert: React.FC<AlertProps> = ({
  message,
  title,
  variant = 'info',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon,
  className = '',
  showIcon = true,
  actions,
  fullWidth = false,
  bordered = true,
  solid = false,
  elevated = false,
  closeButton,
  closeButtonClassName = '',
  rounded = 'md',
}) => {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  
  const alertClasses = twMerge(
    'relative flex',
    fullWidth ? 'w-full' : 'w-auto',
    bordered && `border ${variantClass.border}`,
    solid ? variantClass.bg.replace('50', '100').replace('900/30', '800') : variantClass.bg,
    sizeClass.padding,
    roundedClasses[rounded],
    elevated && 'shadow-md',
    className
  );

  const contentClasses = twMerge(
    'flex-1',
    sizeClass.text,
    variantClass.text
  );

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    onDismiss?.();
  };

  const renderCloseButton = () => {
    if (!dismissible) return null;

    if (closeButton) {
      return (
        <div 
          className={twMerge('ml-4 flex-shrink-0', closeButtonClassName)}
          onClick={handleDismiss}
        >
          {closeButton}
        </div>
      );
    }

    return (
      <button
        type="button"
        className={twMerge(
          'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
          'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400',
          closeButtonClassName
        )}
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    );
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    return (
      <div className="flex-shrink-0">
        {icon || variantClass.icon}
      </div>
    );
  };

  return (
    <div className={alertClasses} role="alert">
      {renderIcon()}
      <div className={twMerge('ml-3', showIcon ? 'ml-3' : '')}>
        {title && (
          <h3 className={twMerge(sizeClass.title, 'mb-1')}>
            {title}
          </h3>
        )}
        <div className={contentClasses}>
          {message}
        </div>
        {actions && (
          <div className="mt-3 flex space-x-3">
            {actions}
          </div>
        )}
      </div>
      {renderCloseButton()}
    </div>
  );
};

/**
 * A simple alert component with a more compact layout
 */
export const InlineAlert: React.FC<Omit<AlertProps, 'title' | 'size'>> = (props) => (
  <Alert 
    {...props} 
    size="sm" 
    showIcon={false} 
    className={twMerge(
      'inline-flex items-center',
      props.className
    )} 
  />
);

export default Alert;
