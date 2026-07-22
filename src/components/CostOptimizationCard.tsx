import React from 'react';
import { OptimizationSuggestion } from '../types/assessment';
import { TrendingDown, Lightbulb, Check } from 'lucide-react';

interface CostOptimizationCardProps {
  optimizations: OptimizationSuggestion[];
}

export const CostOptimizationCard: React.FC<CostOptimizationCardProps> = ({ optimizations }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-lg shadow-slate-200/50">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <TrendingDown className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-extrabold text-slate-900">Cost Optimization & Best Practices</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {optimizations.map((opt, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-2xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-teal-800 uppercase tracking-wide">{opt.platform}</span>
                <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-black">{opt.potentialSavings}</span>
              </div>
              <h4 className="text-xs font-black text-slate-900 leading-snug">{opt.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{opt.description}</p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-2 text-xs">
              <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-600" /> Actionable Steps:
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 font-medium">
                {opt.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="h-3 w-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
