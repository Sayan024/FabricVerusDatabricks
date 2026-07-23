import React, { useState, useRef } from 'react';
import {
  Database,
  Server,
  Cpu,
  HardDrive,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Box,
  Activity,
  LayoutGrid,
  Move,
} from 'lucide-react';
import { QuickInputs, AdvancedInputs } from '../types/assessment';

export interface CanvasNode {
  id: string;
  type: string;
  label: string;
  category: 'source' | 'ingestion' | 'storage' | 'compute' | 'bi' | 'governance';
  x: number;
  y: number;
  badge?: string;
  subtext?: string;
  color: string;
  bgGradient: string;
  iconType: string;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  flowType: 'realtime' | 'batch' | 'direct_lake';
  color?: string;
}

interface ArchitectureCanvasProps {
  quickInputs?: QuickInputs;
  advancedInputs?: AdvancedInputs;
}

// ── PRESET ARCHITECTURE TEMPLATES ─────────────────────────────────────────────
const TEMPLATE_FABRIC: { nodes: CanvasNode[]; connections: CanvasConnection[] } = {
  nodes: [
    {
      id: 'src-1',
      type: 'sap',
      label: 'SAP ECC & ERP',
      category: 'source',
      x: 40,
      y: 80,
      badge: 'OLTP Source',
      subtext: '45 GB/day daily sync',
      color: 'border-blue-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconType: 'database',
    },
    {
      id: 'src-2',
      type: 'sql_server',
      label: 'On-Prem SQL Server',
      category: 'source',
      x: 40,
      y: 260,
      badge: 'Relational DB',
      subtext: 'Change Data Capture (CDC)',
      color: 'border-sky-500',
      bgGradient: 'from-sky-50 to-blue-50',
      iconType: 'server',
    },
    {
      id: 'ingest-1',
      type: 'datafactory',
      label: 'Fabric Data Factory',
      category: 'ingestion',
      x: 280,
      y: 170,
      badge: 'Copy Activity / Pipelines',
      subtext: 'Fast ingestion pipelines',
      color: 'border-teal-500',
      bgGradient: 'from-teal-50 to-emerald-50',
      iconType: 'zap',
    },
    {
      id: 'store-1',
      type: 'onelake_bronze',
      label: 'OneLake Bronze (Raw)',
      category: 'storage',
      x: 520,
      y: 80,
      badge: 'Delta Parquet',
      subtext: 'Raw ingestion lakehouse',
      color: 'border-amber-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconType: 'harddrive',
    },
    {
      id: 'store-2',
      type: 'onelake_gold',
      label: 'OneLake Gold (Curated)',
      category: 'storage',
      x: 520,
      y: 260,
      badge: 'Star Schema',
      subtext: 'Aggregated analytics tables',
      color: 'border-emerald-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconType: 'harddrive',
    },
    {
      id: 'comp-1',
      type: 'fabric_eng',
      label: 'Fabric Spark Compute',
      category: 'compute',
      x: 760,
      y: 170,
      badge: 'F64 Capacity',
      subtext: 'Autoscaling PySpark Jobs',
      color: 'border-cyan-500',
      bgGradient: 'from-cyan-50 to-blue-50',
      iconType: 'cpu',
    },
    {
      id: 'bi-1',
      type: 'powerbi',
      label: 'Power BI (Direct Lake)',
      category: 'bi',
      x: 1000,
      y: 170,
      badge: 'Direct Lake Mode',
      subtext: 'Zero-copy sub-second report BI',
      color: 'border-amber-500',
      bgGradient: 'from-amber-50 to-yellow-50',
      iconType: 'activity',
    },
    {
      id: 'gov-1',
      type: 'purview',
      label: 'Microsoft Purview',
      category: 'governance',
      x: 520,
      y: 430,
      badge: 'Data Governance',
      subtext: 'Catalog, lineage & security',
      color: 'border-purple-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconType: 'shield',
    },
  ],
  connections: [
    { id: 'c1', fromId: 'src-1', toId: 'ingest-1', flowType: 'realtime', label: 'CDC Ingest' },
    { id: 'c2', fromId: 'src-2', toId: 'ingest-1', flowType: 'batch', label: 'Nightly Batch' },
    { id: 'c3', fromId: 'ingest-1', toId: 'store-1', flowType: 'realtime', label: 'Raw Write' },
    { id: 'c4', fromId: 'store-1', toId: 'store-2', flowType: 'batch', label: 'ETL Transform' },
    { id: 'c5', fromId: 'store-2', toId: 'comp-1', flowType: 'realtime', label: 'Query Compute' },
    { id: 'c6', fromId: 'store-2', toId: 'bi-1', flowType: 'direct_lake', label: 'Direct Lake Zero-Copy' },
    { id: 'c7', fromId: 'store-2', toId: 'gov-1', flowType: 'batch', label: 'Scan Lineage' },
  ],
};

