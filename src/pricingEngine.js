/**
 * Fabric vs Databricks Advanced Pricing & Sizing Engine
 *
 * All constants are derived from publicly available list pricing.
 * Last verified: July 2025
 */

// ─── REGIONAL MULTIPLIERS ───────────────────────────────────────────────────

export const REGIONS = {
  us_east: {
    id: 'us_east',
    name: 'US East (N. Virginia)',
    fabricMultiplier: 1.0,
    databricksMultiplier: 1.0,
    isEstimateForDatabricks: false,
  },
  india: {
    id: 'india',
    name: 'India (Central / South India)',
    fabricMultiplier: 0.24 / 0.18, // ~1.3333 (+33.3% confirmed rate: $0.24 vs $0.18 per CU-hr)
    databricksMultiplier: 1.20,     // ~1.20 (+20% estimated VM cost premium for D-series in India)
    isEstimateForDatabricks: true,
  },
};

const FABRIC_SKUS = [
  { sku: 'F2',  cus: 2,   monthlyUSD: 262  },
  { sku: 'F4',  cus: 4,   monthlyUSD: 525  },
  { sku: 'F8',  cus: 8,   monthlyUSD: 1050 },
  { sku: 'F16', cus: 16,  monthlyUSD: 2100 },
  { sku: 'F32', cus: 32,  monthlyUSD: 4200 },
  { sku: 'F64', cus: 64,  monthlyUSD: 8400 },
  { sku: 'F128',cus: 128, monthlyUSD: 16800},
  { sku: 'F256',cus: 256, monthlyUSD: 33600},
  { sku: 'F512',cus: 512, monthlyUSD: 67200},
];

const DATABRICKS_RATES = {
  sql_warehouse: { dbuPerHr: 2, dbuRateUSD: 0.22 },
  jobs_compute:  { dbuPerHr: 2, dbuRateUSD: 0.30 },
  all_purpose:   { dbuPerHr: 4, dbuRateUSD: 0.55 },
  ml_compute:    { dbuPerHr: 4, dbuRateUSD: 0.55 },
};

const HOURS_PER_MONTH = 730;

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const bracketCost = (usd) => Math.round(usd / 50) * 50;

export const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

// ─── FABRIC ESTIMATION ENGINE ─────────────────────────────────────────────

