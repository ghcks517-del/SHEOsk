import React, { useState } from 'react';
import { useSheosk } from '../context/SheoskContext';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { deletingSheosk, setDeletingSheosk, deleteSheosk, showToast } = useSheosk();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deletingSheosk) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteSheosk(deletingSheosk.id);
      setDeletingSheosk(null);
    } catch (err: any) {
      showToast('삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-red-200 p-5 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              SHE오스크 정보 삭제
            </h3>
            <span className="text-xs text-red-600 font-semibold">
              삭제 후 복구할 수 없습니다
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-red-50/60 p-3 rounded-lg border border-red-100">
          <strong className="text-slate-900 font-bold">{deletingSheosk.managementNumber}</strong> SHE오스크 정보를 삭제하시겠습니까?
        </p>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setDeletingSheosk(null)}
            disabled={isDeleting}
            className="flex-1 h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors active:scale-95"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>삭제</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
