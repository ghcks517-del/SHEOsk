export type UsageStatus = '사용중' | '미사용' | '점검중';

export interface Sheosk {
  id: string;
  managementNumber: string; // 고유 관리번호 (SHE-001 등, 수정 불가)
  location: string;         // 현재 위치
  usageStatus: UsageStatus; // 사용 여부
  createdAt: number;        // 생성 타임스탬프 (ms)
  updatedAt: number;        // 수정 타임스탬프 (ms)
  updatedBy: string;        // 수정자 (예: 관리자, 홍길동 매니저)
  notes?: string;           // 비고 (옵션)
}

export interface SheoskHistory {
  id: string;
  sheoskId: string;
  managementNumber: string;
  previousLocation: string;
  newLocation: string;
  previousStatus: UsageStatus;
  newStatus: UsageStatus;
  changedAt: number;        // 변경 타임스탬프 (ms)
  changedBy: string;        // 변경자
}

export interface SheoskStats {
  total: number;
  inUse: number;      // 사용중
  unused: number;     // 미사용
  maintenance: number;// 점검중
}

export type TabType = 'home' | 'list' | 'history' | 'admin';

export type SortOrder = 'managementNumber' | 'updatedAt';
