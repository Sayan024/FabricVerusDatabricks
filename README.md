# Fabric vs Databricks — AI Architecture Decision Tool

![Version](https://img.shields.io/badge/version-1.5-teal.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-7-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8-purple.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-sky.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **Enterprise AI Solution Architect** — An intelligent, AI-powered platform decision engine that helps data teams choose between Microsoft Fabric and Azure Databricks with instant SKU sizing, side-by-side cost breakdowns, and executive decision reports.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Components Reference](#-components-reference)
- [Services Reference](#-services-reference)
- [Pricing Engine](#-pricing-engine)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Pages & Navigation](#-pages--navigation)
- [AI Integration](#-ai-integration)
- [PDF Export](#-pdf-export)

---

## 🌐 Overview

The **Fabric vs Databricks Decision Tool** is a single-page React application that answers the most critical enterprise data architecture question:

> *"Should we build on Microsoft Fabric or Azure Databricks?"*

It does this through a combination of:
- A **deterministic pricing engine** that calculates SKU sizes and monthly cost ranges.
- An **AI Document Ingestion Pipeline** (Microsoft MarkItDown-style) that extracts workload parameters from uploaded project specification documents.
- A **Floating AI Architecture Copilot Chatbot** powered by OpenRouter.
- A **Monthly Release Tracker** that surfaces the latest monthly updates from official Microsoft Fabric and Azure Databricks release notes.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **5-Input Quick Assessment** | Daily data volume, concurrent BI users, workload mix, processing pattern, team skillset |
| 🔬 **Advanced 6-Tab Data Estate Panel** | Fine-grained inputs: databases, tables, files, Power BI, Engineering pipelines, ML workloads, storage |
| 📄 **AI Document Ingestion** | Upload PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, MD, TXT — AI auto-extracts workload parameters |
| ✅ **Human Verification Drawer** | Review, accept, edit, or reject every AI-extracted field with confidence scores and source citations |
| 🏆 **Executive Recommendation Card** | Winner platform badge, fit score, confidence score, and structured rationale |
| 📊 **Granular Platform Cost Cards** | F-SKU sizes, CU allocation, monthly and annual cost ranges per platform |
| 🚦 **Traffic-Light Comparison Matrix** | 10-dimension side-by-side table (Cost, Scalability, Power BI, ML, Governance, etc.) |
| 🗺️ **Migration Roadmap Card** | Migration difficulty, estimated weeks, engineering hours, and risk level |
| ⚡ **Monthly Release Tracker Page** | Dedicated full-page tracker for Microsoft Fabric & Databricks monthly updates |
| 🤖 **Floating AI Chatbot Copilot** | Context-aware multi-turn conversational AI powered by OpenRouter |
| 📤 **PDF Executive Report Export** | Full report as a print-quality PDF via browser `window.print()` |
| 🔗 **Shareable URL Encoding** | Encode workload profile into a shareable URL for team collaboration |
| 🌍 **6 Azure Region Support** | India (Central, South, West), US East/West, Europe, with regional pricing multipliers |
| 🔄 **Clear Fields / Reset** | One-click full form and assessment reset |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 7 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **PDF Parsing** | pdfjs-dist 6 |
| **AI API** | OpenRouter (GPT & Gemma models) |
| **Form Utilities** | react-hook-form, zod |
| **Linting** | oxlint |

---

## 📁 Project Structure

```
fabricDatabricks/
├── public/
│   └── icons/
│       ├── fabric.svg          # Microsoft Fabric logo
│       └── databricks.svg      # Azure Databricks logo
│
├── src/
│   ├── components/             # All UI components
│   ├── services/               # AI & document processing services
│   ├── pricing/                # Deterministic sizing & cost engine
│   ├── types/                  # TypeScript interfaces
│   ├── config/                 # Pricing configuration JSON
│   ├── data/                   # Static data (feature updates)
│   ├── App.tsx                 # Root application + page routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── .env                        # 🔒 Local secrets (not committed)
├── .env.example                # Template for required env vars
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧩 Components Reference

### `Header.tsx`
The sticky top navigation bar with:
- **Brand Logo**: Fabric VS Databricks icon pill.
- **Tab Navigation**: Switches between `Decision Engine` and `Monthly Release Tracker` pages.
- **AI Document Upload**: Shortcut button to open the ingestion modal.
- **Status Badge**: "Architecture Decision Tool v1.5" live indicator.
- **Mobile Responsive**: Collapsible tab bar for small screens.

---

### `HeroUploadCard.tsx`
Full-width hero banner card at the top of the Decision Engine page.
- Promotes the **AI Document Ingestion** workflow as the primary enterprise entry point.
- Lists four core benefits: Extract workload parameters, Auto-fill assessment model, Estimate Fabric vs DB costs, Generate Executive Report.
- "Start AI Ingestion" CTA button that opens the `DocumentIngestionModal`.

---

### `QuickAssessment.tsx`
The 5-input core workload profile form:
1. **Target Azure Region** — Dropdown (India Central/South/West, US East/West, Europe).
2. **Daily Data Volume (GB/day)** — Numeric input with `GB/day` unit label.
3. **Peak Concurrent BI Users** — Numeric input.
4. **Workload Mix** — Select: BI Only, BI + Engineering, BI + Engineering + ML, Pure Engineering, Pure ML.
5. **Processing Pattern** — Select: Scheduled Batch, Hourly Micro-Batch, Real-Time Streaming, Mixed.
6. **Team Skillset** — Select (10+ options including SQL+PBI, PySpark+Databricks, Mixed, etc.).
- **Evaluate Platforms** submit button.
- **Share via URL** copy button.
- **Clear Fields** reset button.

---

### `AdvancedAssessment.tsx`
Collapsible optional refinement panel with 6 sub-tabs:

| Tab | Inputs |
|---|---|
| **Data Estate** | Databases, Schemas, Tables, Stored Procedures, SQL Views |
| **Files** | Excel/CSV/JSON/XML files per day, average & max file size |
| **Power BI** | Reports count, Semantic Models, Direct Lake mode toggle |
| **Engineering** | ETL Pipelines, Spark Jobs, Notebooks, Azure Data Factory pipelines |
| **ML** | ML Workload count, MLflow experiments, GPU cluster flag |
| **Storage** | Total storage GB, Hot/Cool/Archive tier breakdown |

Increasing these inputs raises the **Data Confidence** score from 75% toward 95%+.

---

### `DocumentIngestionModal.tsx`
Full-screen modal for the AI document ingestion pipeline:
- **Drag-and-drop dropzone** (or click-to-browse) supporting: `.pdf`, `.docx`, `.pptx`, `.xlsx`, `.csv`, `.json`, `.xml`, `.html`, `.md`, `.txt`.
- **Multi-file support** — upload several documents simultaneously.
- **Processing Pipeline**: Convert → Merge Markdown → Extract with AI.
- **Human Verification Drawer**: Each extracted field is shown with:
  - AI-extracted value + `Accept` / `Edit` / `Reject` buttons.
  - Confidence score badge (High ≥90%, Moderate ≥75%, Low).
  - Source document name, page/slide location, and verbatim quote citation.
- On **Apply**, the extracted and verified values are loaded into the workload form and the assessment re-runs automatically. The full extracted document text is also passed to the AI Chatbot as system context.

---

### `ExecutiveRecommendationCard.tsx`
The primary output card shown after evaluation:
- **Platform Winner Badge** (Fabric or Databricks) with gradient border.
- **Fit Score** (0–100) for both platforms.
- **Data Confidence** indicator.
- **Primary Workload Type** badge (e.g., "Unified SaaS Analytics Platform").
- **Structured Rationale**: 3-section breakdown — Why This Platform, Key Strengths, and Potential Trade-offs.
- **Export Total Executive Report (PDF)** button.

---

### `PlatformCard.tsx`
Individual cost and sizing card for each platform:
- **F-SKU or Cluster Tier** recommendation.
- **CU Allocation** or DBU breakdown.
- **Monthly cost range** (min–max in ₹ or regional currency).
- **Annual cost range**.
- **Granular Cost Itemization** accordion: Compute, Storage, Power BI, Networking line items.

---

### `SideBySideComparison.tsx`
10-row traffic-light architectural comparison matrix:

| Dimension | What it compares |
|---|---|
| Cost & Licensing | Monthly billing model |
| Scalability | Cluster vs. CU autoscaling |
| Power BI Integration | Direct Lake vs. SQL Warehouse |
| Data Engineering | Synapse Notebooks vs. Delta Live Tables |
| Machine Learning | Synapse ML vs. MLflow |
| Streaming Processing | Eventstream vs. Structured Streaming |
| Data Governance | Purview vs. Unity Catalog |
| Operational Complexity | Managed SaaS vs. Cluster Admin |
| Team Learning Curve | SQL/PBI native vs. PySpark ramp |
| Time to Production | Weeks to first dashboard |

Each row shows **Optimal / Moderate / Complex** pill badges and a **Winner** indicator.

---

### `MigrationTimelineCard.tsx`
Enterprise transition assessment panel:
- **Migration Difficulty** (Low / Medium / High Complexity).
- **Estimated Duration** in weeks (e.g., "3–6 Weeks").
- **Total Engineering Hours** estimate.
- **Risk Level** (Low / Medium / High Risk) with description.

---

### `CostOptimizationCard.tsx`
Optimization tips and actionable cost-reduction suggestions:
- Displays 2–4 platform-specific recommendations.
- Each tip shows estimated savings percentage and implementation effort.

---

### `AICopilotDrawer.tsx`
A **floating SaaS chatbot app** in the bottom-right corner of the screen:
- **Floating Action Button** with pulsing green live indicator.
- **Slide-over chat window** (620px tall, `max-w-lg`).
- **Context Banner** showing loaded workload profile (region, GB/day, users).
- **Document Badge** if an architecture doc was uploaded.
- **Welcome Screen** with 5 one-click starter prompt chips.
- **Conversational Chat**: Full multi-turn chat history with user and assistant message bubbles.
- **Markdown Rendering**: Formats bold text, bullet lists, and section headers in AI responses.
- **Clear Chat** button and **Close / Re-open** toggle.
- **Input Bar**: Text field + Send button + loading spinner.
- Uses `VITE_OPENROUTER_API_KEY` from environment variables.

---

### `FeatureUpdatesCard.tsx`
The dedicated **Monthly Release Tracker** page component:
- **Platform Filter Toggles**: All Platforms / Microsoft Fabric / Azure Databricks.
- **Category Filter Dropdown**: AI & Copilot, Data Engineering, Direct Lake, Unity Catalog, Warehouse & Compute, MLOps & Governance.
- **Live Keyword Search** across all release notes.
- **Release Note Cards** per month, each showing:
  - Platform badge (Fabric / Databricks) + Month & Year.
  - Impact badge: 🔥 Game Changer / ⚡ High Impact / ✨ Enhancement.
  - Feature title and description.
  - **Sizing & Architecture Impact** box: How this update affects SKU sizing or cost.
  - Category tag + "Read Release Notes ↗" official link.
- Data sourced from Microsoft Fabric Community Blog and Azure Databricks official release notes.

---

### `DisclaimerBanner.tsx`
Footer disclaimer banner displayed below the assessment results:
- Notes that cost estimates are indicative, not official Microsoft or Databricks pricing.
- Links to official Azure and Databricks pricing calculators.
- Shows current region-specific pricing basis.

---

### `Footer.tsx`
App footer with branding, links to official docs, and version number.

---

## ⚙️ Services Reference

### `aiService.ts`
Core AI communication service:
- **`sendAIChatMessage(quick, advanced, messages, userPrompt, extractedDocText?)`** — Sends a multi-turn chat message to OpenRouter with full workload context. Tries primary model first (`openai/gpt-oss-20b:free`), falls back to (`google/gemma-4-26b-a4b-it:free`).
- **`sanitizeAIText(text)`** — Strips non-ASCII foreign scripts and normalises whitespace in AI output.

### `aiWebappContext.ts`
Builds the AI system prompt markdown:
- **`buildWebappSystemPromptMarkdown(quick, advanced, extractedDocText?)`** — Generates a rich 100-line markdown system prompt containing the complete pricing knowledge base (Fabric F-SKUs, Databricks DBU rates, regional multipliers) plus the user's current workload profile and any verbatim extracted document content.

### `docConverter.ts`
Browser-side document-to-Markdown converter:
- Handles PDF (via `pdfjs-dist`), XLSX (tabular CSV-style), JSON, XML, HTML, CSV, and plain text/markdown files.
- Returns a clean Markdown string for each uploaded file.

### `documentExtractionEngine.ts`
AI-powered workload extraction from Markdown:
- **`extractWorkloadFromMarkdown(masterContext, docNames)`** — Sends the combined Markdown context to OpenRouter AI and returns a structured `DocumentExtractionResult` with confidence scores, source citations, and extracted values for all 5 quick inputs + 19 advanced inputs.

### `projectContextBuilder.ts`
Merges multiple converted Markdown files into a single master context string with document headers and separators.

---

## 🧮 Pricing Engine

### `pricing/engine.ts`
The deterministic assessment engine — no AI required for core sizing:
- **`runFullAssessment(quick, advanced)`** — Entry point that returns a full `AssessmentResult`.
- **Fabric Sizing**: Maps GB/day + concurrent users + workload mix to an F-SKU (F2–F512). Applies regional CU pricing multipliers. Calculates min/max monthly cost with and without reservation discounts.
- **Databricks Sizing**: Maps workloads to SQL Serverless Warehouse + Jobs Compute tiers. Calculates DBU costs + Azure VM infrastructure costs. Applies Spot VM savings for ETL jobs.
- **Comparison Matrix**: Scores each of the 10 architectural dimensions and assigns Optimal / Moderate / Complex ratings.
- **Migration Timeline**: Determines difficulty, weeks, and hours based on workload complexity and team skillset.
- **Optimizations**: Generates platform-specific cost reduction tips.

### `config/pricingConfig.json`
All pricing constants in one place:
- Regional pricing multipliers for 6 Azure regions.
- Fabric F-SKU CU-to-price mapping.
- Databricks DBU rates by tier.
- Storage pricing per GB per month.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key for AI features | ✅ Yes |

> **Note**: The `.env` file is listed in `.gitignore` and will never be committed to source control. The `.env.example` file provides a safe template for team members.

Get your free OpenRouter API key at [openrouter.ai](https://openrouter.ai).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd fabricDatabricks

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your VITE_OPENROUTER_API_KEY

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173** (or the next available port).

### Build for Production

```bash
npm run build       # Build to /dist
npm run preview     # Preview production build locally
```

### Type Check

```bash
npx tsc --noEmit    # TypeScript type check (0 errors expected)
```

---

## 📄 Pages & Navigation

The app has **two main pages** accessible via the header tab navigation:

| Tab | Page | Description |
|---|---|---|
| `📊 Decision Engine` | Architecture Advisor | The primary workload profiler, AI document ingestion, platform sizing, cost comparison, and executive report. |
| `⚡ Monthly Release Tracker` | Release Notes Tracker | Dedicated full-page tracker for the latest monthly feature releases from both platforms. |

---

## 🤖 AI Integration

The app uses **OpenRouter** as the AI gateway, which provides access to multiple models:

| Role | Model | Purpose |
|---|---|---|
| Primary | `openai/gpt-oss-20b:free` | Chat & document extraction |
| Fallback | `google/gemma-4-26b-a4b-it:free` | Automatic fallback if primary fails |

**AI is used in two places:**
1. **Document Ingestion** — Extracting workload parameters from uploaded files.
2. **AI Chatbot Copilot** — Multi-turn conversational architecture advisor with full workload context and uploaded document text injected as system prompt.

---

## 📤 PDF Export

The **Export Total Executive Report (PDF)** button triggers `window.print()` with print-specific CSS that:
- Hides all interactive UI elements (sidebar form, buttons, chatbot, header nav).
- Adds a formatted report header with region, volume, users, and date.
- Renders all assessment cards in a clean single-column print layout.
- Outputs an A4-compatible PDF via the browser's native print dialog.

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/my-new-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/my-new-feature`.
5. Open a Pull Request.

---

## 📝 License

This project is licensed under the MIT License.

---

*Built with ❤️ for the Microsoft Fabric & Azure Databricks community.*
