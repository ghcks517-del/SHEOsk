import React from 'react';
import { useSheosk } from '../context/SheoskContext';
import { CheckCircle2, AlertTriangle, Info, X, Radio } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSheosk();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50 pointer-events-none flex flex-col gap-2">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
            case 'error':
              return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
            default:
              return <Radio className="w-4 h-4 text-orange-600 shrink-0 animate-pulse" />;
          }
        };

        const getBorder = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 bg-white text-emerald-950';
            case 'warning':
              return 'border-amber-200 bg-white text-amber-950';
            case 'error':
              return 'border-red-200 bg-white text-red-950';
            default:
              return 'border-orange-200 bg-white text-slate-900';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${getBorder()}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon()}
              <span className="text-xs sm:text-sm font-medium leading-snug break-keep">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -mr-1 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
