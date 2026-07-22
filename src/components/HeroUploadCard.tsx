import React, { useRef } from 'react';
import { Upload, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroUploadCardProps {
  onOpenModal: () => void;
  onFileDrop?: (files: FileList | File[]) => void;
}

export const HeroUploadCard: React.FC<HeroUploadCardProps> = ({ onOpenModal }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="hero-upload-card relative overflow-hidden rounded-3xl border-2 border-teal-600/30 bg-gradient-to-br from-white via-teal-50/40 to-slate-50 p-6 sm:p-8 shadow-xl shadow-teal-900/5 transition hover:border-teal-500/60">
      {/* Top Rainbow Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2AAC94] via-[#00A4EF] via-[#0078D4] to-[#FF3621]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Heading & Outcomes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/30 bg-teal-100/60 px-3.5 py-1 text-xs font-black text-teal-900 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-700 animate-pulse" />
            <span>PRIMARY ENTERPRISE WORKFLOW</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              📄 AI Workload Discovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Drop existing project architecture documents, spreadsheets, or specs. We’ll automatically extract parameters, run sizing models, and generate an executive report.
            </p>
          </div>

          {/* Automated Steps List */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold text-slate-800">
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Extract workload parameters</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Auto-fill assessment model</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Estimate Fabric vs DB costs</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Generate Executive Report</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dropzone Box */}
        <div className="lg:col-span-5">
          <div
            onClick={onOpenModal}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-teal-500/40 bg-white p-6 text-center transition hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer shadow-sm group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 block">
                Drop your PDF, PPTX, DOCX, XLSX, CSV, JSON, XML
              </span>
              <span className="text-[11px] font-bold text-teal-700 group-hover:underline inline-flex items-center gap-1">
                Click to Browse & Upload Documents <ArrowRight className="h-3 w-3" />
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-1 text-[10px] font-bold text-slate-500 pt-1">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">PDF</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">PPTX</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">DOCX</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">XLSX</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">CSV</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">JSON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
