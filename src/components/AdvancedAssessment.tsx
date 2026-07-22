import React, { useState } from 'react';
import { AdvancedInputs } from '../types/assessment';
import { ChevronDown, Sliders, Database, FileText, BarChart3, Cpu, Sparkles, HardDrive, Plug, X, Check } from 'lucide-react';

interface AdvancedAssessmentProps {
  inputs: AdvancedInputs;
  onChange: (field: keyof AdvancedInputs, value: any) => void;
}

// Official Microsoft Fabric Data Factory connectors grouped by category
// Source: https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview
const CONNECTOR_GROUPS = [
  {
    group: 'Microsoft Azure',
    color: 'blue',
    connectors: [
      { id: 'azure_sql_db', name: 'Azure SQL Database', icon: '/datasource-icons/Azure SQL Database.svg' },
      { id: 'azure_synapse', name: 'Azure Synapse Analytics', icon: '/datasource-icons/AzureSynapse.svg' },
      { id: 'azure_blob', name: 'Azure Blob Storage', icon: '/datasource-icons/AzureBlobs.svg' },
      { id: 'azure_datalake', name: 'Azure Data Lake Storage Gen2', icon: '/datasource-icons/Azure Files.svg' },
      { id: 'azure_mysql', name: 'Azure Database for MySQL', icon: '/datasource-icons/Maria DB.svg' },
      { id: 'azure_postgres', name: 'Azure Database for PostgreSQL', icon: '/datasource-icons/PostgreSQL.svg' },
      { id: 'azure_cosmosdb', name: 'Azure Cosmos DB', icon: '/datasource-icons/Database.svg' },
      { id: 'azure_tables', name: 'Azure Table Storage', icon: '/datasource-icons/AzureTables.svg' },
      { id: 'azure_hdinsight', name: 'Azure HDInsight', icon: '/datasource-icons/AzureHdInsightClusters.svg' },
      { id: 'azure_sql_mi', name: 'Azure SQL Managed Instance', icon: '/datasource-icons/Azure SQL Database.svg' },
    ],
  },
  {
    group: 'Databases & Warehouses',
    color: 'teal',
    connectors: [
      { id: 'sql_server', name: 'SQL Server (On-Prem)', icon: '/datasource-icons/SQL Database (on-prem).svg' },
      { id: 'oracle', name: 'Oracle Database', icon: '/datasource-icons/Database.svg' },
      { id: 'mysql', name: 'MySQL', icon: '/datasource-icons/Maria DB.svg' },
      { id: 'postgresql', name: 'PostgreSQL', icon: '/datasource-icons/PostgreSQL.svg' },
      { id: 'snowflake', name: 'Snowflake', icon: '/datasource-icons/Snowflake.svg' },
      { id: 'ibm_db2', name: 'IBM DB2', icon: '/datasource-icons/IBM DB2.svg' },
      { id: 'teradata', name: 'Teradata', icon: '/datasource-icons/Database.svg' },
      { id: 'cassandra', name: 'Cassandra', icon: '/datasource-icons/Cassandra.svg' },
      { id: 'vertica', name: 'Vertica', icon: '/datasource-icons/Vertica.svg' },
      { id: 'mariadb', name: 'MariaDB', icon: '/datasource-icons/Maria DB.svg' },
    ],
  },
  {
    group: 'Cloud & Big Data',
    color: 'orange',
    connectors: [
      { id: 'amazon_s3', name: 'Amazon S3', icon: '/datasource-icons/Amazon S3.svg' },
      { id: 'amazon_redshift', name: 'Amazon Redshift', icon: '/datasource-icons/Amazon RDS.svg' },
      { id: 'amazon_rds_sql', name: 'Amazon RDS for SQL Server', icon: '/datasource-icons/Amazon RDS.svg' },
      { id: 'amazon_athena', name: 'Amazon Athena', icon: '/datasource-icons/Amazon Web Services.svg' },
      { id: 'google_bigquery', name: 'Google BigQuery', icon: '/datasource-icons/Google Big Query.svg' },
      { id: 'google_cloud_storage', name: 'Google Cloud Storage', icon: '/datasource-icons/Google Cloud.svg' },
      { id: 'google_sheets', name: 'Google Sheets', icon: '/datasource-icons/Google Sheets.svg' },
      { id: 'apache_spark', name: 'Apache Spark / HDInsight', icon: '/datasource-icons/Apache Spark.svg' },
    ],
  },
  {
    group: 'SaaS & Applications',
    color: 'purple',
    connectors: [
      { id: 'salesforce', name: 'Salesforce', icon: '/datasource-icons/Salesforce.svg' },
      { id: 'dynamics365', name: 'Dynamics 365', icon: '/datasource-icons/Dynamics 365.svg' },
      { id: 'sharepoint', name: 'SharePoint Online', icon: '/datasource-icons/SharePoint.svg' },
      { id: 'servicenow', name: 'ServiceNow', icon: '/datasource-icons/Servicenow.svg' },
      { id: 'sap', name: 'SAP (ECC / BW / HANA)', icon: '/datasource-icons/SAP.svg' },
      { id: 'dataverse', name: 'Microsoft Dataverse', icon: '/datasource-icons/Dataflow.svg' },
      { id: 'microsoft365', name: 'Microsoft 365', icon: '/datasource-icons/Microsoft 365.svg' },
      { id: 'zendesk', name: 'Zendesk', icon: '/datasource-icons/Zendesk.svg' },
    ],
  },
  {
    group: 'Files & APIs',
    color: 'slate',
    connectors: [
      { id: 'rest_api', name: 'REST API', icon: '/datasource-icons/HTTP.svg' },
      { id: 'odata', name: 'OData', icon: '/datasource-icons/OData.svg' },
      { id: 'http', name: 'HTTP / Web', icon: '/datasource-icons/Web.svg' },
      { id: 'excel', name: 'Excel (.xlsx)', icon: '/datasource-icons/Excel.svg' },
      { id: 'parquet', name: 'Parquet', icon: '/datasource-icons/Parquet.svg' },
      { id: 'json', name: 'JSON', icon: '/datasource-icons/JSON.svg' },
      { id: 'xml', name: 'XML', icon: '/datasource-icons/XML.svg' },
      { id: 'odbc', name: 'ODBC / Generic DB', icon: '/datasource-icons/Odbc.svg' },
      { id: 'mongodb', name: 'MongoDB', icon: '/datasource-icons/MongoDB.svg' },
    ],
  },
];