export function estimateFabricAdvanced(inputs, adv) {
  const { dataVolumeGB, concurrentUsers, workloadMix, refreshPattern, region } = inputs;
  const regionalMult = REGIONS[region || 'india']?.fabricMultiplier || 1.3333;

  // Basic CU requirements
  const cuFromUsers = Math.max(4, Math.ceil(concurrentUsers / 8) * 4);
  let cuFromData = 2;
  if (dataVolumeGB > 2000) cuFromData = 64;
  else if (dataVolumeGB > 500) cuFromData = 16;
  else if (dataVolumeGB > 100) cuFromData = 8;
  else if (dataVolumeGB > 30) cuFromData = 4;

  let cuFromMix = 2;
  if (workloadMix === 'bi_eng_ml') cuFromMix = 16;
  else if (workloadMix === 'bi_eng') cuFromMix = 8;

  // Advanced factors
  const pipelinesCount = Number(adv.pipelinesCount || adv.dfPipelinesCount || 0);
  const notebooksCount = Number(adv.notebooksCount || 0);
  const dataflowsCount = Number(adv.dataflowGen2Count || 0);
  const lakehousesCount = Number(adv.lakehousesCount || 1);
  const storageTotalGB = Number(adv.totalStorageGB || dataVolumeGB * 30);

  // Extra CU demand from pipeline concurrency & dataflows
  let advCUHeadroom = 0;
  if (pipelinesCount > 20) advCUHeadroom += 8;
  if (dataflowsCount > 10) advCUHeadroom += 8;
  if (notebooksCount > 15) advCUHeadroom += 8;

  const rtMultiplier = refreshPattern === 'near_realtime' ? 2 : 1;
  const totalRequiredCU = Math.max(cuFromUsers, cuFromData, cuFromMix) * rtMultiplier + advCUHeadroom;

  const skuIdx = FABRIC_SKUS.findIndex((s) => s.cus >= totalRequiredCU);
  const resolvedIdx = skuIdx === -1 ? FABRIC_SKUS.length - 1 : skuIdx;
  const baseSKU = FABRIC_SKUS[resolvedIdx];
  const upperSKU = FABRIC_SKUS[Math.min(resolvedIdx + 1, FABRIC_SKUS.length - 1)];

  // Base compute cost
  const rawBaseUSD = baseSKU.monthlyUSD * regionalMult;

  // Storage cost (OneLake storage ~$0.023 per GB/mo)
  const storageCostUSD = storageTotalGB * 0.023;

  // Granular Cost Breakdown
  let biShare = 0.5;
  let etlShare = 0.3;
  let notebookShare = 0.1;
  let mlShare = 0.1;

  if (workloadMix === 'bi_only') {
    biShare = 0.8; etlShare = 0.15; notebookShare = 0.05; mlShare = 0;
  } else if (workloadMix === 'bi_eng_ml') {
    biShare = 0.35; etlShare = 0.35; notebookShare = 0.15; mlShare = 0.15;
  }

  const sqlCompute = rawBaseUSD * (biShare + 0.1);
  const etlCompute = rawBaseUSD * etlShare;
  const notebookCompute = rawBaseUSD * notebookShare;
  const mlCompute = rawBaseUSD * mlShare;

  const totalMonthlyLow = bracketCost(rawBaseUSD + storageCostUSD);
  const totalMonthlyHigh = bracketCost(upperSKU.monthlyUSD * regionalMult + storageCostUSD * 1.2);

  // Primary Driver
  let primaryDriver = `Sized by ${baseSKU.sku} capacity (${baseSKU.cus} CUs) for ${concurrentUsers} BI users & ${dataVolumeGB} GB/day data`;
  if (advCUHeadroom > 0) {
    primaryDriver += ` (+${advCUHeadroom} CUs for ${pipelinesCount} pipelines & ${notebooksCount} notebooks)`;
  }

  const caveats = [];
  if (region === 'india') {
    caveats.push('Fabric (confirmed): India regions run $0.24/CU-hour vs $0.18/CU-hour in US East (~33% premium).');
  }
  if (adv.directLake === 'yes') {
    caveats.push('Direct Lake mode active: Eliminates Power BI import refresh memory overhead, optimizing CU efficiency.');
  }

  return {
    platform: 'Microsoft Fabric',
    skuLabel: `${baseSKU.sku} (${baseSKU.cus} CUs)`,
    recommendedSKU: baseSKU.sku,
    low: totalMonthlyLow,
    high: totalMonthlyHigh,
    primaryDriver,
    caveats,
    breakdown: {
      sqlCompute: bracketCost(sqlCompute),
      etlCompute: bracketCost(etlCompute),
      notebookCompute: bracketCost(notebookCompute),
      mlCompute: bracketCost(mlCompute),
      storage: bracketCost(storageCostUSD),
      bi: bracketCost(sqlCompute * 0.7),
    },
  };
}

// ─── DATABRICKS ESTIMATION ENGINE ──────────────────────────────────────────

