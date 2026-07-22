import React from 'react';
import { QuickInputs, RegionId } from '../types/assessment';
import { Share2, Check, ArrowRight, MapPin, Sparkles, RotateCcw } from 'lucide-react';

interface QuickAssessmentProps {
  inputs: QuickInputs;
  errors: Record<string, string>;
  onChange: (field: keyof QuickInputs, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onShare: () => void;
  onReset: () => void;
  shareState: 'idle' | 'copied';
  onOpenIngestionModal?: () => void;
}

export const QuickAssessment: React.FC<QuickAssessmentProps> = ({
  inputs,
  errors,
  onChange,
  onSubmit,
  onShare,
  onReset,
  shareState,
  onOpenIngestionModal,
}) => {
  return (
    <div className="space-y-4">
      {/* AI Document Upload Banner Button */}
      {onOpenIngestionModal && (
        <button
          type="button"
          onClick={onOpenIngestionModal}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-600/30 bg-gradient-to-r from-teal-50 to-teal-100/60 px-3.5 py-2.5 text-xs font-extrabold text-teal-900 shadow-xs transition hover:border-teal-600/60 hover:from-teal-100 active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-teal-700 animate-pulse" />
          <span>Upload Architecture Docs (AI Auto-Fill)</span>
        </button>
      )}

      {/* Region Selector */}
      <div className="space-y-1.5">
        <label htmlFor="region" className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <MapPin className="h-3.5 w-3.5 text-teal-700" />
          Target Azure Region
        </label>
        <select
          id="region"
          value={inputs.region}
          onChange={(e) => onChange('region', e.target.value as RegionId)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
        >
          <optgroup label="🇮🇳 Indian Regions (Priced in ₹ Rupees)">
            <option value="central_india">Central India (Pune) — ₹ Rupees</option>
            <option value="south_india">South India (Chennai) — ₹ Rupees</option>
            <option value="west_india">West India (Mumbai) — ₹ Rupees</option>
          </optgroup>
          <optgroup label="🌐 Americas (Priced in $ USD)">
            <option value="us_east">US East (N. Virginia)</option>
            <option value="us_east_2">US East 2 (Ohio)</option>
            <option value="us_west">US West (California)</option>
            <option value="us_west_2">US West 2 (Oregon)</option>
            <option value="us_central">US Central (Iowa)</option>
            <option value="canada_central">Canada Central (Toronto)</option>
            <option value="brazil_south">Brazil South (Sao Paulo)</option>
          </optgroup>
          <optgroup label="🌍 Europe & Middle East (Priced in $ USD)">
            <option value="uk_south">UK South (London)</option>
            <option value="europe_west">Europe West (Netherlands)</option>
            <option value="europe_north">Europe North (Ireland)</option>
            <option value="uae_north">UAE North (Dubai)</option>
          </optgroup>
          <optgroup label="🌏 Asia Pacific (Priced in $ USD)">
            <option value="southeast_asia">Southeast Asia (Singapore)</option>
            <option value="east_asia">East Asia (Hong Kong)</option>
            <option value="japan_east">Japan East (Tokyo)</option>
            <option value="australia_east">Australia East (New South Wales)</option>
          </optgroup>
        </select>
      </div>

      {/* 1 — Daily data volume */}
      <div className="space-y-1.5">
        <label htmlFor="dataVolumeGB" className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-800 border border-teal-300">
            1
          </span>
          Daily Data Volume Processed (GB/day) *
        </label>
        <div className="relative">
          <input
            id="dataVolumeGB"
            type="number"
            placeholder="e.g. 250"
            value={inputs.dataVolumeGB || ''}
            onChange={(e) => onChange('dataVolumeGB', Number(e.target.value))}
            min="1"
            max="100000"
            className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 pr-16 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 shadow-xs ${
              errors.dataVolumeGB ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            GB/day
          </span>
        </div>
        {errors.dataVolumeGB && (
          <p className="text-xs font-bold text-red-600">{errors.dataVolumeGB}</p>
        )}
      </div>

      {/* 2 — Peak concurrent BI report users */}
      <div className="space-y-1.5">
        <label htmlFor="concurrentUsers" className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-800 border border-teal-300">
            2
          </span>
          Peak Concurrent BI Report Users *
        </label>
        <div className="relative">
          <input
            id="concurrentUsers"
            type="number"
            placeholder="e.g. 50"
            value={inputs.concurrentUsers || ''}
            onChange={(e) => onChange('concurrentUsers', Number(e.target.value))}
            min="1"
            max="10000"
            className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 pr-16 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 shadow-xs ${
              errors.concurrentUsers ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            users
          </span>
        </div>
        {errors.concurrentUsers && (
          <p className="text-xs font-bold text-red-600">{errors.concurrentUsers}</p>
        )}
      </div>

      {/* 3 — Workload Mix */}
      <div className="space-y-1.5">
        <label htmlFor="workloadMix" className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-800 border border-teal-300">
            3
          </span>
          Workload Mix *
        </label>
        <select
          id="workloadMix"
          value={inputs.workloadMix}
          onChange={(e) => onChange('workloadMix', e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
        >
          <option value="bi_only">BI Only</option>
          <option value="bi_eng">BI + Data Engineering</option>
          <option value="bi_eng_ml">BI + Engineering + Machine Learning</option>
        </select>
      </div>

      {/* 4 — Processing Pattern */}
      <div className="space-y-1.5">
        <label htmlFor="processingPattern" className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-800 border border-teal-300">
            4
          </span>
          Processing Pattern *
        </label>
        <select
          id="processingPattern"
          value={inputs.processingPattern}
          onChange={(e) => onChange('processingPattern', e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
        >
          <option value="batch">Scheduled Batch (Daily / Hourly)</option>
          <option value="hourly">Hourly Micro-Batch</option>
          <option value="near_realtime">Near Real-Time Streaming</option>
        </select>
      </div>

      {/* 5 — Existing Team Skillset (Expanded Options) */}
      <div className="space-y-1.5">
        <label htmlFor="teamSkillset" className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-800 border border-teal-300">
            5
          </span>
          Existing Team Skillset *
        </label>
        <select
          id="teamSkillset"
          value={inputs.teamSkillset}
          onChange={(e) => onChange('teamSkillset', e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
        >
          <option value="sql_powerbi">SQL + Power BI First (T-SQL, DAX, DWH)</option>
          <option value="python_spark">Python + Spark First (PySpark, Data Eng)</option>
          <option value="dotnet_csharp">.NET / C# Enterprise Stack (Azure SSIS, C#)</option>
          <option value="scala_spark">Scala + Heavy Spark Tuning (Low-level Spark)</option>
          <option value="dbt_snowflake">dbt + Snowflake / Analytics Engineering</option>
          <option value="r_statistics">R / Data Science & Statistics</option>
          <option value="mixed">Mixed / Hybrid Skillset</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={onSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 py-3 text-xs font-black text-white shadow-md transition hover:from-teal-600 hover:to-teal-500 active:scale-[0.98] cursor-pointer"
        >
          <span>Evaluate Platforms</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onShare}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            {shareState === 'copied' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share URL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Clear Fields</span>
          </button>
        </div>
      </div>
    </div>
  );
};
