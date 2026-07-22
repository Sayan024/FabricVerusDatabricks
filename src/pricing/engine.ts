import {
  QuickInputs,
  AdvancedInputs,
  AssessmentResult,
  PlatformAssessment,
  DimensionComparison,
  ExecutiveRecommendation,
  OptimizationSuggestion,
  RegionId,
  GranularCostBreakdown,
  DecisionBadges,
  MigrationTimeline,
  ExecutiveKPIs,
} from '../types/assessment';
import pricingConfig from '../config/pricingConfig.json';

const HOURS_PER_MONTH = 730;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function roundToNearest50(usd: number): number {
  return Math.round(usd / 50) * 50;
}

export function formatRegionalCurrency(amountUSD: number, regionId: RegionId): string {
  const regionConfig = (pricingConfig.regions as any)[regionId] || pricingConfig.regions.central_india;
  const isIndian = regionConfig.isIndianRegion;

  if (isIndian) {
    const amountINR = Math.round(amountUSD * pricingConfig.usdToInrRate);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amountINR);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountUSD);
}

export function formatUSD(amountUSD: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountUSD);
}

// ─── CONFIDENCE ENGINE ──────────────────────────────────────────────────────

export function calculateConfidence(
  quick: QuickInputs,
  advanced: AdvancedInputs
): { score: number; reason: string; missingInfo: string[] } {
  let score = 75;
  const missing: string[] = [];
  const provided: string[] = [];

  if (advanced.databasesCount || advanced.tablesCount || advanced.storedProceduresCount) {
    score += 5;
    provided.push('Data estate schema metrics');
  } else {
    missing.push('Database table & schema count');
  }

  if (advanced.excelFilesDaily || advanced.csvFilesDaily || advanced.avgFileSizeMB) {
    score += 4;
    provided.push('File ingestion specs');
  } else {
    missing.push('Daily file ingestion sizes');
  }

  if (advanced.reportsCount || advanced.directLake || advanced.incrementalRefresh) {
    score += 5;
    provided.push('Power BI semantic model & Direct Lake settings');
  } else {
    missing.push('Power BI dataset mode (Direct Lake vs Import)');
  }

  if (advanced.etlPipelinesCount || advanced.sparkJobsCount || advanced.notebooksCount) {
    score += 5;
    provided.push('Pipeline & notebook job execution count');
  } else {
    missing.push('Notebook runtime & Spark job frequency');
  }

  if (advanced.bronzeLayerGB || advanced.totalStorageGB || advanced.monthlyStorageGrowthGB) {
    score += 4;
    provided.push('Medallion storage growth & layer distribution');
  } else {
    missing.push('Historical storage retention & monthly growth rate');
  }

  if (advanced.fabricConnectors && advanced.fabricConnectors.length > 0) {
    score += 4;
    provided.push(`Selected source system connectors (${advanced.fabricConnectors.length} systems)`);
  } else {
    missing.push('Source systems & Fabric connector inventory');
  }

  score = clamp(score, 60, 98);

  let reason = '';
  if (score >= 90) {
    reason = `High confidence (${score}%): Detailed workload specifications provided across ${provided.join(', ')}.`;
  } else if (score >= 78) {
    reason = `Moderate-High confidence (${score}%): Sized conservatively from quick assessment inputs. Adding details for ${missing.slice(0, 2).join(', ')} will improve accuracy.`;
  } else {
    reason = `Base confidence (${score}%): Sized using general heuristics. Notebook runtime, SQL Warehouse auto-stop, and storage growth were not provided.`;
  }

  return { score, reason, missingInfo: missing };
}

// ─── FABRIC SIZING ENGINE ───────────────────────────────────────────────────

