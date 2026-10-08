import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Sheosk, SheoskHistory, SheoskStats, TabType, UsageStatus, SortOrder } from '../types/sheosk';
import { sheoskService } from '../firebase/service';
import { getActiveFirebaseConfig, isFirebaseConfigured } from '../firebase/config';

interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface SheoskContextValue {
  sheosks: Sheosk[];
  history: SheoskHistory[];
  stats: SheoskStats;
  filteredSheosks: Sheosk[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatus: '전체' | UsageStatus;
  setSelectedStatus: (status: '전체' | UsageStatus) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Modals & Sheets
  selectedSheosk: Sheosk | null;
  setSelectedSheosk: (s: Sheosk | null) => void;
  editingSheosk: Sheosk | null;
  setEditingSheosk: (s: Sheosk | null) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  deletingSheosk: Sheosk | null;
  setDeletingSheosk: (s: Sheosk | null) => void;

  // Actions
  addSheosk: (params: {
    managementNumber: string;
    location: string;
    usageStatus: UsageStatus;
    updatedBy: string;
    notes?: string;
  }) => Promise<void>;
  updateLocationAndStatus: (
    id: string,
    params: {
      newLocation: string;
      newStatus: UsageStatus;
      updatedBy: string;
      notes?: string;
    }
  ) => Promise<void>;
  deleteSheosk: (id: string) => Promise<void>;

  // Toasts
  toasts: ToastItem[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Status & Connectivity
  isLoading: boolean;
  connectionMode: 'firebase' | 'local';
  projectId?: string;
  reconnectFirebase: () => void;
}

const SheoskContext = createContext<SheoskContextValue | null>(null);

export const SheoskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sheosks, setSheosks] = useState<Sheosk[]>([]);
  const [history, setHistory] = useState<SheoskHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'전체' | UsageStatus>('전체');
  const [sortOrder, setSortOrder] = useState<SortOrder>('managementNumber');
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Modals
  const [selectedSheosk, setSelectedSheosk] = useState<Sheosk | null>(null);
  const [editingSheosk, setEditingSheosk] = useState<Sheosk | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [deletingSheosk, setDeletingSheosk] = useState<Sheosk | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const isFirstLoad = useRef(true);
  const prevSheosksMap = useRef<Map<string, number>>(new Map());

  const [connectionMode, setConnectionMode] = useState<'firebase' | 'local'>(sheoskService.getMode());
  const [projectId, setProjectId] = useState<string | undefined>(sheoskService.getProjectId());

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev.slice(-3), { id, message, type }]); // Keep max 4 visible
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const reconnectFirebase = useCallback(() => {
    sheoskService.init();
    setConnectionMode(sheoskService.getMode());
    setProjectId(sheoskService.getProjectId());
    showToast(
      isFirebaseConfigured(getActiveFirebaseConfig())
        ? 'Firebase Firestore 연결을 시도합니다.'
        : '로컬 실시간 모드로 전환되었습니다.',
      'info'
    );
  }, [showToast]);

  // Subscribe to realtime changes
  useEffect(() => {
    setIsLoading(true);

    const unsubSheosks = sheoskService.subscribeSheosks((newList) => {
      // Check for real-time external change notifications
      if (!isFirstLoad.current) {
        let hasLocationOrStatusChange = false;
        let changedMgmt = '';

        newList.forEach(item => {
          const prevUpdated = prevSheosksMap.current.get(item.id);
          if (prevUpdated && prevUpdated !== item.updatedAt) {
            hasLocationOrStatusChange = true;
            changedMgmt = item.managementNumber;
          }
        });

        if (hasLocationOrStatusChange) {
          showToast(`[실시간 동기화] ${changedMgmt || 'SHE오스크'} 정보가 업데이트되었습니다.`, 'success');
        } else if (newList.length > prevSheosksMap.current.size && prevSheosksMap.current.size > 0) {
          showToast('새로운 SHE오스크가 실시간 등록되었습니다.', 'info');
        }
      }

      // Update ref map
      const newMap = new Map<string, number>();
      newList.forEach(item => newMap.set(item.id, item.updatedAt));
      prevSheosksMap.current = newMap;
      isFirstLoad.current = false;

      setSheosks(newList);
      setIsLoading(false);

      // Keep selected or editing sheosk updated in real time if open
      setSelectedSheosk(prev => (prev ? newList.find(s => s.id === prev.id) || null : null));
      setEditingSheosk(prev => (prev ? newList.find(s => s.id === prev.id) || null : null));
    });

    const unsubHistory = sheoskService.subscribeAllHistory((newHist) => {
      setHistory(newHist);
    });

    return () => {
      unsubSheosks();
      unsubHistory();
    };
  }, [showToast]);

  // Compute stats
  const stats = useMemo<SheoskStats>(() => {
    return {
      total: sheosks.length,
      inUse: sheosks.filter(s => s.usageStatus === '사용중').length,
      unused: sheosks.filter(s => s.usageStatus === '미사용').length,
      maintenance: sheosks.filter(s => s.usageStatus === '점검중').length
    };
  }, [sheosks]);

  // Filter and sort items
  const filteredSheosks = useMemo(() => {
    let result = [...sheosks];

    // Status filter
    if (selectedStatus !== '전체') {
      result = result.filter(s => s.usageStatus === selectedStatus);
    }

    // Search query (managementNumber or location)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        s =>
          s.managementNumber.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortOrder === 'managementNumber') {
        // Natural alphanumeric sort: SHE-001 < SHE-002
        return a.managementNumber.localeCompare(b.managementNumber, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        // Recently modified first
        return b.updatedAt - a.updatedAt;
      }
    });

    return result;
  }, [sheosks, selectedStatus, searchQuery, sortOrder]);

  const handleAddSheosk = async (params: {
    managementNumber: string;
    location: string;
    usageStatus: UsageStatus;
    updatedBy: string;
    notes?: string;
  }) => {
    await sheoskService.addSheosk(params);
    showToast(`${params.managementNumber} SHE오스크가 성공적으로 등록되었습니다.`, 'success');
  };

  const handleUpdateLocationAndStatus = async (
    id: string,
    params: {
      newLocation: string;
      newStatus: UsageStatus;
      updatedBy: string;
      notes?: string;
    }
  ) => {
    await sheoskService.updateLocationAndStatus(id, params);
    showToast('위치 및 사용상태 변경사항이 저장되었습니다.', 'success');
  };

  const handleDeleteSheosk = async (id: string) => {
    const target = sheosks.find(s => s.id === id);
    const mgmt = target ? target.managementNumber : 'SHE오스크';
    await sheoskService.deleteSheosk(id);
    showToast(`${mgmt} 정보가 삭제되었습니다.`, 'info');
  };

  return (
    <SheoskContext.Provider
      value={{
        sheosks,
        history,
        stats,
        filteredSheosks,
        searchQuery,
        setSearchQuery,
        selectedStatus,
        setSelectedStatus,
        sortOrder,
        setSortOrder,
        activeTab,
        setActiveTab,
        selectedSheosk,
        setSelectedSheosk,
        editingSheosk,
        setEditingSheosk,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        deletingSheosk,
        setDeletingSheosk,
        addSheosk: handleAddSheosk,
        updateLocationAndStatus: handleUpdateLocationAndStatus,
        deleteSheosk: handleDeleteSheosk,
        toasts,
        showToast,
        removeToast,
        isLoading,
        connectionMode,
        projectId,
        reconnectFirebase
      }}
    >
      {children}
    </SheoskContext.Provider>
  );
};

export const useSheosk = () => {
  const context = useContext(SheoskContext);
  if (!context) {
    throw new Error('useSheosk must be used within SheoskProvider');
  }
  return context;
};
