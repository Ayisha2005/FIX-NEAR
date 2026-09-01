import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, ArrowRight, Wrench, ShieldCheck, CheckCircle } from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function FloatingAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;
    setLoading(true);
    setError('');
    setAiResult(null);

    try {
      const res = await API.post('/ai/diagnose', { problem_description: problem });
      setAiResult(res.data);
    } catch (err) {
      setError("AI Assistant temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCategory = (categoryName) => {
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="gradient-bg text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center space-x-2 border-2 border-purple-400/50 shadow-purple-600/40 group"
          title="Google AI Home Diagnostic Assistant"
        >
          <div className="relative">
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
            </span>
          </div>
          <span className="hidden md:inline text-xs font-extrabold pr-1 tracking-wide">
            Google AI Diagnostics
          </span>
        </button>
      </div>

      {/* Slide-Up Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-[1000] max-w-md w-[calc(100vw-2rem)] bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-5 md:p-6 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4 animate-fade-in text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl gradient-bg p-2 flex items-center justify-center text-white shadow">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Google Gemini AI Assistant
                </span>
                <h4 className="text-sm font-extrabold text-white">Home Issue AI Diagnostics</h4>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleDiagnose} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Describe your issue in English/Tamil/Hindi (e.g. "AC water leaking", "Main breaker trip", "Tap leaking"):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="What needs fixing in your home?..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={loading || !problem.trim()}
                className="px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-extrabold hover:opacity-90 flex items-center justify-center"
              >
                {loading ? 'AI Working...' : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs">
              {error}
            </div>
          )}

          {aiResult && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-900/50 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-purple-400" /> {aiResult.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  Severity: {aiResult.severity}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {aiResult.summary}
              </p>

              <div className="bg-slate-900 p-3 rounded-xl space-y-1">
                <span className="font-bold text-teal-400 block text-[11px]">Recommended Steps:</span>
                {aiResult.action_steps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1 text-slate-300 text-[11px]">
                    <CheckCircle className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Est. Cost: <strong className="text-amber-400 font-extrabold">{aiResult.estimated_cost}</strong></span>
                <button
                  onClick={() => handleSearchCategory(aiResult.category)}
                  className="px-3 py-1.5 rounded-lg gradient-bg text-white font-bold text-xs flex items-center gap-1"
                >
                  Find Pros <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
