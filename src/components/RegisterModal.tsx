import React, { useState } from 'react';
import { useSheosk } from '../context/SheoskContext';
import { UsageStatus } from '../types/sheosk';
import { COMMON_FACTORY_LOCATIONS } from '../firebase/seedData';
import { X, Check, Loader2, Sparkles, AlertCircle, Hash, MapPin } from 'lucide-react';

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, setIsRegisterModalOpen, addSheosk, sheosks, showToast } = useSheosk();
  const [managementNumber, setManagementNumber] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<UsageStatus>('사용중');
  const [updatedBy, setUpdatedBy] = useState('현장관리자');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isRegisterModalOpen) return null;

  // Auto suggest next management number e.g. SHE-009
  const handleAutoSuggestNumber = () => {
    let maxNum = 0;
    sheosks.forEach(s => {
      const match = s.managementNumber.match(/SHE-(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxNum) maxNum = val;
      }
    });
    const nextNum = String(maxNum + 1).padStart(3, '0');
    setManagementNumber(`SHE-${nextNum}`);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMgmt = managementNumber.trim().toUpperCase();
    const cleanLoc = location.trim();

    if (!cleanMgmt) {
      setErrorMessage('관리번호는 필수 입력 항목입니다.');
      return;
    }
    if (!cleanLoc) {
      setErrorMessage('현재 위치는 필수 입력 항목입니다.');
      return;
    }

    // Duplicate check
    const isDuplicate = sheosks.some(
      s => s.managementNumber.trim().toUpperCase() === cleanMgmt
    );
    if (isDuplicate) {
      setErrorMessage('이미 등록된 관리번호입니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await addSheosk({
        managementNumber: cleanMgmt,
        location: cleanLoc,
        usageStatus: status,
        updatedBy: updatedBy.trim() || '현장관리자',
        notes: notes.trim()
      });
      setIsRegisterModalOpen(false);
      // Reset form
      setManagementNumber('');
      setLocation('');
      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || '등록 중 오류가 발생했습니다.');
      showToast('등록에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-orange-50/50">
          <div>
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
              신규 기기 추가
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              + SHE오스크 신규 등록
            </h2>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Management Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                관리번호 <span className="text-orange-600">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSuggestNumber}
                className="text-[11px] text-orange-600 font-semibold hover:underline"
              >
                다음 번호 자동추천
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={managementNumber}
                onChange={(e) => {
                  setManagementNumber(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="예: SHE-009"
                className="w-full h-12 pl-10 pr-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 tracking-wider uppercase transition-all"
                required
              />
              <Hash className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              * 고유 관리번호는 등록 후 절대 수정할 수 없습니다.
            </p>
          </div>

          {/* Current Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                현재 배치 위치 <span className="text-orange-600">*</span>
              </label>
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
            <div className="mt-2">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-orange-500" /> 추천 공장 위치 선택:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {COMMON_FACTORY_LOCATIONS.slice(0, 6).map((loc) => (
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

          {/* Usage Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              초기 사용 여부 <span className="text-orange-600">*</span>
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

          {/* Registrant & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                등록 담당자
              </label>
              <input
                type="text"
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
                placeholder="예: 안전환경팀"
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                기기 메모 (선택)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 43인치 이동형"
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
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
                  <span>등록 중...</span>
                </>
              ) : (
                <span>등록</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
