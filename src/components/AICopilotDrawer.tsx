import React, { useState, useEffect, useRef } from 'react';
import { QuickInputs, AdvancedInputs } from '../types/assessment';
import { sendAIChatMessage, ChatMessage, sanitizeAIText } from '../services/aiService';
import { Bot, Sparkles, Send, X, RefreshCw, MessageSquare, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

interface AICopilotDrawerProps {
  quickInputs: QuickInputs;
  advancedInputs: AdvancedInputs;
  extractedDocText?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  quickInputs,
  advancedInputs,
  extractedDocText,
  isOpen,
  onClose,
  onOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    '💡 How can I reduce monthly costs?',
    '🔄 Should I migrate existing SSIS / SPs?',
    '⚡ Can an F32 SKU support this workload?',
    '🌊 Direct Lake vs Import mode trade-offs?',
    '🔥 Can Fabric replace Databricks completely?',
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customPrompt) setInputQuery('');
    setLoading(true);
    setError(null);

    try {
      const res = await sendAIChatMessage(
        quickInputs,
        advancedInputs,
        messages,
        textToSend,
        extractedDocText
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.content,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const renderFormattedText = (rawContent: string) => {
    const sanitized = sanitizeAIText(rawContent);
    const blocks = sanitized.split(/\n\n+/);

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      const lines = trimmed.split(/\n/);

      return (
        <div key={idx} className="space-y-1.5 mb-2">
          {lines.map((line, lineIdx) => {
            const l = line.trim();
            if (!l) return null;

            const isHeaderMatch = l.match(/^(\*\*.*?\*\*|[^:\n]{2,30}:)\s*[-–—]?\s*(.*)/);

            if (isHeaderMatch) {
              const headerRaw = isHeaderMatch[1];
              const bodyContent = isHeaderMatch[2];
              const headerTitle = headerRaw.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/:$/, '').trim();

              return (
                <div key={lineIdx} className="space-y-1 mt-3 first:mt-0">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 border-b border-teal-200/80 pb-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    {headerTitle}
                  </h4>
                  {bodyContent && (
                    <p className="text-xs leading-relaxed text-slate-800 font-medium">
                      {parseInlineBold(bodyContent)}
                    </p>
                  )}
                </div>
              );
            }

            const isList = /^\d+[\.\)]\s*/.test(l) || /^[-•*]\s*/.test(l);
            if (isList) {
              const cleanLine = l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '');
              return (
                <div key={lineIdx} className="flex items-start gap-1.5 text-xs text-slate-800 pl-2 py-0.5 bg-slate-50 rounded-lg border border-slate-200 my-0.5 font-medium">
                  <span className="text-teal-700 font-black text-xs leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{parseInlineBold(cleanLine)}</span>
                </div>
              );
            }

            return (
              <p key={lineIdx} className="text-xs leading-relaxed text-slate-800 font-medium">
                {parseInlineBold(l)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 bg-teal-50 px-1 py-0.5 rounded border border-teal-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right Corner) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-5 py-3 text-xs font-black text-white shadow-2xl hover:scale-105 transition-transform cursor-pointer active:scale-95 border-2 border-white"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
          </div>
          <Bot className="h-4 w-4" />
          <span>Ask AI Architecture Copilot</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
            CHATBOT
          </span>
        </button>
      )}

      {/* Floating Chatbot App Window / Modal */}
      {isOpen && (
        <div className="no-print fixed bottom-4 right-4 z-50 w-full max-w-lg h-[620px] max-h-[calc(100vh-2rem)] flex flex-col rounded-3xl border-2 border-teal-600/30 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  AI Architecture Copilot
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-teal-200/80 font-medium">
                  WebApp System Context & Uploaded Docs Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700/60 hover:text-white transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700/60 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          <div className="bg-teal-50 border-b border-teal-200/80 px-4 py-2 text-[11px] font-bold text-teal-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
              Loaded Context: {quickInputs.region.replace('_', ' ').toUpperCase()} ({quickInputs.dataVolumeGB || 0} GB/day, {quickInputs.concurrentUsers || 0} Users)
            </span>
            {extractedDocText && (
              <span className="bg-teal-200 text-teal-900 px-2 py-0.5 rounded text-[10px] font-black">
                📄 Doc Extracted
              </span>
            )}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="text-center py-8 space-y-3 max-w-sm mx-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 mx-auto">
                  <Sparkles className="h-6 w-6 text-teal-700 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">How can I assist your platform decision?</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    I have full knowledge of Microsoft Fabric F-SKUs, Databricks DBUs, Direct Lake mode, pricing, and your uploaded project specs.
                  </p>
                </div>

                {/* 1-Click Prompt Chips */}
                <div className="space-y-1.5 pt-2 text-left">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Suggested Questions:</div>
                  <div className="flex flex-col gap-1.5">
                    {samplePrompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(p)}
                        className="text-left text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/60 transition shadow-2xs cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white font-semibold rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm space-y-2'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div>{msg.content}</div>
                    ) : (
                      renderFormattedText(msg.content)
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl p-3 text-xs shadow-sm flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-teal-700 animate-spin" />
                  <span className="font-bold text-slate-600">AI is analyzing your architecture...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask any question about Fabric vs Databricks..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md hover:from-teal-600 hover:to-teal-500 active:scale-95 transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