const TEMPLATE_DATABRICKS: { nodes: CanvasNode[]; connections: CanvasConnection[] } = {
  nodes: [
    {
      id: 'db-src-1',
      type: 'oracle',
      label: 'Oracle Enterprise DB',
      category: 'source',
      x: 40,
      y: 100,
      badge: 'Transactional DB',
      subtext: '60 GB/day daily ingestion',
      color: 'border-red-500',
      bgGradient: 'from-red-50 to-rose-50',
      iconType: 'database',
    },
    {
      id: 'db-src-2',
      type: 's3',
      label: 'Amazon S3 Bucket',
      category: 'source',
      x: 40,
      y: 280,
      badge: 'Cloud Storage',
      subtext: 'Streaming Parquet files',
      color: 'border-amber-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconType: 'harddrive',
    },
    {
      id: 'db-ingest-1',
      type: 'autoloader',
      label: 'Databricks Auto Loader',
      category: 'ingestion',
      x: 280,
      y: 190,
      badge: 'Incremental Streaming',
      subtext: 'File notification streaming',
      color: 'border-red-600',
      bgGradient: 'from-red-50 to-orange-50',
      iconType: 'zap',
    },
    {
      id: 'db-store-1',
      type: 'adls_delta',
      label: 'ADLS Gen2 Delta Lake',
      category: 'storage',
      x: 520,
      y: 190,
      badge: 'ACID Delta Lake',
      subtext: 'Medallion Bronze/Silver/Gold',
      color: 'border-sky-500',
      bgGradient: 'from-sky-50 to-blue-50',
      iconType: 'harddrive',
    },
    {
      id: 'db-gov-1',
      type: 'unity_catalog',
      label: 'Unity Catalog Governance',
      category: 'governance',
      x: 520,
      y: 380,
      badge: 'Central Governance',
      subtext: 'Row/Column security & lineage',
      color: 'border-indigo-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      iconType: 'shield',
    },
    {
      id: 'db-comp-1',
      type: 'sql_warehouse',
      label: 'SQL Serverless Warehouse',
      category: 'compute',
      x: 760,
      y: 190,
      badge: '4-Node Serverless',
      subtext: 'Photon engine query acceleration',
      color: 'border-red-500',
      bgGradient: 'from-red-50 to-rose-50',
      iconType: 'cpu',
    },
    {
      id: 'db-bi-1',
      type: 'powerbi_query',
      label: 'Power BI (SQL Warehouse)',
      category: 'bi',
      x: 1000,
      y: 190,
      badge: 'DirectQuery / Import',
      subtext: 'Interactive SQL report queries',
      color: 'border-amber-500',
      bgGradient: 'from-amber-50 to-yellow-50',
      iconType: 'activity',
    },
  ],
  connections: [
    { id: 'dbc1', fromId: 'db-src-1', toId: 'db-ingest-1', flowType: 'batch', label: 'JDBC Extraction' },
    { id: 'dbc2', fromId: 'db-src-2', toId: 'db-ingest-1', flowType: 'realtime', label: 'Cloud Events' },
    { id: 'dbc3', fromId: 'db-ingest-1', toId: 'db-store-1', flowType: 'realtime', label: 'Delta Stream Write' },
    { id: 'dbc4', fromId: 'db-store-1', toId: 'db-gov-1', flowType: 'realtime', label: 'UC Metastore Bind' },
    { id: 'dbc5', fromId: 'db-store-1', toId: 'db-comp-1', flowType: 'realtime', label: 'Photon Read' },
    { id: 'dbc6', fromId: 'db-comp-1', toId: 'db-bi-1', flowType: 'realtime', label: 'SQL Endpoint Query' },
  ],
};

