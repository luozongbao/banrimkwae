import React from 'react'
import { Card } from '../ui/Card'
import { useTranslation } from '../../hooks/useTranslation'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  BellIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline'

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const tabs = [
    {
      key: 'general',
      label: t('settings.general') || 'General',
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
      description: t('settings.generalDescription') || 'Resort information and localization',
      permission: 'settings.general',
    },
    {
      key: 'security',
      label: t('settings.security') || 'Security',
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      description: t('settings.securityDescription') || 'Password policies and access control',
      permission: 'settings.security',
    },
    {
      key: 'backup',
      label: t('settings.backup') || 'Backup',
      icon: <CloudArrowUpIcon className="h-5 w-5" />,
      description: t('settings.backupDescription') || 'Data backup and recovery',
      permission: 'settings.backup',
    },
    {
      key: 'notifications',
      label: t('settings.notifications') || 'Notifications',
      icon: <BellIcon className="h-5 w-5" />,
      description: t('settings.notificationsDescription') || 'Email and notification settings',
      permission: 'settings.notifications',
    },
    {
      key: 'integrations',
      label: t('settings.integrations') || 'Integrations',
      icon: <PuzzlePieceIcon className="h-5 w-5" />,
      description: t('settings.integrationsDescription') || 'Third-party service integrations',
      permission: 'settings.integrations',
    },
    {
      key: 'maintenance',
      label: t('settings.maintenance') || 'Maintenance',
      icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
      description: t('settings.maintenanceDescription') || 'System maintenance and health',
      permission: 'settings.maintenance',
    },
  ]

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || user?.permissions?.includes('settings.*')
  }

  const visibleTabs = tabs.filter(tab => hasPermission(tab.permission))

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
  )
}
