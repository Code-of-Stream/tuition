import React, { forwardRef, InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type CheckboxVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** The label text for the checkbox */
  label?: string | React.ReactNode;
  /** The position of the label relative to the checkbox */
  labelPosition?: 'left' | 'right';
  /** The variant of the checkbox */
  variant?: CheckboxVariant;
  /** The size of the checkbox */
  size?: CheckboxSize;
  /** Whether the checkbox is in an error state */
  error?: boolean | string;
  /** Custom class name for the container */
  containerClassName?: string;
  /** Custom class name for the input */
  inputClassName?: string;
  /** Custom class name for the label */
  labelClassName?: string;
  /** Whether to show an error message */
  showError?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Whether the checkbox is indeterminate */
  indeterminate?: boolean;
}

const variantClasses: Record<CheckboxVariant, string> = {
  primary: 'text-primary-600 focus:ring-primary-500 border-gray-300',
  secondary: 'text-secondary-600 focus:ring-secondary-500 border-gray-300',
  success: 'text-green-600 focus:ring-green-500 border-gray-300',
  danger: 'text-red-600 focus:ring-red-500 border-gray-300',
  warning: 'text-yellow-600 focus:ring-yellow-500 border-gray-300',
  info: 'text-blue-600 focus:ring-blue-500 border-gray-300',
};

const sizeClasses: Record<CheckboxSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const labelSizeClasses: Record<CheckboxSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * A customizable checkbox component
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
  {
    label,
    labelPosition = 'right',
    variant = 'primary',
    size = 'md',
    className = '',
    containerClassName = '',
    inputClassName = '',
    labelClassName = '',
    error = false,
    showError = true,
    errorMessage,
    disabled = false,
    indeterminate = false,
    ...props
  },
  ref
) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isError = !!error;
  const errorText = typeof error === 'string' ? error : errorMessage;

  // Handle indeterminate state
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // Combine refs
  React.useImperativeHandle(ref, () => ({
    ...(inputRef.current as HTMLInputElement),
  }));

  const checkbox = (
    <input
      type="checkbox"
      ref={inputRef}
      className={twMerge(
        'rounded border-gray-300 focus:ring-2',
        variantClasses[variant],
        sizeClasses[size],
        isError && 'border-red-500 text-red-600 focus:ring-red-500',
        disabled && 'opacity-50 cursor-not-allowed',
        inputClassName,
        className
      )}
      disabled={disabled}
      aria-invalid={isError ? 'true' : undefined}
      aria-describedby={isError ? `${props.id}-error` : undefined}
      {...props}
    />
  );

  return (
    <div className={twMerge('space-y-1', containerClassName)}>
      <label
        className={twMerge(
          'inline-flex items-center',
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
          labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {checkbox}
        {label && (
          <span
            className={twMerge(
              labelPosition === 'left' ? 'mr-2' : 'ml-2',
              labelSizeClasses[size],
              'text-gray-700 dark:text-gray-300',
              labelClassName
            )}
          >
            {label}
          </span>
        )}
      </label>
      {isError && showError && errorText && (
        <p
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          id={`${props.id}-error`}
        >
          {errorText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps, CheckboxVariant, CheckboxSize };