const COLOR_MAP: Record<string, { badge: string; bg: string; border: string; check: string }> = {
  blue:   { badge: 'bg-blue-100 text-blue-900 border-blue-300',   bg: 'bg-blue-50',   border: 'border-blue-200',   check: 'bg-blue-600' },
  teal:   { badge: 'bg-teal-100 text-teal-900 border-teal-300',   bg: 'bg-teal-50',   border: 'border-teal-200',   check: 'bg-teal-600' },
  orange: { badge: 'bg-orange-100 text-orange-900 border-orange-300', bg: 'bg-orange-50', border: 'border-orange-200', check: 'bg-orange-600' },
  purple: { badge: 'bg-purple-100 text-purple-900 border-purple-300', bg: 'bg-purple-50', border: 'border-purple-200', check: 'bg-purple-600' },
  slate:  { badge: 'bg-slate-100 text-slate-700 border-slate-300',  bg: 'bg-slate-50',  border: 'border-slate-200',  check: 'bg-slate-600' },
};

export const AdvancedAssessment: React.FC<AdvancedAssessmentProps> = ({ inputs, onChange }) => {
  const [open, setOpen] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState<'estate' | 'files' | 'pbi' | 'eng' | 'ml' | 'storage' | 'connectors'>('estate');
  const [connectorSearch, setConnectorSearch] = useState('');

  const selectedConnectors: string[] = inputs.fabricConnectors ?? [];

  const toggleConnector = (id: string) => {
    const updated = selectedConnectors.includes(id)
      ? selectedConnectors.filter((c) => c !== id)
      : [...selectedConnectors, id];
    onChange('fabricConnectors', updated);
  };

  const clearAllConnectors = () => onChange('fabricConnectors', []);

  const allConnectors = CONNECTOR_GROUPS.flatMap((g) => g.connectors);
  const filteredGroups = connectorSearch.trim()
    ? [{ group: 'Search Results', color: 'teal', connectors: allConnectors.filter((c) => c.name.toLowerCase().includes(connectorSearch.toLowerCase())) }]
    : CONNECTOR_GROUPS;

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
          <span className="text-xs font-black text-slate-800">
            Improve Estimate Accuracy
          </span>
          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs">
            Optional
          </span>
          {selectedConnectors.length > 0 && (
            <span className="rounded-full bg-teal-100 border border-teal-300 px-2 py-0.5 text-[10px] font-black text-teal-900">
              {selectedConnectors.length} connector{selectedConnectors.length > 1 ? 's' : ''} selected
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

          {/* Sub-tabs Grid */}
          <div className="grid grid-cols-4 gap-1.5 border-b border-slate-200 pb-3">
            {[
              { id: 'estate',     label: 'Data Estate', icon: Database },
              { id: 'files',      label: 'Files',        icon: FileText },
              { id: 'pbi',        label: 'Power BI',     icon: BarChart3 },
              { id: 'eng',        label: 'Engineering',  icon: Cpu },
              { id: 'ml',         label: 'ML',           icon: Sparkles },
              { id: 'storage',    label: 'Storage',      icon: HardDrive },
              { id: 'connectors', label: 'Connectors',   icon: Plug },
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
                  {tab.id === 'connectors' && selectedConnectors.length > 0 && (
                    <span className="ml-0.5 rounded-full bg-teal-600 text-white px-1.5 py-px text-[9px] font-black leading-none">{selectedConnectors.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subtab Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Tab 1: Data Estate */}
            {activeSubtab === 'estate' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Databases</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={inputs.databasesCount || ''}
                    onChange={(e) => onChange('databasesCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Schemas</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={inputs.schemasCount || ''}
                    onChange={(e) => onChange('schemasCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tables</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={inputs.tablesCount || ''}
                    onChange={(e) => onChange('tablesCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Stored Procedures</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={inputs.storedProceduresCount || ''}
                    onChange={(e) => onChange('storedProceduresCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Tab 2: Files */}
            {activeSubtab === 'files' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Excel Files Daily</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={inputs.excelFilesDaily || ''}
                    onChange={(e) => onChange('excelFilesDaily', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">CSV Files Daily</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={inputs.csvFilesDaily || ''}
                    onChange={(e) => onChange('csvFilesDaily', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Avg File Size (MB)</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={inputs.avgFileSizeMB || ''}
                    onChange={(e) => onChange('avgFileSizeMB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Largest File Size (MB)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={inputs.largestFileSizeMB || ''}
                    onChange={(e) => onChange('largestFileSizeMB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Tab 3: Power BI */}
            {activeSubtab === 'pbi' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Reports</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={inputs.reportsCount || ''}
                    onChange={(e) => onChange('reportsCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Dataset Size (GB)</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={inputs.datasetSizeGB || ''}
                    onChange={(e) => onChange('datasetSizeGB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Direct Lake Enabled?</label>
                  <select
                    value={inputs.directLake ? 'yes' : 'no'}
                    onChange={(e) => onChange('directLake', e.target.value === 'yes')}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (Zero-Copy)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Incremental Refresh?</label>
                  <select
                    value={inputs.incrementalRefresh ? 'yes' : 'no'}
                    onChange={(e) => onChange('incrementalRefresh', e.target.value === 'yes')}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer"
                  >
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
                  <input
                    type="number"
                    placeholder="20"
                    value={inputs.etlPipelinesCount || ''}
                    onChange={(e) => onChange('etlPipelinesCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Notebooks</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={inputs.notebooksCount || ''}
                    onChange={(e) => onChange('notebooksCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Tab 5: Machine Learning */}
            {activeSubtab === 'ml' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Active ML Models</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={inputs.mlWorkloadsCount || ''}
                    onChange={(e) => onChange('mlWorkloadsCount', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Requires GPU Clusters?</label>
                  <select
                    value={inputs.gpuUsage ? 'yes' : 'no'}
                    onChange={(e) => onChange('gpuUsage', e.target.value === 'yes')}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 cursor-pointer"
                  >
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
                  <input
                    type="number"
                    placeholder="2000"
                    value={inputs.totalStorageGB || ''}
                    onChange={(e) => onChange('totalStorageGB', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Retention (Months)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={inputs.retentionMonths || ''}
                    onChange={(e) => onChange('retentionMonths', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Tab 7: Fabric Connectors — full-width outside the 2-col grid */}
          {activeSubtab === 'connectors' && (
            <div className="space-y-4 pt-1">
              {/* Header bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black text-slate-800">Select Fabric Data Factory Connectors in Use</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Source:{' '}
                    <a
                      href="https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:underline font-bold"
                    >
                      Microsoft Fabric Connector Overview ↗
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConnectors.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllConnectors}
                      className="flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 hover:bg-red-100 transition cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      Clear all ({selectedConnectors.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Search box */}
              <input
                type="text"
                placeholder="Search connectors (e.g. Snowflake, SAP, REST...)"
                value={connectorSearch}
                onChange={(e) => setConnectorSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
              />

              {/* Connector groups */}
              <div className="space-y-4">
                {filteredGroups.map((group) => {
                  const colors = COLOR_MAP[group.color] ?? COLOR_MAP.slate;
                  return (
                    <div key={group.group} className={`rounded-xl border ${colors.border} ${colors.bg} p-3 space-y-2`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${colors.badge}`}>
                          {group.group}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {group.connectors.filter((c) => selectedConnectors.includes(c.id)).length}/{group.connectors.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {group.connectors.map((connector) => {
                          const checked = selectedConnectors.includes(connector.id);
                          return (
                            <button
                              key={connector.id}
                              type="button"
                              onClick={() => toggleConnector(connector.id)}
                              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition cursor-pointer ${
                                checked
                                  ? 'bg-white border-teal-400 shadow-sm'
                                  : 'bg-white/60 border-transparent hover:border-slate-300 hover:bg-white'
                              }`}
                            >
                              {/* Custom checkbox */}
                              <span className={`flex-shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition ${
                                checked ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white'
                              }`}>
                                {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                              </span>
                              {/* Icon */}
                              <img
                                src={connector.icon}
                                alt={connector.name}
                                className="h-4 w-4 flex-shrink-0 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              {/* Label */}
                              <span className={`text-[11px] font-bold leading-tight truncate ${checked ? 'text-teal-900' : 'text-slate-700'}`}>
                                {connector.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredGroups[0]?.connectors.length === 0 && (
                <p className="text-center text-xs text-slate-400 font-bold py-4">No connectors match your search.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
