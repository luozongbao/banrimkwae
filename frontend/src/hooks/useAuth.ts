import { useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Mock user for development
const mockUser: User = {
  id: 1,
  name: 'Admin User',
  email: 'admin@banrimkwae.com',
  avatar_url: '/avatars/default.png',
  role: 'admin'
};

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing auth session
    const timer = setTimeout(() => {
      // For development, always return the mock user as authenticated
      setUser(mockUser);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(mockUser);
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };
};
