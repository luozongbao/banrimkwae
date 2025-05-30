import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { UserForm } from './UserForm';
import { useUpdateUser } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import type { CreateUserData, User } from '../../types/user';

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const { t } = useTranslation();
  const { updateUser, isLoading } = useUpdateUser();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUserData) => {
    try {
      setError(null);
      await updateUser(user.id, data);
      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('users.updateError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('users.editUser')}
      size="lg"
    >
      <UserForm
        user={user}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        error={error}
        submitButtonText={t('users.updateUser')}
      />
    </Modal>
  );
};
