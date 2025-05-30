import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { UserForm } from './UserForm';
import { useCreateUser } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import type { CreateUserData } from '../../types/user';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { t } = useTranslation();
  const { createUser, isLoading } = useCreateUser();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUserData) => {
    try {
      setError(null);
      await createUser(data);
      onUserCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('users.createError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('users.addNewUser')}
      size="lg"
    >
      <UserForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        error={error}
        submitButtonText={t('users.createUser')}
      />
    </Modal>
  );
};