const TEMPLATE_HYBRID: { nodes: CanvasNode[]; connections: CanvasConnection[] } = {
  nodes: [
    {
      id: 'h-src-1',
      type: 'sap',
      label: 'SAP ERP & Postgres DB',
      category: 'source',
      x: 40,
      y: 100,
      badge: 'Enterprise Core',
      subtext: 'Multi-system data feeds',
      color: 'border-blue-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconType: 'database',
    },
    {
      id: 'h-ingest-1',
      type: 'db_dlt',
      label: 'Databricks DLT Pipelines',
      category: 'ingestion',
      x: 280,
      y: 100,
      badge: 'Heavy Spark Processing',
      subtext: 'Complex ETL & PySpark ML',
      color: 'border-red-500',
      bgGradient: 'from-red-50 to-rose-50',
      iconType: 'zap',
    },
    {
      id: 'h-store-1',
      type: 'onelake_shortcut',
      label: 'OneLake Delta Shortcuts',
      category: 'storage',
      x: 520,
      y: 100,
      badge: 'Zero-Copy Link',
      subtext: 'Direct Lake shortcut over ADLS',
      color: 'border-teal-500',
      bgGradient: 'from-teal-50 to-cyan-50',
      iconType: 'harddrive',
    },
    {
      id: 'h-comp-1',
      type: 'fabric_cu',
      label: 'Microsoft Fabric F64',
      category: 'compute',
      x: 760,
      y: 100,
      badge: 'Unified SaaS Compute',
      subtext: 'Power BI Enterprise Capacity',
      color: 'border-teal-600',
      bgGradient: 'from-teal-50 to-emerald-50',
      iconType: 'cpu',
    },
    {
      id: 'h-bi-1',
      type: 'pbi_directlake',
      label: 'Power BI Direct Lake',
      category: 'bi',
      x: 1000,
      y: 100,
      badge: 'Zero-Copy Reporting',
      subtext: 'Sub-second M365 reports',
      color: 'border-amber-500',
      bgGradient: 'from-amber-50 to-yellow-50',
      iconType: 'activity',
    },
  ],
  connections: [
    { id: 'hc1', fromId: 'h-src-1', toId: 'h-ingest-1', flowType: 'realtime', label: 'High-speed Ingest' },
    { id: 'hc2', fromId: 'h-ingest-1', toId: 'h-store-1', flowType: 'realtime', label: 'Write Delta Delta Parquet' },
    { id: 'hc3', fromId: 'h-store-1', toId: 'h-comp-1', flowType: 'direct_lake', label: 'OneLake Shortcut' },
    { id: 'hc4', fromId: 'h-comp-1', toId: 'h-bi-1', flowType: 'direct_lake', label: 'Direct Lake Reporting' },
  ],
};

