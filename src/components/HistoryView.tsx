import React, { useState } from 'react';
import { useSheosk } from '../context/SheoskContext';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatRelativeTime } from '../utils/format';
import { History, ArrowRight, Filter, Clock, MapPin, User, ChevronDown } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, sheosks, setSelectedSheosk } = useSheosk();
  const [selectedKioskId, setSelectedKioskId] = useState<string>('all');

  const filteredHistory = history
    .filter((h) => selectedKioskId === 'all' || h.sheoskId === selectedKioskId || h.managementNumber === selectedKioskId)
    .sort((a, b) => b.changedAt - a.changedAt);

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div className="pt-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-orange-600" />
          <span>공장 내 SHE오스크 이동 이력</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          배치 위치 및 가동 상태의 전체 실시간 변경 기록
        </p>
      </div>

      {/* Filter by Kiosk */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 shrink-0">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>기기별 필터:</span>
        </div>
        <select
          value={selectedKioskId}
          onChange={(e) => setSelectedKioskId(e.target.value)}
          className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-orange-500 min-w-36"
        >
          <option value="all">전체 기기 ({history.length}건)</option>
          {sheosks.map((k) => (
            <option key={k.id} value={k.id}>
              {k.managementNumber}
            </option>
          ))}
        </select>
      </div>

      {/* History Timeline */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 text-xs text-slate-500 space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p>등록된 변경 이력이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5 relative hover:border-slate-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const target = sheosks.find((s) => s.id === item.sheoskId);
                    if (target) setSelectedSheosk(target);
                  }}
                  className="text-sm font-black text-slate-900 tracking-tight hover:text-orange-600 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>{item.managementNumber}</span>
                </button>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700 block">
                    {formatDateTime(item.changedAt)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({formatRelativeTime(item.changedAt)})
                  </span>
                </div>
              </div>

              {/* Movement Transition Display */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">이전 위치</span>
                  <p className="font-medium text-slate-600 truncate">{item.previousLocation}</p>
                </div>

                <div className="shrink-0 px-1 text-orange-500">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <span className="text-[10px] text-orange-600 font-semibold block mb-0.5">이동 위치</span>
                  <p className="font-bold text-slate-900 truncate">{item.newLocation}</p>
                </div>
              </div>

              {/* Status and Modifier */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">상태:</span>
                  <StatusBadge status={item.newStatus} size="sm" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <User className="w-3 h-3" />
                  <span>작업자: {item.changedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
