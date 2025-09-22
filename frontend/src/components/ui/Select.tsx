import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

type SelectVariant = 'default' | 'error' | 'success' | 'warning';
type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  options: SelectOption[];
  leftIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  helperTextClassName?: string;
}

const variantStyles: Record<SelectVariant, string> = {
  default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

const sizeStyles: Record<SelectSize, string> = {
  sm: 'py-1.5 px-2.5 text-sm',
  md: 'py-2 px-3',
  lg: 'py-3 px-4 text-lg',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      options,
      leftIcon,
      className = '',
      containerClassName = '',
      labelClassName = '',
      selectClassName = '',
      helperTextClassName = '',
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const selectVariant = error ? 'error' : variant;
    const selectId = id || React.useId();
    const showError = !!error;
    const showHelperText = helperText || showError;

    return (
      <div className={twMerge('space-y-1', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={twMerge(
              'block text-sm font-medium text-gray-700 dark:text-gray-300',
              labelClassName
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={twMerge(
              'block w-full rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white',
              'focus:outline-none sm:text-sm',
              variantStyles[selectVariant],
              sizeStyles[size],
              leftIcon ? 'pl-10' : 'pl-3',
              showError ? 'pr-10' : 'pr-3',
              disabled && 'opacity-60 cursor-not-allowed',
              'appearance-none',
              selectClassName,
              className
            )}
            aria-invalid={showError}
            aria-describedby={showError ? `${selectId}-error` : undefined}
            {...props}
          >
            {props.placeholder && (
              <option value="" disabled>
                {props.placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="dark:bg-gray-800"
              >
                {option.label}
              </option>
            ))}
          </select>

          {showError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}

          {!showError && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
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
            id={showError ? `${selectId}-error` : `${selectId}-description`}
          >
            {showError ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectVariant, SelectSize, SelectOption };
