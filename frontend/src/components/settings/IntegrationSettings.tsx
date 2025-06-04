import React, { useState, useEffect } from 'react';
import { useIntegrationSettings } from '../../hooks/useSettings';
import type { IntegrationSettings } from '../../services/settingsAPI';
import { Toggle } from '../ui/Toggle';

export const IntegrationSettingsComponent: React.FC = () => {
  const {
    settings,
    isLoading: loading,
    error,
    updateSettings: saveSettings
  } = useIntegrationSettings();

  const [formData, setFormData] = useState<IntegrationSettings>({
    paymentGateways: {
      stripe: {
        enabled: false,
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        testMode: true
      },
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        sandboxMode: true
      },
      promptpay: {
        enabled: false,
        merchantId: '',
        terminalId: ''
      }
    },
    bookingPlatforms: {
      agoda: {
        enabled: false,
        hotelId: '',
        username: '',
        password: '',
        syncInventory: true,
        syncRates: true
      },
      booking: {
        enabled: false,
        propertyId: '',
        username: '',
        password: '',
        syncInventory: true,
        syncRates: true
      },
      expedia: {
        enabled: false,
        hotelId: '',
        username: '',
        password: '',
        syncInventory: true,
        syncRates: true
      }
    },
    communicationServices: {
      twilioSms: {
        enabled: false,
        accountSid: '',
        authToken: '',
        fromNumber: ''
      },
      lineNotify: {
        enabled: false,
        accessToken: ''
      },
      fcm: {
        enabled: false,
        serverKey: '',
        senderId: ''
      }
    },
    cloudServices: {
      googleDrive: {
        enabled: false,
        serviceAccountKey: '',
        folderId: ''
      },
      dropbox: {
        enabled: false,
        accessToken: '',
        appKey: ''
      },
      aws: {
        enabled: false,
        accessKeyId: '',
        secretAccessKey: '',
        region: 'ap-southeast-1',
        bucket: ''
      }
    },
    analyticsServices: {
      googleAnalytics: {
        enabled: false,
        trackingId: '',
        measurementId: ''
      },
      facebookPixel: {
        enabled: false,
        pixelId: ''
      }
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (
    category: keyof IntegrationSettings,
    service: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev: IntegrationSettings) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [service]: {
          ...(prev[category] as any)[service],
          [field]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveSettings(formData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save integration settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      setHasUnsavedChanges(false);
    }
  };

  const handleTestConnection = async (category: string, service: string) => {
    try {
      // Mock test connection - replace with actual API call
      const result = { success: true, error: null };
      setTestResults(prev => ({
        ...prev,
        [`${category}_${service}`]: result.success ? 'Connection successful!' : result.error || 'Connection failed'
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [`${category}_${service}`]: 'Connection failed'
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Failed to load integration settings: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integration Settings</h2>
          <p className="text-gray-600 mt-1">Configure third-party service integrations</p>
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

      {/* Payment Gateways */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateways</h3>
        
        {/* Stripe */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Stripe</h4>
              <p className="text-sm text-gray-600">Accept credit card payments via Stripe</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleTestConnection('paymentGateways', 'stripe')}
                disabled={!formData.paymentGateways.stripe.enabled}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Test
              </button>
              <Toggle
                checked={formData.paymentGateways.stripe.enabled}
                onChange={(checked) => handleInputChange('paymentGateways', 'stripe', 'enabled', checked)}
              />
            </div>
          </div>
          {formData.paymentGateways.stripe.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key
                </label>
                <input
                  type="text"
                  value={formData.paymentGateways.stripe.publicKey}
                  onChange={(e) => handleInputChange('paymentGateways', 'stripe', 'publicKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pk_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={formData.paymentGateways.stripe.secretKey}
                  onChange={(e) => handleInputChange('paymentGateways', 'stripe', 'secretKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={formData.paymentGateways.stripe.webhookSecret}
                  onChange={(e) => handleInputChange('paymentGateways', 'stripe', 'webhookSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="whsec_..."
                />
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={formData.paymentGateways.stripe.testMode}
                  onChange={(checked) => handleInputChange('paymentGateways', 'stripe', 'testMode', checked)}
                  size="sm"
                />
                <label className="ml-2 text-sm text-gray-700">Test Mode</label>
              </div>
            </div>
          )}
          {testResults.paymentGateways_stripe && (
            <div className={`text-sm p-2 rounded ${
              testResults.paymentGateways_stripe.includes('successful') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResults.paymentGateways_stripe}
            </div>
          )}
        </div>

        {/* PayPal */}
        <div className="space-y-4 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">PayPal</h4>
              <p className="text-sm text-gray-600">Accept payments via PayPal</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleTestConnection('paymentGateways', 'paypal')}
                disabled={!formData.paymentGateways.paypal.enabled}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Test
              </button>
              <Toggle
                checked={formData.paymentGateways.paypal.enabled}
                onChange={(checked) => handleInputChange('paymentGateways', 'paypal', 'enabled', checked)}
              />
            </div>
          </div>
          {formData.paymentGateways.paypal.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.paymentGateways.paypal.clientId}
                  onChange={(e) => handleInputChange('paymentGateways', 'paypal', 'clientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={formData.paymentGateways.paypal.clientSecret}
                  onChange={(e) => handleInputChange('paymentGateways', 'paypal', 'clientSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={formData.paymentGateways.paypal.sandboxMode}
                  onChange={(checked) => handleInputChange('paymentGateways', 'paypal', 'sandboxMode', checked)}
                  size="sm"
                />
                <label className="ml-2 text-sm text-gray-700">Sandbox Mode</label>
              </div>
            </div>
          )}
          {testResults.paymentGateways_paypal && (
            <div className={`text-sm p-2 rounded ${
              testResults.paymentGateways_paypal.includes('successful') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResults.paymentGateways_paypal}
            </div>
          )}
        </div>

        {/* PromptPay */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">PromptPay</h4>
              <p className="text-sm text-gray-600">Accept QR code payments via PromptPay</p>
            </div>
            <Toggle
              checked={formData.paymentGateways.promptpay.enabled}
              onChange={(checked) => handleInputChange('paymentGateways', 'promptpay', 'enabled', checked)}
            />
          </div>
          {formData.paymentGateways.promptpay.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant ID
                </label>
                <input
                  type="text"
                  value={formData.paymentGateways.promptpay.merchantId}
                  onChange={(e) => handleInputChange('paymentGateways', 'promptpay', 'merchantId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terminal ID
                </label>
                <input
                  type="text"
                  value={formData.paymentGateways.promptpay.terminalId}
                  onChange={(e) => handleInputChange('paymentGateways', 'promptpay', 'terminalId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Platforms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Platforms</h3>
        
        {Object.entries(formData.bookingPlatforms).map(([platform, config]) => {
          const typedConfig = config as any; // Type assertion for complex nested types
          return (
          <div key={platform} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">{platform}</h4>
                <p className="text-sm text-gray-600">Sync inventory and rates with {platform}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleTestConnection('bookingPlatforms', platform)}
                  disabled={!typedConfig.enabled}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Test
                </button>
                <Toggle
                  checked={typedConfig.enabled}
                  onChange={(checked) => handleInputChange('bookingPlatforms', platform, 'enabled', checked)}
                />
              </div>
            </div>
            {typedConfig.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {platform === 'agoda' || platform === 'expedia' ? 'Hotel ID' : 'Property ID'}
                  </label>
                  <input
                    type="text"
                    value={platform === 'booking' ? typedConfig.propertyId : typedConfig.hotelId}
                    onChange={(e) => handleInputChange('bookingPlatforms', platform, platform === 'booking' ? 'propertyId' : 'hotelId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={typedConfig.username}
                    onChange={(e) => handleInputChange('bookingPlatforms', platform, 'username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={typedConfig.password}
                    onChange={(e) => handleInputChange('bookingPlatforms', platform, 'password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Toggle
                      checked={typedConfig.syncInventory}
                      onChange={(checked) => handleInputChange('bookingPlatforms', platform, 'syncInventory', checked)}
                      size="sm"
                    />
                    <label className="ml-2 text-sm text-gray-700">Sync Inventory</label>
                  </div>
                  <div className="flex items-center">
                    <Toggle
                      checked={typedConfig.syncRates}
                      onChange={(checked) => handleInputChange('bookingPlatforms', platform, 'syncRates', checked)}
                      size="sm"
                    />
                    <label className="ml-2 text-sm text-gray-700">Sync Rates</label>
                  </div>
                </div>
              </div>
            )}
            {testResults[`bookingPlatforms_${platform}`] && (
              <div className={`text-sm p-2 rounded ${
                testResults[`bookingPlatforms_${platform}`].includes('successful') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {testResults[`bookingPlatforms_${platform}`]}
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Communication Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Services</h3>
        
        {/* Twilio SMS */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Twilio SMS</h4>
              <p className="text-sm text-gray-600">Send SMS notifications via Twilio</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleTestConnection('communicationServices', 'twilioSms')}
                disabled={!formData.communicationServices.twilioSms.enabled}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Test
              </button>
              <Toggle
                checked={formData.communicationServices.twilioSms.enabled}
                onChange={(checked) => handleInputChange('communicationServices', 'twilioSms', 'enabled', checked)}
              />
            </div>
          </div>
          {formData.communicationServices.twilioSms.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account SID
                </label>
                <input
                  type="text"
                  value={formData.communicationServices.twilioSms.accountSid}
                  onChange={(e) => handleInputChange('communicationServices', 'twilioSms', 'accountSid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={formData.communicationServices.twilioSms.authToken}
                  onChange={(e) => handleInputChange('communicationServices', 'twilioSms', 'authToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Number
                </label>
                <input
                  type="text"
                  value={formData.communicationServices.twilioSms.fromNumber}
                  onChange={(e) => handleInputChange('communicationServices', 'twilioSms', 'fromNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          )}
          {testResults.communicationServices_twilioSms && (
            <div className={`text-sm p-2 rounded ${
              testResults.communicationServices_twilioSms.includes('successful') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResults.communicationServices_twilioSms}
            </div>
          )}
        </div>

        {/* LINE Notify */}
        <div className="space-y-4 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">LINE Notify</h4>
              <p className="text-sm text-gray-600">Send notifications via LINE</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleTestConnection('communicationServices', 'lineNotify')}
                disabled={!formData.communicationServices.lineNotify.enabled}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Test
              </button>
              <Toggle
                checked={formData.communicationServices.lineNotify.enabled}
                onChange={(checked) => handleInputChange('communicationServices', 'lineNotify', 'enabled', checked)}
              />
            </div>
          </div>
          {formData.communicationServices.lineNotify.enabled && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                value={formData.communicationServices.lineNotify.accessToken}
                onChange={(e) => handleInputChange('communicationServices', 'lineNotify', 'accessToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {testResults.communicationServices_lineNotify && (
            <div className={`text-sm p-2 rounded ${
              testResults.communicationServices_lineNotify.includes('successful') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResults.communicationServices_lineNotify}
            </div>
          )}
        </div>

        {/* Firebase Cloud Messaging */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Firebase Cloud Messaging</h4>
              <p className="text-sm text-gray-600">Send push notifications via FCM</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleTestConnection('communicationServices', 'fcm')}
                disabled={!formData.communicationServices.fcm.enabled}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Test
              </button>
              <Toggle
                checked={formData.communicationServices.fcm.enabled}
                onChange={(checked) => handleInputChange('communicationServices', 'fcm', 'enabled', checked)}
              />
            </div>
          </div>
          {formData.communicationServices.fcm.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server Key
                </label>
                <input
                  type="password"
                  value={formData.communicationServices.fcm.serverKey}
                  onChange={(e) => handleInputChange('communicationServices', 'fcm', 'serverKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender ID
                </label>
                <input
                  type="text"
                  value={formData.communicationServices.fcm.senderId}
                  onChange={(e) => handleInputChange('communicationServices', 'fcm', 'senderId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          {testResults.communicationServices_fcm && (
            <div className={`text-sm p-2 rounded ${
              testResults.communicationServices_fcm.includes('successful') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResults.communicationServices_fcm}
            </div>
          )}
        </div>
      </div>

      {/* Cloud Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cloud Storage Services</h3>
        
        {Object.entries(formData.cloudServices).map(([service, config]) => {
          const typedConfig = config as any; // Type assertion for complex nested types
          return (
          <div key={service} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {service === 'googleDrive' ? 'Google Drive' : 
                   service === 'dropbox' ? 'Dropbox' : 
                   service === 'aws' ? 'Amazon S3' : service}
                </h4>
                <p className="text-sm text-gray-600">Store files in {service}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleTestConnection('cloudServices', service)}
                  disabled={!typedConfig.enabled}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Test
                </button>
                <Toggle
                  checked={typedConfig.enabled}
                  onChange={(checked) => handleInputChange('cloudServices', service, 'enabled', checked)}
                />
              </div>
            </div>
            {typedConfig.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                {service === 'googleDrive' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Account Key (JSON)
                      </label>
                      <textarea
                        value={typedConfig.serviceAccountKey}
                        onChange={(e) => handleInputChange('cloudServices', service, 'serviceAccountKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder='{"type": "service_account", ...}'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Folder ID
                      </label>
                      <input
                        type="text"
                        value={typedConfig.folderId}
                        onChange={(e) => handleInputChange('cloudServices', service, 'folderId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                {service === 'dropbox' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={typedConfig.accessToken}
                        onChange={(e) => handleInputChange('cloudServices', service, 'accessToken', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        App Key
                      </label>
                      <input
                        type="text"
                        value={typedConfig.appKey}
                        onChange={(e) => handleInputChange('cloudServices', service, 'appKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                {service === 'aws' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Key ID
                      </label>
                      <input
                        type="text"
                        value={typedConfig.accessKeyId}
                        onChange={(e) => handleInputChange('cloudServices', service, 'accessKeyId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secret Access Key
                      </label>
                      <input
                        type="password"
                        value={typedConfig.secretAccessKey}
                        onChange={(e) => handleInputChange('cloudServices', service, 'secretAccessKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <select
                        value={typedConfig.region}
                        onChange={(e) => handleInputChange('cloudServices', service, 'region', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">Europe (Ireland)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bucket Name
                      </label>
                      <input
                        type="text"
                        value={typedConfig.bucket}
                        onChange={(e) => handleInputChange('cloudServices', service, 'bucket', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            {testResults[`cloudServices_${service}`] && (
              <div className={`text-sm p-2 rounded ${
                testResults[`cloudServices_${service}`].includes('successful') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {testResults[`cloudServices_${service}`]}
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Analytics Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Services</h3>
        
        {/* Google Analytics */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Google Analytics</h4>
              <p className="text-sm text-gray-600">Track website analytics with Google Analytics</p>
            </div>
            <Toggle
              checked={formData.analyticsServices.googleAnalytics.enabled}
              onChange={(checked) => handleInputChange('analyticsServices', 'googleAnalytics', 'enabled', checked)}
            />
          </div>
          {formData.analyticsServices.googleAnalytics.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking ID
                </label>
                <input
                  type="text"
                  value={formData.analyticsServices.googleAnalytics.trackingId}
                  onChange={(e) => handleInputChange('analyticsServices', 'googleAnalytics', 'trackingId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UA-XXXXXXXXX-X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement ID
                </label>
                <input
                  type="text"
                  value={formData.analyticsServices.googleAnalytics.measurementId}
                  onChange={(e) => handleInputChange('analyticsServices', 'googleAnalytics', 'measurementId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          )}
        </div>

        {/* Facebook Pixel */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Facebook Pixel</h4>
              <p className="text-sm text-gray-600">Track conversions with Facebook Pixel</p>
            </div>
            <Toggle
              checked={formData.analyticsServices.facebookPixel.enabled}
              onChange={(checked) => handleInputChange('analyticsServices', 'facebookPixel', 'enabled', checked)}
            />
          </div>
          {formData.analyticsServices.facebookPixel.enabled && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pixel ID
              </label>
              <input
                type="text"
                value={formData.analyticsServices.facebookPixel.pixelId}
                onChange={(e) => handleInputChange('analyticsServices', 'facebookPixel', 'pixelId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XXXXXXXXXXXXXXX"
              />
            </div>
          )}
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