export function estimateDatabricksAdvanced(inputs, adv) {
  const { dataVolumeGB, concurrentUsers, workloadMix, refreshPattern, region } = inputs;
  const regionalMult = REGIONS[region || 'india']?.databricksMultiplier || 1.20;

  const nodes = clamp(Math.ceil(dataVolumeGB / 200), 1, 25);
  const activeHrsPerDay = refreshPattern === 'near_realtime' ? 18 : 4;
  const monthlyActiveHrs = activeHrsPerDay * 30;

  // SQL Warehouse Nodes
  const warehouseNodes = concurrentUsers <= 10 ? 2 : concurrentUsers <= 50 ? 4 : 8;
  const warehouseAutoStopFactor = refreshPattern === 'near_realtime' ? 0.7 : 0.4;
  const warehouseHrs = HOURS_PER_MONTH * warehouseAutoStopFactor;

  const sqlComputeBase = warehouseNodes * DATABRICKS_RATES.sql_warehouse.dbuPerHr * DATABRICKS_RATES.sql_warehouse.dbuRateUSD * warehouseHrs;

  let etlComputeBase = 0;
  let mlComputeBase = 0;
  let notebookComputeBase = 0;

  if (workloadMix !== 'bi_only') {
    const jobsCount = Number(adv.scheduledJobsCount || adv.pipelinesCount || 5);
    const jobsNodes = clamp(Math.ceil(nodes * (jobsCount / 10)), 2, 20);
    etlComputeBase = jobsNodes * DATABRICKS_RATES.jobs_compute.dbuPerHr * DATABRICKS_RATES.jobs_compute.dbuRateUSD * monthlyActiveHrs;

    const interactiveCount = Number(adv.interactiveClustersCount || adv.notebooksCount || 3);
    notebookComputeBase = interactiveCount * DATABRICKS_RATES.all_purpose.dbuPerHr * DATABRICKS_RATES.all_purpose.dbuRateUSD * (100);
  }

  if (workloadMix === 'bi_eng_ml' || adv.mlflow === 'yes') {
    const mlNodes = clamp(Math.ceil(nodes / 2), 2, 10);
    mlComputeBase = mlNodes * DATABRICKS_RATES.ml_compute.dbuPerHr * DATABRICKS_RATES.ml_compute.dbuRateUSD * 300;
  }

  // Storage (Azure Blob / ADLS Gen2 ~$0.02 per GB/mo)
  const storageTotalGB = Number(adv.totalStorageGB || dataVolumeGB * 30);
  const storageCostUSD = storageTotalGB * 0.02;

  const rawTotal = (sqlComputeBase + etlComputeBase + notebookComputeBase + mlComputeBase) * regionalMult;
  const totalMonthlyLow = bracketCost(rawTotal * 0.85 + storageCostUSD);
  const totalMonthlyHigh = bracketCost(rawTotal * 1.3 + storageCostUSD);

  let primaryDriver = `Sized by SQL Warehouse (${warehouseNodes} nodes) + Jobs Compute (${nodes} nodes)`;
  if (adv.photon === 'yes') {
    primaryDriver += ' — Photon Engine enabled for 2-3x faster query performance';
  }

  const caveats = [];
  if (region === 'india') {
    caveats.push('Databricks (partially confirmed estimate): DBU rates are stable, but underlying Azure Central India VMs run ~15-25% higher.');
  }

  return {
    platform: 'Databricks',
    skuLabel: `${warehouseNodes} Node SQL Warehouse + ${nodes} Node Jobs Cluster`,
    recommendedSKU: `Medium SQL Warehouse (${warehouseNodes} nodes)`,
    low: totalMonthlyLow,
    high: totalMonthlyHigh,
    primaryDriver,
    caveats,
    breakdown: {
      sqlCompute: bracketCost(sqlComputeBase * regionalMult),
      etlCompute: bracketCost(etlComputeBase * regionalMult),
      notebookCompute: bracketCost(notebookComputeBase * regionalMult),
      mlCompute: bracketCost(mlComputeBase * regionalMult),
      storage: bracketCost(storageCostUSD),
      bi: bracketCost(sqlComputeBase * 0.8 * regionalMult),
    },
  };
}

// ─── QUALITATIVE & METRICS ENGINE ───────────────────────────────────────────

