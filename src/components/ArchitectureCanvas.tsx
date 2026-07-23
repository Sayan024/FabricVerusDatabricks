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
  CheckCircle2,
  Globe,
  Network,
  Monitor,
  Smartphone,
  Lock,
  Layers,
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
  stepNumber?: number;
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
      bgGradient: 'from-blue-900/60 to-indigo-900/60',
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
      bgGradient: 'from-sky-900/60 to-blue-900/60',
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
      bgGradient: 'from-teal-900/60 to-emerald-900/60',
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
      bgGradient: 'from-amber-900/60 to-orange-900/60',
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
      bgGradient: 'from-emerald-900/60 to-teal-900/60',
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
      bgGradient: 'from-cyan-900/60 to-blue-900/60',
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
      bgGradient: 'from-amber-900/60 to-yellow-900/60',
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
      bgGradient: 'from-purple-900/60 to-pink-900/60',
      iconType: 'shield',
    },
  ],
  connections: [
    { id: 'c1', fromId: 'src-1', toId: 'ingest-1', flowType: 'realtime', label: 'CDC Ingest', stepNumber: 1 },
    { id: 'c2', fromId: 'src-2', toId: 'ingest-1', flowType: 'batch', label: 'Nightly Batch', stepNumber: 2 },
    { id: 'c3', fromId: 'ingest-1', toId: 'store-1', flowType: 'realtime', label: 'Raw Write', stepNumber: 3 },
    { id: 'c4', fromId: 'store-1', toId: 'store-2', flowType: 'batch', label: 'ETL Transform', stepNumber: 4 },
    { id: 'c5', fromId: 'store-2', toId: 'comp-1', flowType: 'realtime', label: 'Query Compute', stepNumber: 5 },
    { id: 'c6', fromId: 'store-2', toId: 'bi-1', flowType: 'direct_lake', label: 'Direct Lake Zero-Copy', stepNumber: 6 },
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
      bgGradient: 'from-red-900/60 to-rose-900/60',
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
      bgGradient: 'from-amber-900/60 to-orange-900/60',
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
      bgGradient: 'from-red-900/60 to-orange-900/60',
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
      bgGradient: 'from-sky-900/60 to-blue-900/60',
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
      bgGradient: 'from-indigo-900/60 to-purple-900/60',
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
      bgGradient: 'from-red-900/60 to-rose-900/60',
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
      bgGradient: 'from-amber-900/60 to-yellow-900/60',
      iconType: 'activity',
    },
  ],
  connections: [
    { id: 'dbc1', fromId: 'db-src-1', toId: 'db-ingest-1', flowType: 'batch', label: 'JDBC Extraction', stepNumber: 1 },
    { id: 'dbc2', fromId: 'db-src-2', toId: 'db-ingest-1', flowType: 'realtime', label: 'Cloud Events', stepNumber: 2 },
    { id: 'dbc3', fromId: 'db-ingest-1', toId: 'db-store-1', flowType: 'realtime', label: 'Delta Stream Write', stepNumber: 3 },
    { id: 'dbc4', fromId: 'db-store-1', toId: 'db-gov-1', flowType: 'realtime', label: 'UC Metastore Bind', stepNumber: 4 },
    { id: 'dbc5', fromId: 'db-store-1', toId: 'db-comp-1', flowType: 'realtime', label: 'Photon Read', stepNumber: 5 },
    { id: 'dbc6', fromId: 'db-comp-1', toId: 'db-bi-1', flowType: 'realtime', label: 'SQL Endpoint Query', stepNumber: 6 },
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
      bgGradient: 'from-blue-900/60 to-indigo-900/60',
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
      bgGradient: 'from-red-900/60 to-rose-900/60',
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
      bgGradient: 'from-teal-900/60 to-cyan-900/60',
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
      bgGradient: 'from-teal-900/60 to-emerald-900/60',
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
      bgGradient: 'from-amber-900/60 to-yellow-900/60',
      iconType: 'activity',
    },
  ],
  connections: [
    { id: 'hc1', fromId: 'h-src-1', toId: 'h-ingest-1', flowType: 'realtime', label: 'High-speed Ingest', stepNumber: 1 },
    { id: 'hc2', fromId: 'h-ingest-1', toId: 'h-store-1', flowType: 'realtime', label: 'Write Delta Delta Parquet', stepNumber: 2 },
    { id: 'hc3', fromId: 'h-store-1', toId: 'h-comp-1', flowType: 'direct_lake', label: 'OneLake Shortcut', stepNumber: 3 },
    { id: 'hc4', fromId: 'h-comp-1', toId: 'h-bi-1', flowType: 'direct_lake', label: 'Direct Lake Reporting', stepNumber: 4 },
  ],
};

