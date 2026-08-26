'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutStart } from '@/features/auth/store/auth.slice';
import { FiSun, FiMoon, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import LoadingButton from '@/components/ui/loadingButton';

interface HeaderProps {
  onToggleSidebar?: () => void;
  collapsed?: boolean;
}

export function Header({ onToggleSidebar, collapsed = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Avoid Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logoutStart());
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 bg-custom-card border-b border-custom flex items-center justify-between px-4 sticky top-0 z-10 transition duration-200">
      <div className="flex items-center space-x-4">
        {onToggleSidebar && (
          <LoadingButton
            onClick={onToggleSidebar}
            variant="custom"
            className="p-2 rounded-xl border border-custom text-custom-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <FiMenu className="w-5 h-5" />
          </LoadingButton>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        {mounted && (
          <LoadingButton
            onClick={toggleTheme}
            variant="custom"
            className="p-2 rounded-xl border border-custom text-custom-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <FiSun className="w-5 h-5 text-amber-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-indigo-600" />
            )}
          </LoadingButton>
        )}

        {/* Logout Button */}
        <LoadingButton
          onClick={handleLogout}
          variant="custom"
          className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer"
          title="Log Out"
        >
          <FiLogOut className="w-5 h-5" />
        </LoadingButton>
      </div>
    </header>
  );
}
