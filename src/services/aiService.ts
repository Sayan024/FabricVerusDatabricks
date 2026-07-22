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
  return text
    // Remove non-ASCII foreign scripts (Telugu, Hebrew, Arabic, Hindi, etc.)
    .replace(/[\u0C00-\u0C7F\u0590-\u05FF\u0600-\u06FF\u0900-\u097F]/g, '')
    // Normalize special space characters (non-breaking space, thin space, zero-width space)
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u2009]/g, ' ')
    // Replace non-standard hyphens with standard dash
    .replace(/[\u2010-\u2015\u2011]/g, '-')
    // Clean up multiple spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
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
