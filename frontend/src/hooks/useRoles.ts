import { useState, useEffect } from 'react';
import { rolesAPI } from '../services/rolesAPI';
import { Role, RoleFilters, CreateRoleData, Permission, PermissionGroup } from '../types/role';

export const useRoles = (filters: RoleFilters) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rolesAPI.getRoles(filters);
      setRoles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [JSON.stringify(filters)]);

  const duplicateRole = async (roleId: number) => {
    const response = await rolesAPI.duplicateRole(roleId);
    return response.data;
  };

  const bulkDeleteRoles = async (roleIds: number[]) => {
    await rolesAPI.bulkDelete(roleIds);
  };

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
    duplicateRole,
    bulkDeleteRoles,
  };
};

export const useCreateRole = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createRole = async (roleData: CreateRoleData) => {
    setIsLoading(true);
    try {
      const response = await rolesAPI.createRole(roleData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { createRole, isLoading };
};

export const useUpdateRole = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateRole = async (id: number, roleData: Partial<CreateRoleData>) => {
    setIsLoading(true);
    try {
      const response = await rolesAPI.updateRole(id, roleData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateRole, isLoading };
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissionsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [permissionsResponse, groupsResponse] = await Promise.all([
          rolesAPI.getPermissions(),
          rolesAPI.getPermissionGroups(),
        ]);
        
        setPermissions(permissionsResponse.data);
        setPermissionGroups(groupsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch permissions data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissionsData();
  }, []);

  return {
    permissions,
    permissionGroups,
    isLoading,
    error,
  };
};
