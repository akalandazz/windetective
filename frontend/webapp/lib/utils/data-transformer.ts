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
    console.error('Backend returned error in report_data:', backendResponse.report_data.error);
    throw new Error(`Report generation failed: ${backendResponse.report_data.error}`);
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
        date: acc.date ? new Date(acc.date) : new Date(),
        severity: acc.severity || 'minor',
        damageType: acc.damage_type || acc.damageType || [],
        estimatedCost: acc.estimated_cost || acc.estimatedCost,
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
      ownershipHistory: data.ownership_history?.owners?.map((owner: any, index: number) => ({
        ownerNumber: index + 1,
        duration: owner.duration,
        location: owner.location,
        endReason: owner.end_reason || undefined,
        mileageStart: owner.mileage_start || undefined,
        mileageEnd: owner.mileage_end || undefined,
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
        recallNumber: recall.recall_number || recall.number || `RECALL-${Math.random().toString(36).substr(2, 9)}`,
        date: recall.date ? new Date(recall.date) : new Date(),
        component: recall.component || 'Unknown',
        description: recall.description || 'No description available',
        severity: recall.severity || 'other',
        status: recall.status || 'unknown',
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
        date: claim.date ? new Date(claim.date) : new Date(),
        claimType: claim.claim_type || claim.type || 'Unknown',
        amount: claim.amount,
        severity: claim.severity || 'minor',
        description: claim.description || 'No description available',
      })) || [],
    },
  });

  return sections;
};


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