export function evaluateFabric(
  quick: QuickInputs,
  advanced: AdvancedInputs
): PlatformAssessment {
  const regionConfig =
    (pricingConfig.regions as any)[quick.region] || pricingConfig.regions.central_india;
  const regionalMult = regionConfig.fabricMultiplier;

  const cuFromUsers = Math.max(4, Math.ceil(quick.concurrentUsers / 8) * 4);

  let cuFromData = 2;
  if (quick.dataVolumeGB > 2000) cuFromData = 64;
  else if (quick.dataVolumeGB > 500) cuFromData = 16;
  else if (quick.dataVolumeGB > 100) cuFromData = 8;
  else if (quick.dataVolumeGB > 30) cuFromData = 4;

  let cuFromMix = 2;
  if (quick.workloadMix === 'bi_eng_ml') cuFromMix = 16;
  else if (quick.workloadMix === 'bi_eng') cuFromMix = 8;

  const patternMult =
    quick.processingPattern === 'near_realtime' ? 2 : quick.processingPattern === 'hourly' ? 1.4 : 1.0;

  let advHeadroom = 0;
  if ((advanced.etlPipelinesCount || 0) > 20) advHeadroom += 8;
  if ((advanced.notebooksCount || 0) > 15) advHeadroom += 8;

  const requiredCU = Math.max(cuFromUsers, cuFromData, cuFromMix) * patternMult + advHeadroom;

  const skus = pricingConfig.fabric.skus;
  const skuIdx = skus.findIndex((s) => s.cus >= requiredCU);
  const resolvedIdx = skuIdx === -1 ? skus.length - 1 : skuIdx;
  const baseSKU = skus[resolvedIdx];
  const upperSKU = skus[Math.min(resolvedIdx + 1, skus.length - 1)];

  const storageGB = advanced.totalStorageGB || quick.dataVolumeGB * 30;
  const storageUSD = storageGB * pricingConfig.fabric.oneLakeStoragePerGBUSD;

  const lowMonthlyUSD = roundToNearest50(baseSKU.baseMonthlyUSD * regionalMult + storageUSD);
  const highMonthlyUSD = roundToNearest50(upperSKU.baseMonthlyUSD * regionalMult + storageUSD * 1.25);

  const lowAnnualUSD = lowMonthlyUSD * 12;
  const highAnnualUSD = highMonthlyUSD * 12;

  // Granular Cost Breakdown
  const computeCost = roundToNearest50(baseSKU.baseMonthlyUSD * regionalMult * 0.82);
  const warehouseCost = roundToNearest50(baseSKU.baseMonthlyUSD * regionalMult * 0.18);
  const granularCosts: GranularCostBreakdown = {
    computeCost,
    storageCost: Math.round(storageUSD),
    warehouseOrVmsCost: warehouseCost,
    powerBiOrUnityText: 'Included in F-SKU',
    totalCost: lowMonthlyUSD,
    formattedCompute: formatRegionalCurrency(computeCost, quick.region),
    formattedStorage: formatRegionalCurrency(storageUSD, quick.region),
    formattedWarehouseOrVms: formatRegionalCurrency(warehouseCost, quick.region),
    formattedTotal: formatRegionalCurrency(lowMonthlyUSD, quick.region),
  };

  // Platform Score Calculation with Expanded Skillsets
  let platformScore = 85;
  if (quick.workloadMix === 'bi_only') platformScore += 10;
  if (['sql_powerbi', 'dotnet_csharp', 'dbt_snowflake'].includes(quick.teamSkillset)) platformScore += 5;
  if (['scala_spark', 'python_spark'].includes(quick.teamSkillset)) platformScore -= 4;
  if (quick.processingPattern === 'near_realtime') platformScore -= 8;
  platformScore = clamp(platformScore, 65, 96);

  const decisionBadges: DecisionBadges = {
    pros: ['✔ Native Direct Lake', '✔ Zero Cluster Management', '✔ Unified M365 SaaS', '✔ Single Capacity Billing'],
    cons: ['⚠ Fixed Memory Limits', '⚠ Less Mature MLOps', '⚠ Potential Concurrency Queuing'],
  };

  let primaryCostDriver = '';
  if (cuFromUsers >= cuFromData && cuFromUsers >= cuFromMix) {
    primaryCostDriver = `Peak concurrent BI users (${quick.concurrentUsers} users → ~${cuFromUsers} CUs floor)`;
  } else if (cuFromData >= cuFromMix) {
    primaryCostDriver = `Daily ingestion volume (${quick.dataVolumeGB} GB/day → ~${cuFromData} CUs floor)`;
  } else {
    primaryCostDriver = `Workload mix (${quick.workloadMix === 'bi_eng_ml' ? 'Spark ML headroom' : 'Data engineering pipelines'})`;
  }

  const sizingReason = `Recommended smallest practical SKU: ${baseSKU.sku} (${baseSKU.cus} CUs) to satisfy concurrent query memory & processing throughput.`;

  const keyAssumptions = [
    `Fabric Capacity pay-as-you-go rate in ${regionConfig.name} (~${formatRegionalCurrency(baseSKU.baseMonthlyUSD * regionalMult, quick.region)}/mo base for ${baseSKU.sku}).`,
    `730 hours/month capacity availability with dynamic smoothing and bursting enabled.`,
    `OneLake storage estimated at ${storageGB} GB (${formatRegionalCurrency(storageUSD, quick.region)}/mo).`,
  ];

  const strengths = [
    'Unified SaaS experience: Zero cluster configuration, infrastructure, or workspace setup.',
    'Direct Lake mode: High performance Power BI reporting directly against Delta Parquet tables without data duplication.',
    'Shared Capacity: Single F-SKU dynamically allocated across Lakehouses, Data Factory pipelines, and Power BI.',
    'Native Microsoft 365 & Purview integration for governance and security.',
  ];

  const risks = [
    'Fixed F-SKU memory boundaries: Heavy concurrency spikes can cause query queuing or interactive throttling.',
    'Synapse ML ecosystem is less mature than Databricks native MLflow & GPU cluster orchestration.',
    'Vendor lock-in to Azure/Fabric ecosystem compared to multi-cloud Delta Lake standards.',
  ];

  const confidenceObj = calculateConfidence(quick, advanced);

  return {
    platform: 'Microsoft Fabric',
    monthlyCostRange: { low: lowMonthlyUSD, high: highMonthlyUSD },
    annualCostRange: { low: lowAnnualUSD, high: highAnnualUSD },
    formattedMonthlyCost: `${formatRegionalCurrency(lowMonthlyUSD, quick.region)} – ${formatRegionalCurrency(highMonthlyUSD, quick.region)}`,
    formattedAnnualCost: `${formatRegionalCurrency(lowAnnualUSD, quick.region)} – ${formatRegionalCurrency(highAnnualUSD, quick.region)}`,
    suggestedSKU: baseSKU.sku,
    confidenceScore: confidenceObj.score,
    confidenceReason: confidenceObj.reason,
    primaryCostDriver,
    sizingReason,
    keyAssumptions,
    strengths,
    risks,
    platformScore,
    matchPercentage: platformScore,
    granularCosts,
    decisionBadges,
  };
}

