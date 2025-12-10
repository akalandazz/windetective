// Re-export all types for easy importing
export type {
  // API Types
  VinReportRequest,
  ProviderData,
  BackendReportResponse,
  CarReport,
  ExecutiveSummary,
  ReportSection,
  SectionData,
  MaintenanceData,
  MaintenanceRecord,
  AccidentData,
  AccidentReport,
  OwnershipData,
  OwnershipRecord,
  RecallData,
  RecallRecord,
  TitleData,
  TitleRecord,
  InsuranceData,
  InsuranceClaim,
  ReportMetadata,
  DataSource,
  ApiResponse,
  ApiError,
  ReportState,
  ChartDataPoint,
  ChartConfig,
  ReportFilters,
  SearchResult
} from './api';

export type {
  // Component Props Types
  VinInputProps,
  LoadingStateProps,
  ReportDisplayProps,
  ExecutiveSummaryProps,
  ReportSectionProps,
  StatusBadgeProps,
  ProgressBarProps,
  ChartProps,
  SkeletonProps,
  ErrorBoundaryProps,
  ModalProps,
  TooltipProps,
  AccordionProps,
  AccordionItem,
  
  // Form Types
  VinFormData,
  VinFormErrors,
  FormFieldProps,
  InputProps,
  ButtonProps,
  
  // Layout Types
  LayoutProps,
  ContainerProps,
  SidebarProps,
  SidebarSection,
  
  // Navigation Types
  BreadcrumbProps,
  BreadcrumbItem,
  TabsProps,
  TabItem,
  
  // Data Display Types
  DataTableProps,
  TableColumn,
  PaginationConfig,
  SortingConfig,
  StatsCardProps,
  TimelineProps,
  TimelineItem,
  
  // Utility Types
  ThemeConfig,
  ResponsiveValue,
  MediaQuery,
  AccessibilityProps,
  AnimationConfig,
  TransitionProps
} from './components';

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Brand types for better type safety
export type VIN = string & { _brand: 'VIN' };
export type DateString = string & { _brand: 'DateString' };
export type Percentage = number & { _brand: 'Percentage' }; // 0-100
export type Confidence = number & { _brand: 'Confidence' }; // 0-1

// Event handler types
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

// Generic response wrapper
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Async state types
export type AsyncState<T> = {
  data?: T;
  loading: boolean;
  error?: string;
  lastFetched?: Date;
};

// Color and theme types
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Spacing = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '12' | '16' | '20' | '24';