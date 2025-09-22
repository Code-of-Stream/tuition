import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';
import { Select } from './Select';

type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to show page size selector */
  showPageSizeOptions?: boolean;
  /** Whether to show total count */
  showTotal?: boolean;
  /** Custom class name */
  className?: string;
  /** Size of the pagination */
  size?: PaginationSize;
  /** Whether to show first/last page buttons */
  showFirstLastButtons?: boolean;
  /** Whether to show previous/next page buttons */
  showPrevNextButtons?: boolean;
  /** Whether to show page numbers */
  showPageNumbers?: boolean;
  /** Number of page numbers to show before and after current page */
  siblingCount?: number;
  /** Whether the pagination is disabled */
  disabled?: boolean;
  /** Whether to show ellipsis */
  showEllipsis?: boolean;
  /** Custom previous button text */
  previousButtonText?: string;
  /** Custom next button text */
  nextButtonText?: string;
  /** Custom first page button text */
  firstButtonText?: string;
  /** Custom last page button text */
  lastButtonText?: string;
  /** Custom page size select label */
  pageSizeLabel?: string;
  /** Custom total count text */
  totalText?: (total: number, range: [number, number]) => string;
}

const sizeClasses: Record<PaginationSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const buttonSizeClasses: Record<PaginationSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

/**
 * A customizable pagination component
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeOptions = true,
  showTotal = true,
  className = '',
  size = 'md',
  showFirstLastButtons = true,
  showPrevNextButtons = true,
  showPageNumbers = true,
  siblingCount = 1,
  disabled = false,
  showEllipsis = true,
  previousButtonText = 'Previous',
  nextButtonText = 'Next',
  firstButtonText = 'First',
  lastButtonText = 'Last',
  pageSizeLabel = 'per page',
  totalText = (total, [start, end]) => `${start}-${end} of ${total} items`,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Calculate the range of page numbers to display
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const paginationRange = React.useMemo(() => {
    // Total number of page numbers to show is: first + last + current + 2*DOTS + 2*siblingCount
    const totalPageNumbers = 5 + 2 * siblingCount;

    // If total pages is less than the page numbers we want to show, return the range [1..totalPages]
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 1: No left dots to show, but right dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    // Case 2: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    // Case 3: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return range(1, totalPages);
  }, [totalPages, currentPage, siblingCount]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled) {
      return;
    }
    onPageChange(page);
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
    // Reset to first page when page size changes
    onPageChange(1);
  };

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // If there are no items, don't show pagination
  if (totalItems <= 0) {
    return null;
  }

  return (
    <div className={twMerge('flex flex-col sm:flex-row items-center justify-between gap-4', sizeClasses[size], className)}>
      {showTotal && (
        <div className="text-gray-600 dark:text-gray-400">
          {totalText(totalItems, [startItem, endItem])}
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {/* First page button */}
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(1)}
            disabled={disabled || currentPage === 1}
            className={buttonSizeClasses[size]}
            aria-label="First page"
            title={firstButtonText}
          >
            «
          </Button>
        )}
        
        {/* Previous page button */}
        {showPrevNextButtons && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={buttonSizeClasses[size]}
            aria-label="Previous page"
            title={previousButtonText}
          >
            ‹
          </Button>
        )}
        
        {/* Page numbers */}
        {showPageNumbers && paginationRange.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <span 
                key={`ellipsis-${index}`} 
                className="flex items-center justify-center px-2"
              >
                ...
              </span>
            );
          }
          
          const isCurrent = pageNumber === currentPage;
          
          return (
            <Button
              key={pageNumber}
              variant={isCurrent ? 'primary' : 'outline'}
              size={size}
              onClick={() => handlePageChange(pageNumber as number)}
              disabled={disabled}
              className={twMerge(
                buttonSizeClasses[size],
                isCurrent ? 'font-semibold' : ''
              )}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${pageNumber}`}
            >
              {pageNumber}
            </Button>
          );
        })}
        
        {/* Next page button */}
        {showPrevNextButtons && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage >= totalPages}
            className={buttonSizeClasses[size]}
            aria-label="Next page"
            title={nextButtonText}
          >
            ›
          </Button>
        )}
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || currentPage >= totalPages}
            className={buttonSizeClasses[size]}
            aria-label="Last page"
            title={lastButtonText}
          >
            »
          </Button>
        )}
      </div>
      
      {/* Page size selector */}
      {showPageSizeOptions && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">{pageSizeLabel}</span>
          <Select
            value={pageSize.toString()}
            onChange={handlePageSizeChange}
            options={pageSizeOptions.map(size => ({
              value: size.toString(),
              label: size.toString(),
            }))}
            size={size}
            disabled={disabled}
            className="w-20"
            aria-label="Items per page"
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;
