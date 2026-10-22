import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('YUM HUB UI Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#160b06] text-[#f7f2eb] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#201009] border border-[#3b1e11] rounded-2xl p-8 space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#2e170c] border border-[#c59b27] flex items-center justify-center mx-auto text-[#c59b27]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-serif font-bold text-white">
              YUM HUB Bakery Storefront
            </h1>
            <p className="text-xs text-[#a99485] leading-relaxed">
              Something encountered a brief hiccup while loading. Click below to refresh your view.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-300 bg-[#160b06] p-2.5 rounded border border-red-900/60 overflow-x-auto text-left max-h-24 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-lg bg-[#c59b27] text-[#160b06] text-xs font-bold hover:bg-[#d4af37] transition-colors cursor-pointer flex items-center gap-2 mx-auto shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Storefront</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
