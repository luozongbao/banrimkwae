import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { Alert } from '../ui/Alert';
import { useRoles } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import type { CreateUserData, User } from '../../types/user';
import { generatePassword } from '../../utils/password';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  submitButtonText: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading,
  error,
  submitButtonText,
}) => {
  const { t } = useTranslation();
  const { roles } = useRoles();
  const { departments } = useDepartments();

  const [formData, setFormData] = useState<CreateUserData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    username: user?.username || '',
    password: '',
    password_confirmation: '',
    role_id: user?.role.id || 0,
    department_id: user?.department_id || 0,
    position: user?.position || '',
    start_date: user?.start_date || '',
    avatar: null,
    is_active: user?.is_active ?? true,
    send_welcome_email: true,
    require_password_change: !user,
    expires_at: user?.expires_at || '',
    email_notifications: user?.email_notifications ?? true,
    sms_notifications: user?.sms_notifications ?? true,
    push_notifications: user?.push_notifications ?? false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateUserData, value: any) => {
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

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      password_confirmation: newPassword,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = t('validation.required', { field: t('users.firstName') });
    }

    if (!formData.last_name.trim()) {
      errors.last_name = t('validation.required', { field: t('users.lastName') });
    }

    if (!formData.email.trim()) {
      errors.email = t('validation.required', { field: t('users.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.invalidEmail');
    }

    if (!user && !formData.password) {
      errors.password = t('validation.required', { field: t('users.password') });
    } else if (formData.password && formData.password.length < 8) {
      errors.password = t('validation.minLength', { field: t('users.password'), length: 8 });
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = t('validation.passwordMismatch');
    }

    if (!formData.role_id) {
      errors.role_id = t('validation.required', { field: t('users.role') });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(formData);
  };

  const roleOptions = roles.map(role => ({
    value: String(role.id),
    label: role.display_name,
  }));

  const departmentOptions = [
    { value: '', label: t('users.selectDepartment') },
    ...departments.map(dept => ({
      value: String(dept.id),
      label: dept.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.personalInformation')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FileUpload
              label={t('users.profilePhoto')}
              accept="image/*"
              onChange={(file) => handleInputChange('avatar', file)}
              preview={user?.avatar}
              className="mb-4"
            />
          </div>

          <Input
            label={t('users.firstName')}
            value={formData.first_name}
            onChange={(value) => handleInputChange('first_name', value)}
            error={validationErrors.first_name}
            required
          />

          <Input
            label={t('users.lastName')}
            value={formData.last_name}
            onChange={(value) => handleInputChange('last_name', value)}
            error={validationErrors.last_name}
            required
          />

          <Input
            label={t('users.email')}
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={validationErrors.email}
            required
          />

          <Input
            label={t('users.phone')}
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={validationErrors.phone}
          />
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.accountInformation')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t('users.username')}
            value={formData.username}
            onChange={(value) => handleInputChange('username', value)}
            error={validationErrors.username}
          />

          <div className="space-y-4">
            <div className="flex items-end space-x-2">
              <Input
                label={t('users.password')}
                type="password"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                error={validationErrors.password}
                required={!user}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                className="whitespace-nowrap"
              >
                {t('users.generateRandom')}
              </Button>
            </div>

            <Input
              label={t('users.confirmPassword')}
              type="password"
              value={formData.password_confirmation}
              onChange={(value) => handleInputChange('password_confirmation', value)}
              error={validationErrors.password_confirmation}
              required={!!formData.password}
            />
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.roleAndPermissions')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t('users.primaryRole')}
            value={String(formData.role_id)}
            onChange={(value) => handleInputChange('role_id', Number(value))}
            options={roleOptions}
            error={validationErrors.role_id}
            required
          />

          <Select
            label={t('users.department')}
            value={String(formData.department_id)}
            onChange={(value) => handleInputChange('department_id', Number(value))}
            options={departmentOptions}
          />

          <Input
            label={t('users.position')}
            value={formData.position}
            onChange={(value) => handleInputChange('position', value)}
          />

          <Input
            label={t('users.startDate')}
            type="date"
            value={formData.start_date}
            onChange={(value) => handleInputChange('start_date', value)}
          />
        </div>
      </div>

      {/* Additional Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.additionalSettings')}
        </h3>
        
        <div className="space-y-4">
          {!user && (
            <>
              <Checkbox
                checked={formData.send_welcome_email}
                onChange={(checked) => handleInputChange('send_welcome_email', checked)}
                label={t('users.sendWelcomeEmail')}
              />
              
              <Checkbox
                checked={formData.require_password_change}
                onChange={(checked) => handleInputChange('require_password_change', checked)}
                label={t('users.requirePasswordChange')}
              />
            </>
          )}

          <div className="flex items-center space-x-4">
            <Checkbox
              checked={formData.is_active}
              onChange={(checked) => handleInputChange('is_active', checked)}
              label={t('users.accountActive')}
            />
            
            <Input
              label={t('users.accountExpires')}
              type="date"
              value={formData.expires_at}
              onChange={(value) => handleInputChange('expires_at', value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.notifications')}
        </h3>
        
        <div className="space-y-4">
          <Checkbox
            checked={formData.email_notifications}
            onChange={(checked) => handleInputChange('email_notifications', checked)}
            label={t('users.emailNotifications')}
          />
          
          <Checkbox
            checked={formData.sms_notifications}
            onChange={(checked) => handleInputChange('sms_notifications', checked)}
            label={t('users.smsNotifications')}
          />
          
          <Checkbox
            checked={formData.push_notifications}
            onChange={(checked) => handleInputChange('push_notifications', checked)}
            label={t('users.pushNotifications')}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
