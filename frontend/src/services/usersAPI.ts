import { api } from './api';
import type { User, CreateUserData, UserFilters, UsersResponse, ActivityLog, Role, Department } from '../types/user';

export const usersAPI = {
  // Get paginated users with filters
  getUsers: async (params: UserFilters & { page: number; per_page: number }): Promise<UsersResponse> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<{ data: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<{ data: User }> => {
    const formData = new FormData();
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: Partial<CreateUserData>): Promise<{ data: User }> => {
    const formData = new FormData();
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add _method for Laravel form method spoofing
    formData.append('_method', 'PUT');

    const response = await api.post(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Bulk update users
  bulkUpdate: async (userIds: number[], action: string): Promise<void> => {
    await api.post('/users/bulk-update', {
      user_ids: userIds,
      action,
    });
  },

  // Export users
  exportUsers: async (filters: UserFilters): Promise<void> => {
    const response = await api.get('/users/export', {
      params: filters,
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get user activity logs
  getUserActivity: async (userId: number, page = 1, per_page = 20): Promise<{ data: ActivityLog[], total: number }> => {
    const response = await api.get(`/users/${userId}/activity`, {
      params: { page, per_page },
    });
    return response.data;
  },

  // Change user password
  changePassword: async (userId: number, data: { current_password?: string; password: string; password_confirmation: string }): Promise<void> => {
    await api.put(`/users/${userId}/password`, data);
  },

  // Reset user password
  resetPassword: async (userId: number): Promise<{ temporary_password: string }> => {
    const response = await api.post(`/users/${userId}/reset-password`);
    return response.data;
  },

  // Toggle user status
  toggleStatus: async (userId: number): Promise<{ data: User }> => {
    const response = await api.post(`/users/${userId}/toggle-status`);
    return response.data;
  },

  // Get roles for user creation/editing
  getRoles: async (): Promise<{ data: Role[] }> => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get departments
  getDepartments: async (): Promise<{ data: Department[] }> => {
    const response = await api.get('/departments');
    return response.data;
  },
};
