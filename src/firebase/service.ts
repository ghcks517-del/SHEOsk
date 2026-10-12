import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { Sheosk, SheoskHistory, UsageStatus } from '../types/sheosk';
import { getActiveFirebaseConfig, isFirebaseConfigured, FirebaseAppConfig } from './config';
import { INITIAL_SHEOSKS, INITIAL_HISTORY } from './seedData';

const SHEOSK_COLLECTION = 'sheosk';
const HISTORY_COLLECTION = 'history';
const LOCAL_STORAGE_KEY = 'sheosk_local_db_v1';
const HISTORY_STORAGE_KEY = 'sheosk_local_history_v1';

// BroadcastChannel for instant multi-tab realtime sync when running locally/offline
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('sheosk_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

class SheoskDataService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private currentConfig: FirebaseAppConfig | null = null;
  private activeMode: 'firebase' | 'local' = 'local';
  private localListeners: Array<(sheosks: Sheosk[]) => void> = [];
  private historyListeners: Array<(history: SheoskHistory[]) => void> = [];

  constructor() {
    this.init();

    // Listen to multi-tab broadcast updates
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'DATA_UPDATED') {
          this.notifyLocalSubscribers();
        }
      };
    }

    // Listen to storage events across tabs as secondary sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === LOCAL_STORAGE_KEY || e.key === HISTORY_STORAGE_KEY) {
          this.notifyLocalSubscribers();
        }
      });
    }
  }

  public init() {
    const config = getActiveFirebaseConfig();
    this.currentConfig = config;

    if (isFirebaseConfigured(config)) {
      try {
        if (getApps().length === 0) {
          this.app = initializeApp(config);
        } else {
          this.app = getApp();
        }
        this.db = getFirestore(this.app, config.firestoreDatabaseId || '(default)');
        this.activeMode = 'firebase';
        console.log('[SHE오스크] Firebase Firestore initialized successfully for project:', config.projectId);
      } catch (err) {
        console.warn('[SHE오스크] Failed to init Firebase SDK, falling back to local realtime store:', err);
        this.activeMode = 'local';
        this.ensureLocalSeedData();
      }
    } else {
      this.activeMode = 'local';
      this.ensureLocalSeedData();
      console.log('[SHE오스크] Running in local realtime sync mode (Firebase config pending)');
    }
  }

  public getMode(): 'firebase' | 'local' {
    return this.activeMode;
  }

  public getProjectId(): string | undefined {
    return this.currentConfig?.projectId || undefined;
  }

  // --- LOCAL PERSISTENCE HELPERS ---
  private ensureLocalSeedData() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SHEOSKS));
      }
      const historyStored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!historyStored) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      }
    } catch (e) {
      console.error('Error seeding local storage', e);
    }
  }

  private getLocalSheosks(): Sheosk[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_SHEOSKS;
    } catch {
      return INITIAL_SHEOSKS;
    }
  }

  private saveLocalSheosks(items: Sheosk[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    this.broadcastUpdate();
  }

  private getLocalHistory(): SheoskHistory[] {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  }

  private saveLocalHistory(items: SheoskHistory[]) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    this.broadcastUpdate();
  }

  private broadcastUpdate() {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
    }
    this.notifyLocalSubscribers();
  }

  private notifyLocalSubscribers() {
    const sheosks = this.getLocalSheosks();
    const history = this.getLocalHistory();
    this.localListeners.forEach(listener => listener(sheosks));
    this.historyListeners.forEach(listener => listener(history));
  }

  // --- REAL-TIME SUBSCRIBERS ---

  /**
   * Subscribe to all SHE kiosks in real-time
   */
  public subscribeSheosks(callback: (sheosks: Sheosk[]) => void): () => void {
    if (this.activeMode === 'firebase' && this.db) {
      try {
        const q = query(collection(this.db, SHEOSK_COLLECTION), orderBy('managementNumber', 'asc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (snapshot.empty) {
              console.log('[Firestore] Fresh database detected, seeding initial kiosks...');
              this.seedToFirestore().catch(e => console.warn('Auto seed error:', e));
              return;
            }
            const list: Sheosk[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                managementNumber: data.managementNumber || docSnap.id,
                location: data.location || '',
                usageStatus: (data.usageStatus as UsageStatus) || '미사용',
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
                updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || Date.now()),
                updatedBy: data.updatedBy || '관리자',
                notes: data.notes || ''
              });
            });
            callback(list);
          },
          (error) => {
            console.error('[Firestore onSnapshot error]', error);
            // Fall back to local storage if permission or quota fails
            callback(this.getLocalSheosks());
          }
        );
        return unsubscribe;
      } catch (err) {
        console.error('Firestore subscribe failed', err);
      }
    }

    // Local mode listener
    this.localListeners.push(callback);
    callback(this.getLocalSheosks());
    return () => {
      this.localListeners = this.localListeners.filter(l => l !== callback);
    };
  }

  /**
   * Subscribe to history movement events
   */
  public subscribeAllHistory(callback: (history: SheoskHistory[]) => void): () => void {
    if (this.activeMode === 'firebase' && this.db) {
      // In Firestore, we can listen to global history or construct collectionGroup
      // For simplicity and instant responsiveness, we maintain top-level or subcollection sync
      // If collection 'sheosk_history' exists, subscribe to it
      try {
        const q = query(collection(this.db, 'sheosk_history'), orderBy('changedAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list: SheoskHistory[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                sheoskId: data.sheoskId || '',
                managementNumber: data.managementNumber || '',
                previousLocation: data.previousLocation || '',
                newLocation: data.newLocation || '',
                previousStatus: (data.previousStatus as UsageStatus) || '미사용',
                newStatus: (data.newStatus as UsageStatus) || '미사용',
                changedAt: data.changedAt?.toMillis ? data.changedAt.toMillis() : (data.changedAt || Date.now()),
                changedBy: data.changedBy || '관리자'
              });
            });
            callback(list);
          },
          () => {
            callback(this.getLocalHistory());
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn('Firestore history subscription error, using local fallback', err);
      }
    }

    this.historyListeners.push(callback);
    callback(this.getLocalHistory());
    return () => {
      this.historyListeners = this.historyListeners.filter(l => l !== callback);
    };
  }

  // --- MUTATION OPERATIONS ---

  /**
   * Register a new SHE kiosk
   */
  public async addSheosk(params: {
    managementNumber: string;
    location: string;
    usageStatus: UsageStatus;
    updatedBy: string;
    notes?: string;
  }): Promise<Sheosk> {
    const trimmedMgmt = params.managementNumber.trim().toUpperCase();
    const trimmedLoc = params.location.trim();

    if (!trimmedMgmt) throw new Error('관리번호를 입력해주세요.');
    if (!trimmedLoc) throw new Error('현재 위치를 입력해주세요.');

    // Check duplicate
    const currentList = this.activeMode === 'firebase' && this.db
      ? await this.getSheosksListDirect()
      : this.getLocalSheosks();

    const isDuplicate = currentList.some(
      s => s.managementNumber.trim().toUpperCase() === trimmedMgmt
    );
    if (isDuplicate) {
      throw new Error(`이미 등록된 관리번호입니다: ${trimmedMgmt}`);
    }

    const docId = `sheosk-${trimmedMgmt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const now = Date.now();

    const newRecord: Sheosk = {
      id: docId,
      managementNumber: trimmedMgmt,
      location: trimmedLoc,
      usageStatus: params.usageStatus,
      createdAt: now,
      updatedAt: now,
      updatedBy: params.updatedBy.trim() || '관리자',
      notes: params.notes?.trim() || ''
    };

    if (this.activeMode === 'firebase' && this.db) {
      try {
        const docRef = doc(this.db, SHEOSK_COLLECTION, docId);
        await setDoc(docRef, {
          ...newRecord,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Add initial history
        const histDocId = `hist-${Date.now()}`;
        const histRef = doc(this.db, 'sheosk_history', histDocId);
        await setDoc(histRef, {
          id: histDocId,
          sheoskId: docId,
          managementNumber: trimmedMgmt,
          previousLocation: '신규 등록',
          newLocation: trimmedLoc,
          previousStatus: params.usageStatus,
          newStatus: params.usageStatus,
          changedAt: serverTimestamp(),
          changedBy: newRecord.updatedBy
        });
      } catch (err) {
        console.error('Firebase setDoc failed, saving locally', err);
        this.saveLocalSheoskDirect(newRecord);
      }
    } else {
      this.saveLocalSheoskDirect(newRecord);
    }

    return newRecord;
  }

  private saveLocalSheoskDirect(newRecord: Sheosk) {
    const current = this.getLocalSheosks();
    const updated = [...current, newRecord];
    this.saveLocalSheosks(updated);

    // Add history
    const historyList = this.getLocalHistory();
    const newHist: SheoskHistory = {
      id: `hist-${Date.now()}`,
      sheoskId: newRecord.id,
      managementNumber: newRecord.managementNumber,
      previousLocation: '신규 등록',
      newLocation: newRecord.location,
      previousStatus: newRecord.usageStatus,
      newStatus: newRecord.usageStatus,
      changedAt: Date.now(),
      changedBy: newRecord.updatedBy
    };
    this.saveLocalHistory([newHist, ...historyList]);
  }

  /**
   * Update location and/or usage status
   */
  public async updateLocationAndStatus(
    sheoskId: string,
    params: {
      newLocation: string;
      newStatus: UsageStatus;
      updatedBy: string;
      notes?: string;
    }
  ): Promise<void> {
    const trimmedLoc = params.newLocation.trim();
    if (!trimmedLoc) {
      throw new Error('위치는 필수 입력 항목입니다.');
    }

    // Find previous item
    let target: Sheosk | undefined;
    if (this.activeMode === 'firebase' && this.db) {
      const all = await this.getSheosksListDirect();
      target = all.find(s => s.id === sheoskId);
    } else {
      target = this.getLocalSheosks().find(s => s.id === sheoskId);
    }

    if (!target) {
      throw new Error('수정할 SHE오스크를 찾을 수 없습니다.');
    }

    const prevLocation = target.location;
    const prevStatus = target.usageStatus;
    const now = Date.now();
    const updater = params.updatedBy.trim() || '현장관리자';

    // Create history entry
    const histEntry: SheoskHistory = {
      id: `hist-${Date.now()}`,
      sheoskId: target.id,
      managementNumber: target.managementNumber,
      previousLocation: prevLocation,
      newLocation: trimmedLoc,
      previousStatus: prevStatus,
      newStatus: params.newStatus,
      changedAt: now,
      changedBy: updater
    };

    if (this.activeMode === 'firebase' && this.db) {
      try {
        const docRef = doc(this.db, SHEOSK_COLLECTION, sheoskId);
        await updateDoc(docRef, {
          location: trimmedLoc,
          usageStatus: params.newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: updater,
          ...(params.notes !== undefined ? { notes: params.notes.trim() } : {})
        });

        // Also add to subcollection and top-level history
        const subHistoryRef = doc(collection(this.db, SHEOSK_COLLECTION, sheoskId, HISTORY_COLLECTION), histEntry.id);
        const topHistoryRef = doc(this.db, 'sheosk_history', histEntry.id);

        await setDoc(subHistoryRef, {
          ...histEntry,
          changedAt: serverTimestamp()
        });
        await setDoc(topHistoryRef, {
          ...histEntry,
          changedAt: serverTimestamp()
        });
        return;
      } catch (err) {
        console.error('Firebase updateDoc failed, falling back to local', err);
      }
    }

    // Local mode update
    const current = this.getLocalSheosks();
    const updated = current.map(item => {
      if (item.id === sheoskId) {
        return {
          ...item,
          location: trimmedLoc,
          usageStatus: params.newStatus,
          updatedAt: now,
          updatedBy: updater,
          notes: params.notes !== undefined ? params.notes.trim() : item.notes
        };
      }
      return item;
    });
    this.saveLocalSheosks(updated);

    const historyList = this.getLocalHistory();
    this.saveLocalHistory([histEntry, ...historyList]);
  }

  /**
   * Delete a SHE kiosk (Admin menu only)
   */
  public async deleteSheosk(sheoskId: string): Promise<void> {
    if (this.activeMode === 'firebase' && this.db) {
      try {
        const docRef = doc(this.db, SHEOSK_COLLECTION, sheoskId);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        console.error('Firebase deleteDoc failed', err);
      }
    }

    const current = this.getLocalSheosks();
    const updated = current.filter(s => s.id !== sheoskId);
    this.saveLocalSheosks(updated);
  }

  /**
   * Seed factory initial data to Firestore (Utility for admin setup)
   */
  public async seedToFirestore(): Promise<number> {
    if (!this.db) throw new Error('Firebase가 연결되어 있지 않습니다.');
    const batch = writeBatch(this.db);
    let count = 0;

    for (const item of INITIAL_SHEOSKS) {
      const docRef = doc(this.db, SHEOSK_COLLECTION, item.id);
      batch.set(docRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      count++;
    }

    for (const h of INITIAL_HISTORY) {
      const histRef = doc(this.db, 'sheosk_history', h.id);
      batch.set(histRef, {
        ...h,
        changedAt: serverTimestamp()
      });
    }

    await batch.commit();
    return count;
  }

  /**
   * Reset local storage back to standard plant initial demo data
   */
  public resetToDefaultPlantData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SHEOSKS));
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
    this.broadcastUpdate();
  }

  private async getSheosksListDirect(): Promise<Sheosk[]> {
    if (!this.db) return this.getLocalSheosks();
    try {
      const snap = await getDocs(collection(this.db, SHEOSK_COLLECTION));
      const list: Sheosk[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          managementNumber: data.managementNumber || docSnap.id,
          location: data.location || '',
          usageStatus: (data.usageStatus as UsageStatus) || '미사용',
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || Date.now()),
          updatedBy: data.updatedBy || '관리자'
        });
      });
      return list;
    } catch {
      return this.getLocalSheosks();
    }
  }
}

export const sheoskService = new SheoskDataService();
