import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';

interface AICopilotCardProps {
  onOpenCopilot?: () => void;
}

export const AICopilotCard: React.FC<AICopilotCardProps> = ({ onOpenCopilot }) => {
  return (
    <div className="no-print rounded-2xl border-2 border-teal-600/30 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-5 flex flex-wrap items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 border border-teal-300 text-teal-800">
          <Bot className="h-5 w-5 text-teal-700" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">Have specific questions about this recommendation?</h4>
          <p className="text-xs text-slate-600 font-medium">Launch our floating AI Architecture Copilot chatbot for expert platform guidance.</p>
        </div>
      </div>

      {onOpenCopilot && (
        <button
          type="button"
          onClick={onOpenCopilot}
          className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-600 transition cursor-pointer active:scale-95"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Launch AI Chatbot</span>
        </button>
      )}
    </div>
  );
};
