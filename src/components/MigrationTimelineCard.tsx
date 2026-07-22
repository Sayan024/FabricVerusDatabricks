import React from 'react';
import { MigrationTimeline } from '../types/assessment';
import { Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface MigrationTimelineCardProps {
  timeline: MigrationTimeline;
}

export const MigrationTimelineCard: React.FC<MigrationTimelineCardProps> = ({ timeline }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-lg shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-700" />
          <h3 className="text-base font-extrabold text-slate-900">Migration Roadmap & Timeline Estimate</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Enterprise Transition Assessment
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Migration Difficulty */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Migration Difficulty</div>
          <div className="text-lg font-black text-slate-900">{timeline.difficulty} Complexity</div>
          <div className="font-mono text-xs font-bold text-teal-700 tracking-wider">
            {timeline.scoreBar}
          </div>
        </div>

        {/* Metric 2: Estimated Duration */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Duration</div>
          <div className="text-lg font-black text-slate-900">{timeline.durationWeeks}</div>
          <div className="text-[11px] text-slate-600 font-medium">
            ~{timeline.estimatedHours} Total Engineering Hours
          </div>
        </div>

        {/* Metric 3: Risk Assessment */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Risk Level</div>
          <div className="text-lg font-black text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {timeline.riskLevel} Risk
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Standard automated ingestion & schema migration
          </div>
        </div>
      </div>
    </div>
  );
};
