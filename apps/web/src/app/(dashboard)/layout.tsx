'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import { DynamicSidebar } from '@/components/common/DynamicSidebar';
import { Header } from '@/components/common/Header';
import GlobalLoadingOverlay from '@/components/ui/globalLoadingOverlay';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-custom-card text-custom">
      {/* Sidebar */}
      <DynamicSidebar collapsed={collapsed} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-custom-background transition duration-200">
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
        
        <main className="flex-1 p-2 md:p-2 flex flex-col min-h-0 overflow-hidden">
          <div className="w-full flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>

      {/* Full-screen loading overlay */}
      <GlobalLoadingOverlay />
    </div>
  );
}
