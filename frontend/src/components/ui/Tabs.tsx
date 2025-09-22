import React, { ReactNode, useState, Children, cloneElement, isValidElement } from 'react';
import { twMerge } from 'tailwind-merge';

type TabVariant = 'underline' | 'pills' | 'cards' | 'segmented';
type TabSize = 'sm' | 'md' | 'lg';
type TabPosition = 'start' | 'center' | 'end' | 'stretch';

interface TabsProps {
  /** The active tab index (controlled) */
  activeTab?: number;
  /** Callback when the active tab changes */
  onChange?: (index: number) => void;
  /** The default active tab index (uncontrolled) */
  defaultIndex?: number;
  /** The variant of the tabs */
  variant?: TabVariant;
  /** The size of the tabs */
  size?: TabSize;
  /** The position of the tabs */
  position?: TabPosition;
  /** Whether the tabs are full width */
  fullWidth?: boolean;
  /** Custom class name for the tabs container */
  className?: string;
  /** Custom class name for the tab list */
  tabListClassName?: string;
  /** Custom class name for the tab */
  tabClassName?: string;
  /** Custom class name for the active tab */
  activeTabClassName?: string;
  /** Custom class name for the tab panel */
  panelClassName?: string;
  /** Whether to keep the tab panels mounted when not active */
  keepMounted?: boolean;
  /** The children of the tabs component */
  children: ReactNode;
  /** Whether to disable all tabs */
  disabled?: boolean;
  /** Whether to use the manual activation mode */
  manual?: boolean;
  /** The orientation of the tabs */
  orientation?: 'horizontal' | 'vertical';
  /** The color scheme of the tabs */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

interface TabProps {
  /** The label of the tab */
  label: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** The icon to display before the label */
  icon?: ReactNode;
  /** The badge to display after the label */
  badge?: ReactNode;
  /** Custom class name for the tab */
  className?: string;
  /** Custom class name for the tab panel */
  panelClassName?: string;
  /** Whether the tab panel should be lazy loaded */
  lazy?: boolean;
  /** Whether the tab panel is mounted */
  isMounted?: boolean;
  /** Whether the tab panel is active */
  isActive?: boolean;
  /** The index of the tab */
  index?: number;
  /** Callback when the tab is clicked */
  onClick?: () => void;
  /** Callback when a key is pressed on the tab */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** The children of the tab panel */
  children?: ReactNode;
}

const sizeClasses: Record<TabSize, string> = {
  sm: 'text-xs py-1.5 px-2',
  md: 'text-sm py-2 px-3',
  lg: 'text-base py-2.5 px-4',
};

const variantClasses: Record<TabVariant, string> = {
  underline: 'border-b-2 border-transparent',
  pills: 'rounded-md',
  cards: 'border border-transparent rounded-t-lg',
  segmented: 'rounded-md border',
};

const activeVariantClasses: Record<TabVariant, string> = {
  underline: 'border-current text-current',
  pills: 'bg-gray-100 dark:bg-gray-700 text-current',
  cards: 'bg-white dark:bg-gray-800 border-b-0 text-current',
  segmented: 'bg-white dark:bg-gray-800 shadow-sm text-current',
};

const positionClasses: Record<TabPosition, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  stretch: 'justify-stretch',
};

/**
 * A single tab component
 */
