import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom class name */
  className?: string;
  /** Color of the spinner */
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'black';
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Show loading text */
  showText?: boolean;
  /** Custom loading text */
  text?: string;
  /** Text position */
  textPosition?: 'right' | 'bottom';
}

const sizeClasses = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-10 w-10 border-2',
  xl: 'h-12 w-12 border-2',
};

const colorClasses = {
  primary: 'border-primary-200 border-t-primary-600',
  secondary: 'border-secondary-200 border-t-secondary-600',
  white: 'border-gray-200 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
  black: 'border-gray-200 border-t-gray-900',
};

/**
 * A customizable loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'primary',
  fullScreen = false,
  showText = false,
  text = 'Loading...',
  textPosition = 'right',
}) => {
  const spinner = (
    <div
      className={twMerge(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
        {spinner}
        {showText && (
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (showText) {
    return (
      <div
        className={`inline-flex items-center ${
          textPosition === 'right' ? 'space-x-3' : 'flex-col space-y-2'
        }`}
      >
        {spinner}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {text}
        </span>
      </div>
    );
  }

  return spinner;
};

export { LoadingSpinner };
export default LoadingSpinner;
