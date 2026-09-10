export interface RolePermission {
  module: {
    name: string;
  };
  permission_ids: string[];
}

export interface UserAddress {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

export interface UserRoleRef {
  id: string;
  name: string;
  rolePermissions?: RolePermission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  profile_image?: string | null;
  is_active: boolean;
  role: UserRoleRef;
  about?: string | null;
  date_of_birth?: string | Date | null;
  address?: UserAddress | null;
  permissions?: Record<string, string[]>;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  _count?: {
    users?: number;
  };
}

export interface AppModule {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  icon?: string | null;
  route?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  is_assigned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RolePermissionMapping {
  id: string;
  role_id: string;
  module_id: string;
  permission_ids: string[];
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SearchDataState {
  search: string;
  status: 'all' | boolean;
}
