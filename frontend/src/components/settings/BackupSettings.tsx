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
import { useBackupSettings } from '../../hooks/useSettings'
import { backupFrequencies } from '../../constants/settings'
import { CloudArrowUpIcon, ClockIcon } from '@heroicons/react/24/outline'

export const BackupSettings: React.FC = () => {
  const { t } = useTranslation()
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    createBackup,
    getBackupHistory,
  } = useBackupSettings()

  const [formData, setFormData] = useState({
    auto_backup_enabled: true,
    backup_frequency: 'daily',
    backup_retention_days: 30,
    backup_storage_location: 'local',
    include_database: true,
    include_files: true,
    include_logs: false,
    backup_compression: true,
    backup_encryption: false,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupHistory, setBackupHistory] = useState<any[]>([])

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        auto_backup_enabled: settings.auto_backup_enabled ?? true,
        backup_frequency: settings.backup_frequency || 'daily',
        backup_retention_days: settings.backup_retention_days || 30,
        backup_storage_location: settings.backup_storage_location || 'local',
        include_database: settings.include_database ?? true,
        include_files: settings.include_files ?? true,
        include_logs: settings.include_logs ?? false,
        backup_compression: settings.backup_compression ?? true,
        backup_encryption: settings.backup_encryption ?? false,
      })
      setHasChanges(false)
    }
  }, [settings])

  // Load backup history
  useEffect(() => {
    const loadBackupHistory = async () => {
      try {
        const history = await getBackupHistory()
        setBackupHistory(history || [])
      } catch (error) {
        console.error('Failed to load backup history:', error)
      }
    }
    loadBackupHistory()
  }, [getBackupHistory])

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

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true)
      await createBackup()
      // Refresh backup history
      const history = await getBackupHistory()
      setBackupHistory(history || [])
    } catch (error) {
      console.error('Backup creation failed:', error)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleReset = () => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        auto_backup_enabled: settings.auto_backup_enabled ?? true,
        backup_frequency: settings.backup_frequency || 'daily',
        backup_retention_days: settings.backup_retention_days || 30,
        backup_storage_location: settings.backup_storage_location || 'local',
        include_database: settings.include_database ?? true,
        include_files: settings.include_files ?? true,
        include_logs: settings.include_logs ?? false,
        backup_compression: settings.backup_compression ?? true,
        backup_encryption: settings.backup_encryption ?? false,
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

      {/* Manual Backup */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {t('settings.manualBackup') || 'Manual Backup'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('settings.manualBackupDescription') || 'Create an immediate backup of your data'}
            </p>
          </div>
          <Button
            onClick={handleCreateBackup}
            loading={isCreatingBackup}
            leftIcon={<CloudArrowUpIcon className="h-4 w-4" />}
          >
            {t('settings.createBackup') || 'Create Backup'}
          </Button>
        </div>
      </Card>

      {/* Automatic Backup Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.automaticBackup') || 'Automatic Backup'}
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('settings.enableAutoBackup') || 'Enable Automatic Backup'}
              </label>
              <p className="text-sm text-gray-500">
                {t('settings.enableAutoBackupDescription') || 'Automatically create backups on schedule'}
              </p>
            </div>
            <Toggle
              checked={formData.auto_backup_enabled}
              onChange={(checked) => handleInputChange('auto_backup_enabled', checked)}
            />
          </div>

          {formData.auto_backup_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label={t('settings.backupFrequency') || 'Backup Frequency'}
                value={formData.backup_frequency}
                onChange={(value) => handleInputChange('backup_frequency', value)}
                options={backupFrequencies}
              />

              <Input
                label={t('settings.retentionDays') || 'Retention Period (Days)'}
                type="number"
                value={String(formData.backup_retention_days)}
                onChange={(value) => handleInputChange('backup_retention_days', Number(value))}
                min="1"
                max="365"
                help={t('settings.retentionDaysHelp') || 'How long to keep backup files'}
              />

              <Select
                label={t('settings.storageLocation') || 'Storage Location'}
                value={formData.backup_storage_location}
                onChange={(value) => handleInputChange('backup_storage_location', value)}
                options={[
                  { value: 'local', label: 'Local Storage' },
                  { value: 's3', label: 'Amazon S3' },
                  { value: 'gcs', label: 'Google Cloud Storage' },
                  { value: 'azure', label: 'Azure Blob Storage' },
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Backup Content */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.backupContent') || 'Backup Content'}
        </h3>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {t('settings.includeInBackup') || 'Include in Backup'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              checked={formData.include_database}
              onChange={(checked) => handleInputChange('include_database', checked)}
              label={t('settings.includeDatabase') || 'Database'}
              description="User data, bookings, settings, etc."
            />
            
            <Checkbox
              checked={formData.include_files}
              onChange={(checked) => handleInputChange('include_files', checked)}
              label={t('settings.includeFiles') || 'Uploaded Files'}
              description="Images, documents, and other uploads"
            />
            
            <Checkbox
              checked={formData.include_logs}
              onChange={(checked) => handleInputChange('include_logs', checked)}
              label={t('settings.includeLogs') || 'System Logs'}
              description="Application and error logs"
            />
          </div>
        </div>
      </Card>

      {/* Backup Options */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.backupOptions') || 'Backup Options'}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.enableCompression') || 'Enable Compression'}
                </label>
                <p className="text-sm text-gray-500">
                  Reduce backup file size
                </p>
              </div>
              <Toggle
                checked={formData.backup_compression}
                onChange={(checked) => handleInputChange('backup_compression', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.enableEncryption') || 'Enable Encryption'}
                </label>
                <p className="text-sm text-gray-500">
                  Encrypt backup files for security
                </p>
              </div>
              <Toggle
                checked={formData.backup_encryption}
                onChange={(checked) => handleInputChange('backup_encryption', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Backup History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {t('settings.backupHistory') || 'Backup History'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ClockIcon className="h-4 w-4" />}
            onClick={async () => {
              const history = await getBackupHistory()
              setBackupHistory(history || [])
            }}
          >
            {t('common.refresh') || 'Refresh'}
          </Button>
        </div>

        {backupHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('settings.noBackupsFound') || 'No backups found'}
          </div>
        ) : (
          <div className="space-y-3">
            {backupHistory.slice(0, 10).map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-sm">
                    {backup.filename || `Backup ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {backup.created_at ? new Date(backup.created_at).toLocaleString() : 'Unknown date'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {backup.size || 'Unknown size'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Handle backup download/restore
                      console.log('Download backup:', backup)
                    }}
                  >
                    {t('common.download') || 'Download'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
