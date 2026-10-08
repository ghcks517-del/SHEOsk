import React from 'react';
import { UsageStatus } from '../types/sheosk';

interface StatusBadgeProps {
  status: UsageStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStyle = () => {
    switch (status) {
      case '사용중':
        return {
          wrapper: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/10',
          dot: 'bg-emerald-500 animate-pulse',
          iconText: '●'
        };
      case '미사용':
        return {
          wrapper: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-400/10',
          dot: 'bg-slate-400',
          iconText: '●'
        };
      case '점검중':
        return {
          wrapper: 'bg-amber-50 text-amber-900 border-amber-300 ring-amber-500/10',
          dot: 'bg-amber-500',
          iconText: '▲'
        };
      default:
        return {
          wrapper: 'bg-gray-100 text-gray-700 border-gray-300',
          dot: 'bg-gray-400',
          iconText: '●'
        };
    }
  };

  const style = getStyle();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium transition-colors shadow-xs ${style.wrapper} ${sizeClasses[size]} ${className}`}
    >
      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
      <span className="tracking-tight">{status}</span>
    </span>
  );
};
