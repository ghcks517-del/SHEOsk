/**
 * Format timestamp to Korean localized string: 2026.10.08 11:30
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * Format relative time (방금 전, 12분 전, 1시간 전, 2일 전)
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '-';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  
  return formatDateTime(timestamp).split(' ')[0];
}