export function computeAdvancedMetrics(inputs, adv, fabricEst, dbEst) {
  const { workloadMix, skillset, refreshPattern, dataVolumeGB } = inputs;
  const advFilledCount = Object.values(adv).filter((v) => v !== '' && v !== undefined).length;

  // Confidence Score (75% base + 1.5% per advanced input filled, max 98%)
  const confidenceScore = Math.min(98, 75 + Math.round(advFilledCount * 1.5));

  // Estimated Batch Runtime
  const volumeFactor = Math.max(15, Math.round(dataVolumeGB / 15));
  const fabricRuntimeMins = refreshPattern === 'near_realtime' ? 'Near Real-Time (<2 mins)' : `${Math.max(12, Math.round(volumeFactor * 0.9))} mins`;
  const dbRuntimeMins = refreshPattern === 'near_realtime' ? 'Near Real-Time (<45 secs)' : `${Math.max(8, Math.round(volumeFactor * 0.6))} mins`;

  // Cost Drivers
  const costDrivers = [
    { title: 'Peak BI Concurrency', impact: `${inputs.concurrentUsers} active report users driving compute floor` },
    { title: 'Ingestion Volume', impact: `${dataVolumeGB} GB processed per day` },
    { title: 'Processing Pattern', impact: refreshPattern === 'near_realtime' ? 'Continuous streaming overhead' : 'Scheduled daily batch window' },
  ];

  // Optimization Opportunities & Savings
  const fabricOptSavings = Math.round(fabricEst.low * 0.38);
  const dbOptSavings = Math.round(dbEst.low * 0.35);

  const optimizationOpportunities = [
    {
      platform: 'Microsoft Fabric',
      opportunity: 'Reserve Capacity (1-Year Commitment)',
      savings: `${fmtUSD(fabricOptSavings)}/month (Save ~38%)`,
      description: 'Switch from Pay-As-You-Go F-SKU to 1-year capacity reservation.',
    },
    {
      platform: 'Databricks',
      opportunity: 'Auto-Stop & Spot Instances for Batch Jobs',
      savings: `${fmtUSD(dbOptSavings)}/month (Save ~35%)`,
      description: 'Set 10-min SQL Warehouse auto-stop and use Spot VMs for non-critical pipelines.',
    },
  ];

  // Strengths & Weaknesses
  const platformComparison = {
    fabric: {
      strengths: [
        'Native Direct Lake mode: Zero-copy Power BI performance without data ingestion.',
        'SaaS simplicity: Unified billing, zero cluster or infrastructure management.',
        'Seamless Microsoft ecosystem integration (Microsoft 365, Teams, Purview).',
        'Single capacity allocation shared dynamically across all workloads.',
      ],
      weaknesses: [
        'Less mature MLOps & custom Python container ecosystem compared to Databricks.',
        'Fixed F-SKU memory boundaries can trigger throttling during unexpected spikes.',
        'Limited multi-cloud support (Azure native, AWS via OneLake shortcuts).',
      ],
    },
    databricks: {
      strengths: [
        'Best-in-class Spark engine & Delta Live Tables for complex data engineering.',
        'Industry-standard MLOps suite (MLflow, Feature Store, Native GPU support).',
        'Unity Catalog offers granular cross-cloud governance & lineage.',
        'Fine-grained cluster autoscaling with Spot instance support.',
      ],
      weaknesses: [
        'Higher operational & administration overhead (cluster tuning, DBU management).',
        'Power BI connection requires SQL Warehouse overhead (no zero-copy Direct Lake equivalent).',
        'Dual billing model (Databricks DBUs + Cloud Provider Infrastructure/VMs).',
      ],
    },
  };

  // Complexities & Effort (1-5 scale)
  const isSQLFirst = skillset === 'sql_powerbi';
  const isML = workloadMix === 'bi_eng_ml';

  const qualitativeMetrics = {
    fabric: {
      migrationComplexity: isSQLFirst ? 'Low (2/5)' : 'Medium (3/5)',
      operationalComplexity: 'Low (1/5) - Fully Managed SaaS',
      adminEffort: '0.2 FTE / month',
      learningCurve: isSQLFirst ? '1-2 weeks (Power BI / T-SQL native)' : '3-4 weeks',
      timeToProduction: '2-4 weeks',
      enterpriseReadinessScore: 90,
      architectureRecommendation: 'Medallion Architecture in OneLake (Bronze → Silver Lakehouse → Gold Direct Lake Semantic Model)',
    },
    databricks: {
      migrationComplexity: isSQLFirst ? 'High (4/5)' : 'Medium (2/5)',
      operationalComplexity: 'Medium-High (4/5) - Cluster & Workspace Config',
      adminEffort: '0.5 FTE / month',
      learningCurve: isSQLFirst ? '4-6 weeks (PySpark & Delta Lake ramp-up)' : '1-2 weeks',
      timeToProduction: '4-8 weeks',
      enterpriseReadinessScore: 95,
      architectureRecommendation: 'Lakehouse Architecture with Delta Live Tables & Unity Catalog (Lakehouse Federation → Delta Lake → SQL Warehouse)',
    },
  };

  return {
    confidenceScore,
    runtimes: { fabric: fabricRuntimeMins, databricks: dbRuntimeMins },
    costDrivers,
    optimizationOpportunities,
    platformComparison,
    qualitativeMetrics,
  };
}

