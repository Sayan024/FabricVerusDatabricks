export type WorkloadMix = 'bi_only' | 'bi_eng' | 'bi_eng_ml';
export type ProcessingPattern = 'batch' | 'hourly' | 'near_realtime';
export type TeamSkillset =
  | 'sql_powerbi'
  | 'python_spark'
  | 'dotnet_csharp'
  | 'scala_spark'
  | 'dbt_snowflake'
  | 'r_statistics'
  | 'mixed';

export type RegionId =
  | 'central_india'
  | 'south_india'
  | 'west_india'
  | 'us_east'
  | 'us_east_2'
  | 'us_west'
  | 'us_west_2'
  | 'us_central'
  | 'uk_south'
  | 'europe_west'
  | 'europe_north'
  | 'southeast_asia'
  | 'east_asia'
  | 'japan_east'
  | 'australia_east'
  | 'uae_north'
  | 'brazil_south'
  | 'canada_central';

export interface QuickInputs {
  dataVolumeGB: number;
  concurrentUsers: number;
  workloadMix: WorkloadMix;
  processingPattern: ProcessingPattern;
  teamSkillset: TeamSkillset;
  region: RegionId;
}

export interface AdvancedInputs {
  databasesCount?: number;
  schemasCount?: number;
  tablesCount?: number;
  storedProceduresCount?: number;
  sqlViewsCount?: number;

  excelFilesDaily?: number;
  csvFilesDaily?: number;
  jsonFilesDaily?: number;
  xmlFilesDaily?: number;
  avgFileSizeMB?: number;
  largestFileSizeMB?: number;

  reportsCount?: number;
  semanticModelsCount?: number;
  datasetSizeGB?: number;
  directLake?: boolean;
  directQuery?: boolean;
  importMode?: boolean;
  incrementalRefresh?: boolean;

  etlPipelinesCount?: number;
  sparkJobsCount?: number;
  notebooksCount?: number;
  dataFactoryPipelinesCount?: number;

  mlWorkloadsCount?: number;
  gpuUsage?: boolean;

  totalStorageGB?: number;
  bronzeLayerGB?: number;
  silverLayerGB?: number;
  goldLayerGB?: number;
  retentionMonths?: number;
  monthlyStorageGrowthGB?: number;
}

export interface GranularCostBreakdown {
  computeCost: number;
  storageCost: number;
  warehouseOrVmsCost: number;
  powerBiOrUnityText: string;
  totalCost: number;
  formattedCompute: string;
  formattedStorage: string;
  formattedWarehouseOrVms: string;
  formattedTotal: string;
}

export interface DecisionBadges {
  pros: string[];
  cons: string[];
}

export interface PlatformAssessment {
  platform: 'Microsoft Fabric' | 'Azure Databricks';
  monthlyCostRange: { low: number; high: number };
  annualCostRange: { low: number; high: number };
  formattedMonthlyCost: string;
  formattedAnnualCost: string;
  suggestedSKU: string;
  confidenceScore: number;
  confidenceReason: string;
  primaryCostDriver: string;
  sizingReason: string;
  keyAssumptions: string[];
  strengths: string[];
  risks: string[];
  dbuUsage?: string;
  clusterSize?: string;

  // $100K+ Enterprise Additions
  platformScore: number;
  matchPercentage: number;
  granularCosts: GranularCostBreakdown;
  decisionBadges: DecisionBadges;
}

export interface DimensionComparison {
  dimension: string;
  fabricRating: string;
  databricksRating: string;
  verdict: 'Fabric' | 'Databricks' | 'Tie';
  fabricTrafficLight: 'green' | 'yellow' | 'red';
  databricksTrafficLight: 'green' | 'yellow' | 'red';
  notes: string;
}

export interface MigrationTimeline {
  difficulty: 'Low' | 'Medium' | 'High';
  scoreBar: string;
  durationWeeks: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  estimatedHours: number;
}

export interface ExecutiveKPIs {
  formattedCost: string;
  suggestedSKU: string;
  confidenceScore: number;
  migrationDifficulty: string;
  estimatedDuration: string;
  potentialSavings: string;
}

export interface ExecutiveRecommendation {
  recommendedPlatform: 'Microsoft Fabric' | 'Azure Databricks' | 'Tie';
  confidenceScore: number;
  matchPercentage: number;
  executiveSummary: string;
  whySelected: string[];
  whyNotChosen: string[];
  whenMightChange: string[];
  kpis: ExecutiveKPIs;
  migrationTimeline: MigrationTimeline;
}

export interface OptimizationSuggestion {
  category: string;
  platform: 'Microsoft Fabric' | 'Azure Databricks' | 'Both';
  title: string;
  potentialSavings: string;
  description: string;
  actionableSteps: string[];
}

export interface AssessmentResult {
  fabric: PlatformAssessment;
  databricks: PlatformAssessment;
  comparisons: DimensionComparison[];
  recommendation: ExecutiveRecommendation;
  optimizations: OptimizationSuggestion[];
  pricingDate: string;
}
