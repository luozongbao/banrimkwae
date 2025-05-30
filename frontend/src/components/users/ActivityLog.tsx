import React from 'react';
import { format } from 'date-fns';
import { Activity, Clock, User, Shield, Settings } from 'lucide-react';
import type { UserActivity } from '../../types/user';
import { useUserActivities } from '../../hooks/useUserActivities';

interface ActivityLogProps {
  userId?: number;
  activities?: UserActivity[];
  loading?: boolean;
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
    case 'logout':
      return <User className="h-4 w-4" />;
    case 'password_change':
    case 'permission_change':
      return <Shield className="h-4 w-4" />;
    case 'profile_update':
      return <Settings className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'login':
      return 'text-green-600 bg-green-100';
    case 'logout':
      return 'text-gray-600 bg-gray-100';
    case 'password_change':
    case 'permission_change':
      return 'text-orange-600 bg-orange-100';
    case 'profile_update':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-purple-600 bg-purple-100';
  }
};

export const ActivityLog: React.FC<ActivityLogProps> = ({
  userId,
  activities: propActivities,
  loading: propLoading = false,
  className = ''
}) => {
  // Use hook only if userId is provided and no activities are passed
  const { 
    activities: fetchedActivities, 
    loading: fetchLoading,
    error 
  } = useUserActivities(userId && !propActivities ? userId : undefined);

  // Determine which activities and loading state to use
  const activities = propActivities || fetchedActivities;
  const loading = propLoading || fetchLoading;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-start space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Activity className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No activity logged yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {activity.description}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(activity.timestamp || activity.created_at || new Date()), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
            {(activity.ipAddress || activity.ip_address) && (
              <p className="text-xs text-gray-500 mt-1">
                IP: {activity.ipAddress || activity.ip_address}
              </p>
            )}
            {(activity.userAgent || activity.user_agent) && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {activity.userAgent || activity.user_agent}
              </p>
            )}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <strong>Details:</strong>
                <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(activity.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
