import { api } from './api';
import { Role, RoleFilters, CreateRoleData, Permission, PermissionGroup } from '../types/role';

export const rolesAPI = {
  // Get all roles with optional filters
  getRoles: (filters?: RoleFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.permission_type) params.append('permission_type', filters.permission_type);
    if (filters?.user_count) params.append('user_count', filters.user_count);
    
    return api.get<Role[]>(`/roles?${params.toString()}`);
  },

  // Get a specific role by ID
  getRole: (id: number) => {
    return api.get<Role>(`/roles/${id}`);
  },

  // Create a new role
  createRole: (roleData: CreateRoleData) => {
    return api.post<Role>('/roles', roleData);
  },

  // Update an existing role
  updateRole: (id: number, roleData: Partial<CreateRoleData>) => {
    return api.put<Role>(`/roles/${id}`, roleData);
  },

  // Delete a role
  deleteRole: (id: number) => {
    return api.delete(`/roles/${id}`);
  },

  // Duplicate a role
  duplicateRole: (id: number) => {
    return api.post<Role>(`/roles/${id}/duplicate`);
  },

  // Bulk delete roles
  bulkDelete: (roleIds: number[]) => {
    return api.delete('/roles/bulk', { data: { role_ids: roleIds } });
  },

  // Get all permissions
  getPermissions: () => {
    return api.get<Permission[]>('/permissions');
  },

  // Get permission groups
  getPermissionGroups: () => {
    return api.get<PermissionGroup[]>('/permissions/groups');
  },

  // Assign role to users
  assignRoleToUsers: (roleId: number, userIds: number[]) => {
    return api.post(`/roles/${roleId}/assign`, { user_ids: userIds });
  },

  // Remove role from users
  removeRoleFromUsers: (roleId: number, userIds: number[]) => {
    return api.post(`/roles/${roleId}/remove`, { user_ids: userIds });
  },

  // Get users assigned to a role
  getRoleUsers: (roleId: number) => {
    return api.get(`/roles/${roleId}/users`);
  },
};
