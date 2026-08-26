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
];

export const DEFAULT_MODULES = [
  { name: 'user', display_name: 'User' },
  { name: 'role', display_name: 'Role' },
  { name: 'permission', display_name: 'Permission' },
  { name: 'module', display_name: 'Module' },
  { name: 'role-permission', display_name: 'Role permission' },
  { name: 'dashboard', display_name: 'Dashboard' },
];

export const DEFAULT_ROLE_PERMISSIONS = [
  // Admin gets all modules and all permissions using wildcard '*'
  { roleName: 'admin', moduleName: '*', permissions: ['*'] },

  // User role permission maps (restricted access)
  { roleName: 'user', moduleName: 'dashboard', permissions: ['view'] },
  { roleName: 'user', moduleName: 'user', permissions: ['view'] },
];
