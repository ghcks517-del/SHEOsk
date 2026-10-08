import React, { useState } from 'react';
import { useSheosk } from '../context/SheoskContext';
import { StatusBadge } from './StatusBadge';
import { getActiveFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured, FirebaseAppConfig } from '../firebase/config';
import { sheoskService } from '../firebase/service';
import {
  Settings,
  Plus,
  Trash2,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    sheosks,
    setDeletingSheosk,
    setIsRegisterModalOpen,
    connectionMode,
    projectId,
    reconnectFirebase,
    showToast
  } = useSheosk();

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [config, setConfig] = useState<FirebaseAppConfig>(getActiveFirebaseConfig());
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      saveFirebaseConfig(config);
      reconnectFirebase();
      showToast('Firebase 설정이 저장되었습니다.', 'success');
      setShowConfigForm(false);
    } catch (err) {
      showToast('설정 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleClearConfig = () => {
    clearFirebaseConfig();
    setConfig(getActiveFirebaseConfig());
    reconnectFirebase();
    showToast('Firebase 설정이 초기화되었습니다.', 'info');
  };

  const handleResetToSeed = () => {
    sheoskService.resetToDefaultPlantData();
    showToast('공장 초기 데이터(SHE-001 ~ SHE-008)로 재설정되었습니다.', 'success');
  };

  const handleSeedToFirestore = async () => {
    if (!isFirebaseConfigured()) {
      showToast('먼저 Firebase 설정을 입력하고 연결해주세요.', 'warning');
      setShowConfigForm(true);
      return;
    }
    try {
      setIsSeedingFirestore(true);
      const count = await sheoskService.seedToFirestore();
      showToast(`${count}대의 SHE오스크가 Firestore에 업로드되었습니다.`, 'success');
    } catch (err: any) {
      showToast('Firestore 시딩 실패: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setIsSeedingFirestore(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Title */}
      <div className="pt-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-600" />
          <span>SHE오스크 시스템 관리</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          신규 기기 등록, 삭제 관리 및 Firebase 데이터베이스 동기화 설정
        </p>
      </div>

      {/* Quick Registration Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-orange-200 uppercase tracking-wider block">
            신규 기기 도입
          </span>
          <h3 className="text-base font-extrabold leading-snug">
            새로운 SHE오스크 등록
          </h3>
          <p className="text-xs text-orange-100 mt-0.5">
            현장에 추가 투입된 키오스크 관리번호 및 위치 등록
          </p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="h-11 px-4 rounded-xl bg-white text-orange-700 font-bold text-xs shrink-0 shadow-xs hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>신규 등록</span>
        </button>
      </div>

      {/* Firebase Database Connection Card */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Firebase Firestore 연동 상태
              </h3>
              <p className="text-[11px] text-slate-500">
                {connectionMode === 'firebase'
                  ? `연결 완료 (프로젝트: ${projectId})`
                  : '로컬 실시간 스토리지 모드 동작중'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
              connectionMode === 'firebase'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionMode === 'firebase' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'
              }`}
            />
            {connectionMode === 'firebase' ? 'Firestore 연동' : '로컬 모드'}
          </span>
        </div>

        {/* Details and Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Firebase 설정 {showConfigForm ? '접기' : '입력 / 수정'}</span>
            {showConfigForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetToSeed}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            title="공장 초기 데모 데이터로 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 데이터 복원</span>
          </button>
        </div>

        {/* Collapsible Firebase Config Form */}
        {showConfigForm && (
          <form
            onSubmit={handleSaveConfig}
            className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200"
          >
            <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200/80 text-xs text-orange-900 leading-relaxed">
              <strong>안내:</strong> Firebase 콘솔에서 발급받은 웹앱 설정값을 입력하면 실제 Cloud Firestore와 실시간 양방향 동기화됩니다. 설정 파일은 <code>src/firebase/config.ts</code>에도 분리되어 있습니다.
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Project ID <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="예: my-sheosk-app"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                API Key <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  placeholder="1:12345:web:abc"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Auth Domain (옵션)
                </label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  placeholder="project.firebaseapp.com"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearConfig}
                className="flex-1 h-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                설정 비우기
              </button>
              <button
                type="submit"
                disabled={isSavingConfig}
                className="flex-2 h-10 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Firebase 설정 저장 및 연결</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Kiosk Management & Deletion List (관리 메뉴 안에서만 삭제 노출) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              SHE오스크 기기 삭제 관리
            </h3>
            <p className="text-[11px] text-slate-500">
              * 기기 정보 삭제는 일반 화면에 노출되지 않으며 관리자 전용입니다.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            총 {sheosks.length}대
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
          {sheosks.map((kiosk) => (
            <div
              key={kiosk.id}
              className="py-3 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{kiosk.managementNumber}</span>
                  <StatusBadge status={kiosk.usageStatus} size="sm" />
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  위치: {kiosk.location}
                </p>
              </div>

              {/* Dedicated Red Delete Button */}
              <button
                type="button"
                onClick={() => setDeletingSheosk(kiosk)}
                className="h-9 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 transition-colors active:scale-95 shrink-0"
                title="기기 삭제"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>삭제</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