// ── COMPONENT PALETTE CATALOG ────────────────────────────────────────────────
const PALETTE_CATALOG = [
  {
    categoryName: 'Data Sources',
    items: [
      { type: 'sap', label: 'SAP ECC / BW', category: 'source', color: 'border-blue-500', bgGradient: 'from-blue-50 to-indigo-50', iconType: 'database', badge: 'ERP Source' },
      { type: 'sql_server', label: 'SQL Server', category: 'source', color: 'border-sky-500', bgGradient: 'from-sky-50 to-blue-50', iconType: 'server', badge: 'RDBMS' },
      { type: 'oracle', label: 'Oracle Database', category: 'source', color: 'border-red-500', bgGradient: 'from-red-50 to-rose-50', iconType: 'database', badge: 'Enterprise' },
      { type: 'salesforce', label: 'Salesforce CRM', category: 'source', color: 'border-cyan-500', bgGradient: 'from-cyan-50 to-blue-50', iconType: 'box', badge: 'SaaS App' },
      { type: 's3', label: 'Amazon S3 / Blob', category: 'source', color: 'border-amber-500', bgGradient: 'from-amber-50 to-orange-50', iconType: 'harddrive', badge: 'Cloud Storage' },
      { type: 'rest_api', label: 'REST API / Webhooks', category: 'source', color: 'border-emerald-500', bgGradient: 'from-emerald-50 to-teal-50', iconType: 'zap', badge: 'API Ingest' },
    ],
  },
  {
    categoryName: 'Ingestion & Pipelines',
    items: [
      { type: 'datafactory', label: 'Fabric Data Factory', category: 'ingestion', color: 'border-teal-500', bgGradient: 'from-teal-50 to-emerald-50', iconType: 'zap', badge: 'SaaS Pipelines' },
      { type: 'autoloader', label: 'Databricks Auto Loader', category: 'ingestion', color: 'border-red-600', bgGradient: 'from-red-50 to-orange-50', iconType: 'zap', badge: 'Spark Stream' },
      { type: 'dataflows', label: 'Dataflows Gen2', category: 'ingestion', color: 'border-amber-500', bgGradient: 'from-amber-50 to-yellow-50', iconType: 'zap', badge: 'Low-Code ETL' },
    ],
  },
  {
    categoryName: 'Storage & Lakehouse',
    items: [
      { type: 'onelake', label: 'Microsoft OneLake', category: 'storage', color: 'border-teal-600', bgGradient: 'from-teal-50 to-cyan-50', iconType: 'harddrive', badge: 'Delta Parquet' },
      { type: 'adls_delta', label: 'ADLS Gen2 Delta', category: 'storage', color: 'border-blue-600', bgGradient: 'from-blue-50 to-sky-50', iconType: 'harddrive', badge: 'Azure Storage' },
      { type: 'medallion_bronze', label: 'Bronze Layer (Raw)', category: 'storage', color: 'border-amber-600', bgGradient: 'from-amber-50 to-orange-50', iconType: 'harddrive', badge: 'Raw Lakehouse' },
      { type: 'medallion_gold', label: 'Gold Layer (Curated)', category: 'storage', color: 'border-emerald-600', bgGradient: 'from-emerald-50 to-teal-50', iconType: 'harddrive', badge: 'Star Schema' },
    ],
  },
  {
    categoryName: 'Compute & Processing',
    items: [
      { type: 'fabric_spark', label: 'Fabric Spark Engine', category: 'compute', color: 'border-teal-600', bgGradient: 'from-teal-50 to-emerald-50', iconType: 'cpu', badge: 'F-SKU Compute' },
      { type: 'sql_warehouse', label: 'Databricks SQL Warehouse', category: 'compute', color: 'border-red-600', bgGradient: 'from-red-50 to-orange-50', iconType: 'cpu', badge: 'Serverless DBU' },
      { type: 'fabric_dw', label: 'Fabric Data Warehouse', category: 'compute', color: 'border-cyan-600', bgGradient: 'from-cyan-50 to-blue-50', iconType: 'server', badge: 'T-SQL Warehouse' },
    ],
  },
  {
    categoryName: 'Analytics & BI',
    items: [
      { type: 'powerbi_dl', label: 'Power BI (Direct Lake)', category: 'bi', color: 'border-amber-500', bgGradient: 'from-amber-50 to-yellow-50', iconType: 'activity', badge: 'Zero-Copy BI' },
      { type: 'powerbi_dq', label: 'Power BI (DirectQuery)', category: 'bi', color: 'border-amber-600', bgGradient: 'from-amber-50 to-orange-50', iconType: 'activity', badge: 'Live SQL Query' },
      { type: 'db_dashboards', label: 'Databricks Lakeview', category: 'bi', color: 'border-red-500', bgGradient: 'from-red-50 to-rose-50', iconType: 'activity', badge: 'SQL Dashboards' },
    ],
  },
  {
    categoryName: 'Governance & Security',
    items: [
      { type: 'purview', label: 'Microsoft Purview', category: 'governance', color: 'border-purple-500', bgGradient: 'from-purple-50 to-pink-50', iconType: 'shield', badge: 'M365 Lineage' },
      { type: 'unity_catalog', label: 'Unity Catalog', category: 'governance', color: 'border-indigo-500', bgGradient: 'from-indigo-50 to-purple-50', iconType: 'shield', badge: 'Cross-Cloud' },
    ],
  },
];

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>(TEMPLATE_FABRIC.nodes);
  const [connections, setConnections] = useState<CanvasConnection[]>(TEMPLATE_FABRIC.connections);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);

  // Connecting mode state: when user clicks output port of a node
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Flow animation controls
  const [animSpeed, setAnimSpeed] = useState<'fast' | 'normal' | 'slow' | 'paused'>('normal');
  const [activePreset, setActivePreset] = useState<'fabric' | 'databricks' | 'hybrid' | 'custom'>('fabric');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load preset template
  const handleLoadPreset = (preset: 'fabric' | 'databricks' | 'hybrid') => {
    setActivePreset(preset);
    setSelectedNodeId(null);
    setSelectedConnId(null);
    setConnectingFromId(null);

    if (preset === 'fabric') {
      setNodes(TEMPLATE_FABRIC.nodes);
      setConnections(TEMPLATE_FABRIC.connections);
    } else if (preset === 'databricks') {
      setNodes(TEMPLATE_DATABRICKS.nodes);
      setConnections(TEMPLATE_DATABRICKS.connections);
    } else {
      setNodes(TEMPLATE_HYBRID.nodes);
      setConnections(TEMPLATE_HYBRID.connections);
    }
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedConnId(null);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    setDraggingNodeId(node.id);
    setDragOffset({
      x: cursorX - node.x,
      y: cursorY - node.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (connectingFromId) {
      setMousePos({ x: currentX, y: currentY });
    }

    if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggingNodeId) {
            const newX = Math.max(10, Math.min(1300, currentX - dragOffset.x));
            const newY = Math.max(10, Math.min(800, currentY - dragOffset.y));
            return { ...n, x: newX, y: newY };
          }
          return n;
        })
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Connection Creation Logic
  const handleStartConnect = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFromId(nodeId);
    setSelectedConnId(null);
  };

  const handleEndConnect = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (!connectingFromId || connectingFromId === targetNodeId) {
      setConnectingFromId(null);
      setMousePos(null);
      return;
    }

    // Check if connection already exists
    const exists = connections.some((c) => c.fromId === connectingFromId && c.toId === targetNodeId);
    if (!exists) {
      const newConn: CanvasConnection = {
        id: `conn-${Date.now()}`,
        fromId: connectingFromId,
        toId: targetNodeId,
        flowType: 'realtime',
        label: 'Active Data Stream',
      };
      setConnections((prev) => [...prev, newConn]);
      setActivePreset('custom');
    }

    setConnectingFromId(null);
    setMousePos(null);
  };

  // Add node from palette
  const handleAddPaletteNode = (item: any) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type: item.type,
      label: item.label,
      category: item.category,
      x: 350 + (nodes.length % 4) * 40,
      y: 180 + (nodes.length % 3) * 50,
      badge: item.badge,
      subtext: 'Custom architecture component',
      color: item.color,
      bgGradient: item.bgGradient,
      iconType: item.iconType,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setActivePreset('custom');
  };

  // Delete selected node
  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
      setConnections((prev) => prev.filter((c) => c.fromId !== selectedNodeId && c.toId !== selectedNodeId));
      setSelectedNodeId(null);
      setActivePreset('custom');
    }
    if (selectedConnId) {
      setConnections((prev) => prev.filter((c) => c.id !== selectedConnId));
      setSelectedConnId(null);
      setActivePreset('custom');
    }
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setSelectedConnId(null);
    setActivePreset('custom');
  };

  // Helper icon renderer
  const renderNodeIcon = (iconType: string) => {
    switch (iconType) {
      case 'database':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'server':
        return <Server className="h-4 w-4 text-sky-600" />;
      case 'harddrive':
        return <HardDrive className="h-4 w-4 text-amber-600" />;
      case 'cpu':
        return <Cpu className="h-4 w-4 text-teal-600" />;
      case 'zap':
        return <Zap className="h-4 w-4 text-emerald-600" />;
      case 'shield':
        return <ShieldCheck className="h-4 w-4 text-purple-600" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-amber-500" />;
      default:
        return <Box className="h-4 w-4 text-teal-700" />;
    }
  };

  // Animation speed CSS class mapper
  const getDashAnimationClass = () => {
    if (animSpeed === 'paused') return '';
    if (animSpeed === 'fast') return 'animate-moving-dash-fast';
    if (animSpeed === 'slow') return 'animate-moving-dash-slow';
    return 'animate-moving-dash';
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedConnection = connections.find((c) => c.id === selectedConnId);

  return (
    <div className="space-y-4">
      {/* ── TOP CONTROL BAR ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Left: Template Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4 text-teal-700" />
            <span>Templates:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleLoadPreset('fabric')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activePreset === 'fabric'
                  ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Fabric Medallion
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('databricks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activePreset === 'databricks'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Databricks Lakehouse
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('hybrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activePreset === 'hybrid'
                  ? 'bg-gradient-to-r from-slate-900 to-teal-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Hybrid Fabric + Databricks
            </button>
          </div>
        </div>

        {/* Center: Animation Controls */}
        <div className="flex items-center gap-2 border-x border-slate-200 px-3">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-teal-700" />
            <span>Data Flow Speed:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-extrabold">
            <button
              type="button"
              onClick={() => setAnimSpeed('fast')}
              className={`px-2 py-0.5 rounded cursor-pointer ${animSpeed === 'fast' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
            >
              Fast Stream
            </button>
            <button
              type="button"
              onClick={() => setAnimSpeed('normal')}
              className={`px-2 py-0.5 rounded cursor-pointer ${animSpeed === 'normal' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setAnimSpeed('slow')}
              className={`px-2 py-0.5 rounded cursor-pointer ${animSpeed === 'slow' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
            >
              Slow
            </button>
            <button
              type="button"
              onClick={() => setAnimSpeed(animSpeed === 'paused' ? 'normal' : 'paused')}
              className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                animSpeed === 'paused' ? 'bg-red-600 text-white' : 'text-slate-600'
              }`}
            >
              {animSpeed === 'paused' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              <span>{animSpeed === 'paused' ? 'Play' : 'Pause'}</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {(selectedNodeId || selectedConnId) && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearCanvas}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Canvas</span>
          </button>
        </div>
      </div>

      {/* ── CANVAS MAIN WORKSPACE GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar Palette Catalog */}
        <div className="lg:col-span-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 max-h-[640px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-teal-700" />
              <span>Component Palette</span>
            </h3>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded">
              Click to Add
            </span>
          </div>

          <p className="text-[11px] text-slate-700 leading-snug font-medium">
            Click any component to drop it onto the canvas, or drag connecting dots between nodes.
          </p>

          <div className="space-y-3">
            {PALETTE_CATALOG.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block border-l-2 border-teal-600 pl-1.5">
                  {cat.categoryName}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {cat.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      type="button"
                      onClick={() => handleAddPaletteNode(item)}
                      className={`w-full text-left p-2 rounded-xl border ${item.color} bg-gradient-to-r ${item.bgGradient} hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between group`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          {renderNodeIcon(item.iconType)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-800">
                            {item.label}
                          </span>
                          <span className="text-[9px] font-bold text-slate-600">{item.badge}</span>
                        </div>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-slate-600 group-hover:text-teal-700 transition" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Canvas Canvas Area */}
        <div className="lg:col-span-9 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl overflow-hidden relative min-h-[620px]">
          {/* Canvas Dot Grid Background */}
          <div
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={() => {
              setSelectedNodeId(null);
              setSelectedConnId(null);
              setConnectingFromId(null);
              setMousePos(null);
            }}
            className="w-full h-full min-h-[620px] relative select-none cursor-crosshair overflow-auto"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Top Canvas Instruction Overlay Banner */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-200">
                Interactive Architecture Canvas: Drag cards • Click green dot to connect with animated arrows
              </span>
            </div>

            {/* SVG OVERLAY FOR MOVING DOTTED CONNECTING LINES WITH ARROWS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 min-w-[1200px] min-h-[800px]">
              <defs>
                {/* Directional Arrow Markers */}
                <marker
                  id="arrow-teal"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#2dd4bf" />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                </marker>
                <marker
                  id="arrow-blue"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>

                {/* Glow Filter for Active Data Flow */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Existing Connections */}
              {connections.map((conn) => {
                const fromNode = nodes.find((n) => n.id === conn.fromId);
                const toNode = nodes.find((n) => n.id === conn.toId);

                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + 190; // right output port of fromNode
                const y1 = fromNode.y + 42;
                const x2 = toNode.x; // left input port of toNode
                const y2 = toNode.y + 42;

                const dx = Math.max(50, Math.abs(x2 - x1) * 0.4);
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const isSelected = selectedConnId === conn.id;

                let strokeColor = '#2dd4bf'; // default teal
                let markerId = 'url(#arrow-teal)';

                if (conn.flowType === 'direct_lake') {
                  strokeColor = '#fbbf24'; // amber for Direct Lake
                  markerId = 'url(#arrow-amber)';
                } else if (conn.flowType === 'batch') {
                  strokeColor = '#38bdf8'; // sky blue for batch
                  markerId = 'url(#arrow-blue)';
                }

                return (
                  <g
                    key={conn.id}
                    className="pointer-events-auto cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnId(conn.id);
                      setSelectedNodeId(null);
                    }}
                  >
                    {/* Outer Glow Background Path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 6 : 4}
                      strokeOpacity="0.25"
                      filter="url(#glow)"
                    />

                    {/* Base Solid Guide Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeOpacity="0.5"
                    />

                    {/* ANIMATED MOVING DOTTED LINE WITH DIRECTIONAL ARROW */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="3.5"
                      strokeDasharray="8 8"
                      markerEnd={markerId}
                      className={getDashAnimationClass()}
                    />

                    {/* Connection Text Label */}
                    {conn.label && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 8}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="bg-slate-900 px-1 py-0.5"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Temporary In-Progress Connection Line when Dragging */}
              {connectingFromId && mousePos && (
                (() => {
                  const fromNode = nodes.find((n) => n.id === connectingFromId);
                  if (!fromNode) return null;
                  const x1 = fromNode.x + 190;
                  const y1 = fromNode.y + 42;
                  const x2 = mousePos.x;
                  const y2 = mousePos.y;
                  const dx = Math.max(40, Math.abs(x2 - x1) * 0.4);
                  const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                  return (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      markerEnd="url(#arrow-teal)"
                      className="animate-moving-dash-fast"
                    />
                  );
                })()
              )}
            </svg>

            {/* RENDER DRAGGABLE NODES CARDS */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnectingSource = connectingFromId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute z-20 w-[190px] rounded-2xl bg-slate-800/95 border-2 ${
                    isSelected
                      ? 'border-teal-400 shadow-2xl ring-4 ring-teal-500/20'
                      : isConnectingSource
                      ? 'border-emerald-400 ring-4 ring-emerald-500/30'
                      : 'border-slate-700/80 shadow-lg hover:border-slate-500'
                  } p-3 backdrop-blur-md transition-shadow cursor-grab active:cursor-grabbing group`}
                >
                  {/* Left Target Connection Port (Input Dot) */}
                  <div
                    onClick={(e) => handleEndConnect(e, node.id)}
                    title="Click to connect target input"
                    className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center cursor-pointer hover:border-teal-400 hover:scale-125 transition-all group-hover:border-teal-500"
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-400" />
                  </div>

                  {/* Right Source Connection Port (Output Dot) */}
                  <div
                    onClick={(e) => handleStartConnect(e, node.id)}
                    title="Click to start moving dotted line connection"
                    className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center cursor-pointer hover:bg-emerald-400 hover:scale-125 transition-all shadow-md"
                  >
                    <ArrowRight className="h-3 w-3 text-slate-950 font-black" />
                  </div>

                  {/* Card Content Header */}
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-900/90 rounded-xl border border-slate-700 shadow-xs">
                        {renderNodeIcon(node.iconType)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-100 leading-tight">
                          {node.label}
                        </h4>
                        <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider block">
                          {node.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      className="text-slate-500 hover:text-slate-300 transition"
                    >
                      <Move className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Badge & Details */}
                  {node.badge && (
                    <div className="mt-1">
                      <span className="inline-block rounded-md bg-slate-900/80 border border-slate-700 px-2 py-0.5 text-[9px] font-bold text-slate-300">
                        {node.badge}
                      </span>
                    </div>
                  )}

                  {node.subtext && (
                    <p className="mt-1 text-[10px] font-medium text-slate-400 leading-tight">
                      {node.subtext}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ARCHITECTURE INSPECTOR & SPEC SUMMARY PANEL ───────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl">
            <Sparkles className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Architecture Canvas Inspector</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {nodes.length} Components • {connections.length} Live Data Streams
              </span>
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {selectedNode
                ? `Selected Component: ${selectedNode.label} (${selectedNode.badge || selectedNode.category})`
                : selectedConnection
                ? `Selected Connection Stream: ${selectedConnection.label} (${selectedConnection.flowType.toUpperCase()})`
                : 'Select any node or connecting line above to inspect data flow parameters and cost drivers.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-slate-700">Moving Dash Animation Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-900">Direct Lake Zero-Copy Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
