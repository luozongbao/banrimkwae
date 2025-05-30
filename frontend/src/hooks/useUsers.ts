import { useState, useEffect } from 'react';
import { usersAPI } from '../services/usersAPI';
import type { User, UserFilters, CreateUserData } from '../types/user';

export const useUsers = (filters: UserFilters & { page: number; per_page: number }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getUsers(filters);
      setUsers(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(filters)]);

  const exportUsers = async (exportFilters: UserFilters) => {
    try {
      await usersAPI.exportUsers(exportFilters);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Export failed');
    }
  };

  const bulkUpdateUsers = async (userIds: number[], action: string) => {
    try {
      await usersAPI.bulkUpdate(userIds, action);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Bulk update failed');
    }
  };

  return {
    users,
    total,
    isLoading,
    error,
    refetch: fetchUsers,
    exportUsers,
    bulkUpdateUsers,
  };
};

export const useCreateUser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserData) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.createUser(userData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading };
};

export const useUpdateUser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (id: number, userData: Partial<CreateUserData>) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.updateUser(id, userData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateUser, isLoading };
};

export const useUser = (id: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getUser(id);
      setUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
};

export const useRoles = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const response = await usersAPI.getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, isLoading };
};

export const useDepartments = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const response = await usersAPI.getDepartments();
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, isLoading };
};
