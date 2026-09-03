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
import * as Icons from 'react-icons/fi';
import { apiClient } from '@/lib/api/client';
import { getInitials } from '@/lib/utils';

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
  const [menuItems, setMenuItems] = React.useState<MenuItemType[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const fetchSidebarModules = async () => {
    try {
      const response = await apiClient.get('/modules');
      const activeModules = response.data.filter((m: any) => m.is_active);
      const items: MenuItemType[] = activeModules.map((m: any) => {
        const IconComponent = (Icons as any)[m.icon || 'FiFolder'] || Icons.FiFolder;
        return {
          name: m.name,
          label: m.display_name,
          path: m.route || `/${m.name}`,
          icon: <IconComponent className="w-5 h-5" />,
          sort_order: m.sort_order ?? 99,
        };
      });
      items.sort((a, b) => (a as any).sort_order - (b as any).sort_order);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load sidebar modules', err);
    }
  };

  React.useEffect(() => {
    setMounted(true);
    fetchSidebarModules();
  }, [user]);

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

  const shortName = getInitials(user?.name || user?.email?.split('@')[0]);

  if (!mounted) {
    return <aside className="w-64 bg-custom-card border-r border-custom h-screen sticky top-0" />;
  }

  const menuItemStyles = {
    icon: ({ active }: any) => ({
      color: active ? 'white' : 'var(--primary)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    button: ({ active, hover }: any) => {
      const commonStyles = {
        width: '90%',
        margin: '2px auto',
        display: 'flex',
        borderRadius: '12px',
        padding: '10px 16px',
        height: '42px',
        transition: 'all 0.15s ease',
      };

      if (active) {
        return {
          ...commonStyles,
          backgroundColor: 'var(--primary) !important',
          color: 'white !important',
          '& .ps-menu-icon': {
            color: 'white !important',
          },
        };
      }

      return {
        ...commonStyles,
        backgroundColor: hover ? 'color-mix(in srgb, var(--primary) 35%, transparent) !important' : 'transparent',
        color: hover ? 'var(--primary) !important' : 'var(--text-muted)',
        '& .ps-menu-icon': {
          color: 'var(--primary) !important',
        },
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
        <div className="flex flex-col h-full pb-4 overflow-hidden">
          {/* Header / Logo */}
          <div className="flex items-center justify-center h-[70px] shrink-0">
            <div className="flex flex-row px-4 py-2 items-center w-full">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  router.push('/dashboard');
                }}
              >
                <div className="w-10 h-10 rounded-full bg-custom-primary flex items-center justify-center text-white font-bold text-lg shadow-md dark:shadow-none">
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

          {/* Menu Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto min-h-0 py-2">
            <nav className="mt-2">
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
          <div className="pt-2 border-t border-custom shrink-0 mt-auto">
            {(() => {
              const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile/');
              return (
                <Menu menuItemStyles={menuItemStyles}>
                  <MenuItem
                    key="profile"
                    icon={
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-custom-primary text-white text-xs font-bold shadow-sm">
                        {shortName}
                      </div>
                    }
                    active={isProfileActive}
                    component={<Link href="/profile" />}
                  >
                    {!collapsed && (
                      <div className="flex flex-col ml-1 text-left leading-tight py-1">
                        <span className={`font-bold text-sm capitalize transition-colors ${
                          isProfileActive ? 'text-white' : 'text-custom-primary'
                        }`}>
                          {user?.name || user?.email?.split('@')[0]}
                        </span>
                        <span className={`text-[10px] font-medium break-all pr-2 transition-colors ${
                          isProfileActive ? 'text-white/70' : 'text-custom-primary/70'
                        }`}>
                          {user?.email}
                        </span>
                      </div>
                    )}
                  </MenuItem>
                </Menu>
              );
            })()}
          </div>
        </div>
      </ProSidebar>
    </div>
  );
}
