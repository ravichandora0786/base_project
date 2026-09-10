'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutStart } from '@/features/auth/store/auth.slice';
import { FiSun, FiMoon, FiLogOut, FiMenu } from 'react-icons/fi';
import LoadingButton from '@/components/ui/loadingButton';
import { useConfirm } from '@/components/ui/confirmationModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  collapsed?: boolean;
  onToggleMobile?: () => void;
  isMobileOpen?: boolean;
}

export function Header({
  onToggleSidebar,
  collapsed = false,
  onToggleMobile,
  isMobileOpen = false,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const { user } = useAppSelector((state) => state?.auth || {}) as any;

  // Avoid Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'Log Out?',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (isConfirmed) {
      dispatch(logoutStart());
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 bg-custom-card border-b border-custom flex items-center justify-between px-3 sm:px-4 sticky top-0 z-10 transition duration-200">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile Hamburger Toggle (Visible only on < lg) */}
        {onToggleMobile && (
          <button
            type="button"
            onClick={onToggleMobile}
            className="p-2 sm:p-2.5 rounded-xl border border-custom text-custom-muted hover:text-custom-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer lg:hidden"
            aria-label={isMobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            title={isMobileOpen ? 'Close Menu' : 'Open Menu'}
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Rail Toggle (Visible only on >= lg) */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-xl border border-custom text-custom-muted hover:text-custom-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer items-center justify-center"
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}

        {/* Brand/Logo for Mobile / Tablet View (Visible only on < lg) */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-custom-primary flex items-center justify-center text-white font-bold text-sm shadow-xs">
            B
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
            Base
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Theme Toggle */}
        {mounted && (
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl border border-custom text-custom-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer flex items-center justify-center"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <FiSun className="w-5 h-5 text-amber-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 sm:p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer flex items-center justify-center"
          title="Log Out"
          aria-label="Log Out"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
