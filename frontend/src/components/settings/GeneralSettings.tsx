import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { FileUpload } from '../ui/FileUpload'
import { Alert } from '../ui/Alert'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useTranslation } from '../../hooks/useTranslation'
import { useGeneralSettings } from '../../hooks/useSettings'
import { timezones, currencies, languages, countries } from '../../constants/settings'

export const GeneralSettings: React.FC = () => {
  const { t } = useTranslation()
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    uploadLogo,
  } = useGeneralSettings()

  const [formData, setFormData] = useState({
    resort_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'Asia/Bangkok',
    default_language: 'th',
    currency: 'THB',
    date_format: 'DD/MM/YYYY',
    time_format: '24',
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
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
      })
      setHasChanges(false)
    }
  }, [settings])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleLogoUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    try {
      await uploadLogo(files[0])
    } catch (error) {
      console.error('Logo upload failed:', error)
    }
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

      {/* Resort Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.resortInformation') || 'Resort Information'}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FileUpload
                label={t('settings.resortLogo') || 'Resort Logo'}
                accept="image/*"
                onChange={handleLogoUpload}
                preview={settings.logo_url}
                help={t('settings.logoHelp') || 'Upload your resort logo (recommended size: 200x100px)'}
              />
            </div>

            <Input
              label={t('settings.resortName') || 'Resort Name'}
              value={formData.resort_name}
              onChange={(value) => handleInputChange('resort_name', value)}
              required
              placeholder="Enter resort name"
            />

            <Input
              label={t('settings.email') || 'Email'}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              required
              placeholder="info@resort.com"
            />

            <Input
              label={t('settings.phone') || 'Phone'}
              type="tel"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="+66 2 123 4567"
            />

            <Input
              label={t('settings.website') || 'Website'}
              type="url"
              value={formData.website}
              onChange={(value) => handleInputChange('website', value)}
              placeholder="https://www.resort.com"
            />
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {t('settings.address') || 'Address'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t('settings.addressLine1') || 'Address Line 1'}
                  value={formData.address_line_1}
                  onChange={(value) => handleInputChange('address_line_1', value)}
                  placeholder="Street address"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label={t('settings.addressLine2') || 'Address Line 2'}
                  value={formData.address_line_2}
                  onChange={(value) => handleInputChange('address_line_2', value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <Input
                label={t('settings.city') || 'City'}
                value={formData.city}
                onChange={(value) => handleInputChange('city', value)}
                placeholder="City"
              />

              <Input
                label={t('settings.state') || 'State/Province'}
                value={formData.state}
                onChange={(value) => handleInputChange('state', value)}
                placeholder="State or Province"
              />

              <Input
                label={t('settings.postalCode') || 'Postal Code'}
                value={formData.postal_code}
                onChange={(value) => handleInputChange('postal_code', value)}
                placeholder="Postal Code"
              />

              <Select
                label={t('settings.country') || 'Country'}
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
                options={countries}
                searchable
                placeholder="Select country"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Localization Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.localization') || 'Localization'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t('settings.timezone') || 'Timezone'}
            value={formData.timezone}
            onChange={(value) => handleInputChange('timezone', value)}
            options={timezones}
            searchable
            placeholder="Select timezone"
          />

          <Select
            label={t('settings.defaultLanguage') || 'Default Language'}
            value={formData.default_language}
            onChange={(value) => handleInputChange('default_language', value)}
            options={languages}
            placeholder="Select language"
          />

          <Select
            label={t('settings.currency') || 'Currency'}
            value={formData.currency}
            onChange={(value) => handleInputChange('currency', value)}
            options={currencies}
            searchable
            placeholder="Select currency"
          />

          <Select
            label={t('settings.dateFormat') || 'Date Format'}
            value={formData.date_format}
            onChange={(value) => handleInputChange('date_format', value)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
              { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' },
            ]}
            placeholder="Select date format"
          />

          <Select
            label={t('settings.timeFormat') || 'Time Format'}
            value={formData.time_format}
            onChange={(value) => handleInputChange('time_format', value)}
            options={[
              { value: '12', label: t('settings.12hour') || '12-hour (2:30 PM)' },
              { value: '24', label: t('settings.24hour') || '24-hour (14:30)' },
            ]}
            placeholder="Select time format"
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
