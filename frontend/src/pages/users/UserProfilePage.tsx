import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProfileForm, PasswordChangeForm, ActivityLog } from '../../components/users';
import { useUser } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserIcon,
  PencilIcon,
  ShieldCheckIcon,
  ClockIcon,
  BellIcon 
} from '@heroicons/react/24/outline';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, isLoading, refetch } = useUser(Number(id));
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const tabs = [
    { key: 'profile', label: t('users.profile'), icon: <UserIcon className="h-4 w-4" /> },
    { key: 'security', label: t('users.security'), icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { key: 'activity', label: t('users.activity'), icon: <ClockIcon className="h-4 w-4" /> },
    { key: 'notifications', label: t('users.notifications'), icon: <BellIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        description={user.email}
        icon={<UserIcon className="h-6 w-6" />}
        actions={
          <Button
            variant="primary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
          >
            {t('common.edit')}
          </Button>
        }
      />

      {/* User Overview Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <Avatar
            src={user.avatar}
            alt={`${user.first_name} ${user.last_name}`}
            size="xl"
            fallback={`${user.first_name[0]}${user.last_name[0]}`}
          />
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600">{user.position}</p>
            
            <div className="flex items-center space-x-4 mt-4">
              <Badge
                variant={user.is_active ? 'success' : 'error'}
                size="sm"
              >
                {user.is_active ? t('users.active') : t('users.inactive')}
              </Badge>
              
              <span className="text-sm text-gray-500">
                {user.role.display_name}
              </span>
              
              <span className="text-sm text-gray-500">
                {user.department}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {t('users.lastLogin')}
            </div>
            <div className="text-sm text-gray-900">
              {user.last_login_at
                ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                : t('users.neverLoggedIn')
              }
            </div>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-resort-blue-500 text-resort-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <ProfileForm user={user} onUpdate={refetch} />
        )}
        
        {activeTab === 'security' && (
          <PasswordChangeForm userId={user.id} />
        )}
        
        {activeTab === 'activity' && (
          <ActivityLog userId={user.id} />
        )}
        
        {activeTab === 'notifications' && (
          <div>Notification settings coming soon...</div>
        )}
      </div>
    </div>
  );
};
