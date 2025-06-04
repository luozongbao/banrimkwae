import { apiClient } from './apiClient';

export interface TrendData {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  period: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  dismissible?: boolean;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface DashboardData {
  todayRevenue: number;
  occupancyRate: number;
  todayBookings: number;
  currentGuests: number;
  revenueTrend: TrendData;
  occupancyTrend: TrendData;
  revenueChart: ChartDataPoint[];
  occupancyChart: ChartDataPoint[];
  alerts: Alert[];
  recentActivities: Activity[];
  lastUpdated: string;
}

export interface KPIData {
  current: number;
  previous: number;
  trend: TrendData;
  target?: number;
  achievement?: number;
}

class DashboardService {
  async getDashboardData(dateRange: string = 'today'): Promise<DashboardData> {
    const response = await apiClient.get(`/dashboard/summary`, {
      params: { date_range: dateRange }
    });
    return response.data.data;
  }

  async getKPIData(kpiType: string, dateRange: string): Promise<KPIData> {
    const response = await apiClient.get(`/dashboard/kpi/${kpiType}`, {
      params: { date_range: dateRange }
    });
    return response.data.data;
  }

  async getChartData(chartType: string, filters: any): Promise<ChartDataPoint[]> {
    const response = await apiClient.get(`/dashboard/charts/${chartType}`, {
      params: filters
    });
    return response.data.data;
  }

  async dismissAlert(alertId: string): Promise<void> {
    await apiClient.post(`/dashboard/alerts/${alertId}/dismiss`);
  }

  async getRealtimeUpdates(): Promise<Partial<DashboardData>> {
    const response = await apiClient.get('/dashboard/realtime');
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();
