import React, { useState, useEffect } from 'react';
import { useMaintenanceSettings } from '../../hooks/useSettings';
import type { MaintenanceSettings } from '../../services/settingsAPI';
import { Toggle } from '../ui/Toggle';

export const MaintenanceSettingsComponent: React.FC = () => {
  const {
    settings,
    isLoading,
    error,
    updateSettings
  } = useMaintenanceSettings();

  const [formData, setFormData] = useState<MaintenanceSettings>({
    systemMaintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'System is under maintenance. Please check back later.',
      allowedIps: [],
      scheduleMaintenanceStart: '',
      scheduleMaintenanceEnd: ''
    },
    monitoring: {
      healthChecks: {
        enabled: true,
        interval: 300,
        endpoints: ['/api/health', '/api/database', '/api/cache'],
        alertThreshold: 5
      },
      performanceMetrics: {
        enabled: true,
        retentionDays: 30,
        alertOnHighCpu: true,
        alertOnHighMemory: true,
        alertOnHighDisk: true
      },
      errorTracking: {
        enabled: true,
        retentionDays: 30,
        alertOnErrors: true
      }
    },
    cacheManagement: {
      enabled: true,
      defaultTtl: 3600,
      maxSize: 1024,
      compressionEnabled: true
    },
    security: {
      autoUpdates: {
        enabled: false,
        maintenanceWindow: '02:00-04:00',
        includePatch: true,
        includeMinor: false,
        includeMajor: false
      },
      ipBlocking: {
        enabled: true,
        blockedIps: [],
        maxAttemptsBeforeBlock: 5,
        blockDuration: 3600
      },
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        burstAllowance: 10
      }
    },
    logging: {
      logLevel: 'info',
      retentionDays: 30,
      enableFileLogging: true,
      enableDatabaseLogging: true,
      maxLogFileSize: 10
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (
    category: keyof MaintenanceSettings,
    subcategory: string | null,
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev: MaintenanceSettings) => {
      if (subcategory) {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [subcategory]: {
              ...(prev[category] as any)[subcategory],
              [field]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [field]: value
          }
        };
      }
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save maintenance settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      setHasUnsavedChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Failed to load maintenance settings: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Settings</h2>
          <p className="text-gray-600 mt-1">Configure system maintenance and monitoring</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Maintenance</h3>
        
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">Put the system in maintenance mode</p>
            </div>
            <Toggle
              checked={formData.systemMaintenance.maintenanceMode}
              onChange={(checked) => handleInputChange('systemMaintenance', null, 'maintenanceMode', checked)}
            />
          </div>

          {/* Maintenance Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Message
            </label>
            <textarea
              value={formData.systemMaintenance.maintenanceMessage}
              onChange={(e) => handleInputChange('systemMaintenance', null, 'maintenanceMessage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* System Monitoring */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Monitoring</h3>

        {/* Health Checks */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Health Checks</h4>
              <p className="text-sm text-gray-600">Monitor system health endpoints</p>
            </div>
            <Toggle
              checked={formData.monitoring.healthChecks.enabled}
              onChange={(checked) => handleInputChange('monitoring', 'healthChecks', 'enabled', checked)}
            />
          </div>

          {formData.monitoring.healthChecks.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Interval (seconds)
                </label>
                <input
                  type="number"
                  value={formData.monitoring.healthChecks.interval}
                  onChange={(e) => handleInputChange('monitoring', 'healthChecks', 'interval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (failures)
                </label>
                <input
                  type="number"
                  value={formData.monitoring.healthChecks.alertThreshold}
                  onChange={(e) => handleInputChange('monitoring', 'healthChecks', 'alertThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cache Management</h3>
            <p className="text-sm text-gray-600">Configure system caching</p>
          </div>
          <Toggle
            checked={formData.cacheManagement.enabled}
            onChange={(checked) => handleInputChange('cacheManagement', null, 'enabled', checked)}
          />
        </div>

        {formData.cacheManagement.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default TTL (seconds)
              </label>
              <input
                type="number"
                value={formData.cacheManagement.defaultTtl}
                onChange={(e) => handleInputChange('cacheManagement', null, 'defaultTtl', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Size (MB)
              </label>
              <input
                type="number"
                value={formData.cacheManagement.maxSize}
                onChange={(e) => handleInputChange('cacheManagement', null, 'maxSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div className="flex items-center">
              <Toggle
                checked={formData.cacheManagement.compressionEnabled}
                onChange={(checked) => handleInputChange('cacheManagement', null, 'compressionEnabled', checked)}
                size="sm"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Compression</label>
            </div>
          </div>
        )}
      </div>

      {/* Logging */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logging Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Log Level
            </label>
            <select
              value={formData.logging.logLevel}
              onChange={(e) => handleInputChange('logging', null, 'logLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retention Days
            </label>
            <input
              type="number"
              value={formData.logging.retentionDays}
              onChange={(e) => handleInputChange('logging', null, 'retentionDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">You have unsaved changes. Don't forget to save your settings.</p>
        </div>
      )}
    </div>
  );
};
