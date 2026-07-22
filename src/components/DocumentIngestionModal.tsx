import React, { useState, useRef } from 'react';
import { UploadedFile, DocumentExtractionResult, ExtractedField } from '../types/ingestion';
import { convertFileToMarkdown } from '../services/docConverter';
import { buildMasterProjectContext } from '../services/projectContextBuilder';
import { extractWorkloadFromMarkdown } from '../services/documentExtractionEngine';
import { QuickInputs, AdvancedInputs } from '../types/assessment';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  Check,
  Edit2,
  FileCheck,
  ArrowRight,
  RefreshCw,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface DocumentIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAssessment: (quick: QuickInputs, advanced: AdvancedInputs, extractedDocText?: string) => void;
}

export const DocumentIngestionModal: React.FC<DocumentIngestionModalProps> = ({
  isOpen,
  onClose,
  onApplyAssessment,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [extractionResult, setExtractionResult] = useState<DocumentExtractionResult | null>(null);
  const [masterContextText, setMasterContextText] = useState<string>('');
  const [editModeField, setEditModeField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = (selectedFiles: FileList | File[]) => {
    const newUploadedFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => {
      const ext = file.name.split('.').pop() || '';
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext,
        file,
        status: 'pending',
      };
    });

    setFiles((prev) => [...prev, ...newUploadedFiles]);
    setExtractionResult(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setExtractionResult(null);
  };

  const startProcessingPipeline = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessingStage('Converting documents to MarkItDown Markdown...');

    const updatedFiles: UploadedFile[] = [];
    for (const f of files) {
      try {
        const md = await convertFileToMarkdown(f);
        updatedFiles.push({
          ...f,
          contentMarkdown: md,
          status: 'converted',
        });
      } catch (err: any) {
        updatedFiles.push({
          ...f,
          status: 'error',
          errorMessage: err.message,
        });
      }
    }
    setFiles(updatedFiles);

    setProcessingStage('Merging Markdown context & building document registry...');
    const masterContext = buildMasterProjectContext(updatedFiles);
    setMasterContextText(masterContext);

    setProcessingStage('Extracting workload parameters with AI...');
    try {
      const docNames = updatedFiles.map((f) => f.name);
      const result = await extractWorkloadFromMarkdown(masterContext, docNames);
      setExtractionResult(result);
    } catch (err: any) {
      console.error('Extraction failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFieldStatus = (
    fieldKey: keyof DocumentExtractionResult['quickAssessment'],
    newStatus: ExtractedField<any>['status'],
    newValue?: any
  ) => {
    if (!extractionResult) return;
    setExtractionResult((prev) => {
      if (!prev) return prev;
      const target = prev.quickAssessment[fieldKey];
      return {
        ...prev,
        quickAssessment: {
          ...prev.quickAssessment,
          [fieldKey]: {
            ...target,
            status: newStatus,
            value: newValue !== undefined ? newValue : target.value,
          },
        },
      };
    });
    setEditModeField(null);
  };

  const handleApplyToAssessment = () => {
    if (!extractionResult) return;

    const q = extractionResult.quickAssessment;
    const a = extractionResult.advancedAssessment;

    const quickInputs: QuickInputs = {
      dataVolumeGB: Number(q.dataVolumeGB.value) || 250,
      concurrentUsers: Number(q.concurrentUsers.value) || 50,
      workloadMix: (q.workloadMix.value as any) || 'bi_only',
      processingPattern: (q.processingPattern.value as any) || 'batch',
      teamSkillset: (q.teamSkillset.value as any) || 'sql_powerbi',
      region: 'central_india',
    };

    const advancedInputs: AdvancedInputs = {
      databasesCount: a.databasesCount?.value || undefined,
      schemasCount: a.schemasCount?.value || undefined,
      tablesCount: a.tablesCount?.value || undefined,
      storedProceduresCount: a.storedProceduresCount?.value || undefined,
      sqlViewsCount: a.sqlViewsCount?.value || undefined,
      excelFilesDaily: a.excelFilesDaily?.value || undefined,
      csvFilesDaily: a.csvFilesDaily?.value || undefined,
      jsonFilesDaily: a.jsonFilesDaily?.value || undefined,
      xmlFilesDaily: a.xmlFilesDaily?.value || undefined,
      avgFileSizeMB: a.avgFileSizeMB?.value || undefined,
      largestFileSizeMB: a.largestFileSizeMB?.value || undefined,
      reportsCount: a.reportsCount?.value || undefined,
      semanticModelsCount: a.semanticModelsCount?.value || undefined,
      etlPipelinesCount: a.etlPipelinesCount?.value || undefined,
      sparkJobsCount: a.sparkJobsCount?.value || undefined,
      notebooksCount: a.notebooksCount?.value || undefined,
      dataFactoryPipelinesCount: a.dataFactoryPipelinesCount?.value || undefined,
      mlWorkloadsCount: a.mlWorkloadsCount?.value || undefined,
      totalStorageGB: a.totalStorageGB?.value || undefined,
    };

    onApplyAssessment(quickInputs, advancedInputs, masterContextText);
    onClose();
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">{confidence}% High Confidence</span>;
    if (confidence >= 75) return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">{confidence}% Moderate</span>;
    return <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded text-[10px] font-bold">{confidence}% Low / Inferred</span>;
  };

  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (['xlsx', 'csv'].includes(e)) return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
    if (['json', 'xml', 'html'].includes(e)) return <FileCode className="h-4 w-4 text-sky-600" />;
    return <FileText className="h-4 w-4 text-teal-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">AI Document Ingestion & Workload Discovery</h2>
              <p className="text-xs text-slate-500 font-medium">
              Upload architecture documents (PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, MD, TXT). Powered by Microsoft MarkItDown + AI extraction.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        {!extractionResult && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleFileSelection(e.dataTransfer.files);
              }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-8 text-center transition hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer"
            >
              <Upload className="h-8 w-8 text-teal-600" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Drag and drop your project documents here, or <span className="text-teal-700 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Supported formats: PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, MD, TXT (Multi-file enabled)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.json,.xml,.html,.htm,.md,.txt"
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
              />
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Selected Documents ({files.length})</span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-red-600 hover:underline text-[11px] font-bold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getFileIcon(f.extension)}
                        <span className="truncate text-slate-800 font-bold">{f.name}</span>
                        <span className="text-[10px] text-slate-400">({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Start Processing Button */}
                <button
                  type="button"
                  onClick={startProcessingPipeline}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 py-3 text-xs font-black text-white shadow-md transition hover:from-teal-600 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{processingStage}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Convert & Extract Workload with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Human Verification Drawer */}
        {extractionResult && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Human Verification & Explainability Drawer</h3>
              </div>
              <button
                type="button"
                onClick={() => setExtractionResult(null)}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Re-upload / Reset
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Review AI-extracted workload parameters below. Click <strong>Accept</strong>, <strong>Edit</strong>, or <strong>Reject</strong> for each field before populating the decision tool.
            </p>

            {/* Extracted Fields List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {[
                { key: 'dataVolumeGB', label: 'Daily Data Volume (GB/day)', unit: 'GB/day' },
                { key: 'concurrentUsers', label: 'Peak Concurrent BI Report Users', unit: 'users' },
                { key: 'workloadMix', label: 'Workload Mix', unit: '' },
                { key: 'processingPattern', label: 'Processing Pattern', unit: '' },
                { key: 'teamSkillset', label: 'Existing Team Skillset', unit: '' },
              ].map(({ key, label, unit }) => {
                const field = (extractionResult.quickAssessment as any)[key] as ExtractedField<any>;
                const isEditing = editModeField === key;
                const isAccepted = field.status === 'accepted';
                const isRejected = field.status === 'rejected';

                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 transition ${
                      isAccepted
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : isRejected
                        ? 'border-red-300 bg-red-50/60'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{label}</span>
                        {getConfidenceBadge(field.confidence)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateFieldStatus(key as any, 'accepted')}
                          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold border transition ${
                            isAccepted ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditModeField(isEditing ? null : key)}
                          className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 transition"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFieldStatus(key as any, 'rejected')}
                          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold border transition ${
                            isRejected ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:text-red-800'
                          }`}
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* Value & Citations */}
                    <div className="mt-3 space-y-2 text-xs">
                      {isEditing ? (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            defaultValue={field.value ?? ''}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateFieldStatus(key as any, 'edited', (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="w-full rounded-md border border-teal-600 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none font-bold"
                            placeholder="Enter override value..."
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = (e.currentTarget.previousElementSibling as HTMLInputElement).value;
                              updateFieldStatus(key as any, 'edited', input);
                            }}
                            className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-extrabold text-white"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Extracted Value:</span>
                          <span className="text-teal-700 font-extrabold">{field.value !== null ? `${field.value} ${unit}` : 'Unable to determine from uploaded documents.'}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <strong>Source Document:</strong> <span className="text-slate-800 font-bold">{field.sourceDoc}</span>
                        </div>
                        <div>
                          <strong>Location / Page:</strong> <span className="text-slate-800 font-bold">{field.pageOrSlide}</span>
                        </div>
                        <div className="sm:col-span-2 text-slate-700 italic border-t border-slate-100 pt-1 mt-1 font-medium">
                          "{field.quote}"
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApplyToAssessment}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-xs font-black text-white shadow-md transition hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] cursor-pointer"
            >
              <span>Apply Verified Inputs & Evaluate Platforms</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
