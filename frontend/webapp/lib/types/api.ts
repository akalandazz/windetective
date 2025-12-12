// API Request Types
export interface VinReportRequest {
  vin: string;
}

// Task Status Enum
export enum TaskStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  SUCCESS = 'SUCCESS',
  COMPLETED = 'COMPLETED',
  FAILURE = 'FAILURE'
}

// Celery Task Types for Asynchronous Processing
export interface CeleryTask {
  id: string;
}

export interface ReportTaskResult {
  message: string;
  status: TaskStatus | 'REVOKED' | 'IN_PROGRESS';
  result?: BackendReportResponse;
}

// Report Data Structure (Placeholder)
export interface ReportData {
  vin: string;
  report_data: Record<string, any>;
  generated_at: string;
  providers_used: string[];
  confidence_score: number;
}

export interface PollingOptions {
  interval?: number; // Polling interval in ms
  timeout?: number; // Maximum polling time in ms
}

// Backend Response Types (matching Python models)
export interface ProviderData {
  provider_name: string;
  data: Record<string, any>;
  retrieved_at: string; // ISO date string
  status: 'success' | 'error' | 'partial';
}

export interface BackendReportResponse {
  vin: string;
  report_data: Record<string, any>;
  generated_at: string; // ISO date string
  providers_used: string[];
  confidence_score: number; // 0-1
}

// Enhanced Frontend Types for Better UX
export interface CarReport {
  vin: string;
  generatedAt: Date;
  providersUsed: string[];
  confidenceScore: number;
  executiveSummary: ExecutiveSummary;
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ExecutiveSummary {
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  riskLevel: 'low' | 'medium' | 'high';
  recommendedAction: 'buy' | 'negotiate' | 'inspect' | 'avoid';
  keyFindings: string[];
  estimatedValue: {
    min: number;
    max: number;
    currency: string;
  };
  confidence: number;
}

export interface ReportSection {
  id: string;
  title: string;
  icon: string;
  status: 'clean' | 'warning' | 'critical' | 'unavailable';
  summary: string;
  data: SectionData;
  lastUpdated?: Date;
}

export type SectionData =
  | VehicleData
  | MaintenanceData
  | AccidentData
  | OwnershipData
  | RecallData
  | TitleData
  | InsuranceData;

export interface VehicleData {
  type: 'vehicle';
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
}

export interface MaintenanceData {
  type: 'maintenance';
  totalServices: number;
  regularMaintenance: boolean;
  overdueServices: string[];
  lastService: {
    date: Date;
    mileage: number;
    type: string;
  };
  records: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  date: Date;
  mileage: number;
  serviceType: string;
  vendor: string;
  cost?: number;
  notes: string;
}

export interface AccidentData {
  type: 'accidents';
  totalAccidents: number;
  severity: 'none' | 'minor' | 'moderate' | 'severe';
  structuralDamage: boolean;
  floodDamage: boolean;
  reports: AccidentReport[];
}

export interface AccidentReport {
  date: Date;
  severity: 'minor' | 'moderate' | 'severe';
  damageType: string[];
  estimatedCost?: number;
  location?: string;
  description: string;
}

export interface OwnershipData {
  type: 'ownership';
  totalOwners: number;
  averageOwnershipDuration: number; // months
  commercialUse: boolean;
  rentalHistory: boolean;
  ownershipHistory: OwnershipRecord[];
}

export interface OwnershipRecord {
  ownerNumber: number;
  duration: number; // months
  location: string;
  endReason?: string;
  mileageStart?: number;
  mileageEnd?: number;
}

export interface RecallData {
  type: 'recalls';
  totalRecalls: number;
  openRecalls: number;
  safetyRecalls: number;
  recalls: RecallRecord[];
}

export interface RecallRecord {
  recallNumber: string;
  date: Date;
  component: string;
  description: string;
  severity: 'safety' | 'emissions' | 'other';
  status: 'open' | 'completed';
  remedy?: string;
}

export interface TitleData {
  type: 'title';
  status: 'clean' | 'salvage' | 'rebuilt' | 'flood' | 'lemon' | 'unknown';
  issues: string[];
  stateIssued: string;
  titleHistory: TitleRecord[];
}

export interface TitleRecord {
  date: Date;
  state: string;
  titleType: string;
  description?: string;
}

export interface InsuranceData {
  type: 'insurance';
  totalClaims: number;
  claimsSeverity: 'low' | 'medium' | 'high';
  claims: InsuranceClaim[];
}

export interface InsuranceClaim {
  date: Date;
  claimType: string;
  amount?: number;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
}

export interface ReportMetadata {
  dataQuality: number; // 0-1
  dataCompletion: number; // 0-1
  lastDataUpdate: Date;
  sources: DataSource[];
  processingTime: number; // milliseconds
}

export interface DataSource {
  name: string;
  coverage: number; // 0-1
  reliability: number; // 0-1
  lastUpdate: Date;
}

// API Response Wrapper Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Loading and State Types
export interface ReportState {
  status: 'idle' | 'validating' | 'starting' | 'processing' | 'polling' | 'completed' | 'error';
  progress: number; // 0-100
  estimatedTime?: number; // seconds
  currentStep?: string;
  error?: string;
  taskId?: string; // Add task ID tracking
}


// Chart and Visualization Types
export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
  category?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'timeline';
  title: string;
  data: ChartDataPoint[];
  xAxis?: string;
  yAxis?: string;
  color?: string;
}

// Filter and Search Types
export interface ReportFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  severity?: ('minor' | 'moderate' | 'severe')[];
  sections?: string[];
  dataQuality?: number;
}

export interface SearchResult {
  section: string;
  title: string;
  content: string;
  relevance: number;
  highlight?: string;
}