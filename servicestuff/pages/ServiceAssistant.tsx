import React, { useState, useRef, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Wrench,
  AlertTriangle,
  History,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { diagnoseIssue } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ServiceAssistant: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Mechanic Helper. Describe any vehicle symptom, and I'll help you diagnose the root cause and suggest repair steps.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await diagnoseIssue(input);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "White smoke from exhaust",
    "Engine overheating",
    "Brake squealing sound",
    "Battery not charging"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      <TopBar onMenuClick={onMenuClick} title="AI Diagnostic Tool" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={scrollRef}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${msg.sender === 'user'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-blue-400'
                }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-300'
                }`}>
                {msg.sender === 'ai' && <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-2">
                  <Sparkles size={10} /> AI Diagnosis
                </div>}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-2 opacity-40 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-xs text-slate-500">Analyzing symptoms...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800 p-4 space-y-4">
        {/* Suggestions */}
        {messages.length < 3 && !loading && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); }}
                className="whitespace-nowrap bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-500 hover:text-blue-400 transition-colors">
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask or describe symptoms..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-none max-h-32 transition-colors min-h-[48px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-600">AI provides suggestions only. Perform manual checks for safety.</p>
      </div>
    </div>
  );
};