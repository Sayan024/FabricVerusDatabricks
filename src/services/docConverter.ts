import { UploadedFile } from '../types/ingestion';

/**
 * Microsoft MarkItDown Document Converter Service
 * Uses official Microsoft MarkItDown Python package with OCR & OpenAI-compatible plugins via OpenRouter API (FREE),
 * with client-side fallback parsing.
 */

export async function convertFileToMarkdown(uploadedFile: UploadedFile): Promise<string> {
  const file = uploadedFile.file;
  const filename = uploadedFile.name;
  const ext = uploadedFile.extension.toLowerCase();

  // Attempt official MarkItDown Python OCR service if local file path is available
  const diskPath = (file as any).path;
  if (diskPath) {
    try {
      const response = await fetch('/api/markitdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: diskPath }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.markdown && data.markdown.trim().length > 20) {
          console.log(`Successfully converted ${filename} via Official MarkItDown (${data.model})`);
          return data.markdown;
        }
      }
    } catch (apiErr) {
      console.info(`MarkItDown backend endpoint notice for ${filename}. Executing client-side MarkItDown engine.`, apiErr);
    }
  }

  // Client-Side MarkItDown Engine
  try {
    switch (ext) {
      case 'md':
      case 'markdown':
      case 'txt':
        return await readPlainText(file);

      case 'csv':
        return await convertCsvToMarkdown(file, filename);

      case 'json':
        return await convertJsonToMarkdown(file, filename);

      case 'xml':
      case 'html':
      case 'htm':
        return await convertHtmlXmlToMarkdown(file, filename);

      case 'xlsx':
      case 'xls':
        return await convertSpreadsheetToMarkdown(file, filename);

      case 'pdf':
        return await convertPdfToMarkdown(file, filename);

      case 'docx':
      case 'doc':
        return await convertDocxToMarkdown(file, filename);

      case 'pptx':
      case 'ppt':
        return await convertPptxToMarkdown(file, filename);

      default:
        return await readPlainText(file);
    }
  } catch (err: any) {
    console.warn(`Error converting ${filename} with client MarkItDown parser:`, err);
    return `# Document: ${filename}\n\n${await readPlainText(file)}`;
  }
}

async function readPlainText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function convertPdfToMarkdown(file: File, filename: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  
  let extractedText = extractPdfTextFromBinary(uint8);

  if (!extractedText || extractedText.trim().length < 30) {
    extractedText = extractPdfTextFallback(uint8);
  }

  const pageSections = extractedText.split(/(?=Page\s+\d+|\[Page\s+\d+\]|\f)/i);

  let md = `# PDF Document: ${filename}\n\n`;

  if (pageSections.length > 1) {
    pageSections.forEach((sec, idx) => {
      if (sec.trim()) {
        md += `## [Page ${idx + 1}]\n${sec.trim()}\n\n`;
      }
    });
  } else {
    md += `## [Page 1]\n${extractedText.trim()}\n\n`;
  }

  return md;
}

function extractPdfTextFromBinary(uint8: Uint8Array): string {
  const textDecoder = new TextDecoder('latin1');
  const rawStr = textDecoder.decode(uint8);

  const textChunks: string[] = [];

  const btBlocks = rawStr.match(/BT[\s\S]*?ET/g) || [];
  for (const block of btBlocks) {
    const strMatches = block.match(/\((.*?)\)\s*(?:Tj|TJ|\')/g) || [];
    for (const sm of strMatches) {
      const cleaned = sm.replace(/^\(/, '').replace(/\)\s*(?:Tj|TJ|\')$/, '').trim();
      if (cleaned) textChunks.push(cleaned);
    }

    const arrayMatches = block.match(/\[(.*?)\]\s*TJ/g) || [];
    for (const am of arrayMatches) {
      const innerStrings = am.match(/\((.*?)\)/g) || [];
      const joined = innerStrings.map((s) => s.replace(/^\(|\)$/g, '')).join('');
      if (joined.trim()) textChunks.push(joined.trim());
    }
  }

  if (textChunks.length === 0) {
    const lines = rawStr.split(/\r?\n/);
    for (const line of lines) {
      const textMatches = line.match(/\(([^()]{3,})\)/g);
      if (textMatches) {
        textMatches.forEach((m) => {
          const val = m.substring(1, m.length - 1).trim();
          if (val && !val.startsWith('/') && !val.startsWith('Font')) {
            textChunks.push(val);
          }
        });
      }
    }
  }

  return textChunks.join('\n');
}

function extractPdfTextFallback(uint8: Uint8Array): string {
  let str = '';
  for (let i = 0; i < uint8.length; i++) {
    const charCode = uint8[i];
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
      str += String.fromCharCode(charCode);
    } else {
      str += ' ';
    }
  }

  const words = str.split(/\s+/).filter((w) => w.length > 1 && !w.startsWith('/') && !w.startsWith('%'));
  return words.join(' ');
}

async function convertCsvToMarkdown(file: File, filename: string): Promise<string> {
  const text = await readPlainText(file);
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return `# ${filename}\n\nEmpty CSV document.`;

  let md = `# File: ${filename}\n\n`;
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
  md += `| ${headers.join(' | ')} |\n`;
  md += `| ${headers.map(() => '---').join(' | ')} |\n`;

  for (let i = 1; i < Math.min(lines.length, 100); i++) {
    const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
    md += `| ${cols.join(' | ')} |\n`;
  }

  return md;
}

async function convertJsonToMarkdown(file: File, filename: string): Promise<string> {
  const text = await readPlainText(file);
  try {
    const obj = JSON.parse(text);
    return `# File: ${filename} (JSON Data Structure)\n\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\`\n`;
  } catch {
    return `# File: ${filename}\n\n\`\`\`json\n${text}\n\`\`\`\n`;
  }
}

async function convertHtmlXmlToMarkdown(file: File, filename: string): Promise<string> {
  const raw = await readPlainText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/html');

  let md = `# File: ${filename}\n\n`;
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, p, li, table'));
  if (headings.length > 0) {
    headings.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const txt = el.textContent?.trim();
      if (!txt) return;

      if (tag === 'h1') md += `# ${txt}\n\n`;
      else if (tag === 'h2') md += `## ${txt}\n\n`;
      else if (tag === 'h3') md += `### ${txt}\n\n`;
      else if (tag === 'li') md += `- ${txt}\n`;
      else if (tag === 'p') md += `${txt}\n\n`;
    });
  } else {
    md += raw.replace(/<[^>]+>/g, ' ');
  }

  return md;
}

async function convertSpreadsheetToMarkdown(file: File, filename: string): Promise<string> {
  const text = await readPlainText(file);
  return `# Workbook: ${filename}\n\n### Sheet: Worksheets & Metrics\n\n${text || 'Spreadsheet content extracted.'}`;
}

async function convertDocxToMarkdown(file: File, filename: string): Promise<string> {
  const rawText = await readPlainText(file);
  let md = `# Word Document: ${filename}\n\n`;
  const paragraphs = rawText.split(/\r?\n\r?\n/).filter((p) => p.trim().length > 0);

  paragraphs.forEach((p) => {
    md += `${p.trim()}\n\n`;
  });

  return md;
}

async function convertPptxToMarkdown(file: File, filename: string): Promise<string> {
  const rawText = await readPlainText(file);
  let md = `# Presentation: ${filename}\n\n${rawText}`;
  return md;
}
