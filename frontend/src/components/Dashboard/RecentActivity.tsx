import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import type { Activity } from '../../services/dashboardService';

interface RecentActivityProps {
  activities: Activity[];
  language?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities
}) => {
  const { t } = useTranslation();

  const getActivityIcon = () => {
    // You can expand this to have more specific icons for different activity types
    return ClockIcon;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      booking: 'text-blue-600',
      'check-in': 'text-green-600',
      'check-out': 'text-orange-600',
      payment: 'text-purple-600',
      default: 'text-gray-600',
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.recentActivity')}
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            {t('dashboard.noActivity')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('dashboard.recentActivity')}
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const IconComponent = getActivityIcon();
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <UserIcon className="w-3 h-3 mr-1" />
                  <span className="mr-3">{activity.user}</span>
                  <span>
                    {new Date(activity.timestamp).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;
