import React from 'react';
import { useSheosk } from '../context/SheoskContext';
import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '../utils/format';
import { UsageStatus } from '../types/sheosk';
import {
  Layers,
  CheckCircle2,
  MinusCircle,
  AlertTriangle,
  Search,
  X,
  MapPin,
  Clock,
  ArrowUpDown,
  Edit3,
  Plus,
  ChevronRight,
  ListFilter,
  Trash2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    stats,
    sheosks,
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
    setIsRegisterModalOpen
  } = useSheosk();

  const statusOptions: Array<'전체' | UsageStatus> = ['전체', '사용중', '미사용', '점검중'];

  const handleStatCardClick = (statusFilter: '전체' | UsageStatus) => {
    setSelectedStatus(selectedStatus === statusFilter ? '전체' : statusFilter);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Title & Subtitle */}
      <div className="pt-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          SHE오스크 위치 현황
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          실시간 SHE오스크 배치 및 사용현황
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Card */}
        <button
          onClick={() => handleStatCardClick('전체')}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-98 ${
            selectedStatus === '전체'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200/90 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === '전체' ? 'text-slate-300' : 'text-slate-500'}`}>
              전체 SHE오스크
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              selectedStatus === '전체' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black">{stats.total}</span>
            <span className={`text-xs font-semibold ${selectedStatus === '전체' ? 'text-slate-300' : 'text-slate-500'}`}>
              대
            </span>
          </div>
          <span className={`text-[10px] mt-1 block ${selectedStatus === '전체' ? 'text-slate-300' : 'text-slate-400'}`}>
            전체 목록 조회
          </span>
        </button>

        {/* In Use Card (Green) */}
        <button
          onClick={() => handleStatCardClick('사용중')}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-98 ${
            selectedStatus === '사용중'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-600/20'
              : 'bg-emerald-50/70 text-slate-900 border-emerald-200/90 shadow-xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === '사용중' ? 'text-emerald-100' : 'text-emerald-800'}`}>
              사용중
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              selectedStatus === '사용중' ? 'bg-emerald-800 text-white' : 'bg-emerald-500/10 text-emerald-700'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${selectedStatus === '사용중' ? 'text-white' : 'text-emerald-900'}`}>
              {stats.inUse}
            </span>
            <span className={`text-xs font-semibold ${selectedStatus === '사용중' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              대
            </span>
          </div>
          <span className={`text-[10px] font-medium mt-1 block ${selectedStatus === '사용중' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            가동률 {stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0}%
          </span>
        </button>

        {/* Unused Card (Gray) */}
        <button
          onClick={() => handleStatCardClick('미사용')}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-98 ${
            selectedStatus === '미사용'
              ? 'bg-slate-700 text-white border-slate-700 shadow-sm ring-2 ring-slate-600/20'
              : 'bg-slate-50 text-slate-900 border-slate-200/90 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === '미사용' ? 'text-slate-200' : 'text-slate-600'}`}>
              미사용
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              selectedStatus === '미사용' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <MinusCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${selectedStatus === '미사용' ? 'text-white' : 'text-slate-800'}`}>
              {stats.unused}
            </span>
            <span className={`text-xs font-semibold ${selectedStatus === '미사용' ? 'text-slate-200' : 'text-slate-500'}`}>
              대
            </span>
          </div>
          <span className={`text-[10px] mt-1 block ${selectedStatus === '미사용' ? 'text-slate-200' : 'text-slate-400'}`}>
            대기 상태 기기
          </span>
        </button>

        {/* Maintenance Card (Amber/Orange) */}
        <button
          onClick={() => handleStatCardClick('점검중')}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-98 ${
            selectedStatus === '점검중'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-600/20'
              : 'bg-amber-50/70 text-slate-900 border-amber-200/90 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === '점검중' ? 'text-amber-100' : 'text-amber-800'}`}>
              점검중
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              selectedStatus === '점검중' ? 'bg-amber-700 text-white' : 'bg-amber-500/10 text-amber-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${selectedStatus === '점검중' ? 'text-white' : 'text-amber-900'}`}>
              {stats.maintenance}
            </span>
            <span className={`text-xs font-semibold ${selectedStatus === '점검중' ? 'text-amber-100' : 'text-amber-700'}`}>
              대
            </span>
          </div>
          <span className={`text-[10px] font-medium mt-1 block ${selectedStatus === '점검중' ? 'text-amber-100' : 'text-amber-700'}`}>
            점검/보수 대상
          </span>
        </button>
      </div>

      {/* SHE오스크 목록 Header & Search */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-4 h-4 text-orange-600" />
            <h3 className="text-base font-extrabold text-slate-900">SHE오스크 목록</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              {filteredSheosks.length}대
            </span>
          </div>

          <button
            onClick={() =>
              setSortOrder(sortOrder === 'managementNumber' ? 'updatedAt' : 'managementNumber')
            }
            className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-orange-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'managementNumber' ? '관리번호순' : '최근수정순'}</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="관리번호 (SHE-001) 또는 위치 (조립라인) 검색"
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
      </div>

      {/* SHE오스크 카드 목록 (사용여부 및 위치 확인) */}
      {filteredSheosks.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">일치하는 SHE오스크가 없습니다</h4>
            <p className="text-xs text-slate-500 mt-1">
              검색어나 상태 필터 조건을 확인해보세요.
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
              {/* Card Header: 관리번호 & 사용여부 상태 */}
              <div
                onClick={() => setSelectedSheosk(kiosk)}
                className="flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 tracking-tight">
                      {kiosk.managementNumber}
                    </h4>
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

              {/* 현재 위치 */}
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

              {/* Card Footer: 최종 수정일시 및 삭제 / 위치 및 상태 변경 버튼 */}
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

      {/* Floating Action Button for mobile registration */}
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
