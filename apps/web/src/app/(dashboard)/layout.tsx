'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import { DynamicSidebar } from '@/components/common/DynamicSidebar';
import { Header } from '@/components/common/Header';

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
    <div className="flex min-h-screen bg-custom-card text-custom">
      {/* Sidebar */}
      <DynamicSidebar collapsed={collapsed} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 transition duration-200">
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
        
        <main className="flex-1 p-4 md:p-5 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
