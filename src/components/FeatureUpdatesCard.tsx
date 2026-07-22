import React, { useState, useMemo } from 'react';
import { MONTHLY_UPDATES, PlatformUpdateItem } from '../data/monthlyUpdatesData';
import { Sparkles, ExternalLink, Filter, Search, Zap, CheckCircle2 } from 'lucide-react';

export const FeatureUpdatesCard: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Microsoft Fabric' | 'Azure Databricks'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUpdates = useMemo(() => {
    return MONTHLY_UPDATES.filter((item) => {
      if (platformFilter !== 'All' && item.platform !== platformFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchImpact = item.architectureImpact.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchImpact) return false;
      }
      return true;
    });
  }, [platformFilter, categoryFilter, searchQuery]);

  const categories = [
    'All',
    'AI & Copilot',
    'Data Engineering',
    'Direct Lake',
    'Unity Catalog',
    'Warehouse & Compute',
    'MLOps & Governance',
  ];

  return (
    <div className="no-print relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50">
      {/* Accent Header Line */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00A4EF] via-[#0F766E] to-[#FF3621]" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">Monthly Feature Velocity & Platform Updates</h3>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-900 uppercase">
                Updated Monthly
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sourced directly from Microsoft Fabric Community Blog & Azure Databricks Platform Release Notes
            </p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {/* Platform Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setPlatformFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              platformFilter === 'All' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Platforms
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('Microsoft Fabric')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              platformFilter === 'Microsoft Fabric' ? 'bg-[#00A4EF] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <img src="/icons/fabric.svg" alt="Fabric" className="h-3.5 w-3.5" />
            Fabric
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('Azure Databricks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              platformFilter === 'Azure Databricks' ? 'bg-[#FF3621] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Databricks
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-slate-900 font-bold"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-56 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-900 outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Grid of Monthly Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map((item) => {
            const isFabric = item.platform === 'Microsoft Fabric';

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 space-y-3 transition hover:shadow-md ${
                  isFabric ? 'border-t-4 border-t-[#00A4EF] border-slate-200' : 'border-t-4 border-t-[#FF3621] border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Metadata Line */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {isFabric ? (
                        <span className="flex items-center gap-1 font-black text-cyan-900 bg-cyan-50 border border-cyan-300 px-2 py-0.5 rounded text-[10px]">
                          <img src="/icons/fabric.svg" alt="Fabric" className="h-3 w-3" /> Microsoft Fabric
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-black text-red-900 bg-red-50 border border-red-300 px-2 py-0.5 rounded text-[10px]">
                          DB Azure Databricks
                        </span>
                      )}
                      <span className="font-extrabold text-slate-500 font-mono text-[11px]">{item.month}</span>
                    </div>

                    <span
                      className={`font-black text-[10px] uppercase px-2 py-0.5 rounded ${
                        item.impactLevel === 'Game Changer'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : item.impactLevel === 'High Impact'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.impactLevel === 'Game Changer' ? '🔥 Game Changer' : item.impactLevel === 'High Impact' ? '⚡ High Impact' : '✨ Enhancement'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h4>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.summary}
                  </p>

                  {/* Architectural Sizing Impact Box */}
                  <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-3 text-xs space-y-1">
                    <div className="font-black text-teal-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-teal-700" /> Sizing & Architecture Impact
                    </div>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      {item.architectureImpact}
                    </p>
                  </div>
                </div>

                {/* Bottom External Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>

                  <a
                    href={item.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 hover:underline transition"
                  >
                    <span>Read Release Notes</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-xs text-slate-500 font-bold bg-slate-50 rounded-2xl border border-slate-200">
            No monthly updates match your filters. Try selecting "All Platforms" or a different category.
          </div>
        )}
      </div>
    </div>
  );
};
