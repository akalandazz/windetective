import { ReactNode } from 'react';
import type { CarReport, ReportSection, ExecutiveSummary, ReportState, ChartConfig } from './api';

// Loading Step interface (used by LoadingStateProps)
export interface LoadingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
}

// Component Props Types
export interface VinInputProps {
  onSubmit: (vin: string) => void;
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

export interface LoadingStateProps {
  state: ReportState;
  steps?: LoadingStep[];
  onCancel?: () => void;
  className?: string;
}


export interface ReportDisplayProps {
  report: CarReport;
  onSectionSelect?: (sectionId: string) => void;
  selectedSection?: string;
  className?: string;
}

export interface ExecutiveSummaryProps {
  summary: ExecutiveSummary;
  onViewDetails?: () => void;
  expanded?: boolean;
  className?: string;
}

export interface ReportSectionProps {
  section: ReportSection;
  expanded?: boolean;
  onToggle?: () => void;
  showDetails?: boolean;
  className?: string;
}

export interface StatusBadgeProps {
  status: 'clean' | 'warning' | 'critical' | 'unavailable';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export interface ProgressBarProps {
  progress: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export interface ChartProps {
  config: ChartConfig;
  height?: number;
  responsive?: boolean;
  onDataPointClick?: (point: any) => void;
  className?: string;
}

export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  className?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenItems?: string[];
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  className?: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: string;
  disabled?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
}

// Form Types
export interface VinFormData {
  vin: string;
}

export interface VinFormErrors {
  vin?: string;
  general?: string;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
  children: ReactNode;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  pattern?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  'aria-label'?: string;
  className?: string;
}

// Layout Types
export interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  className?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sections: SidebarSection[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export interface SidebarSection {
  id: string;
  title: string;
  icon: string;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
  disabled?: boolean;
}

// Navigation Types
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
  disabled?: boolean;
}

// Data Display Types
export interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  onRowClick?: (row: any) => void;
  className?: string;
}

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => ReactNode;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface SortingConfig {
  field?: string;
  order?: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error';
  loading?: boolean;
  className?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  showConnectors?: boolean;
  className?: string;
}

export interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: 'completed' | 'current' | 'upcoming' | 'error';
  details?: ReactNode;
}

// Utility Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColors: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface ResponsiveValue<T> {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface MediaQuery {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-busy'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Animation Types
export interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface TransitionProps {
  show: boolean;
  children: ReactNode;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: number;
}