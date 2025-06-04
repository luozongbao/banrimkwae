import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { useEffect, useState } from 'react';

export const useDashboardData = (dateRange = 'today', refreshInterval = 30000) => {
  return useQuery({
    queryKey: ['dashboard-data', dateRange],
    queryFn: () => dashboardService.getDashboardData(dateRange),
    refetchInterval: refreshInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useKPIData = (kpiType: string, dateRange = 'today') => {
  return useQuery({
    queryKey: ['kpi-data', kpiType, dateRange],
    queryFn: () => dashboardService.getKPIData(kpiType, dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kpiType,
  });
};

export const useChartData = (chartType: string, filters: any) => {
  return useQuery({
    queryKey: ['chart-data', chartType, filters],
    queryFn: () => dashboardService.getChartData(chartType, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!chartType,
  });
};

export const useRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Mock WebSocket connection for now
    // In production, this would use socket.io-client
    const interval = setInterval(async () => {
      try {
        const updates = await dashboardService.getRealtimeUpdates();
        
        // Update the dashboard data cache
        queryClient.setQueryData(['dashboard-data', 'today'], (oldData: any) => ({
          ...oldData,
          ...updates,
          lastUpdated: new Date().toISOString(),
        }));
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch real-time updates:', error);
        setIsConnected(false);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  return { isConnected };
};

export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  const dismissAlert = async (alertId: string) => {
    try {
      await dashboardService.dismissAlert(alertId);
      
      // Update the dashboard data cache to remove the dismissed alert
      queryClient.setQueryData(['dashboard-data', 'today'], (oldData: any) => ({
        ...oldData,
        alerts: oldData?.alerts?.filter((alert: any) => alert.id !== alertId) || [],
      }));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      throw error;
    }
  };

  return { dismissAlert };
};
