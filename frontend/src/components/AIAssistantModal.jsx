import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, X, ArrowRight, Wrench, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import API from '../services/api';

export default function AIAssistantModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      setError("AI diagnostic assistant unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCategory = (categoryName) => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative flex flex-col space-y-5 my-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl gradient-bg p-2.5 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
            </span>
            <h3 className="text-xl font-extrabold text-white">Google AI Home Diagnostic</h3>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleDiagnose} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Describe your home service issue (e.g., "Kitchen sink leaking", "AC not cooling", "Main switch tripping"):
            </label>
            <textarea
              rows="3"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe what's broken or needs maintenance..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-slate-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || !problem.trim()}
            className="w-full py-3 rounded-xl gradient-bg text-white font-extrabold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Google AI Diagnosing...' : 'Get Instant AI Recommendation'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* AI Result Container */}
        {aiResult && (
          <div className="bg-slate-950 p-4 md:p-5 rounded-2xl border border-purple-900/40 space-y-4 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-extrabold text-purple-300 flex items-center gap-1.5 text-sm">
                <Wrench className="w-4 h-4 text-purple-400" /> {aiResult.category}
              </span>
              <span className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase border ${
                aiResult.severity === 'High' ? 'bg-red-950/80 text-red-400 border-red-800/80' :
                aiResult.severity === 'Medium' ? 'bg-amber-950/80 text-amber-400 border-amber-800/80' :
                'bg-teal-950/80 text-teal-400 border-teal-800/80'
              }`}>
                Severity: {aiResult.severity}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed font-medium">
              {aiResult.summary}
            </p>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-teal-400 block text-xs flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Recommended Safety Steps:
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {aiResult.action_steps && aiResult.action_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Estimated Repair Cost</span>
                <span className="text-sm font-extrabold text-amber-400">{aiResult.estimated_cost}</span>
              </div>
              <button
                onClick={() => handleSearchCategory(aiResult.category)}
                className="py-2.5 px-4 rounded-xl gradient-bg text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-90"
              >
                <span>Find {aiResult.category} Pros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
