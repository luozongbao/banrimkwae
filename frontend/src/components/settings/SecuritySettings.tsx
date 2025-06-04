import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Checkbox } from '../ui/Checkbox'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Toggle } from '../ui/Toggle'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useTranslation } from '../../hooks/useTranslation'
import { useSecuritySettings } from '../../hooks/useSettings'

export const SecuritySettings: React.FC = () => {
  const { t } = useTranslation()
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    testEmailConfiguration,
  } = useSecuritySettings()

  const [formData, setFormData] = useState({
    // Password Policy
    min_password_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: true,
    password_history_count: 5,
    password_expiry_days: 90,
    
    // Session Management
    session_timeout_minutes: 30,
    max_concurrent_sessions: 3,
    remember_me_days: 30,
    
    // Login Security
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    require_email_verification: true,
    
    // Two-Factor Authentication
    enable_2fa: false,
    force_2fa_for_admins: true,
    
    // Activity Logging
    log_user_activities: true,
    log_admin_activities: true,
    log_retention_days: 365,
    
    // API Security
    api_rate_limit_per_minute: 60,
    enable_cors: true,
    allowed_origins: '',
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        min_password_length: settings.min_password_length || 8,
        require_uppercase: settings.require_uppercase || true,
        require_lowercase: settings.require_lowercase || true,
        require_numbers: settings.require_numbers || true,
        require_special_chars: settings.require_special_chars || true,
        password_history_count: settings.password_history_count || 5,
        password_expiry_days: settings.password_expiry_days || 90,
        session_timeout_minutes: settings.session_timeout_minutes || 30,
        max_concurrent_sessions: settings.max_concurrent_sessions || 3,
        remember_me_days: settings.remember_me_days || 30,
        max_login_attempts: settings.max_login_attempts || 5,
        lockout_duration_minutes: settings.lockout_duration_minutes || 15,
        require_email_verification: settings.require_email_verification || true,
        enable_2fa: settings.enable_2fa || false,
        force_2fa_for_admins: settings.force_2fa_for_admins || true,
        log_user_activities: settings.log_user_activities || true,
        log_admin_activities: settings.log_admin_activities || true,
        log_retention_days: settings.log_retention_days || 365,
        api_rate_limit_per_minute: settings.api_rate_limit_per_minute || 60,
        enable_cors: settings.enable_cors || true,
        allowed_origins: settings.allowed_origins || '',
      })
      setHasChanges(false)
    }
  }, [settings])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateSettings(formData)
      setHasChanges(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        min_password_length: settings.min_password_length || 8,
        require_uppercase: settings.require_uppercase || true,
        require_lowercase: settings.require_lowercase || true,
        require_numbers: settings.require_numbers || true,
        require_special_chars: settings.require_special_chars || true,
        password_history_count: settings.password_history_count || 5,
        password_expiry_days: settings.password_expiry_days || 90,
        session_timeout_minutes: settings.session_timeout_minutes || 30,
        max_concurrent_sessions: settings.max_concurrent_sessions || 3,
        remember_me_days: settings.remember_me_days || 30,
        max_login_attempts: settings.max_login_attempts || 5,
        lockout_duration_minutes: settings.lockout_duration_minutes || 15,
        require_email_verification: settings.require_email_verification || true,
        enable_2fa: settings.enable_2fa || false,
        force_2fa_for_admins: settings.force_2fa_for_admins || true,
        log_user_activities: settings.log_user_activities || true,
        log_admin_activities: settings.log_admin_activities || true,
        log_retention_days: settings.log_retention_days || 365,
        api_rate_limit_per_minute: settings.api_rate_limit_per_minute || 60,
        enable_cors: settings.enable_cors || true,
        allowed_origins: settings.allowed_origins || '',
      })
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Password Policy */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.passwordPolicy') || 'Password Policy'}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label={t('settings.minPasswordLength') || 'Minimum Password Length'}
              type="number"
              value={String(formData.min_password_length)}
              onChange={(value) => handleInputChange('min_password_length', Number(value))}
              min="6"
              max="50"
            />

            <Input
              label={t('settings.passwordHistoryCount') || 'Password History Count'}
              type="number"
              value={String(formData.password_history_count)}
              onChange={(value) => handleInputChange('password_history_count', Number(value))}
              min="0"
              max="20"
              help={t('settings.passwordHistoryHelp') || 'Number of previous passwords to remember'}
            />

            <Input
              label={t('settings.passwordExpiryDays') || 'Password Expiry (Days)'}
              type="number"
              value={String(formData.password_expiry_days)}
              onChange={(value) => handleInputChange('password_expiry_days', Number(value))}
              min="0"
              max="365"
              help={t('settings.passwordExpiryHelp') || 'Days until password expires (0 = never)'}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {t('settings.passwordRequirements') || 'Password Requirements'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                checked={formData.require_uppercase}
                onChange={(checked) => handleInputChange('require_uppercase', checked)}
                label={t('settings.requireUppercase') || 'Require uppercase letters'}
              />
              
              <Checkbox
                checked={formData.require_lowercase}
                onChange={(checked) => handleInputChange('require_lowercase', checked)}
                label={t('settings.requireLowercase') || 'Require lowercase letters'}
              />
              
              <Checkbox
                checked={formData.require_numbers}
                onChange={(checked) => handleInputChange('require_numbers', checked)}
                label={t('settings.requireNumbers') || 'Require numbers'}
              />
              
              <Checkbox
                checked={formData.require_special_chars}
                onChange={(checked) => handleInputChange('require_special_chars', checked)}
                label={t('settings.requireSpecialChars') || 'Require special characters'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Session Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.sessionManagement') || 'Session Management'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label={t('settings.sessionTimeout') || 'Session Timeout'}
            value={String(formData.session_timeout_minutes)}
            onChange={(value) => handleInputChange('session_timeout_minutes', Number(value))}
            options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '1 hour' },
              { value: '120', label: '2 hours' },
              { value: '480', label: '8 hours' },
            ]}
          />

          <Input
            label={t('settings.maxConcurrentSessions') || 'Max Concurrent Sessions'}
            type="number"
            value={String(formData.max_concurrent_sessions)}
            onChange={(value) => handleInputChange('max_concurrent_sessions', Number(value))}
            min="1"
            max="10"
          />

          <Input
            label={t('settings.rememberMeDays') || 'Remember Me Duration (Days)'}
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
          {t('settings.loginSecurity') || 'Login Security'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label={t('settings.maxLoginAttempts') || 'Max Login Attempts'}
            type="number"
            value={String(formData.max_login_attempts)}
            onChange={(value) => handleInputChange('max_login_attempts', Number(value))}
            min="3"
            max="10"
          />

          <Input
            label={t('settings.lockoutDuration') || 'Lockout Duration (Minutes)'}
            type="number"
            value={String(formData.lockout_duration_minutes)}
            onChange={(value) => handleInputChange('lockout_duration_minutes', Number(value))}
            min="5"
            max="120"
            help={t('settings.lockoutDurationHelp') || 'How long to lock out after failed attempts'}
          />

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.requireEmailVerification') || 'Require Email Verification'}
              </label>
              <p className="text-sm text-gray-500">
                New users must verify their email
              </p>
            </div>
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
          {t('settings.twoFactorAuth') || 'Two-Factor Authentication'}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.enable2FA') || 'Enable Two-Factor Authentication'}
              </label>
              <p className="text-sm text-gray-500">
                {t('settings.enable2FADescription') || 'Allow users to enable 2FA for their accounts'}
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
                  {t('settings.force2FAForAdmins') || 'Force 2FA for Administrators'}
                </label>
                <p className="text-sm text-gray-500">
                  {t('settings.force2FAForAdminsDescription') || 'Require all admin users to use 2FA'}
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
          {t('settings.activityLogging') || 'Activity Logging'}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings.logUserActivities') || 'Log User Activities'}
              </label>
              <Toggle
                checked={formData.log_user_activities}
                onChange={(checked) => handleInputChange('log_user_activities', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings.logAdminActivities') || 'Log Admin Activities'}
              </label>
              <Toggle
                checked={formData.log_admin_activities}
                onChange={(checked) => handleInputChange('log_admin_activities', checked)}
              />
            </div>
          </div>

          <Input
            label={t('settings.logRetentionDays') || 'Log Retention (Days)'}
            type="number"
            value={String(formData.log_retention_days)}
            onChange={(value) => handleInputChange('log_retention_days', Number(value))}
            min="30"
            max="365"
            help={t('settings.logRetentionHelp') || 'How long to keep activity logs'}
            className="w-48"
          />
        </div>
      </Card>

      {/* API Security */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.apiSecurity') || 'API Security'}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('settings.apiRateLimit') || 'API Rate Limit (per minute)'}
              type="number"
              value={String(formData.api_rate_limit_per_minute)}
              onChange={(value) => handleInputChange('api_rate_limit_per_minute', Number(value))}
              min="10"
              max="1000"
              help={t('settings.apiRateLimitHelp') || 'Maximum API requests per minute per user'}
            />

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.enableCORS') || 'Enable CORS'}
                </label>
                <p className="text-sm text-gray-500">
                  {t('settings.enableCORSDescription') || 'Allow cross-origin requests'}
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
              label={t('settings.allowedOrigins') || 'Allowed Origins'}
              value={formData.allowed_origins}
              onChange={(value) => handleInputChange('allowed_origins', value)}
              placeholder="https://example.com, https://app.example.com"
              help={t('settings.allowedOriginsHelp') || 'Comma-separated list of allowed origins'}
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
                {t('settings.unsavedChanges') || 'You have unsaved changes'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                {t('common.reset') || 'Reset'}
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                {t('settings.saveSettings') || 'Save Settings'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
