import React from 'react';
import { Card } from '../ui/Card';
import { UserForm } from './UserForm';
import { useUpdateUser } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import type { User, CreateUserData } from '../../types/user';

interface ProfileFormProps {
  user: User;
  onUpdate: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onUpdate }) => {
  const { t } = useTranslation();
  const { updateUser, isLoading } = useUpdateUser();

  const handleSubmit = async (data: CreateUserData) => {
    try {
      await updateUser(user.id, data);
      onUpdate();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Card className="p-6">
      <UserForm
        user={user}
        onSubmit={handleSubmit}
        onCancel={() => {}}
        isLoading={isLoading}
        error={null}
        submitButtonText={t('users.updateProfile')}
      />
    </Card>
  );
};
