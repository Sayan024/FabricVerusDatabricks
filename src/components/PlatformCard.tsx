import React from 'react';
import { PlatformAssessment } from '../types/assessment';
import { Cpu, Info, DollarSign } from 'lucide-react';

interface PlatformCardProps {
  assessment: PlatformAssessment;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ assessment }) => {
  const isFabric = assessment.platform === 'Microsoft Fabric';

  const brandBorder = isFabric
    ? 'border-t-4 border-t-[#00A4EF] border-slate-200 hover:border-[#00A4EF]/60 shadow-lg shadow-slate-200/50'
    : 'border-t-4 border-t-[#FF3621] border-slate-200 hover:border-[#FF3621]/60 shadow-lg shadow-slate-200/50';

  const brandBadge = isFabric
    ? 'bg-cyan-50 border-cyan-300 text-cyan-900'
    : 'bg-red-50 border-red-300 text-red-900';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 transition-all duration-300 ${brandBorder}`}
    >
      <div className="space-y-4">
        {/* Header with Official Icons and Disambiguated Score & Confidence Badges */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            {isFabric ? (
              <img src="/icons/fabric.svg" alt="Microsoft Fabric" className="h-7 w-7 object-contain" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF3621] text-white font-black text-xs shadow-xs">
                DB
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">{assessment.platform}</h3>
                <span className="text-xs font-black text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  Fit Score: {assessment.platformScore}/100
                </span>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${brandBadge}`}>
                {isFabric ? 'Unified SaaS Analytics Platform' : 'Managed Spark & Lakehouse Engine'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs">
            <span className="text-slate-500 text-[11px]">Data Confidence:</span>
            <span className="font-extrabold text-emerald-700">{assessment.confidenceScore}%</span>
          </div>
        </div>

        {/* Cost Range Display */}
        <div className="space-y-1 rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {assessment.formattedMonthlyCost}
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Estimated Monthly Cost Range</span>
            <span className="text-slate-800 font-mono">
              {assessment.formattedAnnualCost} / yr
            </span>
          </div>
        </div>

        {/* Granular Cost Itemization Table */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
          <div className="flex items-center justify-between font-black text-slate-800 border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-teal-700" /> Cost Itemization Breakdown
            </span>
            <span className="text-[10px] text-slate-500">Monthly</span>
          </div>

          <div className="space-y-1 font-medium text-slate-700">
            <div className="flex items-center justify-between py-0.5">
              <span>{isFabric ? 'Capacity Compute (CU)' : 'Databricks Compute (DBUs)'}</span>
              <span className="font-bold text-slate-900">{assessment.granularCosts.formattedCompute}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span>{isFabric ? 'OneLake Storage' : 'ADLS Gen2 Storage'}</span>
              <span className="font-bold text-slate-900">{assessment.granularCosts.formattedStorage}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span>{isFabric ? 'SQL Data Warehouse' : 'Azure VM Infrastructure'}</span>
              <span className="font-bold text-slate-900">{assessment.granularCosts.formattedWarehouseOrVms}</span>
            </div>
            <div className="flex items-center justify-between py-0.5 text-emerald-800 font-bold border-t border-slate-200/80 pt-1">
              <span>{isFabric ? 'Power BI Integration' : 'Unity Catalog Governance'}</span>
              <span>{assessment.granularCosts.powerBiOrUnityText}</span>
            </div>
          </div>
        </div>

        {/* Suggested Sizing */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-200 text-xs">
          <Cpu className={`h-4 w-4 ${isFabric ? 'text-[#00A4EF]' : 'text-[#FF3621]'} flex-shrink-0`} />
          <span className="font-bold text-slate-600">Suggested Sizing:</span>
          <span className="font-extrabold text-slate-900 font-mono">{assessment.suggestedSKU}</span>
        </div>

        {/* Primary Sizing Driver */}
        <div className={`space-y-1 rounded-lg border-l-3 p-3 text-xs ${
          isFabric ? 'border-[#00A4EF] bg-cyan-50/60' : 'border-[#FF3621] bg-red-50/60'
        }`}>
          <div className={`font-black uppercase tracking-wider text-[10px] ${
            isFabric ? 'text-cyan-900' : 'text-red-900'
          }`}>
            Primary Sizing Driver
          </div>
          <div className="text-slate-700 leading-relaxed font-semibold">{assessment.primaryCostDriver}</div>
        </div>

        {/* Key Assumptions */}
        <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="h-3.5 w-3.5 text-slate-500" />
            Key Sizing Assumptions:
          </div>
          <ul className="space-y-1 text-slate-600 pl-4 list-disc font-medium">
            {assessment.keyAssumptions.map((item, idx) => (
              <li key={idx} className="leading-snug">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
