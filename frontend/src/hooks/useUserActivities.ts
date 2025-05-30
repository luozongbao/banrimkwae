import { useState, useEffect } from 'react';
import type { UserActivity } from '../types/user';

// Mock data for user activities until the backend API is implemented
const generateMockActivities = (_userId: number): UserActivity[] => {
  const activities: UserActivity[] = [
    {
      id: 1,
      type: 'login',
      description: 'User logged in',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: {
        session_id: 'sess_123456',
        location: 'Bangkok, Thailand'
      }
    },
    {
      id: 2,
      type: 'profile_update',
      description: 'Profile information updated',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: {
        changed_fields: ['phone', 'department']
      }
    },
    {
      id: 3,
      type: 'password_change',
      description: 'Password changed successfully',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: {
        initiated_by: 'user'
      }
    },
    {
      id: 4,
      type: 'permission_change',
      description: 'User permissions updated',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
      metadata: {
        added_permissions: ['users.view'],
        removed_permissions: [],
        changed_by: 'Admin User'
      }
    },
    {
      id: 5,
      type: 'logout',
      description: 'User logged out',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: {
        session_duration: '4 hours 23 minutes'
      }
    }
  ];

  return activities;
};

export const useUserActivities = (userId: number | undefined) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call when backend endpoint is available
        // const response = await usersAPI.getUserActivities(userId);
        // setActivities(response.data);
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        const mockActivities = generateMockActivities(userId);
        setActivities(mockActivities);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user activities');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  const refetch = () => {
    if (userId) {
      setLoading(true);
      // Re-trigger the effect
      const timer = setTimeout(() => {
        const mockActivities = generateMockActivities(userId);
        setActivities(mockActivities);
        setLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  };

  return {
    activities,
    loading,
    error,
    refetch,
  };
};
