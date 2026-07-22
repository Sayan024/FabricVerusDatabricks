import { UploadedFile } from '../types/ingestion';

/**
 * Merges multiple converted Markdown documents into a single structured master project context.
 * Standardized Section Hierarchy:
 * # Master Project Context
 * ## Document Registry
 * # 1. Project Overview & Architecture
 * # 2. Data Volumes & Ingestion Patterns
 * # 3. Users & Reporting Footprint
 * # 4. Existing Environment & ETL Pipelines
 * # 5. Machine Learning & Advanced Analytics
 * # 6. Storage & Medallion Layers
 */

export function buildMasterProjectContext(files: UploadedFile[]): string {
  const convertedFiles = files.filter((f) => f.status === 'converted' && f.contentMarkdown);

  if (convertedFiles.length === 0) {
    return '# Master Project Context\n\nNo uploaded document content available.';
  }

  let masterMd = `# Master Project Context & Workload Profile\n\n`;

  // Document Registry
  masterMd += `## Document Registry (${convertedFiles.length} uploaded files)\n`;
  convertedFiles.forEach((f, idx) => {
    masterMd += `- [Doc ${idx + 1}]: **${f.name}** (${f.extension.toUpperCase()} format, ${(f.size / 1024).toFixed(1)} KB)\n`;
  });
  masterMd += `\n---\n\n`;

  // Append converted document markdowns with source boundaries
  convertedFiles.forEach((f, idx) => {
    masterMd += `# Source Document [Doc ${idx + 1}]: ${f.name}\n\n`;
    masterMd += `${f.contentMarkdown}\n\n`;
    masterMd += `---\n\n`;
  });

  return masterMd;
}
