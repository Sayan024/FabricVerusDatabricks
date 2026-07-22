import React, { useState } from 'react';
import { AdvancedInputs } from '../types/assessment';
import {
  ChevronDown, Sliders, Database, FileText, BarChart3, Cpu,
  Sparkles, HardDrive, Plug, X, Check, CheckCircle2, AlertTriangle, XCircle, Search
} from 'lucide-react';

interface AdvancedAssessmentProps {
  inputs: AdvancedInputs;
  onChange: (field: keyof AdvancedInputs, value: any) => void;
}

// Connector availability status
// 'native'  → Fabric has a built-in Data Factory connector (no gateway needed)
// 'gateway' → Requires on-premises data gateway
// 'none'    → No native connector; needs custom/REST workaround
type ConnectorStatus = 'native' | 'gateway' | 'none';

interface SourceSystem {
  id: string;
  name: string;
  icon: string;
  fabricStatus: ConnectorStatus;
  note?: string; // extra context shown on hover / in tooltip
}

// Source systems with their Fabric connector availability
// Source: https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview
const SOURCE_GROUPS: { group: string; color: string; sources: SourceSystem[] }[] = [
  {
    group: 'Microsoft Azure',
    color: 'blue',
    sources: [
      { id: 'azure_sql_db',   name: 'Azure SQL Database',           icon: '/datasource-icons/Azure SQL Database.svg', fabricStatus: 'native' },
      { id: 'azure_synapse',  name: 'Azure Synapse Analytics',       icon: '/datasource-icons/AzureSynapse.svg',       fabricStatus: 'native' },
      { id: 'azure_blob',     name: 'Azure Blob Storage',            icon: '/datasource-icons/AzureBlobs.svg',         fabricStatus: 'native' },
      { id: 'azure_adls2',    name: 'Azure Data Lake Storage Gen2',  icon: '/datasource-icons/Azure Files.svg',        fabricStatus: 'native' },
      { id: 'azure_mysql',    name: 'Azure Database for MySQL',      icon: '/datasource-icons/Maria DB.svg',           fabricStatus: 'native' },
      { id: 'azure_postgres', name: 'Azure Database for PostgreSQL', icon: '/datasource-icons/PostgreSQL.svg',         fabricStatus: 'native' },
      { id: 'azure_cosmosdb', name: 'Azure Cosmos DB',               icon: '/datasource-icons/Database.svg',           fabricStatus: 'native' },
      { id: 'azure_tables',   name: 'Azure Table Storage',           icon: '/datasource-icons/AzureTables.svg',        fabricStatus: 'native' },
      { id: 'azure_sql_mi',   name: 'Azure SQL Managed Instance',    icon: '/datasource-icons/Azure SQL Database.svg', fabricStatus: 'native' },
      { id: 'azure_hdinsight',name: 'Azure HDInsight',               icon: '/datasource-icons/AzureHdInsightClusters.svg', fabricStatus: 'native' },
    ],
  },
  {
    group: 'Databases & Warehouses',
    color: 'teal',
    sources: [
      { id: 'sql_server',  name: 'SQL Server (On-Prem)', icon: '/datasource-icons/SQL Database (on-prem).svg', fabricStatus: 'gateway', note: 'Requires On-Premises Data Gateway' },
      { id: 'oracle',      name: 'Oracle Database',       icon: '/datasource-icons/Database.svg',               fabricStatus: 'gateway', note: 'Requires On-Premises Data Gateway' },
      { id: 'mysql',       name: 'MySQL',                 icon: '/datasource-icons/Maria DB.svg',               fabricStatus: 'native'  },
      { id: 'postgresql',  name: 'PostgreSQL',            icon: '/datasource-icons/PostgreSQL.svg',             fabricStatus: 'native'  },
      { id: 'snowflake',   name: 'Snowflake',             icon: '/datasource-icons/Snowflake.svg',              fabricStatus: 'native'  },
      { id: 'ibm_db2',    name: 'IBM DB2',               icon: '/datasource-icons/IBM DB2.svg',                fabricStatus: 'gateway', note: 'Requires On-Premises Data Gateway' },
      { id: 'teradata',    name: 'Teradata',              icon: '/datasource-icons/Database.svg',               fabricStatus: 'native'  },
      { id: 'cassandra',   name: 'Cassandra',             icon: '/datasource-icons/Cassandra.svg',              fabricStatus: 'native'  },
      { id: 'vertica',     name: 'Vertica',               icon: '/datasource-icons/Vertica.svg',                fabricStatus: 'none',    note: 'No native connector — use ODBC or REST workaround' },
      { id: 'mariadb',     name: 'MariaDB',               icon: '/datasource-icons/Maria DB.svg',               fabricStatus: 'native'  },
    ],
  },
  {
    group: 'Cloud & Big Data',
    color: 'orange',
    sources: [
      { id: 'amazon_s3',       name: 'Amazon S3',             icon: '/datasource-icons/Amazon S3.svg',         fabricStatus: 'native' },
      { id: 'amazon_redshift', name: 'Amazon Redshift',        icon: '/datasource-icons/Amazon RDS.svg',        fabricStatus: 'native' },
      { id: 'amazon_rds_sql',  name: 'Amazon RDS for SQL',     icon: '/datasource-icons/Amazon RDS.svg',        fabricStatus: 'native' },
      { id: 'amazon_athena',   name: 'Amazon Athena',          icon: '/datasource-icons/Amazon Web Services.svg',fabricStatus: 'native' },
      { id: 'google_bigquery', name: 'Google BigQuery',         icon: '/datasource-icons/Google Big Query.svg',  fabricStatus: 'native' },
      { id: 'google_gcs',      name: 'Google Cloud Storage',   icon: '/datasource-icons/Google Cloud.svg',      fabricStatus: 'native' },
      { id: 'google_sheets',   name: 'Google Sheets',          icon: '/datasource-icons/Google Sheets.svg',     fabricStatus: 'native' },
      { id: 'apache_spark',    name: 'Apache Spark / HDInsight',icon: '/datasource-icons/Apache Spark.svg',     fabricStatus: 'native' },
    ],
  },
  {
    group: 'SaaS & Business Apps',
    color: 'purple',
    sources: [
      { id: 'salesforce',   name: 'Salesforce',              icon: '/datasource-icons/Salesforce.svg',    fabricStatus: 'native'  },
      { id: 'dynamics365',  name: 'Dynamics 365',            icon: '/datasource-icons/Dynamics 365.svg',  fabricStatus: 'native'  },
      { id: 'sharepoint',   name: 'SharePoint Online',       icon: '/datasource-icons/SharePoint.svg',    fabricStatus: 'native'  },
      { id: 'servicenow',   name: 'ServiceNow',              icon: '/datasource-icons/Servicenow.svg',    fabricStatus: 'native'  },
      { id: 'sap_ecc',      name: 'SAP ECC / BW / HANA',    icon: '/datasource-icons/SAP.svg',           fabricStatus: 'gateway', note: 'Requires SAP on-premises data gateway' },
      { id: 'dataverse',    name: 'Microsoft Dataverse',     icon: '/datasource-icons/Dataflow.svg',      fabricStatus: 'native'  },
      { id: 'microsoft365', name: 'Microsoft 365',           icon: '/datasource-icons/Microsoft 365.svg', fabricStatus: 'native'  },
      { id: 'zendesk',      name: 'Zendesk',                 icon: '/datasource-icons/Zendesk.svg',       fabricStatus: 'native'  },
      { id: 'smartsheet',   name: 'Smartsheet',              icon: '/datasource-icons/Smartsheet.svg',    fabricStatus: 'native'  },
      { id: 'mongodb',      name: 'MongoDB',                 icon: '/datasource-icons/MongoDB.svg',       fabricStatus: 'native'  },
    ],
  },
  {
    group: 'Files & APIs',
    color: 'slate',
    sources: [
      { id: 'rest_api', name: 'REST API',           icon: '/datasource-icons/HTTP.svg',      fabricStatus: 'native' },
      { id: 'odata',    name: 'OData',              icon: '/datasource-icons/OData.svg',     fabricStatus: 'native' },
      { id: 'http',     name: 'HTTP / Web',         icon: '/datasource-icons/Web.svg',       fabricStatus: 'native' },
      { id: 'excel',    name: 'Excel (.xlsx)',       icon: '/datasource-icons/Excel.svg',     fabricStatus: 'native' },
      { id: 'parquet',  name: 'Parquet',            icon: '/datasource-icons/Parquet.svg',   fabricStatus: 'native' },
      { id: 'json',     name: 'JSON',               icon: '/datasource-icons/JSON.svg',      fabricStatus: 'native' },
      { id: 'xml',      name: 'XML',                icon: '/datasource-icons/XML.svg',       fabricStatus: 'native' },
      { id: 'odbc',     name: 'ODBC / Generic DB',  icon: '/datasource-icons/Odbc.svg',      fabricStatus: 'native' },
      { id: 'ftp_sftp', name: 'FTP / SFTP',         icon: '/datasource-icons/File Regular.svg', fabricStatus: 'native' },
    ],
  },
];

