'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { logoutStart, checkAuthStart } from '@/features/auth/store/auth.slice';
import Cookies from 'js-cookie';
import { PUBLIC_ROUTES } from '@/lib/constants/routes';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  
  // Guard client-side state
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On hard reload, if logged_in cookie exists but user not loaded in Redux, trigger profile fetch
    const loggedIn = Cookies.get('logged_in') === 'true';
    if (loggedIn && !user && !isLoading) {
      dispatch(checkAuthStart());
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      authCheck(pathname);
    }
  }, [pathname, mounted, isAuthenticated, user, isLoading]);

  function authCheck(path: string) {
    const loggedIn = Cookies.get('logged_in') === 'true';
    const isPublic = PUBLIC_ROUTES.includes(path);

    // 1. No logged_in cookie and trying to access private page
    if (!loggedIn && !isPublic) {
      setAuthorized(false);
      router.push('/login');
      return;
    }

    // 2. Logged_in cookie exists and trying to access public page (redirect to dashboard)
    if (loggedIn && isPublic) {
      setAuthorized(false);
      router.push('/dashboard');
      return;
    }

    // 3. Role-based permission checks on private pages
    if (loggedIn && !isPublic) {
      if (path === '/dashboard' || path.startsWith('/profile') || path === '/') {
        setAuthorized(true);
        return;
      }

      // Check module access
      let moduleName = path.split('/')[1]; 
      if (moduleName.endsWith('s')) {
        if (moduleName === 'roles') moduleName = 'role';
        else if (moduleName === 'permissions') moduleName = 'permission';
        else if (moduleName === 'modules') moduleName = 'module';
        else if (moduleName === 'users') moduleName = 'user';
      }

      if (user && user.role && user.role.name !== 'admin') {
        const userPermissions = user.permissions || {};
        const hasModuleAccess = !!userPermissions[moduleName.toLowerCase()];
        if (!hasModuleAccess) {
          setAuthorized(false);
          router.push('/_not-found');
          return;
        }
      }
    }

    setAuthorized(true);
  }

  // Prevent flash or pre-render loops by waiting for mount
  if (!mounted) {
    return null;
  }

  return authorized ? <>{children}</> : null;
}
