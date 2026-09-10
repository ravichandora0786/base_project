'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { usePathname, useRouter } from 'next/navigation';
import { DynamicSidebar } from '@/components/common/DynamicSidebar';
import { Header } from '@/components/common/Header';
import GlobalLoadingOverlay from '@/components/ui/globalLoadingOverlay';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state?.auth || {}) as any;
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Auto-close mobile sidebar drawer on page navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Auto-close mobile drawer when window expands to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FCEEA7]">
        <div className="w-10 h-10 border-4 border-[#14532D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-custom-card text-custom">
      {/* Responsive Sidebar: Docked on Desktop, Slide-over Drawer on Mobile */}
      <DynamicSidebar
        collapsed={collapsed}
        mobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-custom-background transition duration-200">
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        />
        
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