// ─── DATABRICKS SIZING ENGINE ───────────────────────────────────────────────

export function evaluateDatabricks(
  quick: QuickInputs,
  advanced: AdvancedInputs
): PlatformAssessment {
  const regionConfig =
    (pricingConfig.regions as any)[quick.region] || pricingConfig.regions.central_india;
  const regionalMult = regionConfig.databricksMultiplier;

  const nodes = clamp(Math.ceil(quick.dataVolumeGB / 200), 1, 25);
  const activeHrsPerDay =
    quick.processingPattern === 'near_realtime' ? 18 : quick.processingPattern === 'hourly' ? 8 : 4;
  const monthlyActiveHrs = activeHrsPerDay * 30;

  const sqlNodes = quick.concurrentUsers <= 10 ? 2 : quick.concurrentUsers <= 50 ? 4 : 8;
  const autoStopFactor = quick.processingPattern === 'near_realtime' ? 0.7 : 0.4;
  const sqlWarehouseHrs = HOURS_PER_MONTH * autoStopFactor;

  const sqlRates = pricingConfig.databricks.ratesUSD.sqlWarehouse;
  const sqlCost = sqlNodes * sqlRates.dbuPerHr * sqlRates.ratePerDbuUSD * sqlWarehouseHrs;

  let jobsCost = 0;
  let mlCost = 0;
  let allPurposeCost = 0;

  if (quick.workloadMix !== 'bi_only') {
    const jobsRates = pricingConfig.databricks.ratesUSD.jobsCompute;
    jobsCost = nodes * jobsRates.dbuPerHr * jobsRates.ratePerDbuUSD * monthlyActiveHrs;

    const interactiveCount = advanced.notebooksCount || 3;
    const apRates = pricingConfig.databricks.ratesUSD.allPurpose;
    allPurposeCost = interactiveCount * apRates.dbuPerHr * apRates.ratePerDbuUSD * 100;
  }

  if (quick.workloadMix === 'bi_eng_ml' || advanced.mlWorkloadsCount) {
    const mlRates = pricingConfig.databricks.ratesUSD.mlCompute;
    const mlNodes = clamp(Math.ceil(nodes / 2), 2, 10);
    mlCost = mlNodes * mlRates.dbuPerHr * mlRates.ratePerDbuUSD * 250;
  }

  const storageGB = advanced.totalStorageGB || quick.dataVolumeGB * 30;
  const storageUSD = storageGB * pricingConfig.databricks.adlsStoragePerGBUSD;

  const rawCompute = (sqlCost + jobsCost + allPurposeCost + mlCost) * regionalMult;
  const lowMonthlyUSD = roundToNearest50(rawCompute * 0.85 + storageUSD);
  const highMonthlyUSD = roundToNearest50(rawCompute * 1.3 + storageUSD);

  const lowAnnualUSD = lowMonthlyUSD * 12;
  const highAnnualUSD = highMonthlyUSD * 12;

  const totalMonthlyDBUs = Math.round((sqlCost + jobsCost + allPurposeCost + mlCost) / 0.35);

  // Granular Cost Breakdown
  const dbuComputeCost = roundToNearest50(rawCompute * 0.65);
  const azureVmCost = roundToNearest50(rawCompute * 0.35);
  const granularCosts: GranularCostBreakdown = {
    computeCost: dbuComputeCost,
    storageCost: Math.round(storageUSD),
    warehouseOrVmsCost: azureVmCost,
    powerBiOrUnityText: 'Unity Catalog Included',
    totalCost: lowMonthlyUSD,
    formattedCompute: formatRegionalCurrency(dbuComputeCost, quick.region),
    formattedStorage: formatRegionalCurrency(storageUSD, quick.region),
    formattedWarehouseOrVms: formatRegionalCurrency(azureVmCost, quick.region),
    formattedTotal: formatRegionalCurrency(lowMonthlyUSD, quick.region),
  };

  // Platform Score Calculation with Expanded Skillsets
  let platformScore = 87;
  if (quick.workloadMix === 'bi_eng_ml') platformScore += 8;
  if (['python_spark', 'scala_spark', 'r_statistics'].includes(quick.teamSkillset)) platformScore += 6;
  if (quick.processingPattern === 'near_realtime') platformScore += 3;
  platformScore = clamp(platformScore, 70, 98);

  const decisionBadges: DecisionBadges = {
    pros: ['✔ Superior Spark Engine', '✔ Industry MLflow MLOps', '✔ Unity Catalog Governance', '✔ Granular Spot VM Scaling'],
    cons: ['⚠ Dual-Billing Complexity', '⚠ Requires Cluster Admin', '⚠ No Native Direct Lake Zero-Copy'],
  };

  let primaryCostDriver = '';
  if (quick.workloadMix === 'bi_only') {
    primaryCostDriver = `SQL Warehouse serverless compute (${sqlNodes} nodes for ${quick.concurrentUsers} BI users)`;
  } else if (quick.workloadMix === 'bi_eng_ml') {
    primaryCostDriver = `All-Purpose ML clusters & Jobs Compute for daily ${quick.dataVolumeGB} GB pipelines`;
  } else {
    primaryCostDriver = `Jobs Compute clusters (${nodes} nodes) for scheduled batch ETL`;
  }

  const sizingReason = `Cluster allocation: ${sqlNodes}-node SQL Warehouse for interactive BI queries + ${nodes}-node Jobs cluster for batch pipelines.`;

  const keyAssumptions = [
    `Databricks DBU rates in ${regionConfig.name} with applied regional multiplier.`,
    `EXCLUDES Azure VM Infrastructure costs (VM instance pricing billed separately by Azure).`,
    `ADLS Gen2 storage estimated at ${storageGB} GB (${formatRegionalCurrency(storageUSD, quick.region)}/mo).`,
    `SQL Warehouse auto-stop configured at 10-15 minutes of inactivity.`,
  ];

  const strengths = [
    'Industry-leading Spark engine performance & Delta Live Tables (DLT) pipeline automation.',
    'Unity Catalog: Fine-grained multi-cloud data governance, lineage, and access controls.',
    'Native MLOps: Full integration with MLflow, Feature Store, and custom GPU training nodes.',
    'Flexible autoscaling clusters with Spot VM support to dramatically reduce batch execution costs.',
  ];

  const risks = [
    'Higher operational complexity: Requires cluster sizing, workspace admin, and DBU budget management.',
    'Dual-billing transparency: Requires tracking both Databricks DBU charges and Azure VM Infrastructure charges.',
    'Power BI queries require SQL Warehouse cluster uptime (no native zero-copy Direct Lake equivalent).',
  ];

  const confidenceObj = calculateConfidence(quick, advanced);

  return {
    platform: 'Azure Databricks',
    monthlyCostRange: { low: lowMonthlyUSD, high: highMonthlyUSD },
    annualCostRange: { low: lowAnnualUSD, high: highAnnualUSD },
    formattedMonthlyCost: `${formatRegionalCurrency(lowMonthlyUSD, quick.region)} – ${formatRegionalCurrency(highMonthlyUSD, quick.region)}`,
    formattedAnnualCost: `${formatRegionalCurrency(lowAnnualUSD, quick.region)} – ${formatRegionalCurrency(highAnnualUSD, quick.region)}`,
    suggestedSKU: `${sqlNodes}-Node SQL Warehouse + ${nodes}-Node Jobs Cluster`,
    confidenceScore: confidenceObj.score,
    confidenceReason: confidenceObj.reason,
    primaryCostDriver,
    sizingReason,
    keyAssumptions,
    strengths,
    risks,
    dbuUsage: `~${totalMonthlyDBUs.toLocaleString()} DBUs / month`,
    clusterSize: `${sqlNodes + nodes} total worker nodes across SQL & Jobs compute`,
    platformScore,
    matchPercentage: platformScore,
    granularCosts,
    decisionBadges,
  };
}

