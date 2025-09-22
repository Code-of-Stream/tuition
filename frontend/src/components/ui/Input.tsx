import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

type InputVariant = 'default' | 'error' | 'success' | 'warning';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
}

const variantStyles: Record<InputVariant, string> = {
  default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'py-1.5 px-2.5 text-sm',
  md: 'py-2 px-3',
  lg: 'py-3 px-4 text-lg',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      helperTextClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputVariant = error ? 'error' : variant;
    const inputId = id || React.useId();
    const showError = !!error;
    const showHelperText = helperText || showError;

    return (
      <div className={twMerge('space-y-1', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={twMerge(
              'block text-sm font-medium text-gray-700 dark:text-gray-300',
              labelClassName
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              'block w-full rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white',
              'placeholder-gray-400 focus:outline-none sm:text-sm',
              variantStyles[inputVariant],
              sizeStyles[size],
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon || showError ? 'pr-10' : 'pr-3',
              props.disabled && 'opacity-60 cursor-not-allowed',
              inputClassName,
              className
            )}
            aria-invalid={showError}
            aria-describedby={showError ? `${inputId}-error` : undefined}
            {...props}
          />

          {showError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}

          {!showError && rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>

        {showHelperText && (
          <p
            className={twMerge(
              'mt-1 text-sm',
              showError
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400',
              helperTextClassName
            )}
            id={showError ? `${inputId}-error` : `${inputId}-description`}
          >
            {showError ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps, InputVariant, InputSize };
