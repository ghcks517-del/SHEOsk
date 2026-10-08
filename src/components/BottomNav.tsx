import React from 'react';
import { useSheosk } from '../context/SheoskContext';
import { TabType } from '../types/sheosk';
import { Tablet, History } from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useSheosk();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: '위치현황',
      icon: Tablet,
      badgeCount: stats.total
    },
    {
      id: 'history',
      label: '변경이력',
      icon: History
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-2 h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'list');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative active:scale-95 ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-3.5 px-1.5 py-0.2 bg-orange-100 text-orange-800 font-bold text-[10px] rounded-full min-w-4 text-center">
                    {item.badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[12px] leading-none ${isActive ? 'text-orange-600 font-semibold' : 'text-slate-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-orange-600 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
