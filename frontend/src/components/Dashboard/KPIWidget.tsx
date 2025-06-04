import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, HomeIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useKPIData } from '../../hooks/useDashboard';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface KPIWidgetProps {
  type: string;
  dateRange: string;
  userRole?: string;
  language?: string;
  onClick?: () => void;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({
  type,
  dateRange,
  onClick
}) => {
  const { t } = useTranslation();
  const { data: kpiData, isLoading, error } = useKPIData(type, dateRange);

  const getKPIConfig = (type: string) => {
    const configs = {
      revenue: {
        title: t('dashboard.revenue'),
        icon: CurrencyDollarIcon,
        color: 'blue',
        format: (value: number) => `THB ${value.toLocaleString()}`,
      },
      occupancy: {
        title: t('dashboard.occupancy'),
        icon: HomeIcon,
        color: 'green',
        format: (value: number) => `${value}%`,
      },
      bookings: {
        title: t('dashboard.bookings'),
        icon: CalendarIcon,
        color: 'purple',
        format: (value: number) => value.toString(),
      },
      guests: {
        title: t('dashboard.guests'),
        icon: UsersIcon,
        color: 'indigo',
        format: (value: number) => value.toString(),
      },
      restaurant: {
        title: t('dashboard.restaurant'),
        icon: CurrencyDollarIcon,
        color: 'orange',
        format: (value: number) => `THB ${value.toLocaleString()}`,
      },
      activities: {
        title: t('dashboard.activities'),
        icon: CalendarIcon,
        color: 'teal',
        format: (value: number) => value.toString(),
      },
      inventory: {
        title: t('dashboard.inventory'),
        icon: ArrowDownIcon,
        color: 'red',
        format: (value: number) => `${value} ${t('dashboard.lowStock')}`,
      },
    };

    return configs[type as keyof typeof configs] || configs.revenue;
  };

  const config = getKPIConfig(type);
  const IconComponent = config.icon;

  const getTrendIcon = () => {
    if (!kpiData?.trend) return null;
    
    const TrendIcon = kpiData.trend.direction === 'up' ? ArrowUpIcon : ArrowDownIcon;
    const trendColor = kpiData.trend.direction === 'up' ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center ${trendColor}`}>
        <TrendIcon className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">{kpiData.trend.percentage}%</span>
      </div>
    );
  };

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-24">
          <LoadingSpinner size="sm" />
        </div>
      </Card>
    );
  }

  if (error || !kpiData) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p className="text-sm">{t('dashboard.loadError')}</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        bg-white rounded-lg border-2 p-6
        ${colorClasses[config.color as keyof typeof colorClasses]}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {config.title}
          </p>
          
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {config.format(kpiData.current)}
          </p>
          
          {kpiData.trend && (
            <div className="flex items-center justify-between">
              {getTrendIcon()}
              <span className="text-sm text-gray-500">
                vs {kpiData.trend.period}
              </span>
            </div>
          )}

          {/* Target Achievement (if available) */}
          {kpiData.target && kpiData.achievement && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{t('dashboard.target')}</span>
                <span>{kpiData.achievement}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    kpiData.achievement >= 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(kpiData.achievement, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${colorClasses[config.color as keyof typeof colorClasses]}
        `}>
          <IconComponent className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default KPIWidget;
