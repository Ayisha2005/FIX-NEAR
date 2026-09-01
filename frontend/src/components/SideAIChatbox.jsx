import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, ChevronLeft, ChevronRight, User, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SideAIChatbox() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your Google Gemini AI Home Assistant. Describe any problem in your house (e.g. "AC leaking", "MCB switch trip", "water tap leak") and I will diagnose it for you!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await API.post('/ai/diagnose', { problem_description: userText });
      const data = res.data;

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.summary,
        category: data.category,
        severity: data.severity,
        cost: data.estimated_cost,
        steps: data.action_steps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I am having trouble connecting to Google AI right now. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCategory = (cat) => {
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(cat)}`);
  };

  return (
    <>
      {/* Collapsed Side Trigger Button on Right Edge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-1/3 right-0 z-40 bg-gradient-to-l from-purple-600 via-indigo-600 to-teal-500 text-white py-3 px-2.5 rounded-l-2xl shadow-2xl hover:pr-4 transition-all duration-300 flex items-center space-x-2 border-l-2 border-t-2 border-b-2 border-purple-400/60 group"
          title="Open Google AI Side Chatbox"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <Bot className="w-5 h-5 text-teal-200 animate-pulse" />
          <span className="text-xs font-extrabold tracking-wide hidden sm:inline [writing-mode:vertical-lr] rotate-180 py-1">
            Google AI Chat
          </span>
        </button>
      )}

      {/* Slide-out Right Side Chatbox Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-slate-900 border-l border-purple-500/30 z-[1000] shadow-2xl flex flex-col justify-between animate-fade-in text-slate-100">
          
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl gradient-bg p-2 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-extrabold text-white">Google AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <span className="text-[10px] text-teal-400 font-semibold block">Home Diagnostic Side Chatbox</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Scrollable Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white flex-shrink-0 text-xs font-bold mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
                }`}>
                  <p>{msg.text}</p>

                  {/* AI Extra Diagnostic Card Details */}
                  {msg.category && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-teal-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> {msg.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-bold text-[9px] border border-amber-800">
                          {msg.severity}
                        </span>
                      </div>

                      {msg.steps && (
                        <div className="space-y-1 pt-1 border-t border-slate-800/80 text-[10px] text-slate-300">
                          {msg.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                        <span className="text-slate-400">Est: <strong className="text-amber-400">{msg.cost}</strong></span>
                        <button
                          onClick={() => handleSearchCategory(msg.category)}
                          className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold hover:bg-purple-500"
                        >
                          Book {msg.category} →
                        </button>
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-teal-400 bg-slate-900 p-3 rounded-2xl w-fit border border-slate-800 animate-pulse">
                <Bot className="w-4 h-4 text-teal-400" />
                <span>Google AI analyzing issue...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Google AI anything..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl gradient-bg text-white hover:opacity-90 transition-opacity shadow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