// ─── DIMENSION COMPARISON ──────────────────────────────────────────────────

export function generateComparisons(
  quick: QuickInputs,
  fabric: PlatformAssessment,
  databricks: PlatformAssessment
): DimensionComparison[] {
  const isSQLFirst = ['sql_powerbi', 'dotnet_csharp', 'dbt_snowflake'].includes(quick.teamSkillset);

  return [
    {
      dimension: 'Cost & Licensing',
      fabricRating: `${fabric.formattedMonthlyCost}/mo (Unified F-SKU)`,
      databricksRating: `${databricks.formattedMonthlyCost}/mo (DBUs + VM)`,
      verdict: fabric.monthlyCostRange.low <= databricks.monthlyCostRange.low ? 'Fabric' : 'Databricks',
      fabricTrafficLight: 'green',
      databricksTrafficLight: 'yellow',
      notes: 'Fabric offers predictable single-capacity billing; Databricks relies on DBUs + underlying Azure VM costs.',
    },
    {
      dimension: 'Scalability',
      fabricRating: 'Auto-smoothing CU capacity (F2 to F512)',
      databricksRating: 'Extreme horizontal cluster autoscaling & multi-cloud',
      verdict: 'Databricks',
      fabricTrafficLight: 'yellow',
      databricksTrafficLight: 'green',
      notes: 'Databricks scales petabyte-scale workloads with granular worker node autoscaling.',
    },
    {
      dimension: 'Power BI Integration',
      fabricRating: 'Native Direct Lake zero-copy reporting',
      databricksRating: 'SQL Warehouse connector (import/DirectQuery)',
      verdict: 'Fabric',
      fabricTrafficLight: 'green',
      databricksTrafficLight: 'red',
      notes: 'Fabric Direct Lake mode bypasses ingestion & import refresh memory overhead.',
    },
    {
      dimension: 'Data Engineering',
      fabricRating: 'Data Factory Pipelines & Synapse Notebooks',
      databricksRating: 'Delta Live Tables (DLT) & PySpark native',
      verdict: 'Databricks',
      fabricTrafficLight: 'yellow',
      databricksTrafficLight: 'green',
      notes: 'Databricks Delta Live Tables provides automated pipeline orchestration and expectation management.',
    },
    {
      dimension: 'Machine Learning',
      fabricRating: 'Synapse ML & AutoML (standard)',
      databricksRating: 'Native MLflow, Feature Store, GPU clusters',
      verdict: 'Databricks',
      fabricTrafficLight: 'red',
      databricksTrafficLight: 'green',
      notes: 'Databricks is the industry standard for production MLOps and LLM/GPU workloads.',
    },
    {
      dimension: 'Streaming Processing',
      fabricRating: 'Eventstream & Real-Time Intelligence',
      databricksRating: 'Structured Streaming & Delta Engine',
      verdict: quick.processingPattern === 'near_realtime' ? 'Databricks' : 'Tie',
      fabricTrafficLight: 'yellow',
      databricksTrafficLight: 'green',
      notes: 'Databricks Structured Streaming is battle-tested for high-throughput, low-latency streams.',
    },
    {
      dimension: 'Data Governance',
      fabricRating: 'Microsoft Purview & Workspace roles',
      databricksRating: 'Unity Catalog (Cross-cloud fine-grained)',
      verdict: 'Databricks',
      fabricTrafficLight: 'green',
      databricksTrafficLight: 'green',
      notes: 'Unity Catalog provides unified cross-cloud lineage, row/column security, and data sharing.',
    },
    {
      dimension: 'Operational Complexity',
      fabricRating: 'Low (Fully Managed SaaS)',
      databricksRating: 'Medium-High (Cluster & Workspace Admin)',
      verdict: 'Fabric',
      fabricTrafficLight: 'green',
      databricksTrafficLight: 'red',
      notes: 'Fabric eliminates cluster provisioning, node tuning, and infrastructure management.',
    },
    {
      dimension: 'Team Learning Curve',
      fabricRating: isSQLFirst ? 'Minimal (SQL & Power BI native)' : 'Low',
      databricksRating: isSQLFirst ? 'Moderate (PySpark & Delta Lake ramp-up)' : 'Minimal',
      verdict: isSQLFirst ? 'Fabric' : 'Databricks',
      fabricTrafficLight: isSQLFirst ? 'green' : 'yellow',
      databricksTrafficLight: isSQLFirst ? 'red' : 'green',
      notes: 'SQL and Power BI teams adapt quickly to Fabric; PySpark teams prefer Databricks.',
    },
    {
      dimension: 'Time to Production',
      fabricRating: '2–4 weeks (Turnkey SaaS workspace)',
      databricksRating: '4–8 weeks (Workspace & cluster setup)',
      verdict: 'Fabric',
      fabricTrafficLight: 'green',
      databricksTrafficLight: 'yellow',
      notes: 'Fabric allows rapid deployment for BI-centric organizations.',
    },
  ];
}