const STATUS_CONFIG: Record<ConnectorStatus, { label: string; icon: React.FC<any>; pill: string; card: string; border: string }> = {
  native:  { label: 'Fabric Connector Available', icon: CheckCircle2, pill: 'bg-emerald-100 text-emerald-800 border-emerald-300', card: 'border-emerald-300 bg-emerald-50/60', border: 'border-emerald-400' },
  gateway: { label: 'Requires Gateway',           icon: AlertTriangle, pill: 'bg-amber-100 text-amber-800 border-amber-300',    card: 'border-amber-300 bg-amber-50/60',   border: 'border-amber-400'   },
  none:    { label: 'No Native Connector',         icon: XCircle,       pill: 'bg-red-100 text-red-800 border-red-300',          card: 'border-red-300 bg-red-50/60',       border: 'border-red-400'     },
};

const COLOR_MAP: Record<string, { badge: string; bg: string; border: string }> = {
  blue:   { badge: 'bg-blue-100 text-blue-900 border-blue-300',       bg: 'bg-blue-50/40',   border: 'border-blue-200'   },
  teal:   { badge: 'bg-teal-100 text-teal-900 border-teal-300',       bg: 'bg-teal-50/40',   border: 'border-teal-200'   },
  orange: { badge: 'bg-orange-100 text-orange-900 border-orange-300', bg: 'bg-orange-50/40', border: 'border-orange-200' },
  purple: { badge: 'bg-purple-100 text-purple-900 border-purple-300', bg: 'bg-purple-50/40', border: 'border-purple-200' },
  slate:  { badge: 'bg-slate-100 text-slate-700 border-slate-300',    bg: 'bg-slate-50/40',  border: 'border-slate-200'  },
};

