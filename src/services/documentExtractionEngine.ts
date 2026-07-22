import { DocumentExtractionResult, ExtractedField, FieldConflict } from '../types/ingestion';
import { WorkloadMix, ProcessingPattern, TeamSkillset } from '../types/assessment';
import { PRIMARY_MODEL, FALLBACK_MODEL } from './aiService';
import { truncateTextForTokenSafety } from './aiWebappContext';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function extractWorkloadFromMarkdown(
  mergedMarkdown: string,
  docNames: string[]
): Promise<DocumentExtractionResult> {
  const safeMarkdown = truncateTextForTokenSafety(mergedMarkdown, 35000);

  const systemPrompt = `You are an elite Principal Enterprise Cloud Data Architect auditing technical architecture documentation.
Your task is to extract workload characteristics into a strict JSON object.

RULES:
1. Extract exact values from text. Convert TB to GB (e.g. 1.8 TB/day = 1800 GB/day; 31 TB storage = 31000 GB). Remove commas from numbers (e.g. 3,250 = 3250).
2. "workloadMix" MUST be exactly one of: "bi_only", "bi_eng", "bi_eng_ml".
3. "processingPattern" MUST be exactly one of: "batch", "hourly", "near_realtime".
4. "teamSkillset" MUST be exactly one of: "sql_powerbi", "python_spark", "mixed".
5. Every field MUST be an object with: "value", "confidence" (0-100), "sourceDoc", "pageOrSlide", "quote".

REQUIRED JSON OUTPUT SHAPE (OUTPUT ONLY VALID JSON, NO MARKDOWN BACKTICKS):
{
  "quickAssessment": {
    "dailyDataVolumeGB": { "value": 1800, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Daily Data Volume 1.8 TB/day" },
    "peakConcurrentUsers": { "value": 310, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Peak Concurrent BI Users 310" },
    "workloadMix": { "value": "bi_eng", "confidence": 92, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Workload Mix BI + Data Engineering" },
    "processingPattern": { "value": "near_realtime", "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Processing Pattern Hourly + Near Real-Time" },
    "teamSkillset": { "value": "sql_powerbi", "confidence": 90, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Team Skillset SQL + Power BI" }
  },
  "advancedAssessment": {
    "databasesCount": { "value": 18, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Databases 18" },
    "tablesCount": { "value": 3250, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Tables 3,250" },
    "storedProceduresCount": { "value": 782, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Stored Procedures 782" },
    "etlPipelinesCount": { "value": 94, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "ETL Jobs 94" },
    "dataFactoryPipelinesCount": { "value": 63, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Data Factory Pipelines 63" },
    "notebooksCount": { "value": 18, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Spark Notebooks 18" },
    "excelFilesDaily": { "value": 145, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Excel Files 145/day" },
    "csvFilesDaily": { "value": 210, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "CSV Files 210/day" },
    "jsonFilesDaily": { "value": 84, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "JSON Files 84/day" },
    "xmlFilesDaily": { "value": 12, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "XML Files 12/day" },
    "reportsCount": { "value": 186, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Reports 186" },
    "semanticModelsCount": { "value": 37, "confidence": 95, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Semantic Models 37" },
    "totalStorageGB": { "value": 31000, "confidence": 90, "sourceDoc": "${docNames[0] || 'doc'}", "pageOrSlide": "Page 1", "quote": "Bronze Storage 18 TB, Silver Storage 9 TB, Gold Storage 4 TB" }
  },
  "conflicts": [],
  "missingFields": []
}`;

  let rawJson = '';

  try {
    rawJson = await callOpenRouterExtraction(PRIMARY_MODEL, systemPrompt, safeMarkdown);
  } catch (primaryErr) {
    console.warn(`Primary model (${PRIMARY_MODEL}) failed. Trying (${FALLBACK_MODEL}).`, primaryErr);
    try {
      rawJson = await callOpenRouterExtraction(FALLBACK_MODEL, systemPrompt, safeMarkdown);
    } catch (fallbackErr) {
      console.warn('Both LLM models failed. Applying heuristic fallback.', fallbackErr);
      return generateHeuristicExtractionFallback(mergedMarkdown, docNames);
    }
  }

  try {
    const parsed = cleanAndParseJson(rawJson);
    return formatParsedExtraction(parsed, mergedMarkdown, docNames);
  } catch (jsonErr) {
    console.warn('JSON parse warning:', jsonErr, rawJson);
    return generateHeuristicExtractionFallback(mergedMarkdown, docNames);
  }
}

