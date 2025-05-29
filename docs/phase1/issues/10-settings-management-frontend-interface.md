# Issue #10: Settings Management Frontend Interface

## Priority: Medium
## Estimated Time: 16-20 hours
## Dependencies: Issues #06, #07

## Description
Implement the complete settings management frontend interface including system settings, security configuration, backup management, notification preferences, and maintenance tools. This issue covers the admin settings wireframes and system configuration management.

## Acceptance Criteria
- [ ] System settings dashboard with tabbed interface
- [ ] General settings form with resort information
- [ ] Security settings with password policies
- [ ] Backup and maintenance configuration
- [ ] Notification settings management
- [ ] Integration settings for external services
- [ ] Real-time settings validation
- [ ] Settings export/import functionality
- [ ] Activity logging for setting changes
- [ ] Multi-environment configuration support
- [ ] Settings reset and rollback capabilities
- [ ] Proper permission-based access control

## Implementation Details

### 1. Settings Management Page

Create `src/pages/settings/SettingsPage.tsx`:
```tsx
import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SettingsTabs } from '../../components/settings/SettingsTabs';
import { GeneralSettings } from '../../components/settings/GeneralSettings';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { BackupSettings } from '../../components/settings/BackupSettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';
import { IntegrationSettings } from '../../components/settings/IntegrationSettings';
import { MaintenanceSettings } from '../../components/settings/MaintenanceSettings';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettings } from '../../hooks/useSettings';
import { 
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const { exportSettings, importSettings, getSettingsHistory } = useSettings();

  const handleExportSettings = async () => {
    try {
      await exportSettings();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportSettings = async (file: File) => {
    try {
      await importSettings(file);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const pageHeaderActions = (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        onClick={handleExportSettings}
        leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
      >
        {t('settings.exportSettings')}
      </Button>
      
      <Button
        variant="outline"
        leftIcon={<DocumentArrowUpIcon className="h-4 w-4" />}
      >
        {t('settings.importSettings')}
      </Button>
      
      <Button
        variant="outline"
        onClick={() => getSettingsHistory()}
        leftIcon={<ClockIcon className="h-4 w-4" />}
      >
        {t('settings.history')}
      </Button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'backup':
        return <BackupSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'maintenance':
        return <MaintenanceSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.systemSettings')}
        description={t('settings.manageSystemConfiguration')}
        icon={<Cog6ToothIcon className="h-6 w-6" />}
        actions={pageHeaderActions}
      />

      <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
        <div className="lg:w-64 flex-shrink-0">
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
```

### 2. Settings Tab Navigation

Create `src/components/settings/SettingsTabs.tsx`:
```tsx
import React from 'react';
import { Card } from '../ui/Card';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  BellIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const tabs = [
    {
      key: 'general',
      label: t('settings.general'),
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
      description: t('settings.generalDescription'),
      permission: 'settings.general',
    },
    {
      key: 'security',
      label: t('settings.security'),
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      description: t('settings.securityDescription'),
      permission: 'settings.security',
    },
    {
      key: 'backup',
      label: t('settings.backup'),
      icon: <CloudArrowUpIcon className="h-5 w-5" />,
      description: t('settings.backupDescription'),
      permission: 'settings.backup',
    },
    {
      key: 'notifications',
      label: t('settings.notifications'),
      icon: <BellIcon className="h-5 w-5" />,
      description: t('settings.notificationsDescription'),
      permission: 'settings.notifications',
    },
    {
      key: 'integrations',
      label: t('settings.integrations'),
      icon: <PuzzlePieceIcon className="h-5 w-5" />,
      description: t('settings.integrationsDescription'),
      permission: 'settings.integrations',
    },
    {
      key: 'maintenance',
      label: t('settings.maintenance'),
      icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
      description: t('settings.maintenanceDescription'),
      permission: 'settings.maintenance',
    },
  ];

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) || user?.permissions.includes('settings.*');
  };

  const visibleTabs = tabs.filter(tab => hasPermission(tab.permission));

  return (
    <Card className="p-2">
      <nav className="space-y-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`w-full flex items-start space-x-3 px-3 py-3 text-left rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-resort-blue-50 text-resort-blue-700 border-l-2 border-resort-blue-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {tab.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs text-gray-500 mt-1">
                {tab.description}
              </div>
            </div>
          </button>
        ))}
      </nav>
    </Card>
  );
};
```

### 3. General Settings Component

Create `src/components/settings/GeneralSettings.tsx`:
```tsx
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { Alert } from '../ui/Alert';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useSettings';
import { timezones, currencies, languages } from '../../constants/settings';

