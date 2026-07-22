import React, { useState } from 'react';
import { AdvancedInputs } from '../types/assessment';
import { ChevronDown, Sliders, Database, FileText, BarChart3, Cpu, Sparkles, HardDrive } from 'lucide-react';

interface AdvancedAssessmentProps {
  inputs: AdvancedInputs;
  onChange: (field: keyof AdvancedInputs, value: any) => void;
}

export const AdvancedAssessment: React.FC<AdvancedAssessmentProps> = ({ inputs, onChange }) => {
  const [open, setOpen] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState<'estate' | 'files' | 'pbi' | 'eng' | 'ml' | 'storage'>('estate');

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden transition shadow-xs">
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 bg-slate-100/80 hover:bg-slate-100 transition text-left cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="h-4 w-4 text-teal-700" />
          <span className="text-xs font-black text-slate-800">
            Improve Estimate Accuracy
          </span>
          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs">
            Optional
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Add parameters to refine your SKU sizing and increase estimation confidence.
          </p>

          {/* Sub-tabs Grid */}
          <div className="grid grid-cols-3 gap-1.5 border-b border-slate-200 pb-3">
            {[
              { id: 'estate', label: 'Data Estate', icon: Database },
              { id: 'files', label: 'Files', icon: FileText },
              { id: 'pbi', label: 'Power BI', icon: BarChart3 },
              { id: 'eng', label: 'Engineering', icon: Cpu },
              { id: 'ml', label: 'ML', icon: Sparkles },
              { id: 'storage', label: 'Storage', icon: HardDrive },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubtab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubtab(tab.id as any)}
                  className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-bold transition leading-none cursor-pointer text-center ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-teal-700" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subtab Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Tab 1: Data Estate */}
            {activeSubtab === 'estate' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Databases</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={inputs.databasesCount || ''}
                    onChange={(e) => onChange('databasesCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Schemas</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={inputs.schemasCount || ''}
                    onChange={(e) => onChange('schemasCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tables</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={inputs.tablesCount || ''}
                    onChange={(e) => onChange('tablesCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Stored Procedures</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={inputs.storedProceduresCount || ''}
                    onChange={(e) => onChange('storedProceduresCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Tab 2: Files */}
            {activeSubtab === 'files' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Excel Files Daily</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={inputs.excelFilesDaily || ''}
                    onChange={(e) => onChange('excelFilesDaily', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">CSV Files Daily</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={inputs.csvFilesDaily || ''}
                    onChange={(e) => onChange('csvFilesDaily', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Avg File Size (MB)</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={inputs.avgFileSizeMB || ''}
                    onChange={(e) => onChange('avgFileSizeMB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Largest File Size (MB)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={inputs.largestFileSizeMB || ''}
                    onChange={(e) => onChange('largestFileSizeMB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Tab 3: Power BI */}
            {activeSubtab === 'pbi' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Reports</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={inputs.reportsCount || ''}
                    onChange={(e) => onChange('reportsCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Dataset Size (GB)</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={inputs.datasetSizeGB || ''}
                    onChange={(e) => onChange('datasetSizeGB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Direct Lake Enabled?</label>
                  <select
                    value={inputs.directLake ? 'yes' : 'no'}
                    onChange={(e) => onChange('directLake', e.target.value === 'yes')}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (Zero-Copy)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Incremental Refresh?</label>
                  <select
                    value={inputs.incrementalRefresh ? 'yes' : 'no'}
                    onChange={(e) => onChange('incrementalRefresh', e.target.value === 'yes')}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </>
            )}

            {/* Tab 4: Engineering */}
            {activeSubtab === 'eng' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">ETL Pipelines</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={inputs.etlPipelinesCount || ''}
                    onChange={(e) => onChange('etlPipelinesCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Notebooks</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={inputs.notebooksCount || ''}
                    onChange={(e) => onChange('notebooksCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Tab 5: Machine Learning */}
            {activeSubtab === 'ml' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Active ML Models</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={inputs.mlWorkloadsCount || ''}
                    onChange={(e) => onChange('mlWorkloadsCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Requires GPU Clusters?</label>
                  <select
                    value={inputs.gpuUsage ? 'yes' : 'no'}
                    onChange={(e) => onChange('gpuUsage', e.target.value === 'yes')}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (NVIDIA GPU)</option>
                  </select>
                </div>
              </>
            )}

            {/* Tab 6: Storage */}
            {activeSubtab === 'storage' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Total Storage (GB)</label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={inputs.totalStorageGB || ''}
                    onChange={(e) => onChange('totalStorageGB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Retention (Months)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={inputs.retentionMonths || ''}
                    onChange={(e) => onChange('retentionMonths', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
