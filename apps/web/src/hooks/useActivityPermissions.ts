import { useMemo } from 'react';
import { useAppSelector } from '@/store';

/**
 * Converts all user permissions into an easy-to-use object:
 * e.g. permissions.userCreate -> true / false
 */
const useAllPermissions = () => {
  const { user } = useAppSelector((state) => state?.auth || {}) as any;

  return useMemo(() => {
    const map: Record<string, boolean> = {};

    if (!user || !user.role) return map;

    // Admin gets all permissions dynamically
    if (user.role.name.toLowerCase() === 'admin') {
      const modules = ['user', 'role', 'permission', 'module', 'role-permission', 'dashboard'];
      const actions = ['View', 'Create', 'Edit', 'Delete', 'ViewDetail'];
      modules.forEach((mod) => {
        const camelMod = mod
          .toLowerCase()
          .split(/[\s-_]+/)
          .map((word, idx) => (idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
          .join('');

        actions.forEach((act) => {
          map[`${camelMod}${act}`] = true;
        });
      });
      return map;
    }

    const permissions = user.permissions;
    if (!permissions) return map;

    Object.entries(permissions).forEach(([moduleName, codes]) => {
      // Normalize module/activity name: e.g. "role-permission" -> "rolePermission"
      const camelActivity = moduleName
        .toLowerCase()
        .split(/[\s-_]+/)
        .map((word, idx) => (idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('');

      const permCodes = Array.isArray(codes) ? (codes as string[]) : [];
      permCodes.forEach((code: string) => {
        // Normalize permission name: e.g. "view_detail" -> "ViewDetail"
        const normalizedPerm = code
          .toLowerCase()
          .split(/[\s-_]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');

        const key = `${camelActivity}${normalizedPerm}`;
        map[key] = true;
      });
    });

    return map;
  }, [user]);
};

export default useAllPermissions;
