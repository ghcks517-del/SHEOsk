import { Sheosk, SheoskHistory } from '../types/sheosk';

const now = Date.now();
const oneHour = 60 * 60 * 1000;
const oneDay = 24 * oneHour;

export const INITIAL_SHEOSKS: Sheosk[] = [
  {
    id: 'sheosk-001',
    managementNumber: 'SHE-001',
    location: 'A동 1층 조립라인 입구',
    usageStatus: '사용중',
    createdAt: now - 30 * oneDay,
    updatedAt: now - 15 * 60 * 1000, // 15분 전
    updatedBy: '김반장 (생산1팀)',
    notes: '조립 메인 라인 실시간 작업표준서 송출 중'
  },
  {
    id: 'sheosk-002',
    managementNumber: 'SHE-002',
    location: 'B동 2층 휴게실 앞',
    usageStatus: '미사용',
    createdAt: now - 28 * oneDay,
    updatedAt: now - 2 * oneHour,
    updatedBy: '박관리 (안전환경팀)',
    notes: '오후 안전교육 전 대기 상태'
  },
  {
    id: 'sheosk-003',
    managementNumber: 'SHE-003',
    location: '출하장 입구',
    usageStatus: '사용중',
    createdAt: now - 25 * oneDay,
    updatedAt: now - 45 * 60 * 1000,
    updatedBy: '이물류 (출하관리팀)',
    notes: '차량 상하차 안전수칙 표출'
  },
  {
    id: 'sheosk-004',
    managementNumber: 'SHE-004',
    location: '고객검수장',
    usageStatus: '점검중',
    createdAt: now - 20 * oneDay,
    updatedAt: now - 3 * oneHour,
    updatedBy: '최정비 (설비보전팀)',
    notes: '터치스크린 센서 캘리브레이션 진행 중'
  },
  {
    id: 'sheosk-005',
    managementNumber: 'SHE-005',
    location: '공장동 중앙통로',
    usageStatus: '사용중',
    createdAt: now - 18 * oneDay,
    updatedAt: now - 5 * 60 * 1000, // 5분 전
    updatedBy: '현장관리자',
    notes: '보행자 통행 안전안내 가동'
  },
  {
    id: 'sheosk-006',
    managementNumber: 'SHE-006',
    location: 'C동 1층 자재창고 입구',
    usageStatus: '미사용',
    createdAt: now - 15 * oneDay,
    updatedAt: now - 5 * oneHour,
    updatedBy: '정자재 (자재관리팀)',
    notes: '재고조사 기간 이동 배치 대기'
  },
  {
    id: 'sheosk-007',
    managementNumber: 'SHE-007',
    location: '도장공정 라인 입구',
    usageStatus: '사용중',
    createdAt: now - 10 * oneDay,
    updatedAt: now - 30 * 60 * 1000,
    updatedBy: '강도장 (표면처리팀)',
    notes: '국소배기장치 가동 알림 및 보호구 착용 안내'
  },
  {
    id: 'sheosk-008',
    managementNumber: 'SHE-008',
    location: '안전체험교육관 앞',
    usageStatus: '사용중',
    createdAt: now - 7 * oneDay,
    updatedAt: now - 1 * oneHour,
    updatedBy: '박관리 (안전환경팀)',
    notes: '신규 입사자 SHE 오리엔테이션 송출'
  }
];

export const INITIAL_HISTORY: SheoskHistory[] = [
  {
    id: 'hist-001',
    sheoskId: 'sheosk-005',
    managementNumber: 'SHE-005',
    previousLocation: 'A동 1층 조립라인',
    newLocation: '공장동 중앙통로',
    previousStatus: '사용중',
    newStatus: '사용중',
    changedAt: now - 5 * 60 * 1000,
    changedBy: '현장관리자'
  },
  {
    id: 'hist-002',
    sheoskId: 'sheosk-001',
    managementNumber: 'SHE-001',
    previousLocation: 'A동 가공라인 2번 부스',
    newLocation: 'A동 1층 조립라인 입구',
    previousStatus: '점검중',
    newStatus: '사용중',
    changedAt: now - 15 * 60 * 1000,
    changedBy: '김반장 (생산1팀)'
  },
  {
    id: 'hist-003',
    sheoskId: 'sheosk-007',
    managementNumber: 'SHE-007',
    previousLocation: '도장공정 예비 대기구역',
    newLocation: '도장공정 라인 입구',
    previousStatus: '미사용',
    newStatus: '사용중',
    changedAt: now - 30 * 60 * 1000,
    changedBy: '강도장 (표면처리팀)'
  },
  {
    id: 'hist-004',
    sheoskId: 'sheosk-003',
    managementNumber: 'SHE-003',
    previousLocation: '물류보관창고 3게이트',
    newLocation: '출하장 입구',
    previousStatus: '사용중',
    newStatus: '사용중',
    changedAt: now - 45 * 60 * 1000,
    changedBy: '이물류 (출하관리팀)'
  },
  {
    id: 'hist-005',
    sheoskId: 'sheosk-008',
    managementNumber: 'SHE-008',
    previousLocation: '본관 1층 로비',
    newLocation: '안전체험교육관 앞',
    previousStatus: '미사용',
    newStatus: '사용중',
    changedAt: now - 1 * oneHour,
    changedBy: '박관리 (안전환경팀)'
  },
  {
    id: 'hist-006',
    sheoskId: 'sheosk-002',
    managementNumber: 'SHE-002',
    previousLocation: 'B동 1층 정문 안내데스크',
    newLocation: 'B동 2층 휴게실 앞',
    previousStatus: '사용중',
    newStatus: '미사용',
    changedAt: now - 2 * oneHour,
    changedBy: '박관리 (안전환경팀)'
  },
  {
    id: 'hist-007',
    sheoskId: 'sheosk-004',
    managementNumber: 'SHE-004',
    previousLocation: '완성차 검사라인',
    newLocation: '고객검수장',
    previousStatus: '사용중',
    newStatus: '점검중',
    changedAt: now - 3 * oneHour,
    changedBy: '최정비 (설비보전팀)'
  }
];

export const COMMON_FACTORY_LOCATIONS = [
  'A동 1층 조립라인 입구',
  'B동 2층 휴게실 앞',
  '출하장 입구',
  '고객검수장',
  '공장동 중앙통로',
  'C동 1층 자재창고 입구',
  '도장공정 라인 입구',
  '안전체험교육관 앞',
  '금형가공 1구역',
  '품질보증 분석실 앞',
  '폐기물 처리장 출입구',
  '하역장 도크 2번'
];
