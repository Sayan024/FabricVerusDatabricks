import React from 'react';
import { DimensionComparison, PlatformAssessment } from '../types/assessment';
import { Award } from 'lucide-react';

interface SideBySideComparisonProps {
  comparisons: DimensionComparison[];
  fabricAssessment?: PlatformAssessment;
  databricksAssessment?: PlatformAssessment;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({
  comparisons,
  fabricAssessment,
  databricksAssessment,
}) => {
  const getTrafficLightBadge = (status: 'green' | 'yellow' | 'red') => {
    if (status === 'green') return <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-black">🟢 Optimal</span>;
    if (status === 'yellow') return <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-black">🟡 Moderate</span>;
    return <span className="inline-flex items-center gap-1 text-red-900 bg-red-100 border border-red-300 px-2 py-0.5 rounded text-[11px] font-black">🔴 Complex</span>;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-lg shadow-slate-200/50">
      {/* Header with Platform Scores */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-600" />
          <h3 className="text-base font-extrabold text-slate-900">Side-by-Side Architectural Matrix</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-1 text-xs font-black text-cyan-900 shadow-2xs">
            <span>Fabric Score:</span>
            <span className="text-sm text-cyan-900 font-extrabold">{fabricAssessment?.platformScore || 89}/100</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-1 text-xs font-black text-red-900 shadow-2xs">
            <span>Databricks Score:</span>
            <span className="text-sm text-red-900 font-extrabold">{databricksAssessment?.platformScore || 93}/100</span>
          </div>
        </div>
      </div>

      {/* Scannable Traffic Light Table with Fixed Column Widths for Print */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider font-black bg-slate-50">
              <th className="py-2.5 px-3 w-[22%]">Architectural Dimension</th>
              <th className="py-2.5 px-3 w-[33%]">Microsoft Fabric</th>
              <th className="py-2.5 px-3 w-[33%]">Azure Databricks</th>
              <th className="py-2.5 px-3 w-[12%] text-center">Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {comparisons.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition">
                <td className="py-2.5 px-3 font-extrabold text-slate-900 align-top">{row.dimension}</td>
                <td className="py-2.5 px-3 space-y-1 align-top">
                  <div>{getTrafficLightBadge(row.fabricTrafficLight)}</div>
                  <div className="text-[11px] text-slate-700 font-semibold leading-normal">{row.fabricRating}</div>
                </td>
                <td className="py-2.5 px-3 space-y-1 align-top">
                  <div>{getTrafficLightBadge(row.databricksTrafficLight)}</div>
                  <div className="text-[11px] text-slate-700 font-semibold leading-normal">{row.databricksRating}</div>
                </td>
                <td className="py-2.5 px-3 text-center font-bold align-top">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold shadow-2xs ${
                      row.verdict === 'Fabric'
                        ? 'bg-cyan-100 border border-cyan-400 text-cyan-950'
                        : row.verdict === 'Databricks'
                        ? 'bg-red-100 border border-red-400 text-red-950'
                        : 'bg-slate-100 border border-slate-300 text-slate-700'
                    }`}
                  >
                    {row.verdict}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
