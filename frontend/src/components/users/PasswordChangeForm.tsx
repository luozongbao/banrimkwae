import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { usersAPI } from '../../services/usersAPI';
import { useTranslation } from '../../hooks/useTranslation';

interface PasswordChangeFormProps {
  userId: number;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      setError(t('validation.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('validation.minLength', { field: t('users.password'), length: 8 }));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await usersAPI.changePassword(userId, formData);
      setSuccess(true);
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('users.passwordChangeError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        {t('users.changePassword')}
      </h3>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {success && (
        <Alert type="success" message={t('users.passwordChangedSuccessfully')} className="mb-6" />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t('users.currentPassword')}
          type="password"
          value={formData.current_password}
          onChange={(e) => handleInputChange('current_password', e.target.value)}
          required
        />

        <Input
          label={t('users.newPassword')}
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          required
        />

        <Input
          label={t('users.confirmNewPassword')}
          type="password"
          value={formData.password_confirmation}
          onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
          required
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {t('users.changePassword')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