async function callOpenRouterExtraction(model: string, systemPrompt: string, userMarkdown: string): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://fabric-vs-databricks-decision-tool.local',
      'X-Title': 'Fabric vs Databricks AI Extraction',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMarkdown },
      ],
      temperature: 0.1,
      max_tokens: 3500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Extraction Failed [${response.status}]: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
}

function cleanAndParseJson(rawText: string): any {
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(cleaned);
  }
}

function mapWorkloadMix(raw: any): WorkloadMix {
  const str = String(raw || '').toLowerCase();
  if (str.includes('ml') || str.includes('machine') || str.includes('python')) return 'bi_eng_ml';
  if (str.includes('eng') || str.includes('etl') || str.includes('pipeline') || str.includes('spark')) return 'bi_eng';
  return 'bi_only';
}

function mapProcessingPattern(raw: any): ProcessingPattern {
  const str = String(raw || '').toLowerCase();
  if (str.includes('stream') || str.includes('real-time') || str.includes('realtime') || str.includes('near real')) return 'near_realtime';
  if (str.includes('hour') || str.includes('micro')) return 'hourly';
  return 'batch';
}

function mapTeamSkillset(raw: any): TeamSkillset {
  const str = String(raw || '').toLowerCase();
  if (str.includes('spark') || str.includes('python')) return 'python_spark';
  if (str.includes('mixed') || str.includes('both')) return 'mixed';
  return 'sql_powerbi';
}

function formatParsedExtraction(parsed: any, mergedMarkdown: string, docNames: string[]): DocumentExtractionResult {
  const primaryDoc = docNames[0] || 'Uploaded Document';

  const makeField = <T>(fieldData: any, defaultSource: string): ExtractedField<T> => {
    if (!fieldData || fieldData.value === null || fieldData.value === undefined) {
      return {
        value: null,
        confidence: 0,
        sourceDoc: defaultSource,
        pageOrSlide: 'Page 1',
        quote: 'Field not specified in uploaded document.',
        status: 'pending',
      };
    }

    return {
      value: fieldData.value,
      confidence: typeof fieldData.confidence === 'number' ? fieldData.confidence : 90,
      sourceDoc: fieldData.sourceDoc || defaultSource,
      pageOrSlide: fieldData.pageOrSlide || 'Page 1',
      quote: fieldData.quote || 'Extracted from document context',
      status: 'pending',
    };
  };

  const q = parsed.quickAssessment || {};
  const a = parsed.advancedAssessment || {};

  const quickAssessment = {
    dataVolumeGB: makeField<number>(q.dailyDataVolumeGB, primaryDoc),
    concurrentUsers: makeField<number>(q.peakConcurrentUsers, primaryDoc),
    workloadMix: {
      ...makeField<WorkloadMix>(q.workloadMix, primaryDoc),
      value: q.workloadMix?.value ? mapWorkloadMix(q.workloadMix.value) : 'bi_only',
    },
    processingPattern: {
      ...makeField<ProcessingPattern>(q.processingPattern, primaryDoc),
      value: q.processingPattern?.value ? mapProcessingPattern(q.processingPattern.value) : 'batch',
    },
    teamSkillset: {
      ...makeField<TeamSkillset>(q.teamSkillset, primaryDoc),
      value: q.teamSkillset?.value ? mapTeamSkillset(q.teamSkillset.value) : 'sql_powerbi',
    },
  };

  return {
    quickAssessment,
    advancedAssessment: {
      databasesCount: makeField<number>(a.databasesCount, primaryDoc),
      tablesCount: makeField<number>(a.tablesCount, primaryDoc),
      storedProceduresCount: makeField<number>(a.storedProceduresCount, primaryDoc),
      etlPipelinesCount: makeField<number>(a.etlPipelinesCount, primaryDoc),
      dataFactoryPipelinesCount: makeField<number>(a.dataFactoryPipelinesCount, primaryDoc),
      notebooksCount: makeField<number>(a.notebooksCount, primaryDoc),
      excelFilesDaily: makeField<number>(a.excelFilesDaily, primaryDoc),
      csvFilesDaily: makeField<number>(a.csvFilesDaily, primaryDoc),
      jsonFilesDaily: makeField<number>(a.jsonFilesDaily, primaryDoc),
      xmlFilesDaily: makeField<number>(a.xmlFilesDaily, primaryDoc),
      reportsCount: makeField<number>(a.reportsCount, primaryDoc),
      semanticModelsCount: makeField<number>(a.semanticModelsCount, primaryDoc),
      totalStorageGB: makeField<number>(a.totalStorageGB, primaryDoc),
      fabricConnectors: Array.isArray(a.fabricConnectors) ? a.fabricConnectors : undefined,
    },
    conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],
    missingFields: [],
    rawMergedMarkdown: mergedMarkdown,
  };
}

