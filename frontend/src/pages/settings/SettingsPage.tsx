import React, { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader'
import { SettingsTabs } from '../../components/settings/SettingsTabs'
import { GeneralSettings } from '../../components/settings/GeneralSettings'
import { SecuritySettings } from '../../components/settings/SecuritySettings'
import { BackupSettings } from '../../components/settings/BackupSettings'
import { NotificationSettings } from '../../components/settings/NotificationSettings'
import { IntegrationSettingsComponent } from '../../components/settings/IntegrationSettings'
import { MaintenanceSettingsComponent } from '../../components/settings/MaintenanceSettings'
import { Button } from '../../components/ui/Button'
import { useTranslation } from '../../hooks/useTranslation'
import { useSettings } from '../../hooks/useSettings'
import { 
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('general')
  const { exportSettings, importSettings, getSettingsHistory } = useSettings()

  const handleExportSettings = async () => {
    try {
      await exportSettings()
    } catch (error) {
      console.error('Export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      await importSettings(file)
      // You could add a toast notification here
      window.location.reload() // Refresh to show new settings
    } catch (error) {
      console.error('Import failed:', error)
      // You could add a toast notification here
    }
  }

  const handleViewHistory = async () => {
    try {
      const history = await getSettingsHistory()
      console.log('Settings history:', history)
      // You could open a modal to show history
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const pageHeaderActions = (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        onClick={handleExportSettings}
        leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
      >
        {t('settings.exportSettings') || 'Export Settings'}
      </Button>
      
      <label className="cursor-pointer">
        <Button
          variant="outline"
          leftIcon={<DocumentArrowUpIcon className="h-4 w-4" />}
        >
          {t('settings.importSettings') || 'Import Settings'}
        </Button>
        <input
          type="file"
          accept=".json"
          onChange={handleImportSettings}
          className="hidden"
        />
      </label>
      
      <Button
        variant="outline"
        onClick={handleViewHistory}
        leftIcon={<ClockIcon className="h-4 w-4" />}
      >
        {t('settings.history') || 'History'}
      </Button>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />
      case 'security':
        return <SecuritySettings />
      case 'backup':
        return <BackupSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'integrations':
        return <IntegrationSettingsComponent />
      case 'maintenance':
        return <MaintenanceSettingsComponent />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.systemSettings') || 'System Settings'}
        description={t('settings.manageSystemConfiguration') || 'Manage system configuration and preferences'}
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
  )
}
