import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboardData, useRealtimeUpdates } from '../../hooks/useDashboard';
import { useTranslation } from '../../hooks/useTranslation';
import KPIWidget from './KPIWidget';
import ChartWidget from './ChartWidget';
import QuickActionsPanel from './QuickActionsPanel';
import AlertsSection from './AlertsSection';
import RecentActivity from './RecentActivity';
import DateRangePicker from './DateRangePicker';
import RefreshButton from './RefreshButton';
import QuickStatsBar from './QuickStatsBar';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface DashboardLayoutProps {
  userRole?: string;
  permissions?: string[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  permissions = ['view_all']
}) => {
  const { t } = useTranslation();
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData(selectedDateRange);
  const { isConnected } = useRealtimeUpdates();

  const getVisibleWidgets = () => {
    const baseWidgets = ['revenue', 'occupancy'];
    
    if (permissions.includes('view_restaurant') || permissions.includes('view_all')) {
      baseWidgets.push('restaurant');
    }
    
    if (permissions.includes('view_activities') || permissions.includes('view_all')) {
      baseWidgets.push('activities');
    }
    
    if (permissions.includes('view_inventory') || permissions.includes('view_all')) {
      baseWidgets.push('inventory');
    }
    
    return baseWidgets;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('dashboard.loadError')}
          </h2>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('dashboard.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500">
                {isConnected ? t('dashboard.connected') : t('dashboard.disconnected')}
              </span>
            </div>
            
            <DateRangePicker 
              value={selectedDateRange}
              onChange={setSelectedDateRange}
            />
            
            <RefreshButton 
              onClick={() => refetch()}
              lastUpdated={dashboardData?.lastUpdated}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <QuickStatsBar 
        data={dashboardData}
      />

      {/* Main Dashboard Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Widgets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ChartWidget
                title={t('dashboard.revenueChart')}
                type="area"
                data={dashboardData?.revenueChart || []}
                height={300}
                color="#2E86AB"
                gradientFill={true}
              />
            </motion.div>

            {/* Occupancy Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ChartWidget
                title={t('dashboard.occupancyChart')}
                type="line"
                data={dashboardData?.occupancyChart || []}
                height={250}
                color="#48BB78"
              />
            </motion.div>

            {/* KPI Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getVisibleWidgets().map((widgetType, index) => (
                <motion.div
                  key={widgetType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <KPIWidget
                    type={widgetType}
                    dateRange={selectedDateRange}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Side Panels */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QuickActionsPanel 
                permissions={permissions}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AlertsSection 
                alerts={dashboardData?.alerts || []}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RecentActivity 
                activities={dashboardData?.recentActivities || []}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
