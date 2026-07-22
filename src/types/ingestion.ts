import { WorkloadMix, ProcessingPattern, TeamSkillset, QuickInputs, AdvancedInputs } from './assessment';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  file: File;
  contentMarkdown?: string;
  pageCount?: number;
  status: 'pending' | 'converting' | 'converted' | 'error';
  errorMessage?: string;
}

export interface ExtractedField<T> {
  value: T | null;
  confidence: number; // 0 to 100
  sourceDoc: string;
  pageOrSlide: string;
  quote: string;
  status: 'pending' | 'accepted' | 'edited' | 'rejected';
  userEditedValue?: T;
}

export interface ConflictOption<T> {
  value: T;
  sourceDoc: string;
  pageOrSlide: string;
  quote: string;
  confidence: number;
}

export interface FieldConflict<T> {
  fieldKey: string;
  fieldLabel: string;
  options: ConflictOption<T>[];
  resolvedValue?: T;
}

export interface ExtractedQuickInputs {
  dataVolumeGB: ExtractedField<number>;
  concurrentUsers: ExtractedField<number>;
  workloadMix: ExtractedField<WorkloadMix>;
  processingPattern: ExtractedField<ProcessingPattern>;
  teamSkillset: ExtractedField<TeamSkillset>;
}

export interface ExtractedAdvancedInputs {
  databasesCount?: ExtractedField<number>;
  schemasCount?: ExtractedField<number>;
  tablesCount?: ExtractedField<number>;
  storedProceduresCount?: ExtractedField<number>;
  sqlViewsCount?: ExtractedField<number>;

  excelFilesDaily?: ExtractedField<number>;
  csvFilesDaily?: ExtractedField<number>;
  jsonFilesDaily?: ExtractedField<number>;
  xmlFilesDaily?: ExtractedField<number>;
  avgFileSizeMB?: ExtractedField<number>;
  largestFileSizeMB?: ExtractedField<number>;

  reportsCount?: ExtractedField<number>;
  semanticModelsCount?: ExtractedField<number>;
  datasetSizeGB?: ExtractedField<number>;

  etlPipelinesCount?: ExtractedField<number>;
  sparkJobsCount?: ExtractedField<number>;
  notebooksCount?: ExtractedField<number>;
  dataFactoryPipelinesCount?: ExtractedField<number>;

  mlWorkloadsCount?: ExtractedField<number>;
  totalStorageGB?: ExtractedField<number>;

  fabricConnectors?: string[];
}

export interface DocumentExtractionResult {
  quickAssessment: ExtractedQuickInputs;
  advancedAssessment: ExtractedAdvancedInputs;
  conflicts: FieldConflict<any>[];
  missingFields: string[];
  rawMergedMarkdown: string;
}
