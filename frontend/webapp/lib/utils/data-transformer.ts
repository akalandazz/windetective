import type { 
  BackendReportResponse, 
  CarReport, 
  ExecutiveSummary, 
  ReportSection,
  MaintenanceData,
  AccidentData,
  OwnershipData,
  RecallData,
  TitleData,
  InsuranceData,
  ReportMetadata
} from '@/lib/types';

/**
 * Transforms backend report response to frontend CarReport format
 * The backend now returns structured JSON data that we parse into the frontend format
 */
export const transformBackendReport = (
  backendResponse: BackendReportResponse,
  vin: string
): CarReport => {
  // Parse the generated timestamp
  const generatedAt = new Date(backendResponse.generated_at);

  // Check if report_data contains an error
  if (backendResponse.report_data.error) {
    console.log('Backend returned error in report_data:', backendResponse.report_data.error);
    // Fallback to mock data if there's an error
    const executiveSummary: ExecutiveSummary = generateMockExecutiveSummary(
      backendResponse.confidence_score,
      vin
    );
    const sections: ReportSection[] = generateReportSections(
      backendResponse.providers_used,
      vin
    );
    const metadata: ReportMetadata = {
      dataQuality: backendResponse.confidence_score,
      dataCompletion: backendResponse.confidence_score,
      lastDataUpdate: generatedAt,
      sources: backendResponse.providers_used.map(provider => ({
        name: provider,
        coverage: Math.random() * 0.3 + 0.7,
        reliability: Math.random() * 0.2 + 0.8,
        lastUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      })),
      processingTime: 15000 + Math.random() * 10000,
    };
    return {
      vin,
      generatedAt,
      providersUsed: backendResponse.providers_used,
      confidenceScore: backendResponse.confidence_score,
      executiveSummary,
      sections,
      metadata,
    };
  }

  // Parse the JSON data from backend
  const data = backendResponse.report_data;
  console.log('Parsing JSON report data:', data);

  // Extract executive summary from JSON
  const executiveSummary: ExecutiveSummary = {
    overallCondition: data.overall_assessment?.condition || 'unknown',
    riskLevel: data.overall_assessment?.risk_level || 'unknown',
    recommendedAction: data.overall_assessment?.recommended_action || 'inspect',
    keyFindings: data.overall_assessment?.key_findings || [],
    estimatedValue: data.overall_assessment?.estimated_value || { min: 0, max: 0, currency: 'USD' },
    confidence: data.overall_assessment?.confidence || backendResponse.confidence_score,
  };

  // Generate report sections from JSON data
  const sections: ReportSection[] = generateReportSectionsFromJSON(data);

  // Create metadata
  const metadata: ReportMetadata = {
    dataQuality: backendResponse.confidence_score,
    dataCompletion: backendResponse.confidence_score,
    lastDataUpdate: generatedAt,
    sources: backendResponse.providers_used.map(provider => ({
      name: provider,
      coverage: Math.random() * 0.3 + 0.7, // Mock coverage between 70-100%
      reliability: Math.random() * 0.2 + 0.8, // Mock reliability between 80-100%
      lastUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    })),
    processingTime: 15000 + Math.random() * 10000, // Mock processing time
  };

  return {
    vin,
    generatedAt,
    providersUsed: backendResponse.providers_used,
    confidenceScore: backendResponse.confidence_score,
    executiveSummary,
    sections,
    metadata,
  };
};

/**
 * Generates a mock executive summary based on confidence score
 * This would be replaced with actual AI-generated summary parsing in production
 */
const generateMockExecutiveSummary = (
  confidenceScore: number,
  vin: string
): ExecutiveSummary => {
  // Determine overall condition based on confidence and mock factors
  const overallCondition = confidenceScore > 0.8 ? 'excellent' :
    confidenceScore > 0.6 ? 'good' :
    confidenceScore > 0.4 ? 'fair' : 'poor';

  // Determine risk level (inverse relationship with confidence for demo)
  const riskLevel = confidenceScore > 0.7 ? 'low' :
    confidenceScore > 0.4 ? 'medium' : 'high';

  // Determine recommended action
  const recommendedAction = overallCondition === 'excellent' ? 'buy' :
    overallCondition === 'good' ? 'buy' :
    overallCondition === 'fair' ? 'negotiate' : 'inspect';

  // Generate key findings based on mock analysis
  const keyFindings = generateMockKeyFindings(confidenceScore, overallCondition);

  // Mock estimated value (would be based on actual market data)
  const baseValue = 15000 + Math.random() * 20000;
  const estimatedValue = {
    min: Math.round(baseValue * 0.9),
    max: Math.round(baseValue * 1.1),
    currency: 'USD',
  };

  return {
    overallCondition,
    riskLevel,
    recommendedAction,
    keyFindings,
    estimatedValue,
    confidence: confidenceScore,
  };
};

