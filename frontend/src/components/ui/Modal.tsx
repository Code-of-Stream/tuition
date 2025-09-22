import React, { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is requested to close */
  onClose: () => void;
  /** Modal title */
  title?: string | React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Show/hide the close button */
  showCloseButton?: boolean;
  /** Custom class name for the modal container */
  className?: string;
  /** Custom class name for the modal content */
  contentClassName?: string;
  /** Custom class name for the header */
  headerClassName?: string;
  /** Custom class name for the body */
  bodyClassName?: string;
  /** Custom class name for the footer */
  footerClassName?: string;
  /** Modal footer content */
  footer?: React.ReactNode;
  /** Show/hide the footer */
  showFooter?: boolean;
  /** Modal size */
  size?: ModalSize;
  /** Modal position */
  position?: ModalPosition;
  /** Close the modal when clicking outside */
  closeOnOverlayClick?: boolean;
  /** Close the modal when pressing the escape key */
  closeOnEsc?: boolean;
  /** Show/hide the overlay */
  showOverlay?: boolean;
  /** Custom overlay class name */
  overlayClassName?: string;
  /** Enable/disable scrolling on the body when modal is open */
  disableBodyScroll?: boolean;
  /** Custom styles for the modal */
  style?: React.CSSProperties;
  /** ID for the modal */
  id?: string;
  /** ARIA label for the modal */
  ariaLabel?: string;
  /** Role attribute for the modal */
  role?: string;
  /** Show/hide the header */
  showHeader?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom close icon */
  closeIcon?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const positionClasses: Record<ModalPosition, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-4 sm:pt-10',
  bottom: 'items-end justify-center pb-4 sm:pb-10',
  left: 'items-center justify-start',
  right: 'items-center justify-end',
};

/**
 * A flexible and accessible modal/dialog component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  showFooter = false,
  size = 'md',
  position = 'center',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showOverlay = true,
  overlayClassName = 'bg-black bg-opacity-50',
  disableBodyScroll = true,
  style,
  id,
  ariaLabel = 'Modal',
  role = 'dialog',
  showHeader = true,
  headerComponent,
  closeIcon = <XMarkIcon className="h-5 w-5" />,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOverlayClick &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, closeOnOverlayClick]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (disableBodyScroll) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      if (disableBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, disableBodyScroll]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${showOverlay ? overlayClassName : ''} ${
        positionClasses[position]
      } flex min-h-screen px-4 py-10 sm:px-6 lg:px-8`}
      role={role}
      aria-modal="true"
      aria-labelledby={id ? `${id}-title` : undefined}
      aria-describedby={id ? `${id}-description` : undefined}
    >
      <div
        ref={modalRef}
        className={twMerge(
          'relative w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all',
          sizeClasses[size],
          className
        )}
        style={style}
      >
        {/* Header */}
        {showHeader && (
          <div
            className={twMerge(
              'flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4',
              headerClassName
            )}
          >
            {headerComponent || (
              <>
                <h3
                  id={id ? `${id}-title` : undefined}
                  className="text-lg font-medium text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
                {showCloseButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close"
                  >
                    {closeIcon}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Body */}
        <div
          id={id ? `${id}-description` : undefined}
          className={twMerge('p-4', bodyClassName)}
        >
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div
            className={twMerge(
              'border-t border-gray-200 dark:border-gray-700 p-4',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
