import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';

interface ToastProps {
  /** The message to display in the toast */
  message: string;
  /** The title of the toast */
  title?: string;
  /** The variant of the toast */
  variant?: ToastVariant;
  /** Whether the toast is visible */
  isOpen?: boolean;
  /** Callback when the toast is closed */
  onClose?: () => void;
  /** Duration in milliseconds before the toast auto-dismisses (0 to disable) */
  duration?: number;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Position of the toast */
  position?: ToastPosition;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the title */
  showTitle?: boolean;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-50 border-green-100',
  error: 'bg-red-50 border-red-100',
  warning: 'bg-yellow-50 border-yellow-100',
  info: 'bg-blue-50 border-blue-100',
};

const iconVariants: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
  error: <XCircleIcon className="h-5 w-5 text-red-400" />,
  warning: <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
};

const textColors: Record<ToastVariant, string> = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800',
};

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
};

/**
 * A toast notification component
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  title,
  variant = 'info',
  isOpen = true,
  onClose,
  duration = 5000,
  showCloseButton = true,
  icon,
  className = '',
  position = 'top-right',
  showIcon = true,
  showTitle = true,
}) => {
  const [visible, setVisible] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  // Handle auto-dismiss
  useEffect(() => {
    setVisible(isOpen);
    
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    if (onClose) {
      setIsExiting(true);
      // Wait for the exit animation to complete before calling onClose
      setTimeout(() => {
        setVisible(false);
        onClose();
        setIsExiting(false);
      }, 300);
    } else {
      setVisible(false);
    }
  };

  if (!visible) return null;

  const toastIcon = icon || iconVariants[variant];

  return (
    <div
      className={twMerge(
        'fixed z-50 max-w-sm w-full sm:w-96 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform',
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        positionStyles[position],
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={twMerge(
        'p-4 border rounded-lg',
        variantStyles[variant],
        textColors[variant]
      )}>
        <div className="flex items-start">
          {showIcon && (
            <div className="flex-shrink-0 pt-0.5">
              {toastIcon}
            </div>
          )}
          <div className="ml-3 w-0 flex-1">
            {showTitle && (title || variant) && (
              <p className="text-sm font-medium">
                {title || variant.charAt(0).toUpperCase() + variant.slice(1)}
              </p>
            )}
            <p className="mt-1 text-sm">
              {message}
            </p>
          </div>
          {showCloseButton && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={handleClose}
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Toast container component to manage multiple toasts
 */
interface ToastContainerProps {
  /** Position of the toasts */
  position?: ToastPosition;
  /** Maximum number of toasts to show */
  maxToasts?: number;
  /** Whether to show the newest toast on top */
  newestOnTop?: boolean;
  /** Custom class name */
  className?: string;
}

interface ToastItem extends Omit<ToastProps, 'isOpen' | 'onClose'> {
  id: string;
}

export const ToastContainer: React.FC<ToastContainerProps> & {
  show: (props: Omit<ToastProps, 'isOpen'>) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
} = ({
  position = 'top-right',
  maxToasts = 5,
  newestOnTop = true,
  className = '',
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const addToast = (toast: Omit<ToastProps, 'isOpen'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prevToasts) => {
      const newToasts = newestOnTop 
        ? [{ ...toast, id }, ...prevToasts]
        : [...prevToasts, { ...toast, id }];
      
      // Limit the number of toasts
      return newToasts.slice(0, maxToasts);
    });

    // Return a function to remove the toast
    return () => removeToast(id);
  };

  // Add static methods to ToastContainer
  ToastContainer.show = (props) => {
    return addToast(props);
  };

  ToastContainer.success = (message, title = 'Success', duration = 5000) => {
    return addToast({ message, title, variant: 'success', duration });
  };

  ToastContainer.error = (message, title = 'Error', duration = 5000) => {
    return addToast({ message, title, variant: 'error', duration });
  };

  ToastContainer.warning = (message, title = 'Warning', duration = 5000) => {
    return addToast({ message, title, variant: 'warning', duration });
  };

  ToastContainer.info = (message, title = 'Info', duration = 5000) => {
    return addToast({ message, title, variant: 'info', duration });
  };

  // Calculate the offset for each toast based on position
  const getToastStyle = (index: number) => {
    if (position.includes('top')) {
      return { top: `${index * 70 + 20}px` };
    }
    return { bottom: `${index * 70 + 20}px` };
  };

  return (
    <div className={twMerge('fixed z-50', className)}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="absolute"
          style={getToastStyle(index)}
        >
          <Toast
            {...toast}
            isOpen={true}
            onClose={() => removeToast(toast.id)}
            position={position}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;
