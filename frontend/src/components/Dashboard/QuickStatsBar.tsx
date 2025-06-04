import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CalendarIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from '../../hooks/useTranslation';
import type { DashboardData, TrendData } from '../../services/dashboardService';

interface QuickStatsBarProps {
  data?: DashboardData;
  language?: string;
}

interface QuickStatProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  trend?: TrendData;
}

const QuickStat: React.FC<QuickStatProps> = ({ icon: IconComponent, label, value, trend }) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const TrendIcon = trend.direction === 'up' ? ArrowUpIcon : ArrowDownIcon;
    const trendColor = trend.direction === 'up' ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center ${trendColor} ml-2`}>
        <TrendIcon className="w-3 h-3 mr-1" />
        <span className="text-xs font-medium">{trend.percentage}%</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="flex items-center">
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {getTrendIcon()}
        </div>
      </div>
    </motion.div>
  );
};

const QuickStatsBar: React.FC<QuickStatsBarProps> = ({ data }) => {
  const { t } = useTranslation();

  if (!data) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          icon={CurrencyDollarIcon}
          label={t('dashboard.todayRevenue')}
          value={`THB ${data.todayRevenue?.toLocaleString() || '0'}`}
          trend={data.revenueTrend}
        />
        
        <QuickStat
          icon={HomeIcon}
          label={t('dashboard.occupancyRate')}
          value={`${data.occupancyRate || 0}%`}
          trend={data.occupancyTrend}
        />
        
        <QuickStat
          icon={CalendarIcon}
          label={t('dashboard.todayBookings')}
          value={data.todayBookings?.toString() || '0'}
        />
        
        <QuickStat
          icon={UsersIcon}
          label={t('dashboard.currentGuests')}
          value={data.currentGuests?.toString() || '0'}
        />
      </div>
    </div>
  );
};

export default QuickStatsBar;
