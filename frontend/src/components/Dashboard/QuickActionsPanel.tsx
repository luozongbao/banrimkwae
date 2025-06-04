import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  href: string;
  permission?: string;
  count?: number;
}

interface QuickActionsPanelProps {
  userRole?: string;
  permissions: string[];
  language?: string;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  permissions
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [
      {
        id: 'new-booking',
        title: t('dashboard.newBooking'),
        icon: CalendarIcon,
        color: 'blue',
        href: '/bookings/new',
        permission: 'create_booking'
      },
      {
        id: 'check-in',
        title: t('dashboard.checkIn'),
        icon: ArrowRightOnRectangleIcon,
        color: 'green',
        href: '/bookings/check-in',
        permission: 'manage_checkin'
      },
      {
        id: 'add-user',
        title: t('dashboard.addUser'),
        icon: UserPlusIcon,
        color: 'purple',
        href: '/users/new',
        permission: 'create_user'
      },
      {
        id: 'inventory-alert',
        title: t('dashboard.inventoryAlerts'),
        icon: ExclamationTriangleIcon,
        color: 'orange',
        href: '/inventory/alerts',
        permission: 'view_inventory',
        count: 5
      },
      {
        id: 'reports',
        title: t('dashboard.reports'),
        icon: ChartBarIcon,
        color: 'indigo',
        href: '/reports',
        permission: 'view_reports'
      },
      {
        id: 'settings',
        title: t('dashboard.settings'),
        icon: CogIcon,
        color: 'gray',
        href: '/settings',
        permission: 'manage_settings'
      }
    ];

    return actions.filter(action => 
      !action.permission || 
      permissions.includes(action.permission) || 
      permissions.includes('view_all')
    );
  };

  const handleActionClick = (href: string) => {
    navigate(href);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      indigo: 'text-indigo-600',
      gray: 'text-gray-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getBadgeColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
      indigo: 'bg-indigo-600',
      gray: 'bg-gray-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('dashboard.quickActions')}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {getQuickActions().map((action, index) => {
          const IconComponent = action.icon;
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action.href)}
              className={`
                relative p-4 rounded-lg border-2 text-left
                transition-all duration-200 hover:shadow-md
                ${getColorClasses(action.color)}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <IconComponent 
                    className={`w-6 h-6 mb-2 ${getIconColorClasses(action.color)}`}
                  />
                  <p className="text-sm font-medium text-gray-900">
                    {action.title}
                  </p>
                </div>
                
                {action.count && (
                  <div className={`
                    absolute -top-2 -right-2 w-6 h-6 rounded-full
                    ${getBadgeColorClasses(action.color)} text-white text-xs
                    flex items-center justify-center font-bold
                  `}>
                    {action.count}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActionsPanel;