// ─── EXECUTIVE RECOMMENDATION ENGINE ────────────────────────────────────────

export function generateExecutiveRecommendation(
  quick: QuickInputs,
  fabric: PlatformAssessment,
  databricks: PlatformAssessment
): ExecutiveRecommendation {
  const isBIOnly = quick.workloadMix === 'bi_only';
  const isSQLFirst = ['sql_powerbi', 'dotnet_csharp', 'dbt_snowflake'].includes(quick.teamSkillset);
  const isPySparkFirst = ['python_spark', 'scala_spark', 'r_statistics'].includes(quick.teamSkillset);
  const isML = quick.workloadMix === 'bi_eng_ml';

  let recommendedPlatform: 'Microsoft Fabric' | 'Azure Databricks' | 'Tie' = 'Microsoft Fabric';
  const whySelected: string[] = [];
  const whyNotChosen: string[] = [];
  const whenMightChange: string[] = [];

  if (isBIOnly && isSQLFirst) {
    recommendedPlatform = 'Microsoft Fabric';
    whySelected.push(
      'Your BI-only workload and SQL/Power BI skillset map directly to Fabric\'s unified SaaS experience and Direct Lake mode.',
      'Fabric eliminates the need for cluster management, workspace setup, and complex ETL pipelines.',
      `Estimated monthly cost range (${fabric.formattedMonthlyCost}) delivers lower TCO without wasted spend on unused ML infrastructure.`
    );
    whyNotChosen.push(
      'Databricks introduces unnecessary cluster management overhead and VM infrastructure complexity for pure BI reporting.',
      'Databricks lacks native zero-copy Direct Lake mode, requiring Power BI queries to keep SQL Warehouses running.',
      'Higher learning curve for SQL & Power BI developers compared to Fabric\'s native SaaS environment.'
    );
    whenMightChange.push(
      'Complex PySpark data engineering or advanced MLOps requirements emerge.',
      'Data volume scales beyond several terabytes with complex streaming requirements.',
      'Multi-cloud data governance across AWS or GCP becomes a mandatory enterprise requirement.'
    );
  } else if (isML || isPySparkFirst) {
    recommendedPlatform = 'Azure Databricks';
    whySelected.push(
      `Your ${quick.teamSkillset.replace('_', ' ').toUpperCase()} team skillset and analytics roadmap align with Databricks\' core strengths in MLflow, Unity Catalog, and Delta Live Tables.`,
      'Granular cluster autoscaling and Spot VM support provide superior cost efficiency for heavy data processing.',
      'Unity Catalog offers robust, cross-cloud data governance and column-level security.'
    );
    whyNotChosen.push(
      'Fabric\'s Synapse ML ecosystem is less mature for advanced MLOps and custom GPU training nodes.',
      'Fabric\'s fixed F-SKU memory boundaries can cause query queuing during heavy Spark concurrency spikes.',
      'Fabric lacks native multi-cloud governance for organizations running datasets on AWS or GCP.'
    );
    whenMightChange.push(
      'Power BI adoption becomes the dominant driver and team prioritizes zero-copy Direct Lake performance over PySpark engineering.',
      'Executive mandate prioritizes SaaS simplicity and unified Microsoft billing over infrastructure customization.'
    );
  } else {
    recommendedPlatform = fabric.monthlyCostRange.low <= databricks.monthlyCostRange.low ? 'Microsoft Fabric' : 'Azure Databricks';
    whySelected.push(
      `For your ${quick.workloadMix.replace('_', ' + ')} workload, ${recommendedPlatform} provides the optimal balance of cost, operational simplicity, and feature velocity.`,
      'Existing team skills and target SLA window fit comfortably within default capacity allocations.'
    );
    whyNotChosen.push(
      `The non-selected platform carries higher projected TCO (${recommendedPlatform === 'Microsoft Fabric' ? databricks.formattedMonthlyCost : fabric.formattedMonthlyCost}) for this workload mix.`,
      'Requires additional architectural setup and operational overhead to achieve equivalent performance.'
    );
    whenMightChange.push(
      'Shift in primary workload mix toward heavy streaming or advanced GPU model training.',
      'Negotiated enterprise agreement discounts significantly shift list price baseline.'
    );
  }

  const executiveSummary =
    `Based on your input of ${quick.dataVolumeGB} GB/day processed, ${quick.concurrentUsers} peak BI users, and ${quick.teamSkillset.replace('_', ' ')} team skillset, ${recommendedPlatform} is the recommended architecture platform for your enterprise workload.`;

  const winnerAssessment = recommendedPlatform === 'Microsoft Fabric' ? fabric : databricks;

  const migrationTimeline: MigrationTimeline = {
    difficulty: quick.workloadMix === 'bi_eng_ml' ? 'High' : quick.workloadMix === 'bi_eng' ? 'Medium' : 'Low',
    scoreBar: quick.workloadMix === 'bi_eng_ml' ? '████████░░' : quick.workloadMix === 'bi_eng' ? '███████░░░' : '████░░░░░░',
    durationWeeks: quick.workloadMix === 'bi_eng_ml' ? '12–16 Weeks' : quick.workloadMix === 'bi_eng' ? '8–12 Weeks' : '3–6 Weeks',
    riskLevel: quick.workloadMix === 'bi_eng_ml' ? 'Medium' : 'Low',
    estimatedHours: quick.workloadMix === 'bi_eng_ml' ? 480 : 320,
  };

  const kpis: ExecutiveKPIs = {
    formattedCost: winnerAssessment.formattedMonthlyCost,
    suggestedSKU: winnerAssessment.suggestedSKU,
    confidenceScore: winnerAssessment.confidenceScore,
    migrationDifficulty: migrationTimeline.difficulty,
    estimatedDuration: migrationTimeline.durationWeeks,
    potentialSavings: '18% - 35%',
  };

  return {
    recommendedPlatform,
    confidenceScore: winnerAssessment.confidenceScore,
    matchPercentage: winnerAssessment.matchPercentage,
    executiveSummary,
    whySelected,
    whyNotChosen,
    whenMightChange,
    kpis,
    migrationTimeline,
  };
}

