import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

type TextareaVariant = 'default' | 'error' | 'success' | 'warning';
type TextareaSize = 'sm' | 'md' | 'lg';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: TextareaVariant;
  size?: TextareaSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  helperTextClassName?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const variantStyles: Record<TextareaVariant, string> = {
  default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'py-1.5 px-2.5 text-sm',
  md: 'py-2 px-3',
  lg: 'py-3 px-4 text-lg',
};

const resizeStyles: Record<NonNullable<TextareaProps['resize']>, string> = {
  none: 'resize-none',
  both: 'resize',
  horizontal: 'resize-x',
  vertical: 'resize-y',
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      leftIcon,
      className = '',
      containerClassName = '',
      labelClassName = '',
      textareaClassName = '',
      helperTextClassName = '',
      resize = 'vertical',
      id,
      rows = 3,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const textareaVariant = error ? 'error' : variant;
    const textareaId = id || React.useId();
    const showError = !!error;
    const showHelperText = helperText || showError;

    return (
      <div className={twMerge('space-y-1', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
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
            <div className="absolute top-3 left-3 text-gray-500">
              {leftIcon}
            </div>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            className={twMerge(
              'block w-full rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white',
              'focus:outline-none sm:text-sm',
              variantStyles[textareaVariant],
              sizeStyles[size],
              resizeStyles[resize],
              leftIcon ? 'pl-10' : 'pl-3',
              showError ? 'pr-10' : 'pr-3',
              disabled && 'opacity-60 cursor-not-allowed',
              textareaClassName,
              className
            )}
            aria-invalid={showError}
            aria-describedby={showError ? `${textareaId}-error` : undefined}
            {...props}
          />

          {showError && (
            <div className="absolute top-3 right-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
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
            id={showError ? `${textareaId}-error` : `${textareaId}-description`}
          >
            {showError ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps, TextareaVariant, TextareaSize };
