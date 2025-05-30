export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions: Permission[];
  users_count?: number;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  group: string;
  is_dangerous: boolean;
  requires_confirmation: boolean;
}

export interface PermissionGroup {
  key: string;
  name: string;
  description?: string;
  permissions_count: number;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
  permissions: number[];
}

export interface RoleFilters {
  search: string;
  permission_type: string;
  user_count: string;
}
