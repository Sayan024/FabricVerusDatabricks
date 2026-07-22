import React from 'react';
import { Info } from 'lucide-react';
import pricingConfig from '../config/pricingConfig.json';

interface DisclaimerBannerProps {
  regionId: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ regionId }) => {
  const region = (pricingConfig.regions as any)[regionId] || pricingConfig.regions.central_india;
  const isIndian = region?.isIndianRegion;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-600 space-y-2">
      <div className="flex items-start gap-2.5">
        <Info className="h-4 w-4 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed text-slate-700 font-medium">
            <strong className="text-slate-900 font-bold">Estimated using publicly available Microsoft and Databricks list pricing as of {pricingConfig.pricingDate}.</strong>{' '}
            All cost figures are directional estimates for <strong className="text-slate-900 font-bold">{region?.name || 'Central India'}</strong>. Actual costs depend on region, workload characteristics, infrastructure choices, autoscaling, reserved pricing, enterprise agreements, and future pricing updates. <strong className="text-slate-900 font-bold">Verify estimates before making purchasing decisions.</strong>
          </p>
          {isIndian && (
            <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-1.5 mt-1 font-medium">
              <strong className="text-slate-800 font-bold">India Pricing Note:</strong> Fabric Central/South/West India rate confirmed at $0.24/CU-hr vs $0.18 in US East (~33% premium). Databricks DBU rates are region-stable, but underlying Azure Central India VMs run ~15-25% above US East.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
