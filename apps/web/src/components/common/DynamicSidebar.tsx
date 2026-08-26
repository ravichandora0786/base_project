'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
} from 'react-pro-sidebar';
import { 
  FiGrid, 
  FiUsers, 
  FiShield, 
  FiLock, 
  FiFolder, 
  FiCheckSquare 
} from 'react-icons/fi';

interface MenuItemType {
  name: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  collapsed?: boolean;
}

export function DynamicSidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems: MenuItemType[] = [
    { name: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'user', label: 'Users', path: '/users', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'role', label: 'Roles', path: '/roles', icon: <FiShield className="w-5 h-5" /> },
    { name: 'permission', label: 'Permissions', path: '/permissions', icon: <FiLock className="w-5 h-5" /> },
    { name: 'module', label: 'App Modules', path: '/modules', icon: <FiFolder className="w-5 h-5" /> },
    { name: 'role-permission', label: 'Role Permissions', path: '/role-permissions', icon: <FiCheckSquare className="w-5 h-5" /> },
  ];

  // Helper to check module permission
  const hasPermission = (moduleName: string) => {
    if (!user || !user.role) return false;
    
    // Admin has super powers and sees everything
    if (user.role.name === 'admin') return true;

    // Check if user's permissions object has this module
    const userPermissions = user.permissions || {};
    return !!userPermissions[moduleName.toLowerCase()];
  };

  const allowedMenuItems = menuItems.filter(item => hasPermission(item.name));

  const shortName = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U';

  if (!mounted) {
    return <aside className="w-64 bg-custom-card border-r border-custom h-screen sticky top-0" />;
  }

  const menuItemStyles = {
    icon: ({ active }: any) => ({
      color: active ? 'white' : 'rgb(var(--primary))',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    button: ({ active }: any) => {
      const commonStyles = {
        width: '90%',
        margin: '2px auto',
        display: 'flex',
        borderRadius: '12px',
        color: active ? 'white' : 'rgb(var(--text-muted))',
        padding: '10px 16px',
        height: '42px',
        transition: 'all 0.15s ease',
        backgroundColor: 'transparent',
      };
      const activeStyles = {
        backgroundColor: 'rgb(var(--primary))',
        color: 'white',
      };
      const hoverStyles = {
        '&:hover': {
          backgroundColor: 'rgba(var(--primary), 0.1) !important',
          color: 'rgb(var(--primary)) !important',
        },
        '&:hover svg': {
          color: 'rgb(var(--primary)) !important',
        },
      };

      return {
        ...commonStyles,
        ...(active ? activeStyles : {}),
        ...hoverStyles,
      };
    },
  };

  return (
    <div className="flex h-screen border-r border-custom bg-custom-card">
      <ProSidebar
        backgroundColor="transparent"
        width="256px"
        collapsed={collapsed}
      >
        <div className="flex flex-col h-full justify-between pb-4">
          <div className="flex-1">
            {/* Header / Logo */}
            <div className="flex items-center justify-center h-[70px]">
              <div className="flex flex-row px-4 py-2 items-center w-full">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-custom-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100 dark:shadow-none">
                    B
                  </div>
                  {!collapsed && (
                    <div className="flex flex-col justify-center text-left">
                      <span className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                        Base
                      </span>
                      <span className="text-[10px] text-custom-muted font-semibold">
                        Enterprise Portal
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="mt-4">
              <Menu menuItemStyles={menuItemStyles}>
                {allowedMenuItems.map((item) => {
                  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                  return (
                    <MenuItem
                      key={item.name}
                      icon={item.icon}
                      active={isActive}
                      component={<Link href={item.path} />}
                    >
                      {!collapsed && <span className="font-semibold text-sm">{item.label}</span>}
                    </MenuItem>
                  );
                })}
              </Menu>
            </nav>
          </div>

          {/* Footer User Profile */}
          <div className="mt-auto pt-2">
            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem
                key="profile"
                icon={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold shadow-sm">
                    {shortName}
                  </div>
                }
                active={pathname === '/profile' || pathname.startsWith('/profile/')}
                component={<Link href="/profile" />}
              >
                {!collapsed && (
                  <span className="font-bold text-sm ml-1 text-gray-900 dark:text-white capitalize">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                )}
              </MenuItem>
            </Menu>
          </div>
        </div>
      </ProSidebar>
    </div>
  );
}
