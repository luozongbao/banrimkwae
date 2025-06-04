import { api } from './api'

export interface GeneralSettings {
  resort_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email: string
  website?: string
  timezone: string
  default_language: string
  currency: string
  date_format: string
  time_format: string
  logo_url?: string
}

export interface SecuritySettings {
  min_password_length: number
  require_uppercase: boolean
  require_lowercase: boolean
  require_numbers: boolean
  require_special_chars: boolean
  password_history_count: number
  password_expiry_days: number
  session_timeout_minutes: number
  max_concurrent_sessions: number
  remember_me_days: number
  max_login_attempts: number
  lockout_duration_minutes: number
  require_email_verification: boolean
  enable_2fa: boolean
  force_2fa_for_admins: boolean
  log_user_activities: boolean
  log_admin_activities: boolean
  log_retention_days: number
  api_rate_limit_per_minute: number
  enable_cors: boolean
  allowed_origins: string
}

export interface BackupSettings {
  auto_backup_enabled: boolean
  backup_frequency: string
  backup_retention_days: number
  backup_storage_location: string
  include_database: boolean
  include_files: boolean
  include_logs: boolean
  backup_compression: boolean
  backup_encryption: boolean
}

export interface NotificationSettings {
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  notification_preferences: {
    booking_created: boolean
    booking_cancelled: boolean
    payment_received: boolean
    system_alerts: boolean
    maintenance_mode: boolean
  }
  email_from_address: string
  email_from_name: string
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  smtp_encryption: string
}

export interface IntegrationSettings {
  paymentGateways: {
    stripe: {
      enabled: boolean
      publicKey: string
      secretKey: string
      webhookSecret: string
      testMode: boolean
    }
    paypal: {
      enabled: boolean
      clientId: string
      clientSecret: string
      sandboxMode: boolean
    }
    promptpay: {
      enabled: boolean
      merchantId: string
      terminalId: string
    }
  }
  bookingPlatforms: {
    [key: string]: {
      enabled: boolean
      propertyId?: string
      hotelId?: string
      username: string
      password: string
      syncInventory: boolean
      syncRates: boolean
    }
  }
  communicationServices: {
    twilioSms: {
      enabled: boolean
      accountSid: string
      authToken: string
      fromNumber: string
    }
    lineNotify: {
      enabled: boolean
      accessToken: string
    }
    fcm: {
      enabled: boolean
      serverKey: string
      senderId: string
    }
  }
  cloudServices: {
    [key: string]: {
      enabled: boolean
      serviceAccountKey?: string
      folderId?: string
      accessToken?: string
      appKey?: string
      accessKeyId?: string
      secretAccessKey?: string
      region?: string
      bucket?: string
    }
  }
  analyticsServices: {
    googleAnalytics: {
      enabled: boolean
      trackingId: string
      measurementId: string
    }
    facebookPixel: {
      enabled: boolean
      pixelId: string
    }
  }
}

export interface MaintenanceSettings {
  systemMaintenance: {
    maintenanceMode: boolean
    maintenanceMessage: string
    allowedIps: string[]
    scheduleMaintenanceStart?: string
    scheduleMaintenanceEnd?: string
  }
  monitoring: {
    healthChecks: {
      enabled: boolean
      interval: number
      endpoints: string[]
      alertThreshold: number
    }
    performanceMetrics: {
      enabled: boolean
      retentionDays: number
      alertOnHighCpu: boolean
      alertOnHighMemory: boolean
      alertOnHighDisk: boolean
    }
    errorTracking: {
      enabled: boolean
      retentionDays: number
      alertOnErrors: boolean
    }
  }
  cacheManagement: {
    enabled: boolean
    defaultTtl: number
    maxSize: number
    compressionEnabled: boolean
  }
  security: {
    autoUpdates: {
      enabled: boolean
      maintenanceWindow: string
      includePatch: boolean
      includeMinor: boolean
      includeMajor: boolean
    }
    ipBlocking: {
      enabled: boolean
      blockedIps: string[]
      maxAttemptsBeforeBlock: number
      blockDuration: number
    }
    rateLimiting: {
      enabled: boolean
      requestsPerMinute: number
      burstAllowance: number
    }
  }
  logging: {
    logLevel: string
    retentionDays: number
    enableFileLogging: boolean
    enableDatabaseLogging: boolean
    maxLogFileSize: number
  }
}

export const settingsAPI = {
  // General Settings
  getGeneralSettings: () => 
    api.get<GeneralSettings>('/api/settings/general'),
  
  updateGeneralSettings: (data: Partial<GeneralSettings>) => 
    api.put<GeneralSettings>('/api/settings/general', data),
  
  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post<{ logo_url: string }>('/api/settings/general/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Security Settings
  getSecuritySettings: () => 
    api.get<SecuritySettings>('/api/settings/security'),
  
  updateSecuritySettings: (data: Partial<SecuritySettings>) => 
    api.put<SecuritySettings>('/api/settings/security', data),
  
  testEmailConfiguration: () => 
    api.post('/api/settings/security/test-email'),

  // Backup Settings
  getBackupSettings: () => 
    api.get<BackupSettings>('/api/settings/backup'),
  
  updateBackupSettings: (data: Partial<BackupSettings>) => 
    api.put<BackupSettings>('/api/settings/backup', data),
  
  createBackup: () => 
    api.post('/api/settings/backup/create'),
  
  getBackupHistory: () => 
    api.get('/api/settings/backup/history'),

  // Notification Settings
  getNotificationSettings: () => 
    api.get<NotificationSettings>('/api/settings/notifications'),
  
  updateNotificationSettings: (data: Partial<NotificationSettings>) => 
    api.put<NotificationSettings>('/api/settings/notifications', data),
  
  testEmailNotification: () => 
    api.post('/api/settings/notifications/test-email'),

  // Integration Settings
  getIntegrationSettings: () => 
    api.get<IntegrationSettings>('/api/settings/integrations'),
  
  updateIntegrationSettings: (data: Partial<IntegrationSettings>) => 
    api.put<IntegrationSettings>('/api/settings/integrations', data),

  // Maintenance Settings
  getMaintenanceSettings: () => 
    api.get<MaintenanceSettings>('/api/settings/maintenance'),
  
  updateMaintenanceSettings: (data: Partial<MaintenanceSettings>) => 
    api.put<MaintenanceSettings>('/api/settings/maintenance', data),
  
  getSystemHealth: () => 
    api.get('/api/settings/maintenance/health'),

  // General Settings Management
  exportSettings: () => 
    api.get('/api/settings/export', { responseType: 'blob' }),
  
  importSettings: (file: File) => {
    const formData = new FormData()
    formData.append('settings', file)
    return api.post('/api/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  getSettingsHistory: () => 
    api.get('/api/settings/history'),
  
  resetSettings: (category: string) => 
    api.post(`/api/settings/${category}/reset`),
}
