import { ReactNode } from 'react';
import type { ReportState, ChartConfig, ExecutiveSummary } from './api';

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

export interface LoadingOverlayProps {
  isVisible: boolean;
  state: ReportState;
  onCancel?: () => void;
  className?: string;
}

export interface ExecutiveSummaryProps {
  summary: ExecutiveSummary;
  onViewDetails?: () => void;
  expanded?: boolean;
  className?: string;
}

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

export interface ChartProps {
  config: ChartConfig;
  height?: number;
  responsive?: boolean;
  onDataPointClick?: (point: any) => void;
  className?: string;
}