// ── BYTEBYTEGO 8 SYSTEM DESIGN CARDS CONTENT ──────────────────────────────────
const SYSTEM_DESIGN_PROBLEMS = [
  {
    num: 1,
    title: 'Use Direct Lake for Zero-Copy BI Reads',
    category: 'Read-Heavy BI System',
    borderColor: 'border-amber-500',
    headerBg: 'bg-amber-950/80 text-amber-300',
    desc: 'Eliminate Power BI Import mode refreshes. Query Delta Parquet directly in OneLake with sub-second latency.',
    diagramType: 'cache_read',
    badge: 'Zero-Copy Direct Lake',
  },
  {
    num: 2,
    title: 'Use Auto Loader & Async Medallion ETL',
    category: 'High-Write Stream Traffic',
    borderColor: 'border-emerald-500',
    headerBg: 'bg-emerald-950/80 text-emerald-300',
    desc: 'Buffer incoming files with cloud notification streams (Auto Loader) before appending to Delta Bronze.',
    diagramType: 'async_write',
    badge: 'Streaming Auto Loader',
  },
  {
    num: 3,
    title: 'Implement Failover & Multi-Region Redundancy',
    category: 'Single Point of Failure',
    borderColor: 'border-sky-500',
    headerBg: 'bg-sky-950/80 text-sky-300',
    desc: 'Active-Passive replication across Azure Regions (e.g. Central India -> South India) with auto failover decision.',
    diagramType: 'failover',
    badge: 'High Availability DR',
  },
  {
    num: 4,
    title: 'Use Serverless SQL Warehouse Load Balancing',
    category: 'High Concurrency Load',
    borderColor: 'border-red-500',
    headerBg: 'bg-red-950/80 text-red-300',
    desc: 'Route incoming BI report queries across auto-scaling SQL Serverless clusters to eliminate query queuing.',
    diagramType: 'load_balance',
    badge: 'Auto-Scaling Router',
  },
  {
    num: 5,
    title: 'Use OneLake Shortcuts & CDN Acceleration',
    category: 'High Latency & Data Duplication',
    borderColor: 'border-teal-500',
    headerBg: 'bg-teal-950/80 text-teal-300',
    desc: 'Link external ADLS Gen2 / Amazon S3 buckets directly into OneLake without copy overhead.',
    diagramType: 'shortcuts',
    badge: 'Zero-Duplication Link',
  },
  {
    num: 6,
    title: 'Use Delta Lake Medallion Storage Layering',
    category: 'Handling Large Files',
    borderColor: 'border-cyan-500',
    headerBg: 'bg-cyan-950/80 text-cyan-300',
    desc: 'Organize data into Bronze (Raw), Silver (Cleansed/Enriched), and Gold (Curated Star Schema).',
    diagramType: 'medallion',
    badge: 'Bronze -> Silver -> Gold',
  },
  {
    num: 7,
    title: 'Use Centralized Purview & Unity Catalog Logging',
    category: 'Data Governance & Audit',
    borderColor: 'border-purple-500',
    headerBg: 'bg-purple-950/80 text-purple-300',
    desc: 'Capture end-to-end data lineage, column-level security, and audit logs across all lakehouse engines.',
    diagramType: 'logging',
    badge: 'Unity Catalog + Purview',
  },
  {
    num: 8,
    title: 'Use Liquid Clustering & Partition Pruning',
    category: 'Slow Database Queries',
    borderColor: 'border-yellow-500',
    headerBg: 'bg-yellow-950/80 text-yellow-300',
    desc: 'Replace rigid hive partitioning with Delta Liquid Clustering for fast Z-Order file skipping.',
    diagramType: 'sharding',
    badge: 'Z-Order Liquid Clustering',
  },
];