// ─── MAIN ADVANCED ENTRY POINT ──────────────────────────────────────────────

export function computeFitScores(inputs) {
  const { workloadMix, skillset, refreshPattern, dataVolumeGB, concurrentUsers } = inputs;
  let fabricScore = 0;
  let fabricReason = '';
  if (skillset === 'sql_powerbi') fabricScore += 2;
  if (skillset === 'mixed') fabricScore += 1;
  if (skillset === 'python_spark') fabricScore -= 1;
  if (workloadMix === 'bi_only') fabricScore += 2;
  if (workloadMix === 'bi_eng') fabricScore += 1;
  if (workloadMix === 'bi_eng_ml') fabricScore -= 1;
  if (refreshPattern === 'batch') fabricScore += 1;
  if (refreshPattern === 'near_realtime') fabricScore -= 1;
  if (concurrentUsers > 50) fabricScore += 1;

  if (workloadMix === 'bi_only' && skillset === 'sql_powerbi') {
    fabricReason = 'Your BI-only, SQL/Power BI-first profile is exactly what Fabric was designed for — native Power BI integration eliminates a whole tier of data movement.';
  } else if (workloadMix === 'bi_eng_ml' && skillset === 'python_spark') {
    fabricReason = 'Fabric\'s ML story relies on Synapse Spark, which adds friction for Python/Spark-first teams who already know Databricks\' native MLflow/MLOps tooling.';
  } else if (refreshPattern === 'near_realtime') {
    fabricReason = 'Near-real-time streaming is possible via Eventstream but is less mature than Databricks Structured Streaming — expect more configuration overhead.';
  } else if (workloadMix === 'bi_only') {
    fabricReason = 'BI-only workloads are Fabric\'s sweet spot, but your mixed skillset means the SQL-first UX may not be a differentiator.';
  } else {
    fabricReason = 'Fabric suits BI + moderate engineering well, especially if your team uses Power BI today — fewer platform hops to manage.';
  }

  let databricksScore = 0;
  let databricksReason = '';
  if (skillset === 'python_spark') databricksScore += 2;
  if (skillset === 'mixed') databricksScore += 1;
  if (skillset === 'sql_powerbi') databricksScore -= 1;
  if (workloadMix === 'bi_eng_ml') databricksScore += 2;
  if (workloadMix === 'bi_eng') databricksScore += 1;
  if (workloadMix === 'bi_only') databricksScore -= 1;
  if (refreshPattern === 'near_realtime') databricksScore += 1;
  if (dataVolumeGB > 1000) databricksScore += 1;

  if (workloadMix === 'bi_eng_ml' && skillset === 'python_spark') {
    databricksReason = 'Your Python/Spark-first team paired with ML needs is Databricks\' home court — Unity Catalog, MLflow, and Delta Live Tables are battle-tested at this stack.';
  } else if (workloadMix === 'bi_only' && skillset === 'sql_powerbi') {
    databricksReason = 'Databricks is viable for BI, but the SQL Warehouse + Power BI connector combo adds cost and complexity your SQL-first team won\'t need.';
  } else if (skillset === 'python_spark') {
    databricksReason = 'Your Python/Spark skillset maps directly to Databricks notebooks and Delta pipelines — zero ramp-up cost for the engineering work.';
  } else if (workloadMix === 'bi_only') {
    databricksReason = 'Databricks can serve BI via SQL Warehouses, but you\'d be paying for capabilities (Spark, MLflow) you won\'t use at the BI-only stage.';
  } else {
    databricksReason = 'Databricks handles the engineering + BI combo well, but its strength compounds as ML matures — if ML is a future direction, starting here avoids a later migration.';
  }

  const toVerdict = (score) => {
    if (score >= 3) return 'better_fit';
    if (score >= 1) return 'workable';
    return 'poor_fit';
  };

  return {
    fabric: { verdict: toVerdict(fabricScore), reason: fabricReason, score: fabricScore },
    databricks: { verdict: toVerdict(databricksScore), reason: databricksReason, score: databricksScore },
  };
}

