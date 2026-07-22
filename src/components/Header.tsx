import React from 'react';
import { Sparkles, Layers, Zap } from 'lucide-react';

interface HeaderProps {
  activeTab: 'engine' | 'updates';
  onTabChange: (tab: 'engine' | 'updates') => void;
  onOpenIngestionModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onOpenIngestionModal }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/80 backdrop-blur-md shadow-xs">
      {/* Top Rainbow Brand Line matching Microsoft Fabric Docs */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#2AAC94] via-[#00A4EF] via-[#0078D4] to-[#FF3621]" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Logo & Navigation Tabs */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange('engine')}
            className="flex items-center gap-3 transition hover:opacity-90 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <img src="/icons/fabric.svg" alt="Fabric" className="h-6 w-6 object-contain" />
              <span className="text-slate-400 font-bold text-xs">VS</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FF3621] text-white font-black text-[10px] shadow-xs">
                DB
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                Fabric <span className="text-slate-400 font-normal">vs</span> Databricks
              </span>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onTabChange('engine')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'engine'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-teal-700" />
              <span>Decision Engine</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('updates')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'updates'
                  ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Monthly Release Tracker</span>
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[9px] font-black rounded-full">
                NEW
              </span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {onOpenIngestionModal && (
            <button
              type="button"
              onClick={onOpenIngestionModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-600/30 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800 transition hover:bg-teal-100 active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              <span>AI Document Upload</span>
            </button>
          )}

          {/* Right Status Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-600/40 bg-teal-50/80 px-3 py-1 text-[11px] font-bold text-teal-900 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            Architecture Decision Tool v1.5
          </span>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-t border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => onTabChange('engine')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold ${
            activeTab === 'engine' ? 'bg-white text-slate-900 shadow-2xs rounded-lg' : 'text-slate-600'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Decision Engine</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('updates')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold ${
            activeTab === 'updates' ? 'bg-teal-700 text-white rounded-lg shadow-2xs' : 'text-slate-600'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          <span>Monthly Updates</span>
        </button>
      </div>
    </header>
  );
};