// ── PALETTE CATALOG FOR FREEFORM CANVAS ───────────────────────────────────────
const PALETTE_CATALOG = [
  {
    categoryName: 'Data Sources',
    items: [
      { type: 'sap', label: 'SAP ECC / BW', category: 'source', color: 'border-blue-500', bgGradient: 'from-blue-900/60 to-indigo-900/60', iconType: 'database', badge: 'ERP Source' },
      { type: 'sql_server', label: 'SQL Server', category: 'source', color: 'border-sky-500', bgGradient: 'from-sky-900/60 to-blue-900/60', iconType: 'server', badge: 'RDBMS' },
      { type: 'oracle', label: 'Oracle Database', category: 'source', color: 'border-red-500', bgGradient: 'from-red-900/60 to-rose-900/60', iconType: 'database', badge: 'Enterprise' },
      { type: 'salesforce', label: 'Salesforce CRM', category: 'source', color: 'border-cyan-500', bgGradient: 'from-cyan-900/60 to-blue-900/60', iconType: 'box', badge: 'SaaS App' },
      { type: 's3', label: 'Amazon S3 / Blob', category: 'source', color: 'border-amber-500', bgGradient: 'from-amber-900/60 to-orange-900/60', iconType: 'harddrive', badge: 'Cloud Storage' },
    ],
  },
  {
    categoryName: 'Ingestion & Pipelines',
    items: [
      { type: 'datafactory', label: 'Fabric Data Factory', category: 'ingestion', color: 'border-teal-500', bgGradient: 'from-teal-900/60 to-emerald-900/60', iconType: 'zap', badge: 'SaaS Pipelines' },
      { type: 'autoloader', label: 'Databricks Auto Loader', category: 'ingestion', color: 'border-red-600', bgGradient: 'from-red-900/60 to-orange-900/60', iconType: 'zap', badge: 'Spark Stream' },
    ],
  },
  {
    categoryName: 'Storage & Lakehouse',
    items: [
      { type: 'onelake', label: 'Microsoft OneLake', category: 'storage', color: 'border-teal-600', bgGradient: 'from-teal-900/60 to-cyan-900/60', iconType: 'harddrive', badge: 'Delta Parquet' },
      { type: 'adls_delta', label: 'ADLS Gen2 Delta', category: 'storage', color: 'border-blue-600', bgGradient: 'from-blue-900/60 to-sky-900/60', iconType: 'harddrive', badge: 'Azure Storage' },
    ],
  },
  {
    categoryName: 'Compute & Processing',
    items: [
      { type: 'fabric_spark', label: 'Fabric Spark Engine', category: 'compute', color: 'border-teal-600', bgGradient: 'from-teal-900/60 to-emerald-900/60', iconType: 'cpu', badge: 'F-SKU Compute' },
      { type: 'sql_warehouse', label: 'Databricks SQL Warehouse', category: 'compute', color: 'border-red-600', bgGradient: 'from-red-900/60 to-orange-900/60', iconType: 'cpu', badge: 'Serverless DBU' },
    ],
  },
  {
    categoryName: 'Analytics & BI',
    items: [
      { type: 'powerbi_dl', label: 'Power BI (Direct Lake)', category: 'bi', color: 'border-amber-500', bgGradient: 'from-amber-900/60 to-yellow-900/60', iconType: 'activity', badge: 'Zero-Copy BI' },
    ],
  },
  {
    categoryName: 'Governance & Security',
    items: [
      { type: 'purview', label: 'Microsoft Purview', category: 'governance', color: 'border-purple-500', bgGradient: 'from-purple-900/60 to-pink-900/60', iconType: 'shield', badge: 'M365 Lineage' },
      { type: 'unity_catalog', label: 'Unity Catalog', category: 'governance', color: 'border-indigo-500', bgGradient: 'from-indigo-900/60 to-purple-900/60', iconType: 'shield', badge: 'Cross-Cloud' },
    ],
  },
];

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = () => {
  // View Modes: 'bytebytego' (ByteByteGo System Design Infographic), 'pipeline' (Numbered Pipeline Flow), 'freeform' (Interactive Canvas)
  const [viewMode, setViewMode] = useState<'bytebytego' | 'pipeline' | 'freeform'>('bytebytego');

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

    const exists = connections.some((c) => c.fromId === connectingFromId && c.toId === targetNodeId);
    if (!exists) {
      const nextStep = connections.length + 1;
      const newConn: CanvasConnection = {
        id: `conn-${Date.now()}`,
        fromId: connectingFromId,
        toId: targetNodeId,
        flowType: 'realtime',
        label: 'Active Data Stream',
        stepNumber: nextStep,
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
        return <Database className="h-4 w-4 text-blue-400" />;
      case 'server':
        return <Server className="h-4 w-4 text-sky-400" />;
      case 'harddrive':
        return <HardDrive className="h-4 w-4 text-amber-400" />;
      case 'cpu':
        return <Cpu className="h-4 w-4 text-teal-400" />;
      case 'zap':
        return <Zap className="h-4 w-4 text-emerald-400" />;
      case 'shield':
        return <ShieldCheck className="h-4 w-4 text-purple-400" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-amber-400" />;
      default:
        return <Box className="h-4 w-4 text-teal-400" />;
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
      {/* ── TOP CONTROL BAR: DESIGN MODE SWITCHER ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Left: View Design Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4 text-teal-400" />
            <span>Design Layout:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('bytebytego')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'bytebytego'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>ByteByteGo Infographic Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'pipeline'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span>Pipeline Flow (Numbered Steps)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('freeform')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'freeform'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Move className="h-3.5 w-3.5" />
              <span>Freeform Drag & Drop Canvas</span>
            </button>
          </div>
        </div>

        {/* Center: Presets & Controls */}
        <div className="flex items-center gap-2">
          {viewMode !== 'bytebytego' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleLoadPreset('fabric')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                  activePreset === 'fabric' ? 'bg-teal-700 text-white' : 'text-slate-400'
                }`}
              >
                Fabric
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('databricks')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                  activePreset === 'databricks' ? 'bg-red-700 text-white' : 'text-slate-400'
                }`}
              >
                Databricks
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('hybrid')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                  activePreset === 'hybrid' ? 'bg-indigo-700 text-white' : 'text-slate-400'
                }`}
              >
                Hybrid
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setAnimSpeed('fast')}
              className={`px-2 py-0.5 rounded cursor-pointer ${animSpeed === 'fast' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Fast
            </button>
            <button
              type="button"
              onClick={() => setAnimSpeed('normal')}
              className={`px-2 py-0.5 rounded cursor-pointer ${animSpeed === 'normal' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setAnimSpeed(animSpeed === 'paused' ? 'normal' : 'paused')}
              className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                animSpeed === 'paused' ? 'bg-red-600 text-white' : 'text-slate-400'
              }`}
            >
              {animSpeed === 'paused' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MODE 1: BYTEBYTEGO SYSTEM DESIGN INFOGRAPHIC MODE (IMAGE 1 REPLICA) ─────── */}
      {viewMode === 'bytebytego' && (
        <div className="bg-[#0B0F19] p-6 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-6 text-white selection:bg-teal-500 selection:text-black">
          {/* Top Banner Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black text-xl shadow-lg">
                8
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>8 Common</span>
                  <span className="bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 px-3 py-0.5 rounded-full text-base font-black">
                    Data Architecture Decisions
                  </span>
                  <span>and Solutions</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Microsoft Fabric vs Azure Databricks Platform Sizing & Design Patterns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-300">Enterprise Solution Architect Blueprint v1.5</span>
            </div>
          </div>

          {/* Center Hub & 8 Radial Nodes Diagram Banner */}
          <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800 p-6 min-h-[300px] flex items-center justify-center overflow-hidden">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #2dd4bf 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* SVG Connecting Dashed Lines radiating from Hub */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <line x1="50%" y1="50%" x2="15%" y2="25%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" className={getDashAnimationClass()} />
              <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" className={getDashAnimationClass()} />
              <line x1="50%" y1="50%" x2="85%" y2="25%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" className={getDashAnimationClass()} />
              <line x1="50%" y1="50%" x2="15%" y2="75%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" className={getDashAnimationClass()} />
              <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" className={getDashAnimationClass()} />
              <line x1="50%" y1="50%" x2="85%" y2="75%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" className={getDashAnimationClass()} />
            </svg>

            {/* Central Circle Hub Node */}
            <div className="z-10 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 p-6 rounded-full border-4 border-teal-500/80 shadow-2xl text-center max-w-[200px] ring-8 ring-teal-500/20">
              <Sparkles className="h-6 w-6 text-teal-400 mx-auto mb-1 animate-pulse" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider leading-tight">
                Common System Design Decisions & Solutions
              </h3>
            </div>

            {/* Radiating Radial Satellite Badges */}
            <div className="absolute top-4 left-10 bg-blue-600/90 text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-blue-400 shadow-lg z-10">
              Read-Heavy BI System
            </div>
            <div className="absolute top-4 right-10 bg-indigo-600/90 text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-indigo-400 shadow-lg z-10">
              Single Point of Failure
            </div>
            <div className="absolute bottom-4 left-10 bg-purple-600/90 text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-purple-400 shadow-lg z-10">
              Monitoring & Governance
            </div>
            <div className="absolute bottom-4 right-10 bg-amber-600/90 text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-amber-400 shadow-lg z-10">
              High Write Traffic
            </div>
          </div>

          {/* 8 SURROUNDING SYSTEM DESIGN CARDS GRID (BYTEBYTEGO INFOGRAPHIC GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SYSTEM_DESIGN_PROBLEMS.map((prob) => (
              <div
                key={prob.num}
                className={`bg-slate-900/95 rounded-2xl border-2 ${prob.borderColor} p-4 space-y-3 shadow-xl hover:scale-[1.02] transition-transform`}
              >
                {/* Header Badge */}
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${prob.headerBg} font-black text-xs shrink-0 shadow-md`}>
                    {prob.num}
                  </span>
                  <h4 className="text-xs font-black text-slate-100 leading-tight">
                    {prob.title}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {prob.desc}
                </p>

                {/* Sub-Diagram Graphics for each card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
                  {prob.diagramType === 'cache_read' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">OneLake</div>
                      <ArrowRight className="h-3 w-3 text-teal-400 animate-pulse" />
                      <div className="p-1.5 bg-teal-900/80 text-teal-300 rounded border border-teal-500">Direct Lake</div>
                      <ArrowRight className="h-3 w-3 text-teal-400 animate-pulse" />
                      <div className="p-1.5 bg-amber-900/80 text-amber-300 rounded border border-amber-500">Power BI</div>
                    </div>
                  )}

                  {prob.diagramType === 'async_write' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">Sources</div>
                      <ArrowRight className="h-3 w-3 text-emerald-400 animate-pulse" />
                      <div className="p-1.5 bg-emerald-900/80 text-emerald-300 rounded border border-emerald-500">Auto Loader</div>
                      <ArrowRight className="h-3 w-3 text-emerald-400 animate-pulse" />
                      <div className="p-1.5 bg-sky-900/80 text-sky-300 rounded border border-sky-500">Delta Lake</div>
                    </div>
                  )}

                  {prob.diagramType === 'failover' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">Primary Region</div>
                      <span className="text-red-400 font-black">⚡ DR Failover</span>
                      <div className="p-1.5 bg-sky-900/80 text-sky-300 rounded border border-sky-500">Replica Region</div>
                    </div>
                  )}

                  {prob.diagramType === 'load_balance' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">50 BI Users</div>
                      <ArrowRight className="h-3 w-3 text-red-400 animate-pulse" />
                      <div className="p-1.5 bg-red-900/80 text-red-300 rounded border border-red-500">Serverless Router</div>
                      <ArrowRight className="h-3 w-3 text-red-400 animate-pulse" />
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">4 SQL Nodes</div>
                    </div>
                  )}

                  {prob.diagramType === 'shortcuts' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">S3 / ADLS</div>
                      <span className="text-teal-300 font-bold">🔗 Shortcut Link</span>
                      <div className="p-1.5 bg-teal-900/80 text-teal-300 rounded border border-teal-500">OneLake Zero-Copy</div>
                    </div>
                  )}

                  {prob.diagramType === 'medallion' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1 bg-amber-900/60 text-amber-300 rounded border border-amber-600">Bronze</div>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <div className="p-1 bg-slate-800 text-slate-200 rounded border border-slate-600">Silver</div>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <div className="p-1 bg-emerald-900/60 text-emerald-300 rounded border border-emerald-600">Gold</div>
                    </div>
                  )}

                  {prob.diagramType === 'logging' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">Jobs</div>
                      <ArrowRight className="h-3 w-3 text-purple-400 animate-pulse" />
                      <div className="p-1.5 bg-purple-900/80 text-purple-300 rounded border border-purple-500">Purview / UC</div>
                    </div>
                  )}

                  {prob.diagramType === 'sharding' && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-700">Unpartitioned</div>
                      <ArrowRight className="h-3 w-3 text-yellow-400 animate-pulse" />
                      <div className="p-1.5 bg-yellow-900/80 text-yellow-300 rounded border border-yellow-500">Liquid Clustered</div>
                    </div>
                  )}

                  <span className="text-[9px] font-bold text-teal-400 block pt-1">
                    ✓ {prob.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ByteByteGo Style Footer Credit */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Fabric vs Databricks System Design Infographic Blueprint</span>
            </div>
            <span className="text-slate-500">Interactive Architecture Engine v1.5</span>
          </div>
        </div>
      )}

      {/* ── MODE 2: NUMBERED PIPELINE FLOW (IMAGE 2 HOTSTAR REPLICA) ────────────────── */}
      {viewMode === 'pipeline' && (
        <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-6 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Network className="h-6 w-6 text-sky-400" />
                <span>End-to-End Data Pipeline Flow with Numbered Step Badges</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Step-by-Step Data Flow from Source Applications to Real-Time Power BI Dashboard
              </p>
            </div>
            <span className="bg-sky-900/80 text-sky-300 border border-sky-500 px-3 py-1 rounded-full text-xs font-bold">
              6 Step Sequence
            </span>
          </div>

          {/* Pipeline Cards Row with Numbered Step Circles */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative py-4">
            {/* Step 1 */}
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-blue-500 relative flex flex-col items-center text-center space-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-950">
                1
              </span>
              <Smartphone className="h-6 w-6 text-blue-400 mt-2" />
              <h4 className="text-xs font-black text-white">Client Apps & Sources</h4>
              <p className="text-[10px] text-slate-400 font-medium">HTTP Ingestion & CDC Files</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-teal-500 relative flex flex-col items-center text-center space-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-950">
                2
              </span>
              <Zap className="h-6 w-6 text-teal-400 mt-2" />
              <h4 className="text-xs font-black text-white">Ingestion Engine</h4>
              <p className="text-[10px] text-slate-400 font-medium">Fabric Data Factory / Auto Loader</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-amber-500 relative flex flex-col items-center text-center space-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-950">
                3
              </span>
              <HardDrive className="h-6 w-6 text-amber-400 mt-2" />
              <h4 className="text-xs font-black text-white">Bronze Storage</h4>
              <p className="text-[10px] text-slate-400 font-medium">OneLake / ADLS Gen2 Delta</p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-cyan-500 relative flex flex-col items-center text-center space-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-950">
                4
              </span>
              <Cpu className="h-6 w-6 text-cyan-400 mt-2" />
              <h4 className="text-xs font-black text-white">Spark Compute</h4>
              <p className="text-[10px] text-slate-400 font-medium">Fabric Spark / Databricks DLT</p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-purple-500 relative flex flex-col items-center text-center space-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-950">
                5
              </span>
              <ShieldCheck className="h-6 w-6 text-purple-400 mt-2" />
              <h4 className="text-xs font-black text-white">Unity & Purview</h4>
              <p className="text-[10px] text-slate-400 font-medium">Governance & Security Catalog</p>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-yellow-500 relative flex flex-col items-center text-center space-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-950">
                6
              </span>
              <Activity className="h-6 w-6 text-yellow-400 mt-2" />
              <h4 className="text-xs font-black text-white">Power BI Direct Lake</h4>
              <p className="text-[10px] text-slate-400 font-medium">Sub-Second Direct Lake BI</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 3: INTERACTIVE FREEFORM DRAG & DROP CANVAS VIEW ──────────────────── */}
      {viewMode === 'freeform' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar Palette Catalog */}
          <div className="lg:col-span-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3 max-h-[640px] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-teal-400">
                <Plus className="h-4 w-4" />
                <span>Component Palette</span>
              </h3>
              <span className="text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 px-1.5 py-0.5 rounded">
                Click to Add
              </span>
            </div>

            <div className="space-y-3">
              {PALETTE_CATALOG.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-l-2 border-teal-500 pl-1.5">
                    {cat.categoryName}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {cat.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => handleAddPaletteNode(item)}
                        className={`w-full text-left p-2 rounded-xl border ${item.color} bg-gradient-to-r ${item.bgGradient} hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between group`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 shadow-2xs">
                            {renderNodeIcon(item.iconType)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-100 block group-hover:text-teal-300">
                              {item.label}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">{item.badge}</span>
                          </div>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-300 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Freeform Canvas Area */}
          <div className="lg:col-span-9 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden relative min-h-[620px]">
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
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-slate-200">
                  Interactive Canvas: Drag cards • Click green dot to connect with animated arrows & step numbers
                </span>
              </div>

              {/* SVG Layer for Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 min-w-[1200px] min-h-[800px]">
                <defs>
                  <marker id="arrow-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#2dd4bf" />
                  </marker>
                  <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                  </marker>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>

                {connections.map((conn) => {
                  const fromNode = nodes.find((n) => n.id === conn.fromId);
                  const toNode = nodes.find((n) => n.id === conn.toId);
                  if (!fromNode || !toNode) return null;

                  const x1 = fromNode.x + 190;
                  const y1 = fromNode.y + 42;
                  const x2 = toNode.x;
                  const y2 = toNode.y + 42;

                  const dx = Math.max(50, Math.abs(x2 - x1) * 0.4);
                  const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                  let strokeColor = '#2dd4bf';
                  let markerId = 'url(#arrow-teal)';
                  if (conn.flowType === 'direct_lake') {
                    strokeColor = '#fbbf24';
                    markerId = 'url(#arrow-amber)';
                  } else if (conn.flowType === 'batch') {
                    strokeColor = '#38bdf8';
                    markerId = 'url(#arrow-blue)';
                  }

                  return (
                    <g
                      key={conn.id}
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConnId(conn.id);
                        setSelectedNodeId(null);
                      }}
                    >
                      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="4" strokeOpacity="0.25" />
                      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3.5" strokeDasharray="8 8" markerEnd={markerId} className={getDashAnimationClass()} />

                      {/* Numbered Step Circle Badge along Arrow Path */}
                      {conn.stepNumber && (
                        <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                          <circle r="11" fill="#10b981" stroke="#022c22" strokeWidth="2" />
                          <text fill="#022c22" fontSize="10" fontWeight="900" textAnchor="middle" dy="3.5">
                            {conn.stepNumber}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Draggable Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute z-20 w-[190px] rounded-2xl bg-slate-900/95 border-2 ${
                    selectedNodeId === node.id ? 'border-teal-400 ring-4 ring-teal-500/20' : 'border-slate-800'
                  } p-3 shadow-xl cursor-grab active:cursor-grabbing`}
                >
                  <div
                    onClick={(e) => handleEndConnect(e, node.id)}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center cursor-pointer hover:border-teal-400"
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-400" />
                  </div>

                  <div
                    onClick={(e) => handleStartConnect(e, node.id)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center cursor-pointer hover:scale-110"
                  >
                    <ArrowRight className="h-3 w-3 text-slate-950 font-black" />
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                      {renderNodeIcon(node.iconType)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white leading-tight">{node.label}</h4>
                      <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider block">{node.category}</span>
                    </div>
                  </div>

                  {node.badge && (
                    <span className="inline-block rounded bg-slate-950 px-2 py-0.5 text-[9px] font-bold text-slate-300 border border-slate-800 mt-1">
                      {node.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