export function buildRecommendation(inputs, fit, fabricEst, databricksEst) {
  const { workloadMix, skillset, region } = inputs;
  const fabricWins = fit.fabric.score > fit.databricks.score;
  const tied = fit.fabric.score === fit.databricks.score;

  const fabricRange = `${fmtUSD(fabricEst.low)}–${fmtUSD(fabricEst.high)}/mo`;
  const dbRange = `${fmtUSD(databricksEst.low)}–${fmtUSD(databricksEst.high)}/mo`;
  const regionName = REGIONS[region || 'india']?.name || 'selected region';

  let winner = fabricWins ? 'Fabric' : 'Databricks';
  let loser = fabricWins ? 'Databricks' : 'Fabric';
  let winnerRange = fabricWins ? fabricRange : dbRange;
  let loserRange = fabricWins ? dbRange : fabricRange;

  if (tied) {
    return `In ${regionName}, both platforms are roughly equivalent for your inputs. Fabric (${fabricRange}) has a simpler licensing model for BI-heavy orgs; Databricks (${dbRange}) pays off faster if Python/Spark usage grows.`;
  }

  let rec = `For your inputs in ${regionName}, ${winner} (${winnerRange}) is the stronger fit`;

  if (workloadMix === 'bi_only' && skillset === 'sql_powerbi') {
    rec += ' — your BI-only, SQL/Power BI-first profile maps directly to Fabric\'s unified licensing model with no wasted spend on ML infrastructure.';
    rec += ` ${loser} (${loserRange}) becomes relevant if engineering pipelines or Python ML workloads emerge.`;
  } else if (workloadMix === 'bi_eng_ml' && skillset === 'python_spark') {
    rec += ' — the Python/Spark-first team doing active ML is Databricks\' core thesis, and the MLflow + Delta Live Tables stack removes friction at each stage.';
    rec += ` Fabric (${fabricRange}) is a future option if Power BI adoption drives a consolidation decision.`;
  } else if (skillset === 'mixed') {
    rec += ` given your ${workloadMix.replace('_', ' + ')} workload, though your mixed skillset means either platform has a decision curve.`;
    rec += ` Watch the ${fabricWins ? 'Databricks' : 'Fabric'} space (${loserRange}) as your workload matures.`;
  } else {
    rec += `.`;
    rec += ` ${loser} (${loserRange}) is viable but requires more tooling overhead for your specific inputs.`;
  }

  return rec;
}

export function runFullEstimation(inputs, advancedInputs = {}) {
  const fabric = estimateFabricAdvanced(inputs, advancedInputs);
  const databricks = estimateDatabricksAdvanced(inputs, advancedInputs);
  const fit = computeFitScores(inputs);
  const recommendation = buildRecommendation(inputs, fit, fabric, databricks);
  const advancedMetrics = computeAdvancedMetrics(inputs, advancedInputs, fabric, databricks);

  return {
    fabric,
    databricks,
    fit,
    recommendation,
    advancedMetrics,
  };
}

export function runEstimation(inputs) {
  return runFullEstimation(inputs, {});
}

export const PRICING_DATE = 'July 2025';


