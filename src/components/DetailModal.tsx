import React, { useState } from 'react';
import { useSheosk } from '../context/SheoskContext';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatRelativeTime } from '../utils/format';
import { X, MapPin, Clock, User, Edit3, History, ArrowRight, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export const DetailModal: React.FC = () => {
  const { selectedSheosk, setSelectedSheosk, setEditingSheosk, setDeletingSheosk, history } = useSheosk();
  const [showHistoryList, setShowHistoryList] = useState(false);

  if (!selectedSheosk) return null;

  // Filter history records for this specific SHE kiosk
  const kioskHistory = history
    .filter((h) => h.sheoskId === selectedSheosk.id || h.managementNumber === selectedSheosk.managementNumber)
    .sort((a, b) => b.changedAt - a.changedAt);

  const handleOpenEdit = () => {
    const target = selectedSheosk;
    setSelectedSheosk(null);
    setEditingSheosk(target);
  };

  const handleDelete = () => {
    const target = selectedSheosk;
    setSelectedSheosk(null);
    setDeletingSheosk(target);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center font-black text-sm">
              SHE
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                SHE오스크 상세정보
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {selectedSheosk.managementNumber}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedSheosk(null)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status & Location Hero Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">현재 상태</span>
              <StatusBadge status={selectedSheosk.usageStatus} size="lg" />
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500 block mb-1">현재 위치</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span className="text-base font-bold text-slate-900 break-keep leading-snug">
                  {selectedSheosk.location}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" /> 최근 업데이트
              </span>
              <p className="font-semibold text-slate-800">
                {formatDateTime(selectedSheosk.updatedAt)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ({formatRelativeTime(selectedSheosk.updatedAt)})
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5" /> 최종 변경자
              </span>
              <p className="font-semibold text-slate-800 truncate">
                {selectedSheosk.updatedBy || '관리자'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedSheosk.notes ? selectedSheosk.notes : '특이사항 없음'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenEdit}
                className="h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                <span>위치/상태 변경</span>
              </button>

              <button
                onClick={() => setShowHistoryList(!showHistoryList)}
                className="h-12 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>변경이력 ({kioskHistory.length})</span>
                {showHistoryList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleDelete}
              className="w-full h-11 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <Trash2 className="w-4 h-4 stroke-[2.2]" />
              <span>{selectedSheosk.managementNumber} 기기 삭제</span>
            </button>
          </div>

          {/* History Collapsible Section */}
          {showHistoryList && (
            <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-orange-600" />
                이동 및 상태 변경 이력
              </h3>

              {kioskHistory.length === 0 ? (
                <div className="p-4 text-center rounded-lg bg-slate-50 text-xs text-slate-500">
                  기록된 변경 이력이 없습니다.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {kioskHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{formatDateTime(item.changedAt)}</span>
                        <span>{item.changedBy}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <span className="text-slate-500 truncate max-w-[40%]">{item.previousLocation}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="font-bold text-slate-900 truncate max-w-[50%]">{item.newLocation}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                        <span className="text-slate-500">상태:</span>
                        <StatusBadge status={item.newStatus} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
