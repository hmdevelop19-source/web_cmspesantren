import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
        <Loader2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Memuat Konten</p>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-secondary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
