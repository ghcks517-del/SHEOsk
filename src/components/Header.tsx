import React from 'react';
import { useSheosk } from '../context/SheoskContext';
import { ShieldAlert, Plus, RefreshCw, Wifi } from 'lucide-react';

export const Header: React.FC = () => {
  const { connectionMode, projectId, setIsRegisterModalOpen, reconnectFirebase, isLoading } = useSheosk();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Factory System Identifier */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs font-black text-sm tracking-wider">
            SHE
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                SHE오스크
              </h1>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                실시간
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{connectionMode === 'firebase' ? `Firestore (${projectId || '연결됨'})` : '실시간 동기화 가동중'}</span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => reconnectFirebase()}
            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="동기화 상태 확인"
            aria-label="동기화 상태 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1 h-9 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>신규등록</span>
          </button>
        </div>
      </div>
    </header>
  );
};
