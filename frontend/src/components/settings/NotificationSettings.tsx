import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Toggle } from '../ui/Toggle'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Checkbox } from '../ui/Checkbox'
import { useTranslation } from '../../hooks/useTranslation'
import { useNotificationSettings } from '../../hooks/useSettings'
import { emailProviders } from '../../constants/settings'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation()
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    testEmailNotification,
  } = useNotificationSettings()

  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: false,
    notification_preferences: {
      booking_created: true,
      booking_cancelled: true,
      payment_received: true,
      system_alerts: true,
      maintenance_mode: true,
    },
    email_from_address: '',
    email_from_name: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        email_notifications: settings.email_notifications ?? true,
        sms_notifications: settings.sms_notifications ?? false,
        push_notifications: settings.push_notifications ?? false,
        notification_preferences: {
          booking_created: settings.notification_preferences?.booking_created ?? true,
          booking_cancelled: settings.notification_preferences?.booking_cancelled ?? true,
          payment_received: settings.notification_preferences?.payment_received ?? true,
          system_alerts: settings.notification_preferences?.system_alerts ?? true,
          maintenance_mode: settings.notification_preferences?.maintenance_mode ?? true,
        },
        email_from_address: settings.email_from_address || '',
        email_from_name: settings.email_from_name || '',
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port || 587,
        smtp_username: settings.smtp_username || '',
        smtp_password: settings.smtp_password || '',
        smtp_encryption: settings.smtp_encryption || 'tls',
      })
      setHasChanges(false)
    }
  }, [settings])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleNotificationPreferenceChange = (preference: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [preference]: value,
      }
    }))
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

  const handleTestEmail = async () => {
    try {
      setIsTesting(true)
      await testEmailNotification()
      // You could add a success toast here
    } catch (error) {
      console.error('Email test failed:', error)
      // You could add an error toast here
    } finally {
      setIsTesting(false)
    }
  }

  const handleReset = () => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        email_notifications: settings.email_notifications ?? true,
        sms_notifications: settings.sms_notifications ?? false,
        push_notifications: settings.push_notifications ?? false,
        notification_preferences: {
          booking_created: settings.notification_preferences?.booking_created ?? true,
          booking_cancelled: settings.notification_preferences?.booking_cancelled ?? true,
          payment_received: settings.notification_preferences?.payment_received ?? true,
          system_alerts: settings.notification_preferences?.system_alerts ?? true,
          maintenance_mode: settings.notification_preferences?.maintenance_mode ?? true,
        },
        email_from_address: settings.email_from_address || '',
        email_from_name: settings.email_from_name || '',
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port || 587,
        smtp_username: settings.smtp_username || '',
        smtp_password: settings.smtp_password || '',
        smtp_encryption: settings.smtp_encryption || 'tls',
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

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.notificationTypes') || 'Notification Types'}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.emailNotifications') || 'Email Notifications'}
              </label>
              <p className="text-sm text-gray-500">
                Send notifications via email
              </p>
            </div>
            <Toggle
              checked={formData.email_notifications}
              onChange={(checked) => handleInputChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.smsNotifications') || 'SMS Notifications'}
              </label>
              <p className="text-sm text-gray-500">
                Send notifications via SMS
              </p>
            </div>
            <Toggle
              checked={formData.sms_notifications}
              onChange={(checked) => handleInputChange('sms_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.pushNotifications') || 'Push Notifications'}
              </label>
              <p className="text-sm text-gray-500">
                Send browser push notifications
              </p>
            </div>
            <Toggle
              checked={formData.push_notifications}
              onChange={(checked) => handleInputChange('push_notifications', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.notificationPreferences') || 'Notification Preferences'}
        </h3>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {t('settings.sendNotificationsFor') || 'Send Notifications For'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              checked={formData.notification_preferences.booking_created}
              onChange={(checked) => handleNotificationPreferenceChange('booking_created', checked)}
              label={t('settings.bookingCreated') || 'New Bookings'}
              description="When a new booking is created"
            />
            
            <Checkbox
              checked={formData.notification_preferences.booking_cancelled}
              onChange={(checked) => handleNotificationPreferenceChange('booking_cancelled', checked)}
              label={t('settings.bookingCancelled') || 'Booking Cancellations'}
              description="When a booking is cancelled"
            />
            
            <Checkbox
              checked={formData.notification_preferences.payment_received}
              onChange={(checked) => handleNotificationPreferenceChange('payment_received', checked)}
              label={t('settings.paymentReceived') || 'Payment Received'}
              description="When payment is received"
            />
            
            <Checkbox
              checked={formData.notification_preferences.system_alerts}
              onChange={(checked) => handleNotificationPreferenceChange('system_alerts', checked)}
              label={t('settings.systemAlerts') || 'System Alerts'}
              description="Critical system notifications"
            />
            
            <Checkbox
              checked={formData.notification_preferences.maintenance_mode}
              onChange={(checked) => handleNotificationPreferenceChange('maintenance_mode', checked)}
              label={t('settings.maintenanceMode') || 'Maintenance Mode'}
              description="When system enters maintenance"
            />
          </div>
        </div>
      </Card>

      {/* Email Configuration */}
      {formData.email_notifications && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('settings.emailConfiguration') || 'Email Configuration'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestEmail}
              loading={isTesting}
              leftIcon={<EnvelopeIcon className="h-4 w-4" />}
            >
              {t('settings.testEmail') || 'Test Email'}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('settings.fromEmailAddress') || 'From Email Address'}
                type="email"
                value={formData.email_from_address}
                onChange={(value) => handleInputChange('email_from_address', value)}
                placeholder="noreply@resort.com"
                required
              />

              <Input
                label={t('settings.fromName') || 'From Name'}
                value={formData.email_from_name}
                onChange={(value) => handleInputChange('email_from_name', value)}
                placeholder="Resort Management System"
                required
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">
                {t('settings.smtpSettings') || 'SMTP Settings'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('settings.smtpHost') || 'SMTP Host'}
                  value={formData.smtp_host}
                  onChange={(value) => handleInputChange('smtp_host', value)}
                  placeholder="smtp.gmail.com"
                  required
                />

                <Input
                  label={t('settings.smtpPort') || 'SMTP Port'}
                  type="number"
                  value={String(formData.smtp_port)}
                  onChange={(value) => handleInputChange('smtp_port', Number(value))}
                  placeholder="587"
                  required
                />

                <Input
                  label={t('settings.smtpUsername') || 'SMTP Username'}
                  value={formData.smtp_username}
                  onChange={(value) => handleInputChange('smtp_username', value)}
                  placeholder="your-email@gmail.com"
                  required
                />

                <Input
                  label={t('settings.smtpPassword') || 'SMTP Password'}
                  type="password"
                  value={formData.smtp_password}
                  onChange={(value) => handleInputChange('smtp_password', value)}
                  placeholder="Your SMTP password"
                  required
                />

                <Select
                  label={t('settings.smtpEncryption') || 'SMTP Encryption'}
                  value={formData.smtp_encryption}
                  onChange={(value) => handleInputChange('smtp_encryption', value)}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'tls', label: 'TLS' },
                    { value: 'ssl', label: 'SSL' },
                  ]}
                  required
                />
              </div>
            </div>
          </div>
        </Card>
      )}

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
