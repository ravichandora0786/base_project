export const DEFAULT_ROLES = [
  { name: 'admin' },
  { name: 'user' },
];

export const DEFAULT_USERS = [
  {
    email: 'admin@gmail.com',
    password: 'Admin@123',
    roleName: 'admin',
    name: 'Admin User',
  },
  {
    email: 'user@gmail.com',
    password: 'User@123',
    roleName: 'user',
    name: 'Regular User',
  }
];

export const DEFAULT_PERMISSIONS = [
  { name: 'view', code: 'view' },
  { name: 'create', code: 'create' },
  { name: 'edit', code: 'edit' },
  { name: 'delete', code: 'delete' },
  { name: 'view detail', code: 'view_detail' },
  { name: 'update status', code: 'update_status' },
];

export const DEFAULT_MODULES = [
  { name: 'dashboard', display_name: 'Dashboard', route: '/dashboard', icon: 'FiGrid', sort_order: 0 },
  { name: 'user', display_name: 'Users', route: '/users', icon: 'FiUsers', sort_order: 1 },
  { name: 'role', display_name: 'Roles', route: '/roles', icon: 'FiShield', sort_order: 2 },
  { name: 'permission', display_name: 'Permissions', route: '/permissions', icon: 'FiLock', sort_order: 3 },
  { name: 'module', display_name: 'App Modules', route: '/modules', icon: 'FiFolder', sort_order: 4 },
];

export const DEFAULT_ROLE_PERMISSIONS = [
  // Admin gets all modules and all permissions using wildcard '*'
  { roleName: 'admin', moduleName: '*', permissions: ['*'] },

  // User role permission maps (restricted access)
  { roleName: 'user', moduleName: 'dashboard', permissions: ['view'] },
  { roleName: 'user', moduleName: 'user', permissions: ['view'] },
];
