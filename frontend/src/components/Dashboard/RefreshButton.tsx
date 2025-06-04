import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface RefreshButtonProps {
  onClick: () => void;
  lastUpdated?: string;
  isLoading?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  onClick, 
  lastUpdated, 
  isLoading = false 
}) => {
  const { t } = useTranslation();

  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return t('dashboard.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('dashboard.minutesAgo', { count: minutes });
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {lastUpdated && (
        <span className="text-xs text-gray-500">
          {t('dashboard.lastUpdated')}: {formatLastUpdated(lastUpdated)}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{t('dashboard.refresh')}</span>
      </Button>
    </div>
  );
};

export default RefreshButton;
