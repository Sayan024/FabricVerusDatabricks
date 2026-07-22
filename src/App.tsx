import React, { useState, useEffect, useCallback } from 'react';
import { QuickInputs, AdvancedInputs, AssessmentResult } from './types/assessment';
import { runFullAssessment } from './pricing/engine';
import { Header } from './components/Header';
import { HeroUploadCard } from './components/HeroUploadCard';
import { QuickAssessment } from './components/QuickAssessment';
import { AdvancedAssessment } from './components/AdvancedAssessment';
import { PlatformCard } from './components/PlatformCard';
import { SideBySideComparison } from './components/SideBySideComparison';
import { ExecutiveRecommendationCard } from './components/ExecutiveRecommendationCard';
import { MigrationTimelineCard } from './components/MigrationTimelineCard';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { FeatureUpdatesCard } from './components/FeatureUpdatesCard';
import { CostOptimizationCard } from './components/CostOptimizationCard';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DocumentIngestionModal } from './components/DocumentIngestionModal';
import { Footer } from './components/Footer';
import { Calendar, CheckCircle, Sparkles, Upload, ArrowRight, Zap, Bot, MessageSquare } from 'lucide-react';

const DEFAULT_QUICK: QuickInputs = {
  dataVolumeGB: 250,
  concurrentUsers: 50,
  workloadMix: 'bi_only',
  processingPattern: 'batch',
  teamSkillset: 'sql_powerbi',
  region: 'central_india',
};

const DEFAULT_ADVANCED: AdvancedInputs = {};

function parseUrlInputs(): { quick: QuickInputs; advanced: AdvancedInputs; isPreset: boolean } {
  const sp = new URLSearchParams(window.location.search);
  const hasParams = sp.has('vol') || sp.has('users');

  const quick: QuickInputs = {
    dataVolumeGB: sp.get('vol') ? Number(sp.get('vol')) : DEFAULT_QUICK.dataVolumeGB,
    concurrentUsers: sp.get('users') ? Number(sp.get('users')) : DEFAULT_QUICK.concurrentUsers,
    workloadMix: (sp.get('mix') as any) || DEFAULT_QUICK.workloadMix,
    processingPattern: (sp.get('ref') as any) || DEFAULT_QUICK.processingPattern,
    teamSkillset: (sp.get('skill') as any) || DEFAULT_QUICK.teamSkillset,
    region: (sp.get('region') as any) || DEFAULT_QUICK.region,
  };

  const advanced: AdvancedInputs = {};
  if (sp.get('dbs')) advanced.databasesCount = Number(sp.get('dbs'));
  if (sp.get('tbls')) advanced.tablesCount = Number(sp.get('tbls'));
  if (sp.get('stor')) advanced.totalStorageGB = Number(sp.get('stor'));

  return { quick, advanced, isPreset: hasParams };
}