// ─── COST OPTIMIZATION SUGGESTIONS ──────────────────────────────────────────

export function generateOptimizations(
  quick: QuickInputs,
  fabric: PlatformAssessment,
  databricks: PlatformAssessment
): OptimizationSuggestion[] {
  const fabricSavings = roundToNearest50(fabric.monthlyCostRange.low * 0.38);
  const dbSavings = roundToNearest50(databricks.monthlyCostRange.low * 0.35);

  return [
    {
      category: 'Capacity Optimization',
      platform: 'Microsoft Fabric',
      title: 'Switch from Pay-As-You-Go to 1-Year Capacity Reservation',
      potentialSavings: `Save up to ${formatRegionalCurrency(fabricSavings, quick.region)}/month (~38%)`,
      description: 'Commit to a 1-year Fabric Capacity reservation for baseline F-SKU workloads.',
      actionableSteps: [
        'Evaluate 30-day peak Capacity Unit (CU) utilization in Fabric Capacity Metrics app.',
        'Purchase 1-year reserved capacity for baseline F-SKU in Azure Portal.',
        'Keep pay-as-you-go enabled for seasonal burst capacity.',
      ],
    },
    {
      category: 'Autoscaling & Compute',
      platform: 'Azure Databricks',
      title: 'Configure Auto-Stop & Utilize Spot VM Instances for Batch Jobs',
      potentialSavings: `Save up to ${formatRegionalCurrency(dbSavings, quick.region)}/month (~35%)`,
      description: 'Set aggressive auto-stop timeouts on SQL Warehouses and configure Spot VMs for non-critical pipelines.',
      actionableSteps: [
        'Set SQL Warehouse auto-stop to 10 minutes of inactivity.',
        'Enable Spot VMs with fallback to On-Demand for daily ETL Jobs Clusters.',
        'Migrate ad-hoc analysis notebooks to Serverless Compute to pay strictly for query duration.',
      ],
    },
    {
      category: 'Architecture Best Practice',
      platform: 'Both',
      title: 'Adopt Direct Lake & Delta Parquet Storage Standards',
      potentialSavings: 'Reduced memory overhead & zero data movement',
      description: 'Store all silver/gold data in open Delta Lake format to eliminate ingestion hops and import mode refreshes.',
      actionableSteps: [
        'Standardize all data transformations on Delta Parquet format.',
        'Use OneLake shortcuts or Unity Catalog external locations for zero-copy access.',
        'Enable Direct Lake mode on Power BI semantic models for instant report performance.',
      ],
    },
  ];
}

// ─── MAIN EVALUATION ENTRY POINT ───────────────────────────────────────────

export function runFullAssessment(
  quick: QuickInputs,
  advanced: AdvancedInputs = {}
): AssessmentResult {
  const fabric = evaluateFabric(quick, advanced);
  const databricks = evaluateDatabricks(quick, advanced);
  const comparisons = generateComparisons(quick, fabric, databricks);
  const recommendation = generateExecutiveRecommendation(quick, fabric, databricks);
  const optimizations = generateOptimizations(quick, fabric, databricks);

  return {
    fabric,
    databricks,
    comparisons,
    recommendation,
    optimizations,
    pricingDate: pricingConfig.pricingDate,
  };
}
