import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { diagnoseIssue } from '../services/geminiService';

interface ServiceAssistantProps {
  onMenuClick: () => void;
}

export const ServiceAssistant: React.FC<ServiceAssistantProps> = ({ onMenuClick }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDiagnose = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse(null);
    
    const result = await diagnoseIssue(input);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <TopBar onMenuClick={onMenuClick} title="AI Mechanic Helper" />
      
      <div className="flex-1 p-4 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 p-6 rounded-2xl shadow-lg shadow-blue-500/10 mb-6 text-white animate-slide-up">
          <div className="flex items-center mb-2">
            <Sparkles className="mr-2 text-yellow-300" />
            <h2 className="font-bold text-lg font-display">Smart Diagnosis</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Describe the vehicle's problem, sound, or symptom. AI will suggest potential causes.
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 space-y-4 mb-20 overflow-y-auto no-scrollbar">
          {response && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 animate-fade-in transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center font-display">
                <Sparkles size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                Diagnosis Report:
              </h3>
              <div className="prose prose-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors">
           <div className="relative">
             <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Clicking sound when turning steering wheel left'"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-14 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors"
             />
             <button
              onClick={handleDiagnose}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
             >
               {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
             </button>
           </div>
           <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-2">AI can make mistakes. Always verify with manual inspection.</p>
        </div>
      </div>
    </div>
  );
};