export const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    uploadLogo,
  } = useGeneralSettings();

  const [formData, setFormData] = useState({
    resort_name: settings.resort_name || '',
    address_line_1: settings.address_line_1 || '',
    address_line_2: settings.address_line_2 || '',
    city: settings.city || '',
    state: settings.state || '',
    postal_code: settings.postal_code || '',
    country: settings.country || '',
    phone: settings.phone || '',
    email: settings.email || '',
    website: settings.website || '',
    timezone: settings.timezone || 'Asia/Bangkok',
    default_language: settings.default_language || 'th',
    currency: settings.currency || 'THB',
    date_format: settings.date_format || 'DD/MM/YYYY',
    time_format: settings.time_format || '24',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      await uploadLogo(file);
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      resort_name: settings.resort_name || '',
      address_line_1: settings.address_line_1 || '',
      address_line_2: settings.address_line_2 || '',
      city: settings.city || '',
      state: settings.state || '',
      postal_code: settings.postal_code || '',
      country: settings.country || '',
      phone: settings.phone || '',
      email: settings.email || '',
      website: settings.website || '',
      timezone: settings.timezone || 'Asia/Bangkok',
      default_language: settings.default_language || 'th',
      currency: settings.currency || 'THB',
      date_format: settings.date_format || 'DD/MM/YYYY',
      time_format: settings.time_format || '24',
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Resort Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.resortInformation')}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FileUpload
                label={t('settings.resortLogo')}
                accept="image/*"
                onChange={handleLogoUpload}
                preview={settings.logo_url}
                help={t('settings.logoHelp')}
              />
            </div>

            <Input
              label={t('settings.resortName')}
              value={formData.resort_name}
              onChange={(value) => handleInputChange('resort_name', value)}
              required
            />

            <Input
              label={t('settings.email')}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              required
            />

            <Input
              label={t('settings.phone')}
              type="tel"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
            />

            <Input
              label={t('settings.website')}
              type="url"
              value={formData.website}
              onChange={(value) => handleInputChange('website', value)}
            />
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {t('settings.address')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t('settings.addressLine1')}
                  value={formData.address_line_1}
                  onChange={(value) => handleInputChange('address_line_1', value)}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label={t('settings.addressLine2')}
                  value={formData.address_line_2}
                  onChange={(value) => handleInputChange('address_line_2', value)}
                />
              </div>

              <Input
                label={t('settings.city')}
                value={formData.city}
                onChange={(value) => handleInputChange('city', value)}
              />

              <Input
                label={t('settings.state')}
                value={formData.state}
                onChange={(value) => handleInputChange('state', value)}
              />

              <Input
                label={t('settings.postalCode')}
                value={formData.postal_code}
                onChange={(value) => handleInputChange('postal_code', value)}
              />

              <Input
                label={t('settings.country')}
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Localization Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.localization')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t('settings.timezone')}
            value={formData.timezone}
            onChange={(value) => handleInputChange('timezone', value)}
            options={timezones}
            searchable
          />

          <Select
            label={t('settings.defaultLanguage')}
            value={formData.default_language}
            onChange={(value) => handleInputChange('default_language', value)}
            options={languages}
          />

          <Select
            label={t('settings.currency')}
            value={formData.currency}
            onChange={(value) => handleInputChange('currency', value)}
            options={currencies}
            searchable
          />

          <Select
            label={t('settings.dateFormat')}
            value={formData.date_format}
            onChange={(value) => handleInputChange('date_format', value)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />

          <Select
            label={t('settings.timeFormat')}
            value={formData.time_format}
            onChange={(value) => handleInputChange('time_format', value)}
            options={[
              { value: '12', label: t('settings.12hour') },
              { value: '24', label: t('settings.24hour') },
            ]}
          />
        </div>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-yellow-800">
                {t('settings.unsavedChanges')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                {t('common.reset')}
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                {t('settings.saveSettings')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
```

### 4. Security Settings Component

Create `src/components/settings/SecuritySettings.tsx`:
```tsx
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Toggle } from '../ui/Toggle';
import { useTranslation } from '../../hooks/useTranslation';
import { useSecuritySettings } from '../../hooks/useSettings';

export const SecuritySettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    testEmailConfiguration,
  } = useSecuritySettings();

  const [formData, setFormData] = useState({
    // Password Policy
    min_password_length: settings.min_password_length || 8,
    require_uppercase: settings.require_uppercase || true,
    require_lowercase: settings.require_lowercase || true,
    require_numbers: settings.require_numbers || true,
    require_special_chars: settings.require_special_chars || true,
    password_history_count: settings.password_history_count || 5,
    password_expiry_days: settings.password_expiry_days || 90,
    
    // Session Management
    session_timeout_minutes: settings.session_timeout_minutes || 30,
    max_concurrent_sessions: settings.max_concurrent_sessions || 3,
    remember_me_days: settings.remember_me_days || 30,
    
    // Login Security
    max_login_attempts: settings.max_login_attempts || 5,
    lockout_duration_minutes: settings.lockout_duration_minutes || 15,
    require_email_verification: settings.require_email_verification || true,
    
    // Two-Factor Authentication
    enable_2fa: settings.enable_2fa || false,
    force_2fa_for_admins: settings.force_2fa_for_admins || true,
    
    // Activity Logging
    log_user_activities: settings.log_user_activities || true,
    log_admin_activities: settings.log_admin_activities || true,
    log_retention_days: settings.log_retention_days || 365,
    
    // API Security
    api_rate_limit_per_minute: settings.api_rate_limit_per_minute || 60,
    enable_cors: settings.enable_cors || true,
    allowed_origins: settings.allowed_origins || '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Password Policy */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.passwordPolicy')}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('settings.minPasswordLength')}
              type="number"
              value={String(formData.min_password_length)}
              onChange={(value) => handleInputChange('min_password_length', Number(value))}
              min="6"
              max="50"
            />

            <Input
              label={t('settings.passwordHistoryCount')}
              type="number"
              value={String(formData.password_history_count)}
              onChange={(value) => handleInputChange('password_history_count', Number(value))}
              min="0"
              max="20"
              help={t('settings.passwordHistoryHelp')}
            />

            <Input
              label={t('settings.passwordExpiryDays')}
              type="number"
              value={String(formData.password_expiry_days)}
              onChange={(value) => handleInputChange('password_expiry_days', Number(value))}
              min="0"
              max="365"
              help={t('settings.passwordExpiryHelp')}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {t('settings.passwordRequirements')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                checked={formData.require_uppercase}
                onChange={(checked) => handleInputChange('require_uppercase', checked)}
                label={t('settings.requireUppercase')}
              />
              
              <Checkbox
                checked={formData.require_lowercase}
                onChange={(checked) => handleInputChange('require_lowercase', checked)}
                label={t('settings.requireLowercase')}
              />
              
              <Checkbox
                checked={formData.require_numbers}
                onChange={(checked) => handleInputChange('require_numbers', checked)}
                label={t('settings.requireNumbers')}
              />
              
              <Checkbox
                checked={formData.require_special_chars}
                onChange={(checked) => handleInputChange('require_special_chars', checked)}
                label={t('settings.requireSpecialChars')}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Session Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.sessionManagement')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label={t('settings.sessionTimeout')}
            value={String(formData.session_timeout_minutes)}
            onChange={(value) => handleInputChange('session_timeout_minutes', Number(value))}
            options={[
              { value: '15', label: t('settings.minutes', { count: 15 }) },
              { value: '30', label: t('settings.minutes', { count: 30 }) },
              { value: '60', label: t('settings.hour', { count: 1 }) },
              { value: '120', label: t('settings.hours', { count: 2 }) },
              { value: '480', label: t('settings.hours', { count: 8 }) },
            ]}
          />

          <Input
            label={t('settings.maxConcurrentSessions')}
            type="number"
            value={String(formData.max_concurrent_sessions)}
            onChange={(value) => handleInputChange('max_concurrent_sessions', Number(value))}
            min="1"
            max="10"
          />

          <Input
            label={t('settings.rememberMeDays')}
            type="number"
            value={String(formData.remember_me_days)}
            onChange={(value) => handleInputChange('remember_me_days', Number(value))}
            min="1"
            max="365"
          />
        </div>
      </Card>

      {/* Login Security */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.loginSecurity')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label={t('settings.maxLoginAttempts')}
            type="number"
            value={String(formData.max_login_attempts)}
            onChange={(value) => handleInputChange('max_login_attempts', Number(value))}
            min="3"
            max="10"
          />

          <Input
            label={t('settings.lockoutDuration')}
            type="number"
            value={String(formData.lockout_duration_minutes)}
            onChange={(value) => handleInputChange('lockout_duration_minutes', Number(value))}
            min="5"
            max="120"
            help={t('settings.lockoutDurationHelp')}
          />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t('settings.requireEmailVerification')}
            </label>
            <Toggle
              checked={formData.require_email_verification}
              onChange={(checked) => handleInputChange('require_email_verification', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.twoFactorAuth')}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.enable2FA')}
              </label>
              <p className="text-sm text-gray-500">
                {t('settings.enable2FADescription')}
              </p>
            </div>
            <Toggle
              checked={formData.enable_2fa}
              onChange={(checked) => handleInputChange('enable_2fa', checked)}
            />
          </div>

          {formData.enable_2fa && (
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.force2FAForAdmins')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('settings.force2FAForAdminsDescription')}
                </p>
              </div>
              <Toggle
                checked={formData.force_2fa_for_admins}
                onChange={(checked) => handleInputChange('force_2fa_for_admins', checked)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Activity Logging */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.activityLogging')}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings.logUserActivities')}
              </label>
              <Toggle
                checked={formData.log_user_activities}
                onChange={(checked) => handleInputChange('log_user_activities', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings.logAdminActivities')}
              </label>
              <Toggle
                checked={formData.log_admin_activities}
                onChange={(checked) => handleInputChange('log_admin_activities', checked)}
              />
            </div>
          </div>

          <Input
            label={t('settings.logRetentionDays')}
            type="number"
            value={String(formData.log_retention_days)}
            onChange={(value) => handleInputChange('log_retention_days', Number(value))}
            min="30"
            max="365"
            help={t('settings.logRetentionHelp')}
            className="w-48"
          />
        </div>
      </Card>

      {/* API Security */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.apiSecurity')}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('settings.apiRateLimit')}
              type="number"
              value={String(formData.api_rate_limit_per_minute)}
              onChange={(value) => handleInputChange('api_rate_limit_per_minute', Number(value))}
              min="10"
              max="1000"
              help={t('settings.apiRateLimitHelp')}
            />

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.enableCORS')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('settings.enableCORSDescription')}
                </p>
              </div>
              <Toggle
                checked={formData.enable_cors}
                onChange={(checked) => handleInputChange('enable_cors', checked)}
              />
            </div>
          </div>

          {formData.enable_cors && (
            <Input
              label={t('settings.allowedOrigins')}
              value={formData.allowed_origins}
              onChange={(value) => handleInputChange('allowed_origins', value)}
              placeholder="https://example.com, https://app.example.com"
              help={t('settings.allowedOriginsHelp')}
            />
          )}
        </div>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-yellow-800">
                {t('settings.unsavedChanges')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={isSaving}
              >
                {t('common.reset')}
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                {t('settings.saveSettings')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
```

### 5. Settings Hooks

Create `src/hooks/useSettings.ts`:
```tsx
import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/settingsAPI';

export const useGeneralSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await settingsAPI.getGeneralSettings();
      setSettings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (data: any) => {
    const response = await settingsAPI.updateGeneralSettings(data);
    setSettings(response.data);
  };

  const uploadLogo = async (file: File) => {
    const response = await settingsAPI.uploadLogo(file);
    setSettings(prev => ({ ...prev, logo_url: response.data.logo_url }));
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    uploadLogo,
    refetch: fetchSettings,
  };
};

export const useSecuritySettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await settingsAPI.getSecuritySettings();
      setSettings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (data: any) => {
    const response = await settingsAPI.updateSecuritySettings(data);
    setSettings(response.data);
  };

  const testEmailConfiguration = async () => {
    await settingsAPI.testEmailConfiguration();
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    testEmailConfiguration,
    refetch: fetchSettings,
  };
};

export const useSettings = () => {
  const exportSettings = async () => {
    await settingsAPI.exportSettings();
  };

  const importSettings = async (file: File) => {
    await settingsAPI.importSettings(file);
  };

  const getSettingsHistory = async () => {
    const response = await settingsAPI.getSettingsHistory();
    return response.data;
  };

  return {
    exportSettings,
    importSettings,
    getSettingsHistory,
  };
};
```

### 6. Settings Constants

Create `src/constants/settings.ts`:
```tsx
export const timezones = [
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
];

export const currencies = [
  { value: 'THB', label: 'Thai Baht (THB)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
];

export const languages = [
  { value: 'th', label: 'ไทย (Thai)' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
];
```

## Testing Criteria
- [ ] Settings tabs navigate correctly
- [ ] General settings form saves and validates properly
- [ ] Security settings update password policies
- [ ] File upload for logo works correctly
- [ ] Settings changes are tracked and can be reset
- [ ] Export/import functionality works
- [ ] Permission-based access control is enforced
- [ ] Real-time validation provides feedback
- [ ] Mobile responsive design functions properly
- [ ] Settings history tracking works correctly

## Related Issues
- **Depends on**: Issue #06 (Frontend Design System), Issue #07 (Frontend Authentication)
- **Blocks**: Issue #11 (Dashboard Implementation), Issue #12 (Testing and Deployment)

## Notes
- Implement proper validation for all settings
- Add confirmation dialogs for critical changes
- Ensure settings changes are logged for audit purposes
- Consider implementing setting templates for different environments
- Add proper error handling and rollback capabilities
- Implement real-time settings synchronization for multi-server setups
