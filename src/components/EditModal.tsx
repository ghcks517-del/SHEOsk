import React, { useState, useEffect } from 'react';
import { useSheosk } from '../context/SheoskContext';
import { UsageStatus } from '../types/sheosk';
import { COMMON_FACTORY_LOCATIONS } from '../firebase/seedData';
import { X, MapPin, Check, Loader2, Sparkles, Trash2 } from 'lucide-react';

export const EditModal: React.FC = () => {
  const { editingSheosk, setEditingSheosk, setDeletingSheosk, updateLocationAndStatus, showToast } = useSheosk();
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<UsageStatus>('사용중');
  const [updatedBy, setUpdatedBy] = useState('현장관리자');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingSheosk) {
      setLocation(editingSheosk.location);
      setStatus(editingSheosk.usageStatus);
      setUpdatedBy(editingSheosk.updatedBy || '현장관리자');
      setNotes(editingSheosk.notes || '');
      setErrorMessage('');
    }
  }, [editingSheosk]);

  if (!editingSheosk) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setErrorMessage('위치는 필수 입력 항목입니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await updateLocationAndStatus(editingSheosk.id, {
        newLocation: location.trim(),
        newStatus: status,
        updatedBy: updatedBy.trim() || '현장관리자',
        notes: notes.trim()
      });
      setEditingSheosk(null);
    } catch (err: any) {
      setErrorMessage(err.message || '저장 중 오류가 발생했습니다.');
      showToast('저장에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
              위치 및 상태 변경
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{editingSheosk.managementNumber}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-normal">
                고유번호 수정불가
              </span>
            </h2>
          </div>
          <button
            onClick={() => setEditingSheosk(null)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
              {errorMessage}
            </div>
          )}

          {/* Management Number (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              관리번호 (수정 불가)
            </label>
            <input
              type="text"
              value={editingSheosk.managementNumber}
              disabled
              className="w-full h-11 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-semibold cursor-not-allowed select-none"
            />
          </div>

          {/* Current Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                현재 위치 <span className="text-orange-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400">직접 입력 또는 빠른 선택</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="예: A동 1층 조립라인 입구"
                className="w-full h-12 pl-10 pr-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium transition-all"
                required
              />
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>

            {/* Quick Location Chips */}
            <div className="mt-2.5">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-orange-500" /> 공장 내 주요 배치 구역:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {COMMON_FACTORY_LOCATIONS.map((loc) => (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all text-left active:scale-95 ${
                      location === loc
                        ? 'bg-orange-50 border-orange-400 text-orange-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              사용 여부 <span className="text-orange-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['사용중', '미사용', '점검중'] as UsageStatus[]).map((st) => {
                const isSelected = status === st;
                const colors = {
                  사용중: isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50',
                  미사용: isSelected ? 'bg-slate-700 text-white border-slate-700 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                  점검중: isSelected ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                };

                return (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setStatus(st)}
                    className={`h-11 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${colors[st]}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modifier Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                변경 작업자
              </label>
              <input
                type="text"
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
                placeholder="예: 김반장"
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                특이사항 (선택)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 임시 이동배치"
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setEditingSheosk(null)}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors active:scale-98"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>실시간 저장 중...</span>
                </>
              ) : (
                <span>변경사항 저장</span>
              )}
            </button>
          </div>

          {/* Delete Option */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const target = editingSheosk;
                setEditingSheosk(null);
                setDeletingSheosk(target);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{editingSheosk.managementNumber} 기기 삭제</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
