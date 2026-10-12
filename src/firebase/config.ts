/**
 * Firebase 설정 파일
 * 
 * Google AI Studio에서 프로비저닝된 프로젝트 설정(firebase-applet-config.json)을 기본 로드하며,
 * 커스텀 설정이 필요한 경우 로컬스토리지 또는 직접 지정할 수 있습니다.
 */

import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

// 프로비저닝된 기본 설정값
export const firebaseConfig: FirebaseAppConfig = {
  apiKey: appletConfig.apiKey || "",
  authDomain: appletConfig.authDomain || "",
  projectId: appletConfig.projectId || "",
  storageBucket: appletConfig.storageBucket || "",
  messagingSenderId: appletConfig.messagingSenderId || "",
  appId: appletConfig.appId || "",
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || "(default)"
};

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
