import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold">Application Notice</h2>
          <p className="text-slate-400 text-sm max-w-md">
            {this.state.error?.message || "Something went wrong while rendering this section."}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" /> Reset State & Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