function encodeUrlInputs(quick: QuickInputs) {
  const sp = new URLSearchParams({
    vol: String(quick.dataVolumeGB || 0),
    users: String(quick.concurrentUsers || 0),
    mix: quick.workloadMix,
    ref: quick.processingPattern,
    skill: quick.teamSkillset,
    region: quick.region,
  });
  return `${window.location.origin}${window.location.pathname}?${sp.toString()}`;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'engine' | 'updates'>('engine');
  const [quickInputs, setQuickInputs] = useState<QuickInputs>(() => parseUrlInputs().quick);
  const [advancedInputs, setAdvancedInputs] = useState<AdvancedInputs>(() => parseUrlInputs().advanced);
  const [extractedDocText, setExtractedDocText] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  useEffect(() => {
    if (quickInputs.dataVolumeGB > 0 && quickInputs.concurrentUsers > 0) {
      setAssessment(runFullAssessment(quickInputs, advancedInputs));
    }
  }, []);

  const handleQuickChange = useCallback((field: keyof QuickInputs, value: any) => {
    setQuickInputs((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleAdvancedChange = useCallback((field: keyof AdvancedInputs, value: any) => {
    setAdvancedInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateQuick = (): boolean => {
    const errs: Record<string, string> = {};
    if (!quickInputs.dataVolumeGB || quickInputs.dataVolumeGB <= 0) {
      errs.dataVolumeGB = 'Enter a valid daily volume (GB/day).';
    }
    if (!quickInputs.concurrentUsers || quickInputs.concurrentUsers <= 0) {
      errs.concurrentUsers = 'Enter a valid user count.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEvaluate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateQuick()) return;

    const result = runFullAssessment(quickInputs, advancedInputs);
    setAssessment(result);

    const shareUrl = encodeUrlInputs(quickInputs);
    window.history.replaceState({}, '', shareUrl);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleResetInputs = () => {
    const emptyQuick: QuickInputs = {
      dataVolumeGB: 0,
      concurrentUsers: 0,
      workloadMix: 'bi_only',
      processingPattern: 'batch',
      teamSkillset: 'sql_powerbi',
      region: 'central_india',
    };
    const emptyAdvanced: AdvancedInputs = {};
    setQuickInputs(emptyQuick);
    setAdvancedInputs(emptyAdvanced);
    setExtractedDocText('');
    setErrors({});
    setAssessment(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleApplyExtractedInputs = (newQuick: QuickInputs, newAdvanced: AdvancedInputs, docText?: string) => {
    setQuickInputs(newQuick);
    setAdvancedInputs(newAdvanced);
    if (docText) setExtractedDocText(docText);
    const result = runFullAssessment(newQuick, newAdvanced);
    setAssessment(result);
  };

  const handleShare = () => {
    const url = encodeUrlInputs(quickInputs);
    navigator.clipboard.writeText(url).then(() => {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onOpenIngestionModal={() => setIsIngestionModalOpen(true)} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Render Dedicated Monthly Release Tracker Page */}
        {activeTab === 'updates' ? (
          <div className="space-y-6">
            {/* Top Breadcrumb & Return Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Zap className="h-6 w-6 text-amber-500" />
                  Monthly Platform Release Tracker
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Official Monthly Release Notes & Feature Velocity for Microsoft Fabric & Azure Databricks
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('engine')}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                <span>← Back to Architecture Decision Engine</span>
              </button>
            </div>

            <FeatureUpdatesCard />
          </div>
        ) : (
          /* Render Main Decision Engine Page */
          <>
            {/* Top Hero Heading */}
            <section className="text-left md:text-center space-y-4 max-w-4xl mx-auto pt-2 no-print">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/30 bg-teal-50 px-3.5 py-1 text-xs font-black text-teal-900 shadow-xs">
                <Calendar className="h-3.5 w-3.5 text-teal-700" />
                <span>ENTERPRISE AI SOLUTION ARCHITECT FOR FABRIC & DATABRICKS</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 leading-none">
                Fabric <span className="text-[#0F766E] font-black">or</span> Databricks?
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                AI-powered architecture decision engine. Drop project specs or fill your workload profile to get instant platform sizing, side-by-side cost breakdowns, and executive decision reports.
              </p>

              {/* Feature Badges Row */}
              <div className="flex flex-wrap items-center justify-start md:justify-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  Instant SKU & Cost Ranges
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3.5 py-1.5 text-xs font-bold text-sky-800 shadow-xs">
                  ◆ Traffic-Light Decision Matrix
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-xs">
                  📑 MarkItDown AI Ingestion
                </span>
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-400 bg-gradient-to-r from-teal-50 to-cyan-50 px-3.5 py-1.5 text-xs font-extrabold text-teal-900 hover:border-teal-500 transition cursor-pointer shadow-2xs"
                >
                  <Bot className="h-3.5 w-3.5 text-teal-700" />
                  Ask AI Copilot (Chatbot)
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-800 shadow-xs">
                  🎯 Total Executive Report (PDF)
                </span>
              </div>
            </section>

            {/* Primary Enterprise Workflow: Hero Upload Card */}
            <HeroUploadCard onOpenModal={() => setIsIngestionModalOpen(true)} />

            {/* 2-Column Workload Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Workload Profile Form */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1.5 no-print">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-lg shadow-slate-200/50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Workload Profile
                    </h2>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                      5 Key Inputs
                    </span>
                  </div>

                  <QuickAssessment
                    inputs={quickInputs}
                    errors={errors}
                    onChange={handleQuickChange}
                    onSubmit={handleEvaluate}
                    onShare={handleShare}
                    onReset={handleResetInputs}
                    shareState={shareState}
                    onOpenIngestionModal={() => setIsIngestionModalOpen(true)}
                  />

                  <AdvancedAssessment
                    inputs={advancedInputs}
                    onChange={handleAdvancedChange}
                  />
                </div>
              </div>

              {/* Right Column: Assessment Results */}
              <div id="results-section" className="lg:col-span-8 space-y-6">
                {/* Printable PDF Executive Header (Starts immediately at top of page 1) */}
                <div className="pdf-report-header hidden print:block mb-4 border-b-2 border-slate-300 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">Fabric <span className="text-teal-700">vs</span> Databricks</span>
                    </div>
                    <div className="text-right text-xs text-slate-500 font-bold">
                      <div>EXECUTIVE ARCHITECTURE ASSESSMENT REPORT</div>
                      <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div>Target Region: <strong className="text-slate-900">{quickInputs.region.replace('_', ' ').toUpperCase()}</strong></div>
                    <div>Daily Volume: <strong className="text-slate-900">{quickInputs.dataVolumeGB || 0} GB/day</strong></div>
                    <div>BI Users: <strong className="text-slate-900">{quickInputs.concurrentUsers || 0} Users</strong></div>
                    <div>Workload Mix: <strong className="text-slate-900">{quickInputs.workloadMix.toUpperCase()}</strong></div>
                  </div>
                </div>

                {assessment ? (
                  <>
                    {/* Hero Executive Recommendation */}
                    <ExecutiveRecommendationCard
                      recommendation={assessment.recommendation}
                      fabricAssessment={assessment.fabric}
                      databricksAssessment={assessment.databricks}
                    />

                    {/* Migration Roadmap & Timeline Card */}
                    <MigrationTimelineCard timeline={assessment.recommendation.migrationTimeline} />

                    {/* Platform Output Cards with Granular Cost Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PlatformCard assessment={assessment.fabric} />
                      <PlatformCard assessment={assessment.databricks} />
                    </div>

                    {/* Side-by-Side Traffic-Light Architectural Matrix */}
                    <SideBySideComparison
                      comparisons={assessment.comparisons}
                      fabricAssessment={assessment.fabric}
                      databricksAssessment={assessment.databricks}
                    />

                    {/* Chatbot Trigger Banner */}
                    <div className="no-print rounded-2xl border-2 border-teal-600/30 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-5 flex flex-wrap items-center justify-between gap-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 border border-teal-300 text-teal-800">
                          <Bot className="h-5 w-5 text-teal-700" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Have specific questions about this recommendation?</h4>
                          <p className="text-xs text-slate-600 font-medium">Ask our AI Architecture Copilot chatbot for instant expert platform guidance.</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCopilotOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-600 transition cursor-pointer active:scale-95"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Launch AI Chatbot</span>
                      </button>
                    </div>

                    {/* Optimization Suggestions */}
                    <CostOptimizationCard optimizations={assessment.optimizations} />

                    {/* Official Disclaimer */}
                    <DisclaimerBanner regionId={quickInputs.region} />
                  </>
                ) : (
                  /* Ready to Evaluate Placeholder State when fields are cleared */
                  <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center space-y-4 shadow-sm no-print">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mx-auto">
                      <Sparkles className="h-7 w-7 text-teal-700 animate-pulse" />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-xl font-black text-slate-900">Ready to Evaluate Your Workload</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Upload your architecture documents (PDF, DOCX, XLSX) above for instant AI extraction, or fill the Workload Profile form on the left to evaluate Microsoft Fabric vs Azure Databricks.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsIngestionModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-600 transition cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Documents (AI Auto-Fill)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickInputs(DEFAULT_QUICK);
                          setAssessment(runFullAssessment(DEFAULT_QUICK, DEFAULT_ADVANCED));
                        }}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <span>Load Demo Sample Data</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating AI Chatbot App Drawer (Available anywhere across WebApp) */}
      <AICopilotDrawer
        quickInputs={quickInputs}
        advancedInputs={advancedInputs}
        extractedDocText={extractedDocText}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onOpen={() => setIsCopilotOpen(true)}
      />

      {/* AI Document Ingestion & Discovery Modal */}
      <DocumentIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        onApplyAssessment={handleApplyExtractedInputs}
      />

      <Footer />
    </div>
  );
};

export default App;
