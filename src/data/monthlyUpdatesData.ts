export interface PlatformUpdateItem {
  id: string;
  platform: 'Microsoft Fabric' | 'Azure Databricks';
  month: string; // e.g. "June 2026"
  year: number;
  title: string;
  category: 'Data Engineering' | 'Direct Lake' | 'AI & Copilot' | 'Unity Catalog' | 'Warehouse & Compute' | 'MLOps & Governance';
  impactLevel: 'Game Changer' | 'High Impact' | 'Enhancement';
  summary: string;
  architectureImpact: string;
  officialLink: string;
}

export const MONTHLY_UPDATES: PlatformUpdateItem[] = [
  // ─── JUNE 2026 ─────────────────────────────────────────────────────────────
  {
    id: 'fab-2026-06-1',
    platform: 'Microsoft Fabric',
    month: 'June 2026',
    year: 2026,
    title: 'Autonomous Data Agents & OneLake Storage Lifecycle Rules',
    category: 'AI & Copilot',
    impactLevel: 'Game Changer',
    summary: 'Introduced autonomous AI Data Agents in Fabric for automated anomaly detection, schema drift monitoring, and OneLake cold storage auto-tiering.',
    architectureImpact: 'Cuts OneLake storage costs up to 30% by auto-archiving historical bronze/silver delta files to low-cost archive tiers.',
    officialLink: 'https://community.fabric.microsoft.com/t5/Data-Engineering/bd-p/ac_dataengineering',
  },
  {
    id: 'db-2026-06-1',
    platform: 'Azure Databricks',
    month: 'June 2026',
    year: 2026,
    title: 'Unity Catalog Managed Apache Iceberg Tables & Entra Auto-Sync',
    category: 'Unity Catalog',
    impactLevel: 'Game Changer',
    summary: 'General Availability for Unity Catalog native Apache Iceberg read/write interoperability and automatic Microsoft Entra ID SCIM identity syncing.',
    architectureImpact: 'Enables zero-copy query access between Databricks, Snowflake, and Fabric OneLake using open Iceberg & Delta spec.',
    officialLink: 'https://learn.microsoft.com/azure/databricks/release-notes/',
  },

  // ─── MAY 2026 ──────────────────────────────────────────────────────────────
  {
    id: 'fab-2026-05-1',
    platform: 'Microsoft Fabric',
    month: 'May 2026',
    year: 2026,
    title: 'GPU-Accelerated Data Warehouse & Tabbed Multitasking Studio',
    category: 'Warehouse & Compute',
    impactLevel: 'High Impact',
    summary: 'Fabric Data Warehouse added preview support for NVMe GPU acceleration on large spatial joins, alongside a tabbed developer workspace experience.',
    architectureImpact: 'Accelerates massive analytical joins (10B+ rows) without requiring cluster tier upgrades.',
    officialLink: 'https://community.fabric.microsoft.com/t5/Data-Engineering/bd-p/ac_dataengineering',
  },
  {
    id: 'db-2026-05-1',
    platform: 'Azure Databricks',
    month: 'May 2026',
    year: 2026,
    title: 'Databricks AI/BI Genie Conversational Analytics & Claude 3.5 Integration',
    category: 'AI & Copilot',
    impactLevel: 'High Impact',
    summary: 'AI/BI Genie received hosted LLM model support (Claude 3.5 Sonnet / GPT-4o) with natural language text-to-SQL dashboard generation.',
    architectureImpact: 'Allows non-technical executive BI users to query Unity Catalog datasets directly in plain English.',
    officialLink: 'https://learn.microsoft.com/azure/databricks/release-notes/',
  },

  // ─── APRIL 2026 ────────────────────────────────────────────────────────────
  {
    id: 'fab-2026-04-1',
    platform: 'Microsoft Fabric',
    month: 'April 2026',
    year: 2026,
    title: 'Fabric VS Code Extension & CI/CD Git Branching Improvements',
    category: 'Data Engineering',
    impactLevel: 'High Impact',
    summary: 'Enhanced VS Code remote development extension for Fabric Synapse Notebooks and native Git multi-branch merging for deployment pipelines.',
    architectureImpact: 'Streamlines enterprise engineering workflows and reduces time to production deployment.',
    officialLink: 'https://community.fabric.microsoft.com/t5/Data-Engineering/bd-p/ac_dataengineering',
  },
  {
    id: 'db-2026-04-1',
    platform: 'Azure Databricks',
    month: 'April 2026',
    year: 2026,
    title: 'Lakehouse Serverless SQL Auto-Stop & Sub-Second Cold Start',
    category: 'Warehouse & Compute',
    impactLevel: 'High Impact',
    summary: 'Serverless SQL Warehouses updated with sub-second cold start times and aggressive 5-minute auto-stop inactivity triggers.',
    architectureImpact: 'Reduces idle compute DBUs on ad-hoc BI reporting workloads by up to 40%.',
    officialLink: 'https://learn.microsoft.com/azure/databricks/release-notes/',
  },

  // ─── MARCH 2026 ────────────────────────────────────────────────────────────
  {
    id: 'fab-2026-03-1',
    platform: 'Microsoft Fabric',
    month: 'March 2026',
    year: 2026,
    title: 'Direct Lake Semantic Model Memory Optimization & Auto-Refreshes',
    category: 'Direct Lake',
    impactLevel: 'Game Changer',
    summary: 'Direct Lake mode added dynamic memory paging and automated column framing for Power BI semantic models over 1 TB.',
    architectureImpact: 'Eliminates memory paging caps on F32 / F64 capacities, allowing 100M+ row models without fallbacks.',
    officialLink: 'https://community.fabric.microsoft.com/t5/Data-Engineering/bd-p/ac_dataengineering',
  },
  {
    id: 'db-2026-03-1',
    platform: 'Azure Databricks',
    month: 'March 2026',
    year: 2026,
    title: 'Lakeflow Pipelines (DLT 2.0) & Real-Time Eventstream Connector',
    category: 'Data Engineering',
    impactLevel: 'High Impact',
    summary: 'Next-generation Lakeflow automated ingestion pipelines with declarative Python syntax and streaming CDC from Kafka/Event Hubs.',
    architectureImpact: 'Simplifies streaming medallion ingestion architecture without writing custom PySpark Structured Streaming loops.',
    officialLink: 'https://learn.microsoft.com/azure/databricks/release-notes/',
  },

  // ─── FEBRUARY 2026 ──────────────────────────────────────────────────────────
  {
    id: 'fab-2026-02-1',
    platform: 'Microsoft Fabric',
    month: 'February 2026',
    year: 2026,
    title: 'OneLake Data Catalog & GraphQL API CI/CD Integration',
    category: 'MLOps & Governance',
    impactLevel: 'Enhancement',
    summary: 'Released OneLake Catalog workspace lineage view and automated GraphQL endpoint schema generation via Fabric REST API.',
    architectureImpact: 'Improves cross-workspace governance and lineage tracking for enterprise compliance.',
    officialLink: 'https://community.fabric.microsoft.com/t5/Data-Engineering/bd-p/ac_dataengineering',
  },
  {
    id: 'db-2026-02-1',
    platform: 'Azure Databricks',
    month: 'February 2026',
    year: 2026,
    title: 'MLflow 3.0 & Foundation Model Fine-Tuning API',
    category: 'MLOps & Governance',
    impactLevel: 'High Impact',
    summary: 'MLflow 3.0 GA release featuring native RAG evaluation frameworks, prompt engineering playgrounds, and 1-click model deployments.',
    architectureImpact: 'Provides enterprise-grade MLOps for generative AI, custom LLMs, and agentic workflows.',
    officialLink: 'https://learn.microsoft.com/azure/databricks/release-notes/',
  },

  // ─── JANUARY 2026 ───────────────────────────────────────────────────────────
  {
    id: 'fab-2026-01-1',
    platform: 'Microsoft Fabric',
    month: 'January 2026',
    year: 2026,
    title: 'AI Semantic Summaries & Incremental Warehouse Statistics',
    category: 'Warehouse & Compute',
    impactLevel: 'Enhancement',
    summary: 'Automated AI executive summaries for Power BI semantic models and incremental auto-stats updates for Fabric Data Warehouses.',
    architectureImpact: 'Optimizes query execution plans automatically as daily volume grows.',
    officialLink: 'https://community.fabric.microsoft.com/t5/Data-Engineering/bd-p/ac_dataengineering',
  },
  {
    id: 'db-2026-01-1',
    platform: 'Azure Databricks',
    month: 'January 2026',
    year: 2026,
    title: 'Liquid Clustering Default for Delta Tables & Automatic Compaction',
    category: 'Warehouse & Compute',
    impactLevel: 'High Impact',
    summary: 'Liquid Clustering replaces traditional Z-Ordering as default table optimization format with zero-downtime background compaction.',
    architectureImpact: 'Reduces table maintenance job runtime by 60% and speeds up point lookup queries.',
    officialLink: 'https://learn.microsoft.com/azure/databricks/release-notes/',
  },
];
