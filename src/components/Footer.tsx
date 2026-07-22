import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 space-y-2">
        <p className="text-slate-600 font-bold">
          Open-Source Architecture Decision & Assessment Tool · MIT License · Built for data architects
        </p>
        <p className="text-[11px] text-slate-400 font-medium">
          Not affiliated with, endorsed by, or sponsored by Microsoft Corporation or Databricks Inc.
        </p>
      </div>
    </footer>
  );
};
