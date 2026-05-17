import { useToastStore } from '@/stores/toastStore';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  error: 'border-l-red-500',
  info: 'border-l-cyan-500',
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`bg-[#121212] border border-white/[0.08] border-l-[3px] ${colors[toast.type]} rounded-lg px-4 py-3 max-w-[360px] flex items-start gap-3 shadow-lg animate-in slide-in-from-right-4 fade-in duration-300`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: toast.type === 'success' ? '#00ff88' : toast.type === 'warning' ? '#ffaa00' : toast.type === 'error' ? '#ff4444' : '#00d4ff' }} />
            <p className="text-sm text-[#e1e1e1] flex-1">{toast.message}</p>
            <button onClick={() => remove(toast.id)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-current opacity-30"
                style={{
                  animation: `shrink ${toast.duration}ms linear forwards`,
                  color: toast.type === 'success' ? '#00ff88' : toast.type === 'warning' ? '#ffaa00' : toast.type === 'error' ? '#ff4444' : '#00d4ff',
                }}
              />
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