const Tab: React.FC<TabProps> = ({
  label,
  disabled = false,
  icon,
  badge,
  className = '',
  panelClassName = '',
  lazy = false,
  isMounted = false,
  isActive = false,
  index = 0,
  onClick,
  onKeyDown,
  children,
  ...rest
}) => {
  // If this is a tab panel, render the panel content
  if ('children' in rest) {
    if (lazy && !isMounted) return null;
    
    return (
      <div
        role="tabpanel"
        tabIndex={0}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        className={twMerge(
          'outline-none',
          !isActive && 'hidden',
          panelClassName
        )}
      >
        {children}
      </div>
    );
  }

  // Otherwise, render the tab button
  return (
    <button
      role="tab"
      id={`tab-${index}`}
      type="button"
      aria-selected={isActive}
      aria-controls={`tabpanel-${index}`}
      disabled={disabled}
      onClick={onClick}
      className={twMerge(
        'inline-flex items-center justify-center font-medium whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
        'transition-colors duration-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      tabIndex={disabled ? -1 : 0}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {badge && <span className="ml-2">{badge}</span>}
    </button>
  );
};

/**
 * A tabs component for organizing content into multiple panels
 */
const Tabs: React.FC<TabsProps> & { Tab: typeof Tab } = ({
  activeTab: controlledActiveTab,
  onChange,
  defaultIndex = 0,
  variant = 'underline',
  size = 'md',
  position = 'start',
  fullWidth = false,
  className = '',
  tabListClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  panelClassName = '',
  keepMounted = false,
  children,
  disabled = false,
  manual = false,
  orientation = 'horizontal',
  colorScheme = 'primary',
}) => {
  const isControlled = controlledActiveTab !== undefined;
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultIndex);
  const [mountedTabs, setMountedTabs] = useState<number[]>([defaultIndex]);
  
  const activeTab = isControlled ? controlledActiveTab : uncontrolledActiveTab;

  const handleTabChange = (index: number) => {
    if (disabled) return;
    
    if (!isControlled) {
      setUncontrolledActiveTab(index);
      
      // Keep track of mounted tabs for lazy loading
      if (keepMounted && !mountedTabs.includes(index)) {
        setMountedTabs([...mountedTabs, index]);
      }
    }
    
    onChange?.(index);
  };

  // Extract tab and panel children
  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.type === Tab || child.type === Tabs.Tab)
  ) as React.ReactElement<TabProps>[];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(index);
    } else if (e.key === 'ArrowRight' || (orientation === 'vertical' && e.key === 'ArrowDown')) {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      handleTabChange(nextIndex);
      // Focus the next tab
      const nextTab = document.getElementById(`tab-${nextIndex}`);
      nextTab?.focus();
    } else if (e.key === 'ArrowLeft' || (orientation === 'vertical' && e.key === 'ArrowUp')) {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      handleTabChange(prevIndex);
      // Focus the previous tab
      const prevTab = document.getElementById(`tab-${prevIndex}`);
      prevTab?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleTabChange(0);
      document.getElementById('tab-0')?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = tabs.length - 1;
      handleTabChange(lastIndex);
      document.getElementById(`tab-${lastIndex}`)?.focus();
    }
  };

  const tabListClasses = twMerge(
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    variant === 'segmented' ? 'p-1 bg-gray-100 dark:bg-gray-800 rounded-lg' : '',
    tabListClassName
  );

  const tabClasses = (isActive: boolean, index: number) => {
    const baseClasses = twMerge(
      sizeClasses[size],
      variantClasses[variant],
      isActive ? activeVariantClasses[variant] : '',
      isActive ? activeTabClassName : '',
      fullWidth && 'flex-1 text-center',
      tabClassName
    );

    // Add color scheme classes for active state
    if (isActive) {
      switch (colorScheme) {
        case 'primary':
          return twMerge(baseClasses, 'text-primary-600 dark:text-primary-400');
        case 'secondary':
          return twMerge(baseClasses, 'text-secondary-600 dark:text-secondary-400');
        case 'success':
          return twMerge(baseClasses, 'text-green-600 dark:text-green-400');
        case 'danger':
          return twMerge(baseClasses, 'text-red-600 dark:text-red-400');
        case 'warning':
          return twMerge(baseClasses, 'text-yellow-600 dark:text-yellow-400');
        case 'info':
          return twMerge(baseClasses, 'text-blue-600 dark:text-blue-400');
        default:
          return baseClasses;
      }
    }

    return baseClasses;
  };

  return (
    <div className={twMerge('w-full', className)}>
      <div
        role="tablist"
        aria-orientation={orientation}
        className={tabListClasses}
        style={{
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          justifyContent: positionClasses[position],
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          const { 
            label, 
            disabled: tabDisabled, 
            icon, 
            badge, 
            className: tabClass,
            ...restTabProps 
          } = tab.props;
          
          return (
            <Tab
              key={`tab-${index}`}
              label={label}
              icon={icon}
              badge={badge}
              disabled={disabled || tabDisabled}
              isActive={isActive}
              index={index}
              onClick={() => handleTabChange(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={tabClasses(isActive, index)}
              {...restTabProps}
            />
          );
        })}
      </div>
      
      <div className={panelClassName}>
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          const { children, lazy: tabLazy = false, panelClassName: tabPanelClass } = tab.props;
          const isMounted = keepMounted ? mountedTabs.includes(index) : isActive;
          
          return (
            <Tab
              key={`tabpanel-${index}`}
              label={tab.props.label}
              isActive={isActive}
              index={index}
              isMounted={isMounted}
              lazy={tabLazy}
              panelClassName={tabPanelClass}
            >
              {children}
            </Tab>
          );
        })}
      </div>
    </div>
  );
};

// Add Tab as a static property of Tabs
Tabs.Tab = Tab;

export { Tabs };
export type { TabsProps, TabProps, TabVariant, TabSize, TabPosition };