export const AdvancedAssessment: React.FC<AdvancedAssessmentProps> = ({ inputs, onChange }) => {
  const [open, setOpen] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState<'estate' | 'files' | 'pbi' | 'eng' | 'ml' | 'storage' | 'connectors'>('estate');
  const [connectorSearch, setConnectorSearch] = useState('');

  const selectedSources: string[] = inputs.fabricConnectors ?? [];

  const toggleSource = (id: string) => {
    const updated = selectedSources.includes(id)
      ? selectedSources.filter((s) => s !== id)
      : [...selectedSources, id];
    onChange('fabricConnectors', updated);
  };

  const clearAllSources = () => onChange('fabricConnectors', []);

  // Compute summary stats for selected sources
  const allSources = SOURCE_GROUPS.flatMap((g) => g.sources);
  const selectedSourceObjects = allSources.filter((s) => selectedSources.includes(s.id));
  const nativeCount  = selectedSourceObjects.filter((s) => s.fabricStatus === 'native').length;
  const gatewayCount = selectedSourceObjects.filter((s) => s.fabricStatus === 'gateway').length;
  const noneCount    = selectedSourceObjects.filter((s) => s.fabricStatus === 'none').length;

  const filteredGroups = connectorSearch.trim()
    ? [{ group: 'Search Results', color: 'teal', sources: allSources.filter((s) => s.name.toLowerCase().includes(connectorSearch.toLowerCase())) }]
    : SOURCE_GROUPS;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden transition shadow-xs">
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 bg-slate-100/80 hover:bg-slate-100 transition text-left cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="h-4 w-4 text-teal-700" />
          <span className="text-xs font-black text-slate-800">Improve Estimate Accuracy</span>
          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs">Optional</span>
          {selectedSources.length > 0 && (
            <span className="rounded-full bg-teal-100 border border-teal-300 px-2 py-0.5 text-[10px] font-black text-teal-900">
              {selectedSources.length} source{selectedSources.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Add parameters to refine your SKU sizing and increase estimation confidence.
          </p>

          {/* Sub-tabs */}
          <div className="grid grid-cols-4 gap-1.5 border-b border-slate-200 pb-3">
            {[
              { id: 'estate',     label: 'Data Estate', icon: Database   },
              { id: 'files',      label: 'Files',        icon: FileText   },
              { id: 'pbi',        label: 'Power BI',     icon: BarChart3  },
              { id: 'eng',        label: 'Engineering',  icon: Cpu        },
              { id: 'ml',         label: 'ML',           icon: Sparkles   },
              { id: 'storage',    label: 'Storage',      icon: HardDrive  },
              { id: 'connectors', label: 'Data Sources', icon: Plug       },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubtab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubtab(tab.id as any)}
                  className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-bold transition leading-none cursor-pointer text-center ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-teal-700" />
                  <span className="truncate">{tab.label}</span>
                  {tab.id === 'connectors' && selectedSources.length > 0 && (
                    <span className="rounded-full bg-teal-600 text-white px-1.5 py-px text-[9px] font-black leading-none">{selectedSources.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subtab content grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">

            {/* Tab 1: Data Estate */}
            {activeSubtab === 'estate' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Databases</label>
                  <input type="number" placeholder="5" value={inputs.databasesCount || ''} onChange={(e) => onChange('databasesCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Schemas</label>
                  <input type="number" placeholder="12" value={inputs.schemasCount || ''} onChange={(e) => onChange('schemasCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tables</label>
                  <input type="number" placeholder="250" value={inputs.tablesCount || ''} onChange={(e) => onChange('tablesCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Stored Procedures</label>
                  <input type="number" placeholder="40" value={inputs.storedProceduresCount || ''} onChange={(e) => onChange('storedProceduresCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
              </>
            )}

            {/* Tab 2: Files */}
            {activeSubtab === 'files' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Excel Files Daily</label>
                  <input type="number" placeholder="50" value={inputs.excelFilesDaily || ''} onChange={(e) => onChange('excelFilesDaily', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">CSV Files Daily</label>
                  <input type="number" placeholder="1000" value={inputs.csvFilesDaily || ''} onChange={(e) => onChange('csvFilesDaily', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Avg File Size (MB)</label>
                  <input type="number" placeholder="25" value={inputs.avgFileSizeMB || ''} onChange={(e) => onChange('avgFileSizeMB', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Largest File Size (MB)</label>
                  <input type="number" placeholder="500" value={inputs.largestFileSizeMB || ''} onChange={(e) => onChange('largestFileSizeMB', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
              </>
            )}

            {/* Tab 3: Power BI */}
            {activeSubtab === 'pbi' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Reports</label>
                  <input type="number" placeholder="15" value={inputs.reportsCount || ''} onChange={(e) => onChange('reportsCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Dataset Size (GB)</label>
                  <input type="number" placeholder="10" value={inputs.datasetSizeGB || ''} onChange={(e) => onChange('datasetSizeGB', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Direct Lake Enabled?</label>
                  <select value={inputs.directLake ? 'yes' : 'no'} onChange={(e) => onChange('directLake', e.target.value === 'yes')} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer">
                    <option value="no">No</option>
                    <option value="yes">Yes (Zero-Copy)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Incremental Refresh?</label>
                  <select value={inputs.incrementalRefresh ? 'yes' : 'no'} onChange={(e) => onChange('incrementalRefresh', e.target.value === 'yes')} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </>
            )}

            {/* Tab 4: Engineering */}
            {activeSubtab === 'eng' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">ETL Pipelines</label>
                  <input type="number" placeholder="20" value={inputs.etlPipelinesCount || ''} onChange={(e) => onChange('etlPipelinesCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Notebooks</label>
                  <input type="number" placeholder="10" value={inputs.notebooksCount || ''} onChange={(e) => onChange('notebooksCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
              </>
            )}

            {/* Tab 5: ML */}
            {activeSubtab === 'ml' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Active ML Models</label>
                  <input type="number" placeholder="3" value={inputs.mlWorkloadsCount || ''} onChange={(e) => onChange('mlWorkloadsCount', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Requires GPU Clusters?</label>
                  <select value={inputs.gpuUsage ? 'yes' : 'no'} onChange={(e) => onChange('gpuUsage', e.target.value === 'yes')} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer">
                    <option value="no">No</option>
                    <option value="yes">Yes (NVIDIA GPU)</option>
                  </select>
                </div>
              </>
            )}

            {/* Tab 6: Storage */}
            {activeSubtab === 'storage' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Total Storage (GB)</label>
                  <input type="number" placeholder="2000" value={inputs.totalStorageGB || ''} onChange={(e) => onChange('totalStorageGB', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Retention (Months)</label>
                  <input type="number" placeholder="12" value={inputs.retentionMonths || ''} onChange={(e) => onChange('retentionMonths', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500" />
                </div>
              </>
            )}
          </div>

          {/* Tab 7: Data Sources — full-width outside the 2-col grid */}
          {activeSubtab === 'connectors' && (
            <div className="space-y-4 pt-1">

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-slate-800">Where does your source data live?</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Select all systems your data currently resides in. We'll show if a Fabric connector is available.{' '}
                    <a href="https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline font-bold">
                      Full connector list ↗
                    </a>
                  </p>
                </div>
                {selectedSources.length > 0 && (
                  <button type="button" onClick={clearAllSources} className="flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 hover:bg-red-100 transition cursor-pointer flex-shrink-0">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2">
                {(Object.entries(STATUS_CONFIG) as [ConnectorStatus, typeof STATUS_CONFIG[ConnectorStatus]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <span key={key} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black ${cfg.pill}`}>
                      <Icon className="h-3 w-3" /> {cfg.label}
                    </span>
                  );
                })}
              </div>

              {/* Summary bar — shown only when sources selected */}
              {selectedSources.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <span className="text-[11px] font-black text-slate-700">Your data sources ({selectedSources.length} selected):</span>
                  {nativeCount  > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-800"><CheckCircle2 className="h-3 w-3" />{nativeCount} native</span>}
                  {gatewayCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-800"><AlertTriangle className="h-3 w-3" />{gatewayCount} need gateway</span>}
                  {noneCount    > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-black text-red-800"><XCircle className="h-3 w-3" />{noneCount} no connector</span>}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search source systems (e.g. Snowflake, SAP, REST…)"
                  value={connectorSearch}
                  onChange={(e) => setConnectorSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>

              {/* Source groups */}
              <div className="space-y-4">
                {filteredGroups.map((group) => {
                  const colors = COLOR_MAP[group.color] ?? COLOR_MAP.slate;
                  const groupSelected = group.sources.filter((s) => selectedSources.includes(s.id)).length;
                  return (
                    <div key={group.group} className={`rounded-xl border ${colors.border} ${colors.bg} p-3 space-y-2`}>
                      {/* Group header */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${colors.badge}`}>
                          {group.group}
                        </span>
                        {groupSelected > 0 && (
                          <span className="text-[10px] text-slate-500 font-semibold">{groupSelected} selected</span>
                        )}
                      </div>

                      {/* Source cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {group.sources.map((source) => {
                          const isSelected = selectedSources.includes(source.id);
                          const statusCfg = STATUS_CONFIG[source.fabricStatus];
                          const StatusIcon = statusCfg.icon;
                          return (
                            <button
                              key={source.id}
                              type="button"
                              onClick={() => toggleSource(source.id)}
                              title={source.note}
                              className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition cursor-pointer w-full group ${
                                isSelected
                                  ? `${statusCfg.border} bg-white shadow-sm`
                                  : 'border-transparent bg-white/70 hover:bg-white hover:border-slate-200'
                              }`}
                            >
                              {/* Checkbox */}
                              <span className={`flex-shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition ${
                                isSelected ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white group-hover:border-slate-400'
                              }`}>
                                {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                              </span>

                              {/* Source icon */}
                              <img
                                src={source.icon}
                                alt={source.name}
                                className="h-5 w-5 flex-shrink-0 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />

                              {/* Name */}
                              <span className={`flex-1 text-[11px] font-bold leading-tight truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {source.name}
                              </span>

                              {/* Fabric connector status badge — always visible */}
                              <span className={`flex-shrink-0 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-px text-[9px] font-black ${statusCfg.pill}`}>
                                <StatusIcon className="h-2.5 w-2.5" />
                                {source.fabricStatus === 'native'  ? 'Available' :
                                 source.fabricStatus === 'gateway' ? 'Gateway'   : 'None'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredGroups[0]?.sources.length === 0 && (
                  <p className="text-center text-xs text-slate-400 font-bold py-6 bg-slate-50 rounded-xl border border-slate-200">
                    No source systems match your search.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
