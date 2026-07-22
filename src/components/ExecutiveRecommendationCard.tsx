import React, { useState } from 'react';
import { ExecutiveRecommendation, PlatformAssessment } from '../types/assessment';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Download, Award, Cpu, DollarSign, Clock } from 'lucide-react';

interface ExecutiveRecommendationCardProps {
  recommendation: ExecutiveRecommendation;
  fabricAssessment?: PlatformAssessment;
  databricksAssessment?: PlatformAssessment;
}

export const ExecutiveRecommendationCard: React.FC<ExecutiveRecommendationCardProps> = ({
  recommendation,
  fabricAssessment,
  databricksAssessment,
}) => {
  const [downloading, setDownloading] = useState(false);
  const isFabric = recommendation.recommendedPlatform === 'Microsoft Fabric';

  const winningAssessment = isFabric ? fabricAssessment : databricksAssessment;

  const handleExportPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 300);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/60 print:p-4 print:space-y-3 print:rounded-2xl print:border">
      {/* Top accent rainbow line */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2AAC94] via-[#00A4EF] via-[#0078D4] to-[#FF3621] print:h-1" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:pb-2 print:gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700 print:h-7 print:w-7">
            <Award className="h-5 w-5 print:h-4 print:w-4" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 print:text-sm">Executive Architecture Recommendation</h3>
            <p className="text-xs text-slate-500 font-medium print:text-[10px]">Enterprise Platform Decision & Sizing Saturated Matrix</p>
          </div>
        </div>

        {/* Visual Confidence Gauge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-2xs print:px-2 print:py-0.5">
          <span className="text-xs text-slate-500 font-bold print:text-[10px]">Data Confidence:</span>
          <span className="font-mono text-xs font-black text-teal-700 tracking-wider print:text-[10px]">
            █████████░ {recommendation.confidenceScore}%
          </span>
        </div>
      </div>

      {/* High-Impact Hero Banner */}
      <div className="rounded-2xl border-2 border-teal-600/30 bg-gradient-to-r from-teal-50/80 via-white to-slate-50 p-6 space-y-4 shadow-sm print:p-3 print:space-y-1.5 print:rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 print:gap-2">
          <div>
            <div className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5 print:text-[10px]">
              <Sparkles className="h-4 w-4 text-teal-700 print:h-3 print:w-3" />
              RECOMMENDED PLATFORM
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1 print:text-xl">
              {recommendation.recommendedPlatform}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-emerald-100 border-2 border-emerald-400 px-5 py-2 text-sm font-black text-emerald-900 shadow-xs print:px-3 print:py-1 print:text-xs">
              {recommendation.matchPercentage}% MATCH
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold print:text-[11px] print:leading-snug">
          {recommendation.executiveSummary}
        </p>
      </div>

      {/* 6 Executive KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:gap-1.5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 print:p-2 print:space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 print:text-[9px]">
            <DollarSign className="h-3 w-3 text-teal-700" /> Cost / mo
          </div>
          <div className="text-sm font-black text-slate-900 truncate print:text-xs">{recommendation.kpis.formattedCost}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 print:p-2 print:space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 print:text-[9px]">
            <Cpu className="h-3 w-3 text-teal-700" /> SKU Sizing
          </div>
          <div className="text-sm font-black text-slate-900 truncate print:text-xs">{recommendation.kpis.suggestedSKU}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 print:p-2 print:space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 print:text-[9px]">
            <ShieldCheck className="h-3 w-3 text-teal-700" /> Confidence
          </div>
          <div className="text-sm font-black text-emerald-800 print:text-xs">{recommendation.confidenceScore}%</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 print:p-2 print:space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 print:text-[9px]">
            <Clock className="h-3 w-3 text-teal-700" /> Migration
          </div>
          <div className="text-sm font-black text-slate-900 print:text-xs">{recommendation.kpis.migrationDifficulty}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 print:p-2 print:space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 print:text-[9px]">
            <Clock className="h-3 w-3 text-teal-700" /> Duration
          </div>
          <div className="text-sm font-black text-slate-900 print:text-xs">{recommendation.kpis.estimatedDuration}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 print:p-2 print:space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 print:text-[9px]">
            <Sparkles className="h-3 w-3 text-teal-700" /> Potential Savings
          </div>
          <div className="text-sm font-black text-emerald-800 print:text-xs">{recommendation.kpis.potentialSavings}</div>
        </div>
      </div>

      {/* Decision Badges */}
      {winningAssessment && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-200 print:p-2.5 print:space-y-1">
          <div className="text-xs font-black text-slate-800 uppercase tracking-wider print:text-[10px]">Scannable Decision Badges</div>
          <div className="flex flex-wrap gap-2 pt-1 print:gap-1">
            {winningAssessment.decisionBadges.pros.map((pro, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-black shadow-2xs print:px-2 print:py-0.5 print:text-[10px]">
                {pro}
              </span>
            ))}
            {winningAssessment.decisionBadges.cons.map((con, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg text-xs font-black shadow-2xs print:px-2 print:py-0.5 print:text-[10px]">
                {con}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Why Selected vs Why NOT Chosen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
        {/* Why Selected */}
        <div className="space-y-2 rounded-xl bg-emerald-50/60 p-4 border border-emerald-200 print:p-2.5 print:space-y-1">
          <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 print:text-[10px]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 print:h-3 print:w-3" />
            Why {recommendation.recommendedPlatform} Was Selected:
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc font-medium print:text-[10px] print:space-y-0.5">
            {recommendation.whySelected.map((reason, idx) => (
              <li key={idx} className="leading-relaxed">{reason}</li>
            ))}
          </ul>
        </div>

        {/* Why Platform WAS NOT Chosen */}
        <div className="space-y-2 rounded-xl bg-slate-100/80 p-4 border border-slate-300 print:p-2.5 print:space-y-1">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 print:text-[10px]">
            <AlertTriangle className="h-4 w-4 text-amber-600 print:h-3 print:w-3" />
            Why Non-Selected Platform Was NOT Chosen:
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc font-medium print:text-[10px] print:space-y-0.5">
            {recommendation.whyNotChosen.map((reason, idx) => (
              <li key={idx} className="leading-relaxed">{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* SINGLE PDF EXPORT BUTTON ONLY */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 no-print">
        <div className="text-xs font-black text-slate-800">
          Export Total Executive Report:
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={downloading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:from-teal-600 hover:to-teal-500 transition cursor-pointer active:scale-[0.98]"
        >
          <Download className="h-4 w-4 text-white" />
          <span>Export Total Executive Report (PDF)</span>
        </button>
      </div>
    </div>
  );
};
