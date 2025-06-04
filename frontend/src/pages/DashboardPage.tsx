import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '../components/ui/Button';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import ErrorBoundary from '../components/ui/ErrorBoundary';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('common.resortName')}
              </h1>
              <p className="text-gray-600 text-sm">
                {t('dashboard.welcomeBack', { name: user?.name || 'User' })}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              size="sm"
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <DashboardLayout />
        </ErrorBoundary>
      </main>
    </div>
  );
};