function generateHeuristicExtractionFallback(mergedMarkdown: string, docNames: string[]): DocumentExtractionResult {
  const primaryDoc = docNames[0] || 'Uploaded Document';

  const volMatchTb = mergedMarkdown.match(/(?:daily data volume|daily volume|daily data processed|ingestion|processes|workload)[^\d]*([\d\.]+)\s*tb/i) || mergedMarkdown.match(/([\d\.]+)\s*tb\s*\/\s*day/i);
  const volMatchGb = mergedMarkdown.match(/(?:daily data volume|daily volume|daily data processed|ingestion|processes|workload)[^\d]*([\d\.]+)\s*gb/i) || mergedMarkdown.match(/([\d\.]+)\s*gb\s*\/\s*day/i);

  let volVal: number | null = null;
  let volQuote = 'Field not specified in uploaded document.';
  if (volMatchTb) {
    volVal = Math.round(parseFloat(volMatchTb[1]) * 1000);
    volQuote = volMatchTb[0];
  } else if (volMatchGb) {
    volVal = Math.round(parseFloat(volMatchGb[1]));
    volQuote = volMatchGb[0];
  }

  const userMatch = mergedMarkdown.match(/(?:peak concurrent bi users|peak concurrent users|concurrent users|users)[^\d]*(\d+)/i);
  let userVal: number | null = null;
  let userQuote = 'Field not specified in uploaded document.';
  if (userMatch) {
    userVal = Number(userMatch[1]);
    userQuote = userMatch[0];
  }

  const dbMatch = mergedMarkdown.match(/(\d+)\s*databases?/i) || mergedMarkdown.match(/(?:databases|database)\s*[:\=]?\s*(\d+)/i);
  let dbVal: number | null = null;
  let dbQuote = 'Field not specified in uploaded document.';
  if (dbMatch) {
    dbVal = Number(dbMatch[1]);
    dbQuote = dbMatch[0];
  }

  const tblMatch = mergedMarkdown.match(/([\d,]+)\s*tables/i) || mergedMarkdown.match(/tables\s*[:\=]?\s*([\d,]+)/i);
  let tblVal: number | null = null;
  let tblQuote = 'Field not specified in uploaded document.';
  if (tblMatch) {
    tblVal = Number(tblMatch[1].replace(/,/g, ''));
    tblQuote = tblMatch[0];
  }

  const spMatch = mergedMarkdown.match(/([\d,]+)\s*stored procedures/i) || mergedMarkdown.match(/(?:stored procedures|sps)\s*[:\=]?\s*([\d,]+)/i);
  let spVal: number | null = null;
  let spQuote = 'Field not specified in uploaded document.';
  if (spMatch) {
    spVal = Number(spMatch[1].replace(/,/g, ''));
    spQuote = spMatch[0];
  }

  const etlMatch = mergedMarkdown.match(/(?:etl pipelines|etl jobs|etl)[^\d]*(\d+)/i);
  let etlVal: number | null = null;
  let etlQuote = 'Field not specified in uploaded document.';
  if (etlMatch) {
    etlVal = Number(etlMatch[1]);
    etlQuote = etlMatch[0];
  }

  const adfMatch = mergedMarkdown.match(/(?:data factory pipelines|adf pipelines)[^\d]*(\d+)/i);
  let adfVal: number | null = null;
  let adfQuote = 'Field not specified in uploaded document.';
  if (adfMatch) {
    adfVal = Number(adfMatch[1]);
    adfQuote = adfMatch[0];
  }

  const nbMatch = mergedMarkdown.match(/(?:spark notebooks|python notebooks|notebooks)[^\d]*(\d+)/i);
  let nbVal: number | null = null;
  let nbQuote = 'Field not specified in uploaded document.';
  if (nbMatch) {
    nbVal = Number(nbMatch[1]);
    nbQuote = nbMatch[0];
  }

  const rptMatch = mergedMarkdown.match(/(?:reports)[^\d]*(\d+)/i);
  let rptVal: number | null = null;
  let rptQuote = 'Field not specified in uploaded document.';
  if (rptMatch) {
    rptVal = Number(rptMatch[1]);
    rptQuote = rptMatch[0];
  }

  const smMatch = mergedMarkdown.match(/(?:semantic models)[^\d]*(\d+)/i);
  let smVal: number | null = null;
  let smQuote = 'Field not specified in uploaded document.';
  if (smMatch) {
    smVal = Number(smMatch[1]);
    smQuote = smMatch[0];
  }

  const excelMatch = mergedMarkdown.match(/excel[^\d]*(\d+)/i);
  let excelVal: number | null = null;
  let excelQuote = 'Field not specified in uploaded document.';
  if (excelMatch) {
    excelVal = Number(excelMatch[1]);
    excelQuote = excelMatch[0];
  }

  const csvMatch = mergedMarkdown.match(/csv[^\d]*(\d+)/i);
  let csvVal: number | null = null;
  let csvQuote = 'Field not specified in uploaded document.';
  if (csvMatch) {
    csvVal = Number(csvMatch[1]);
    csvQuote = csvMatch[0];
  }

  const jsonMatch = mergedMarkdown.match(/json[^\d]*(\d+)/i);
  let jsonVal: number | null = null;
  let jsonQuote = 'Field not specified in uploaded document.';
  if (jsonMatch) {
    jsonVal = Number(jsonMatch[1]);
    jsonQuote = jsonMatch[0];
  }

  const xmlMatch = mergedMarkdown.match(/xml[^\d]*(\d+)/i);
  let xmlVal: number | null = null;
  let xmlQuote = 'Field not specified in uploaded document.';
  if (xmlMatch) {
    xmlVal = Number(xmlMatch[1]);
    xmlQuote = xmlMatch[0];
  }

  let totalStorageGB: number | null = null;
  let storageQuote = 'Field not specified in uploaded document.';
  const layerMatches = Array.from(mergedMarkdown.matchAll(/(?:bronze|silver|gold|historical|storage)[^\d]*([\d\.]+)\s*(tb|gb)/gi));
  let sumGB = 0;
  for (const m of layerMatches) {
    const num = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    sumGB += unit === 'tb' ? num * 1000 : num;
  }
  if (sumGB > 0) {
    totalStorageGB = Math.round(sumGB);
    storageQuote = `Calculated total storage metric from document (${totalStorageGB} GB)`;
  }

  const connectorsFound: string[] = [];
  if (/sap/i.test(mergedMarkdown)) connectorsFound.push('sap_ecc', 'sap_bw');
  if (/sql server/i.test(mergedMarkdown)) connectorsFound.push('sql_server');
  if (/oracle/i.test(mergedMarkdown)) connectorsFound.push('oracle');
  if (/salesforce/i.test(mergedMarkdown)) connectorsFound.push('salesforce');
  if (/snowflake/i.test(mergedMarkdown)) connectorsFound.push('snowflake');
  if (/rest api|rest apis|api/i.test(mergedMarkdown)) connectorsFound.push('rest_api');
  if (/sharepoint|excel/i.test(mergedMarkdown)) connectorsFound.push('sharepoint_lists', 'excel_online');
  if (/s3|amazon s3/i.test(mergedMarkdown)) connectorsFound.push('amazon_s3');
  if (/bigquery|google bigquery/i.test(mergedMarkdown)) connectorsFound.push('google_bigquery');
  if (/postgres|postgresql/i.test(mergedMarkdown)) connectorsFound.push('postgresql');

  const hasML = /machine learning|python notebooks|mlflow/i.test(mergedMarkdown);
  const hasEng = /data engineering|etl|spark|pipelines/i.test(mergedMarkdown);
  const mixVal: WorkloadMix = hasML ? 'bi_eng_ml' : hasEng ? 'bi_eng' : 'bi_only';

  const isRealTime = /near real-time|real-time|realtime|streaming/i.test(mergedMarkdown);
  const isHourly = /hourly/i.test(mergedMarkdown);
  const patternVal: ProcessingPattern = isRealTime ? 'near_realtime' : isHourly ? 'hourly' : 'batch';

  const isSpark = /spark|python/i.test(mergedMarkdown);
  const isPBI = /power bi|sql/i.test(mergedMarkdown);
  const skillVal: TeamSkillset = isSpark && isPBI ? 'mixed' : isSpark ? 'python_spark' : 'sql_powerbi';

  return {
    quickAssessment: {
      dataVolumeGB: {
        value: volVal,
        confidence: volVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: volQuote,
        status: 'pending',
      },
      concurrentUsers: {
        value: userVal,
        confidence: userVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: userQuote,
        status: 'pending',
      },
      workloadMix: {
        value: mixVal,
        confidence: 85,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: 'Inferred from document workload context',
        status: 'pending',
      },
      processingPattern: {
        value: patternVal,
        confidence: 85,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: 'Inferred from document execution pattern',
        status: 'pending',
      },
      teamSkillset: {
        value: skillVal,
        confidence: 85,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: 'Inferred from document team skill context',
        status: 'pending',
      },
    },
    advancedAssessment: {
      databasesCount: {
        value: dbVal,
        confidence: dbVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: dbQuote,
        status: 'pending',
      },
      tablesCount: {
        value: tblVal,
        confidence: tblVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: tblQuote,
        status: 'pending',
      },
      storedProceduresCount: {
        value: spVal,
        confidence: spVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: spQuote,
        status: 'pending',
      },
      etlPipelinesCount: {
        value: etlVal,
        confidence: etlVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: etlQuote,
        status: 'pending',
      },
      dataFactoryPipelinesCount: {
        value: adfVal,
        confidence: adfVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: adfQuote,
        status: 'pending',
      },
      notebooksCount: {
        value: nbVal,
        confidence: nbVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: nbQuote,
        status: 'pending',
      },
      excelFilesDaily: {
        value: excelVal,
        confidence: excelVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: excelQuote,
        status: 'pending',
      },
      csvFilesDaily: {
        value: csvVal,
        confidence: csvVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: csvQuote,
        status: 'pending',
      },
      jsonFilesDaily: {
        value: jsonVal,
        confidence: jsonVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: jsonQuote,
        status: 'pending',
      },
      xmlFilesDaily: {
        value: xmlVal,
        confidence: xmlVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: xmlQuote,
        status: 'pending',
      },
      reportsCount: {
        value: rptVal,
        confidence: rptVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: rptQuote,
        status: 'pending',
      },
      semanticModelsCount: {
        value: smVal,
        confidence: smVal !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: smQuote,
        status: 'pending',
      },
      totalStorageGB: {
        value: totalStorageGB,
        confidence: totalStorageGB !== null ? 90 : 0,
        sourceDoc: primaryDoc,
        pageOrSlide: 'Page 1',
        quote: storageQuote,
        status: 'pending',
      },
      fabricConnectors: connectorsFound.length > 0 ? connectorsFound : undefined,
    },
    conflicts: [],
    missingFields: [],
    rawMergedMarkdown: mergedMarkdown,
  };
}
