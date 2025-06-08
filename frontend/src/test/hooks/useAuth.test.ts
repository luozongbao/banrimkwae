import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('automatically authenticates mock user after loading', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Wait for the useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.name).toBe('Admin User');
    expect(result.current.user?.email).toBe('admin@banrimkwae.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Reset user to test login
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    // Test login
    await act(async () => {
      await result.current.login('admin@banrimkwae.com', 'password123');
    });
    
    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.email).toBe('admin@banrimkwae.com');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles logout correctly', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Wait for initial authentication
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // Test logout
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('provides correct authentication status', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Initially not authenticated
    expect(result.current.isAuthenticated).toBe(false);
    
    // After loading, should be authenticated with mock user
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // After logout, should not be authenticated
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
  });
});
