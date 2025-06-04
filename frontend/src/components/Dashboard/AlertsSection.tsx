import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { useDismissAlert } from '../../hooks/useDashboard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Alert } from '../../services/dashboardService';

interface AlertsSectionProps {
  alerts: Alert[];
  language?: string;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts
}) => {
  const { t } = useTranslation();
  const { dismissAlert } = useDismissAlert();

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      success: 'bg-green-50 border-green-200 text-green-800',
    };
    return styles[type];
  };

  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      info: InformationCircleIcon,
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      success: CheckCircleIcon,
    };
    return icons[type];
  };

  const getAlertIconColor = (type: Alert['type']) => {
    const colors = {
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      success: 'text-green-600',
    };
    return colors[type];
  };

  if (alerts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.alerts')}
        </h3>
        <div className="text-center py-8">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-500">
            {t('dashboard.noAlerts')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('dashboard.alerts')}
        </h3>
        <span className="text-sm text-gray-500">
          {alerts.length} {t('dashboard.items')}
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alerts.map((alert) => {
            const IconComponent = getAlertIcon(alert.type);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`
                  p-4 rounded-lg border-2 relative
                  ${getAlertStyles(alert.type)}
                `}
              >
                <div className="flex items-start">
                  <IconComponent 
                    className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${getAlertIconColor(alert.type)}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {alert.title}
                    </p>
                    <p className="text-sm mt-1 opacity-90">
                      {alert.message}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(alert.timestamp).toLocaleString('en-US')}
                    </p>
                    
                    {alert.actionUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(alert.actionUrl, '_blank')}
                        className="text-sm font-medium underline mt-2 hover:no-underline p-0 h-auto"
                      >
                        {t('dashboard.viewDetails')}
                      </Button>
                    )}
                  </div>
                  
                  {alert.dismissible && (
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default AlertsSection;
