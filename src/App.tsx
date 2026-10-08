/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SheoskProvider, useSheosk } from './context/SheoskContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { AdminView } from './components/AdminView';
import { EditModal } from './components/EditModal';
import { RegisterModal } from './components/RegisterModal';
import { DetailModal } from './components/DetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

const MainContent: React.FC = () => {
  const { activeTab } = useSheosk();

  return (
    <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-24">
      {(activeTab === 'home' || activeTab === 'list') && <DashboardView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'admin' && <AdminView />}
    </main>
  );
};

export default function App() {
  return (
    <SheoskProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
        {/* Realtime Toast Container */}
        <ToastContainer />

        {/* Fixed Header */}
        <Header />

        {/* Active Tab Screen */}
        <MainContent />

        {/* Global Bottom Navigation */}
        <BottomNav />

        {/* Global Modals & Bottom Sheets */}
        <EditModal />
        <RegisterModal />
        <DetailModal />
        <DeleteConfirmModal />
      </div>
    </SheoskProvider>
  );
}
