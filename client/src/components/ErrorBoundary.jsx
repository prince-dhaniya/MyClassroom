import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-blue-500/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-blue-200 bg-blue-950/40 p-2.5 rounded-lg font-mono text-left break-words">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <button
              onClick={() => {
                try {
                  sessionStorage.clear();
                } catch (e) {}
                window.location.href = window.location.origin + window.location.pathname;
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Return to Classroom Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
