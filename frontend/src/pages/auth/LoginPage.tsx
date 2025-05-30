import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Alert } from '../../components/ui/Alert';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { t, switchLanguage, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = t('validation.required', { field: t('auth.emailOrUsername') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.invalidEmail');
    }

    if (!formData.password) {
      errors.password = t('validation.required', { field: t('auth.password') });
    } else if (formData.password.length < 6) {
      errors.password = t('validation.minLength', { field: t('auth.password'), length: 6 });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-resort-blue-50 to-forest-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-resort-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">BR</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {t('common.resortName')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.managementSystem')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-xl rounded-lg px-8 py-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            {t('auth.loginToSystem')}
          </h2>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label={t('auth.emailOrUsername')}
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={validationErrors.email}
                placeholder={t('auth.enterEmail')}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={validationErrors.password}
                  placeholder={t('auth.enterPassword')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                checked={formData.remember}
                onChange={(e) => handleInputChange('remember', e.target.checked)}
                label={t('auth.rememberMe')}
              />
              
              <Link
                to="/forgot-password"
                className="text-sm text-resort-blue-600 hover:text-resort-blue-500"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t('auth.loggingIn') : t('auth.login')}
            </Button>
          </form>

          {/* Language Selector */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-600">{t('common.language')}:</span>
              <button
                onClick={() => switchLanguage('th')}
                className={`text-sm px-3 py-1 rounded ${
                  currentLanguage === 'th'
                    ? 'bg-resort-blue-100 text-resort-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ไทย
              </button>
              <button
                onClick={() => switchLanguage('en')}
                className={`text-sm px-3 py-1 rounded ${
                  currentLanguage === 'en'
                    ? 'bg-resort-blue-100 text-resort-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Help Link */}
          <div className="mt-4 text-center">
            <Link
              to="/help"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('auth.needHelp')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
