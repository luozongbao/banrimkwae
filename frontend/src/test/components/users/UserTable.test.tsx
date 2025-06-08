import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../utils';
import { UserTable } from '../../../components/users/UserTable';
import type { User } from '../../../types/user';

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@banrimkwae.com',
    phone: '+66123456789',
    role: { id: 1, name: 'Admin' },
    status: 'active',
    avatar: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@banrimkwae.com',
    phone: '+66987654321',
    role: { id: 2, name: 'Staff' },
    status: 'inactive',
    avatar: null,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z'
  }
];

const defaultProps = {
  users: mockUsers,
  isLoading: false,
  error: null,
  selectedUsers: [],
  onSelectionChange: jest.fn(),
  onEditUser: jest.fn(),
  onRefresh: jest.fn(),
  pagination: {
    current: 1,
    pageSize: 10,
    total: 2
  },
  onPageChange: jest.fn(),
  onPageSizeChange: jest.fn()
};

describe('UserTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user table with correct data', () => {
    render(<UserTable {...defaultProps} />);
    
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john@banrimkwae.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@banrimkwae.com')).toBeInTheDocument();
  });

  test('displays loading state correctly', () => {
    render(<UserTable {...defaultProps} isLoading={true} users={[]} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('displays error state correctly', () => {
    const errorMessage = 'Failed to load users';
    render(<UserTable {...defaultProps} error={errorMessage} users={[]} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('displays empty state when no users', () => {
    render(<UserTable {...defaultProps} users={[]} />);
    
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  test('handles user selection correctly', async () => {
    render(<UserTable {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Click first user checkbox (index 0 is select all)
    
    await waitFor(() => {
      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([1]);
    });
  });

  test('handles edit user action', async () => {
    render(<UserTable {...defaultProps} />);
    
    const editButtons = screen.getAllByLabelText(/edit user/i);
    fireEvent.click(editButtons[0]);
    
    await waitFor(() => {
      expect(defaultProps.onEditUser).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  test('handles refresh action', async () => {
    render(<UserTable {...defaultProps} />);
    
    const refreshButton = screen.getByLabelText(/refresh/i);
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });
  });

  test('handles pagination correctly', async () => {
    const paginationProps = {
      ...defaultProps,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 25
      }
    };
    
    render(<UserTable {...paginationProps} />);
    
    const nextButton = screen.getByLabelText(/next page/i);
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });
  });

  test('displays user status badges correctly', () => {
    render(<UserTable {...defaultProps} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('displays user roles correctly', () => {
    render(<UserTable {...defaultProps} />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
  });

  test('supports bulk selection', async () => {
    render(<UserTable {...defaultProps} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    fireEvent.click(selectAllCheckbox);
    
    await waitFor(() => {
      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([1, 2]);
    });
  });

  test('shows selected count when users are selected', () => {
    render(<UserTable {...defaultProps} selectedUsers={[1]} />);
    
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });
});