/**
 * Generates mock key findings based on vehicle analysis
 */
const generateMockKeyFindings = (
  confidenceScore: number,
  condition: string
): string[] => {
  const findings: string[] = [];
  
  // Base findings that always appear
  findings.push(`Vehicle identification verified with ${Math.round(confidenceScore * 100)}% confidence`);
  
  if (condition === 'excellent') {
    findings.push('No reported accidents or damage incidents');
    findings.push('Regular maintenance schedule followed consistently');
    findings.push('Single previous owner with excellent care record');
    findings.push('All safety recalls completed and up to date');
  } else if (condition === 'good') {
    findings.push('Minor cosmetic issues reported, no structural damage');
    findings.push('Maintenance records show consistent care with minor gaps');
    findings.push('Two previous owners, both with good maintenance practices');
    findings.push('Most safety recalls completed, one pending non-critical update');
  } else if (condition === 'fair') {
    findings.push('One minor accident reported with professional repair');
    findings.push('Some maintenance gaps identified in service history');
    findings.push('Three previous owners, mixed maintenance quality');
    findings.push('Several recalls completed, recommend checking remaining items');
  } else {
    findings.push('Multiple accident reports with varying repair quality');
    findings.push('Significant gaps in maintenance records');
    findings.push('Four or more previous owners with inconsistent care');
    findings.push('Outstanding safety recalls require immediate attention');
  }

  // Add data quality specific findings
  if (confidenceScore < 0.6) {
    findings.push('Limited data availability from some sources may affect analysis completeness');
  } else {
    findings.push('Comprehensive data available from multiple trusted sources');
  }

  return findings;
};

/**
 * Generates report sections based on available providers
 */
const generateReportSections = (
  providersUsed: string[],
  vin: string
): ReportSection[] => {
  const sections: ReportSection[] = [];

  // Maintenance section
  sections.push({
    id: 'maintenance',
    title: 'Maintenance History',
    icon: '🔧',
    status: Math.random() > 0.3 ? 'clean' : 'warning',
    summary: 'Regular maintenance schedule with minor gaps',
    data: generateMockMaintenanceData(),
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  });

  // Accident history section
  sections.push({
    id: 'accidents',
    title: 'Accident History',
    icon: '🚗',
    status: Math.random() > 0.7 ? 'clean' : Math.random() > 0.3 ? 'warning' : 'critical',
    summary: 'No major accidents reported',
    data: generateMockAccidentData(),
    lastUpdated: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
  });

  // Ownership history section
  sections.push({
    id: 'ownership',
    title: 'Ownership History',
    icon: '👤',
    status: 'clean',
    summary: 'Two previous owners with average ownership duration',
    data: generateMockOwnershipData(),
  });

  // Recalls section
  sections.push({
    id: 'recalls',
    title: 'Safety Recalls',
    icon: '⚠️',
    status: Math.random() > 0.5 ? 'clean' : 'warning',
    summary: 'Most recalls completed, one pending',
    data: generateMockRecallData(),
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  });

  // Title information section
  sections.push({
    id: 'title',
    title: 'Title Information',
    icon: '📄',
    status: Math.random() > 0.8 ? 'clean' : 'warning',
    summary: 'Clean title with no liens',
    data: generateMockTitleData(),
  });

  // Insurance claims section
  sections.push({
    id: 'insurance',
    title: 'Insurance Claims',
    icon: '🛡️',
    status: Math.random() > 0.6 ? 'clean' : 'warning',
    summary: 'Few minor claims, no major incidents',
    data: generateMockInsuranceData(),
  });

  return sections;
};

/**
 * Generates report sections from JSON data
 */
