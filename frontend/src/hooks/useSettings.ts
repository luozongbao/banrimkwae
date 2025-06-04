import { useState, useEffect } from 'react'
import { settingsAPI } from '../services/settingsAPI'
import type { GeneralSettings, SecuritySettings, BackupSettings, NotificationSettings, IntegrationSettings, MaintenanceSettings } from '../services/settingsAPI'

export const useGeneralSettings = () => {
  const [settings, setSettings] = useState<GeneralSettings>({} as GeneralSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await settingsAPI.getGeneralSettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch general settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (data: Partial<GeneralSettings>) => {
    const response = await settingsAPI.updateGeneralSettings(data)
    setSettings(response.data)
    return response.data
  }

  const uploadLogo = async (file: File) => {
    const response = await settingsAPI.uploadLogo(file)
    setSettings(prev => ({ ...prev, logo_url: response.data.logo_url }))
    return response.data
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    uploadLogo,
    refetch: fetchSettings,
  }
}

export const useSecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings>({} as SecuritySettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await settingsAPI.getSecuritySettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch security settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (data: Partial<SecuritySettings>) => {
    const response = await settingsAPI.updateSecuritySettings(data)
    setSettings(response.data)
    return response.data
  }

  const testEmailConfiguration = async () => {
    await settingsAPI.testEmailConfiguration()
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    testEmailConfiguration,
    refetch: fetchSettings,
  }
}

export const useBackupSettings = () => {
  const [settings, setSettings] = useState<BackupSettings>({} as BackupSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await settingsAPI.getBackupSettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch backup settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (data: Partial<BackupSettings>) => {
    const response = await settingsAPI.updateBackupSettings(data)
    setSettings(response.data)
    return response.data
  }

  const createBackup = async () => {
    await settingsAPI.createBackup()
  }

  const getBackupHistory = async () => {
    const response = await settingsAPI.getBackupHistory()
    return response.data
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    createBackup,
    getBackupHistory,
    refetch: fetchSettings,
  }
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({} as NotificationSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await settingsAPI.getNotificationSettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (data: Partial<NotificationSettings>) => {
    const response = await settingsAPI.updateNotificationSettings(data)
    setSettings(response.data)
    return response.data
  }

  const testEmailNotification = async () => {
    await settingsAPI.testEmailNotification()
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    testEmailNotification,
    refetch: fetchSettings,
  }
}

export const useIntegrationSettings = () => {
  const [settings, setSettings] = useState<IntegrationSettings>({} as IntegrationSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await settingsAPI.getIntegrationSettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch integration settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (data: Partial<IntegrationSettings>) => {
    const response = await settingsAPI.updateIntegrationSettings(data)
    setSettings(response.data)
    return response.data
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings,
  }
}

export const useMaintenanceSettings = () => {
  const [settings, setSettings] = useState<MaintenanceSettings>({} as MaintenanceSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await settingsAPI.getMaintenanceSettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch maintenance settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (data: Partial<MaintenanceSettings>) => {
    const response = await settingsAPI.updateMaintenanceSettings(data)
    setSettings(response.data)
    return response.data
  }

  const getSystemHealth = async () => {
    const response = await settingsAPI.getSystemHealth()
    return response.data
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    getSystemHealth,
    refetch: fetchSettings,
  }
}

export const useSettings = () => {
  const exportSettings = async () => {
    try {
      const response = await settingsAPI.exportSettings()
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  const importSettings = async (file: File) => {
    await settingsAPI.importSettings(file)
  }

  const getSettingsHistory = async () => {
    const response = await settingsAPI.getSettingsHistory()
    return response.data
  }

  const resetSettings = async (category: string) => {
    await settingsAPI.resetSettings(category)
  }

  return {
    exportSettings,
    importSettings,
    getSettingsHistory,
    resetSettings,
  }
}
