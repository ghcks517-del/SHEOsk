/**
 * Firebase 설정 파일
 * 
 * 실제 Firebase 프로젝트 정보가 있는 경우 아래 firebaseConfig 객체에 입력하거나,
 * 앱 내 [관리 > Firebase 연동 설정] 메뉴에서 브라우저 상으로 즉시 저장할 수 있습니다.
 */

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

// 기본 설정값 (사용자 입력용 템플릿)
export const firebaseConfig: FirebaseAppConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  firestoreDatabaseId: "(default)"
};

// 로컬 스토리지에 저장된 사용자 정의 Firebase 설정이 있는지 확인
const STORAGE_KEY = 'sheosk_firebase_config';

export function getActiveFirebaseConfig(): FirebaseAppConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.projectId === 'string' && parsed.projectId.trim() !== '') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved Firebase config', e);
  }
  return firebaseConfig;
}

export function saveFirebaseConfig(config: FirebaseAppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Firebase config', e);
  }
}

export function clearFirebaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear Firebase config', e);
  }
}

export function isFirebaseConfigured(config: FirebaseAppConfig = getActiveFirebaseConfig()): boolean {
  return Boolean(
    config.apiKey &&
    config.projectId &&
    config.appId &&
    config.projectId.trim() !== '' &&
    config.apiKey.trim() !== ''
  );
}