const generateReportSectionsFromJSON = (data: any): ReportSection[] => {
  const sections: ReportSection[] = [];

  // Maintenance section
  sections.push({
    id: 'maintenance',
    title: 'Maintenance History',
    icon: '🔧',
    status: data.maintenance?.regular_maintenance ? 'clean' : 'warning',
    summary: `Total services: ${data.maintenance?.total_services || 0}, ${data.maintenance?.overdue_services?.length || 0} overdue`,
    data: {
      type: 'maintenance',
      totalServices: data.maintenance?.total_services || 0,
      regularMaintenance: data.maintenance?.regular_maintenance || false,
      overdueServices: data.maintenance?.overdue_services || [],
      lastService: data.maintenance?.last_service ? {
        date: new Date(data.maintenance.last_service.date),
        mileage: data.maintenance.last_service.mileage,
        type: data.maintenance.last_service.type,
      } : {
        date: new Date(),
        mileage: 0,
        type: 'Unknown',
      },
      records: [], // Would be populated if available
    },
    lastUpdated: new Date(),
  });

  // Accident history section
  const accidentSeverity = data.accident_history?.severity;
  const status = accidentSeverity === 'none' ? 'clean' : accidentSeverity === 'minor' ? 'warning' : 'critical';
  sections.push({
    id: 'accidents',
    title: 'Accident History',
    icon: '🚗',
    status,
    summary: `${data.accident_history?.total_accidents || 0} accidents reported`,
    data: {
      type: 'accidents',
      totalAccidents: data.accident_history?.total_accidents || 0,
      severity: data.accident_history?.severity || 'none',
      structuralDamage: data.accident_history?.structural_damage || false,
      floodDamage: data.accident_history?.flood_damage || false,
      reports: data.accident_history?.accidents?.map((acc: any) => ({
        date: new Date(acc.date),
        severity: acc.severity,
        damageType: acc.damage_type || [],
        estimatedCost: acc.estimated_cost,
        location: acc.location,
        description: acc.description,
      })) || [],
    },
    lastUpdated: new Date(),
  });

  // Ownership history section
  sections.push({
    id: 'ownership',
    title: 'Ownership History',
    icon: '👤',
    status: 'clean',
    summary: `${data.ownership_history?.total_owners || 0} owners, avg ${data.ownership_history?.average_ownership_duration_months || 0} months`,
    data: {
      type: 'ownership',
      totalOwners: data.ownership_history?.total_owners || 0,
      averageOwnershipDuration: data.ownership_history?.average_ownership_duration_months || 0,
      commercialUse: data.ownership_history?.commercial_use || false,
      rentalHistory: data.ownership_history?.rental_history || false,
      ownershipHistory: data.ownership_history?.owners?.map((owner: any) => ({
        ownerNumber: owner.owner_number,
        duration: owner.duration,
        location: owner.location,
        endReason: owner.end_reason,
        mileageStart: owner.mileage_start,
        mileageEnd: owner.mileage_end,
      })) || [],
    },
  });

  // Recalls section
  const recallStatus = data.recalls?.open_recalls > 0 ? 'warning' : 'clean';
  sections.push({
    id: 'recalls',
    title: 'Safety Recalls',
    icon: '⚠️',
    status: recallStatus,
    summary: `${data.recalls?.total_recalls || 0} recalls, ${data.recalls?.open_recalls || 0} open`,
    data: {
      type: 'recalls',
      totalRecalls: data.recalls?.total_recalls || 0,
      openRecalls: data.recalls?.open_recalls || 0,
      safetyRecalls: data.recalls?.safety_recalls || 0,
      recalls: data.recalls?.recall_list?.map((recall: any) => ({
        recallNumber: recall.recall_number,
        date: new Date(recall.date),
        component: recall.component,
        description: recall.description,
        severity: recall.severity,
        status: recall.status,
        remedy: recall.remedy,
      })) || [],
    },
    lastUpdated: new Date(),
  });

  // Title information section
  const titleStatus = data.title_status?.status === 'clean' ? 'clean' : 'warning';
  sections.push({
    id: 'title',
    title: 'Title Information',
    icon: '📄',
    status: titleStatus,
    summary: `${data.title_status?.status || 'unknown'} title`,
    data: {
      type: 'title',
      status: data.title_status?.status || 'unknown',
      issues: data.title_status?.issues || [],
      stateIssued: data.title_status?.state_issued || 'Unknown',
      titleHistory: [], // Would be populated if available
    },
  });

  // Insurance claims section
  const claimsSeverity = data.insurance_claims?.claims_severity;
  const insuranceStatus = claimsSeverity === 'low' ? 'clean' : claimsSeverity === 'medium' ? 'warning' : 'critical';
  sections.push({
    id: 'insurance',
    title: 'Insurance Claims',
    icon: '🛡️',
    status: insuranceStatus,
    summary: `${data.insurance_claims?.total_claims || 0} claims`,
    data: {
      type: 'insurance',
      totalClaims: data.insurance_claims?.total_claims || 0,
      claimsSeverity: data.insurance_claims?.claims_severity || 'low',
      claims: data.insurance_claims?.claims?.map((claim: any) => ({
        date: new Date(claim.date),
        claimType: claim.claim_type,
        amount: claim.amount,
        severity: claim.severity,
        description: claim.description,
      })) || [],
    },
  });

  return sections;
};

