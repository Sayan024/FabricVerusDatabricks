import { QuickInputs, AdvancedInputs } from '../types/assessment';
import { buildWebappSystemPromptMarkdown } from './aiWebappContext';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const PRIMARY_MODEL = 'openai/gpt-oss-20b:free';
export const FALLBACK_MODEL = 'google/gemma-4-26b-a4b-it:free';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  modelUsed: string;
  isFallback: boolean;
}

export function sanitizeAIText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove prefix artifacts like 'chat reponse">' or 'chat response:'
  cleaned = cleaned.replace(/^(?:chat response|chat reponse|assistant response|response)[\s"'>:]*/i, '');

  // 2. Remove markdown blockquote characters '>' at start of lines
  cleaned = cleaned.replace(/^[ \t]*>[ \t]*/gm, '');

  // 3. Remove non-Latin foreign scripts (Korean, Chinese, Japanese, Cyrillic, Indic, Arabic, Hebrew, Thai, etc.)
  cleaned = cleaned.replace(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF\u0600-\u06FF\u0750-\u077F\u0900-\u097F\u0980-\u09FF\u0B80-\u0CFF\u0590-\u05FF\u0E00-\u0E7F]/g, '');

  // 4. Clean up orphaned bullet characters followed by a newline (e.g., "•\n*Item" -> "* Item")
  cleaned = cleaned.replace(/[•·]\s*\n+\s*([*\-])/g, '$1 ');
  cleaned = cleaned.replace(/[•·]\s*\n+\s*/g, '- ');

  // 5. Remove backslash escaping from dollar signs, hashes, and markdown formatting
  cleaned = cleaned.replace(/\\([$#*_`\-\+\(\)])/g, '$1');

  // 6. Clean up garbled non-numeric currency tokens like "$arefa" -> ""
  cleaned = cleaned.replace(/\$\s*[a-zA-Z]{3,}\b/g, '');

  // 7. Clean up broken markdown table divider rows (e.g. "|- - |- - - - |" -> "|---|---|")
  cleaned = cleaned.replace(/^\|[ \t\-\|]+\|$/gm, (match) => {
    const cols = match.split('|').length - 2;
    return '|' + Array(Math.max(1, cols)).fill('---').join('|') + '|';
  });

  // 8. Fix broken bold markdown formatting where newlines are trapped inside ** (e.g. "**Header\n**" -> "**Header**\n")
  cleaned = cleaned.replace(/\*\*([^\*\n]+)\n+\*\*/g, '**$1**\n');
  cleaned = cleaned.replace(/\*([^\*\n]+)\*\*/g, '**$1**');

  // 9. Normalize whitespace & zero-width spaces
  cleaned = cleaned
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u2009]/g, ' ')
    .replace(/[\u2010-\u2015\u2011]/g, '-')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

export async function sendAIChatMessage(
  quick: QuickInputs,
  advanced: AdvancedInputs,
  messages: ChatMessage[],
  userPrompt: string,
  extractedDocText?: string
): Promise<AIResponse> {
  // Prune history to last 8 messages (4 turns) for token budget safety
  const prunedHistory = messages.slice(-8);

  const systemPrompt = buildWebappSystemPromptMarkdown(quick, advanced, extractedDocText, 18000);

  const formattedMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...prunedHistory,
    { role: 'user', content: userPrompt },
  ];

  // Attempt Primary Model
  try {
    const res = await callOpenRouter(PRIMARY_MODEL, formattedMessages);
    return {
      content: sanitizeAIText(res.text),
      modelUsed: PRIMARY_MODEL,
      isFallback: false,
    };
  } catch (primaryErr: any) {
    console.warn(`Primary AI model (${PRIMARY_MODEL}) failed:`, primaryErr?.message || primaryErr);

    // If context length limit error occurred, attempt compressed system prompt retry
    const isContextError = String(primaryErr?.message || '').includes('400') || String(primaryErr?.message || '').toLowerCase().includes('context length');

    if (isContextError) {
      console.info('Context window size exceeded. Executing compressed prompt auto-retry...');
      try {
        const compressedPrompt = buildWebappSystemPromptMarkdown(quick, advanced, extractedDocText, 5000);
        const compressedMessages: ChatMessage[] = [
          { role: 'system', content: compressedPrompt },
          ...messages.slice(-2),
          { role: 'user', content: userPrompt },
        ];
        const res = await callOpenRouter(PRIMARY_MODEL, compressedMessages);
        return {
          content: sanitizeAIText(res.text),
          modelUsed: `${PRIMARY_MODEL} (compressed)`,
          isFallback: false,
        };
      } catch (compressedErr) {
        console.warn('Compressed prompt retry failed:', compressedErr);
      }
    }

    // Fallback Model
    try {
      const res = await callOpenRouter(FALLBACK_MODEL, formattedMessages);
      return {
        content: sanitizeAIText(res.text),
        modelUsed: FALLBACK_MODEL,
        isFallback: true,
      };
    } catch (fallbackErr: any) {
      console.error(`Both AI models failed:`, fallbackErr);

      if (isContextError || String(fallbackErr?.message || '').includes('400')) {
        throw new Error('The uploaded document is too large for the AI context limit. The tool has automatically loaded your extracted fields into the assessment model.');
      }

      throw new Error('AI Copilot service is currently unavailable. Please check internet connection or API key status.');
    }
  }
}

async function callOpenRouter(model: string, messages: ChatMessage[]): Promise<{ text: string }> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://fabric-vs-databricks-decision-tool.local',
      'X-Title': 'Fabric vs Databricks Architecture Decision Tool',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.6,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API call failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content || choice?.text || '';

  if (!text) {
    throw new Error('Empty response from AI model.');
  }

  return { text };
}
