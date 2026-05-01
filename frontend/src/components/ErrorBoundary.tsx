import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Terjadi Kesalahan Teknis</h2>
          <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
            Maaf, komponen ini gagal dimuat. Kami telah mencatat masalah ini untuk segera diperbaiki.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <Home className="w-4 h-4" /> Beranda
            </a>
          </div>
          {import.meta.env.MODE === 'development' && (
            <pre className="mt-8 p-4 bg-slate-800 text-slate-200 text-[10px] text-left rounded-lg max-w-full overflow-auto max-h-40 font-mono shadow-inner">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
