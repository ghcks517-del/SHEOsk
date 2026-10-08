import React from 'react';
import { useSheosk } from '../context/SheoskContext';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatRelativeTime } from '../utils/format';
import { UsageStatus, SortOrder } from '../types/sheosk';
import {
  Search,
  X,
  MapPin,
  Clock,
  ArrowUpDown,
  Edit3,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  Filter,
  Trash2
} from 'lucide-react';

export const ListView: React.FC = () => {
  const {
    filteredSheosks,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    sortOrder,
    setSortOrder,
    setSelectedSheosk,
    setEditingSheosk,
    setDeletingSheosk,
    setIsRegisterModalOpen,
    sheosks
  } = useSheosk();

  const statusOptions: Array<'전체' | UsageStatus> = ['전체', '사용중', '미사용', '점검중'];

  return (
    <div className="space-y-3.5 pb-6">
      {/* Search Input Bar */}
      <div className="relative pt-1">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="관리번호 (예: SHE-003) 또는 위치 (조립라인) 검색"
            className="w-full h-12 pl-10 pr-9 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 absolute right-3 top-3 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Row */}
      <div className="flex flex-col gap-2">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {statusOptions.map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all border active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
                {st === '전체' && ` (${sheosks.length})`}
              </button>
            );
          })}
        </div>

        {/* Results Counter and Sort Order Switcher */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span>
            총 <strong className="text-slate-900 font-bold">{filteredSheosks.length}</strong>대 표시
          </span>

          <button
            onClick={() =>
              setSortOrder(sortOrder === 'managementNumber' ? 'updatedAt' : 'managementNumber')
            }
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-orange-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'managementNumber' ? '관리번호순' : '최근수정순'}</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      {filteredSheosks.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">일치하는 SHE오스크가 없습니다</h4>
            <p className="text-xs text-slate-500 mt-1">
              검색어나 상태 필터 조건을 변경해보세요.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('전체');
            }}
            className="h-9 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSheosks.map((kiosk) => (
            <div
              key={kiosk.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3 group"
            >
              {/* Card Header */}
              <div
                onClick={() => setSelectedSheosk(kiosk)}
                className="flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {kiosk.managementNumber}
                    </h3>
                    <StatusBadge status={kiosk.usageStatus} size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    담당자: {kiosk.updatedBy || '관리자'}
                  </span>
                </div>
                <div className="text-slate-400 group-hover:text-orange-600 transition-colors p-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Current Location Section */}
              <div
                onClick={() => setSelectedSheosk(kiosk)}
                className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 cursor-pointer space-y-1"
              >
                <span className="text-[11px] font-semibold text-slate-500 block">
                  현재 위치
                </span>
                <div className="flex items-start gap-1.5 text-slate-900">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold break-keep leading-snug">
                    {kiosk.location}
                  </span>
                </div>
              </div>

              {/* Card Footer: Timestamp, Delete and Modification Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs gap-2">
                <div className="flex items-center gap-1 text-slate-500 truncate min-w-0">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">최종 수정: {formatDateTime(kiosk.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingSheosk(kiosk);
                    }}
                    className="h-10 px-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                    title={`${kiosk.managementNumber} 삭제`}
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>삭제</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingSheosk(kiosk)}
                    className="h-10 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>위치/상태 변경</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) for quick add */}
      <button
        onClick={() => setIsRegisterModalOpen(true)}
        className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:translate-x-32 z-30 w-13 h-13 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/30 flex items-center justify-center transition-all active:scale-95"
        aria-label="SHE오스크 신규 등록"
        title="SHE오스크 신규 등록"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
};