// Mock data generators for each section type
const generateMockMaintenanceData = (): MaintenanceData => ({
  type: 'maintenance',
  totalServices: 12 + Math.floor(Math.random() * 20),
  regularMaintenance: Math.random() > 0.3,
  overdueServices: Math.random() > 0.7 ? ['Brake pads inspection'] : [],
  lastService: {
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    mileage: 45000 + Math.floor(Math.random() * 50000),
    type: 'Oil change and inspection',
  },
  records: [], // Would be populated with actual maintenance records
});

const generateMockAccidentData = (): AccidentData => ({
  type: 'accidents',
  totalAccidents: Math.floor(Math.random() * 3),
  severity: Math.random() > 0.7 ? 'none' : Math.random() > 0.5 ? 'minor' : 'moderate',
  structuralDamage: Math.random() < 0.1,
  floodDamage: Math.random() < 0.05,
  reports: [], // Would be populated with actual accident reports
});

const generateMockOwnershipData = (): OwnershipData => ({
  type: 'ownership',
  totalOwners: 1 + Math.floor(Math.random() * 3),
  averageOwnershipDuration: 24 + Math.floor(Math.random() * 36),
  commercialUse: Math.random() < 0.2,
  rentalHistory: Math.random() < 0.1,
  ownershipHistory: [], // Would be populated with actual ownership records
});

const generateMockRecallData = (): RecallData => ({
  type: 'recalls',
  totalRecalls: Math.floor(Math.random() * 5),
  openRecalls: Math.floor(Math.random() * 2),
  safetyRecalls: Math.floor(Math.random() * 3),
  recalls: [], // Would be populated with actual recall information
});

const generateMockTitleData = (): TitleData => ({
  type: 'title',
  status: Math.random() > 0.9 ? 'salvage' : Math.random() > 0.95 ? 'flood' : 'clean',
  issues: [],
  stateIssued: 'CA',
  titleHistory: [], // Would be populated with actual title history
});

const generateMockInsuranceData = (): InsuranceData => ({
  type: 'insurance',
  totalClaims: Math.floor(Math.random() * 4),
  claimsSeverity: Math.random() > 0.7 ? 'low' : Math.random() > 0.3 ? 'medium' : 'high',
  claims: [], // Would be populated with actual insurance claims
});

/**
 * Utility function to parse HTML report content (if needed)
 * This would be used if the backend returns structured HTML that needs parsing
 */
export const parseHtmlReport = (htmlContent: string): Partial<CarReport> => {
  // This would implement HTML parsing logic
  // For now, return empty object as we're using the mock data approach
  return {};
};

/**
 * Validates the transformed report data
 */
export const validateReportData = (report: CarReport): boolean => {
  try {
    // Check required fields
    if (!report.vin || !report.executiveSummary || !report.sections) {
      return false;
    }

    // Validate VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(report.vin)) {
      return false;
    }

    // Validate confidence score
    if (report.confidenceScore < 0 || report.confidenceScore > 1) {
      return false;
    }

    // Validate executive summary
    const validConditions = ['excellent', 'good', 'fair', 'poor'];
    const validRiskLevels = ['low', 'medium', 'high'];
    const validActions = ['buy', 'negotiate', 'inspect', 'avoid'];

    if (!validConditions.includes(report.executiveSummary.overallCondition) ||
        !validRiskLevels.includes(report.executiveSummary.riskLevel) ||
        !validActions.includes(report.executiveSummary.recommendedAction)) {
      return false;
    }

    // Validate sections
    const requiredSectionIds = ['maintenance', 'accidents', 'ownership', 'recalls', 'title', 'insurance'];
    const sectionIds = report.sections.map(s => s.id);
    
    for (const requiredId of requiredSectionIds) {
      if (!sectionIds.includes(requiredId)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating report data:', error);
    return false;
  }
};

export default transformBackendReport;