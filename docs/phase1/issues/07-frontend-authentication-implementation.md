# Issue #07: Frontend Authentication Implementation

## Priority: High
## Estimated Time: 16-20 hours
## Dependencies: Issues #04, #05, #06

## Description
Implement the frontend authentication system including login page, authentication state management, protected routes, and authentication context providers. This issue covers the complete frontend authentication flow based on the wireframe specifications.

## Acceptance Criteria
- [ ] Responsive login page with proper form validation
- [ ] Authentication state management with React Context
- [ ] Protected route system for authenticated pages
- [ ] Token management and refresh functionality
- [ ] Multi-language support (Thai/English)
- [ ] "Remember me" functionality
- [ ] Password visibility toggle
- [ ] Form submission with loading states
- [ ] Error handling and display
- [ ] Automatic logout on token expiration

## Implementation Details

### 1. Authentication Context Provider

Create `src/contexts/AuthContext.tsx`:
```tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User, LoginCredentials } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await authAPI.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } catch (error) {
          localStorage.removeItem('auth_token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login(credentials);
      
      if (credentials.remember) {
        localStorage.setItem('auth_token', response.token);
      } else {
        sessionStorage.setItem('auth_token', response.token);
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      clearError,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2. Protected Route Component

Create `src/components/auth/ProtectedRoute.tsx`:
```tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasPermission = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
```

### 3. Login Page Component

Create `src/pages/auth/LoginPage.tsx`:
```tsx
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
      errors.email = t('validation.required', { field: t('auth.email') });
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
                onChange={(value) => handleInputChange('email', value)}
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
                  onChange={(value) => handleInputChange('password', value)}
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
                onChange={(checked) => handleInputChange('remember', checked)}
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
```

### 4. API Service for Authentication

Create `src/services/authAPI.ts`:
```tsx
import { api } from './api';
import { LoginCredentials, AuthResponse, User } from '../types/auth';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};
```

### 5. Authentication Types

Create `src/types/auth.ts`:
```tsx
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: Role;
  permissions: string[];
  department?: string;
  position?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}
```

### 6. Translation Hook and Translations

Create `src/hooks/useTranslation.ts`:
```tsx
import { useState, useEffect } from 'react';

interface TranslationData {
  [key: string]: string | TranslationData;
}

const translations = {
  en: {
    common: {
      language: 'Language',
      resortName: 'BANRIMKWAE RESORT',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
    },
    auth: {
      managementSystem: 'Management System',
      loginToSystem: 'LOGIN TO SYSTEM',
      emailOrUsername: 'Email/Username',
      password: 'Password',
      rememberMe: 'Remember me',
      login: 'Login',
      loggingIn: 'Logging in...',
      forgotPassword: 'Forgot Password?',
      needHelp: 'Need Help?',
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      logout: 'Logout',
    },
    validation: {
      required: '{field} is required',
      invalidEmail: 'Please enter a valid email address',
      minLength: '{field} must be at least {length} characters',
    },
  },
  th: {
    common: {
      language: 'ภาษา',
      resortName: 'บ้านริมแคว รีสอร์ท',
      loading: 'กำลังโหลด...',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      edit: 'แก้ไข',
      delete: 'ลบ',
      add: 'เพิ่ม',
      search: 'ค้นหา',
      filter: 'กรอง',
      export: 'ส่งออก',
      import: 'นำเข้า',
    },
    auth: {
      managementSystem: 'ระบบจัดการ',
      loginToSystem: 'เข้าสู่ระบบ',
      emailOrUsername: 'อีเมล/ชื่อผู้ใช้',
      password: 'รหัสผ่าน',
      rememberMe: 'จดจำฉันไว้',
      login: 'เข้าสู่ระบบ',
      loggingIn: 'กำลังเข้าสู่ระบบ...',
      forgotPassword: 'ลืมรหัสผ่าน?',
      needHelp: 'ต้องการความช่วยเหลือ?',
      enterEmail: 'กรอกอีเมลของคุณ',
      enterPassword: 'กรอกรหัสผ่านของคุณ',
      logout: 'ออกจากระบบ',
    },
    validation: {
      required: 'กรุณากรอก{field}',
      invalidEmail: 'กรุณากรอกอีเมลที่ถูกต้อง',
      minLength: '{field}ต้องมีอย่างน้อย {length} ตัวอักษร',
    },
  },
};

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'th'>(() => {
    return (localStorage.getItem('language') as 'en' | 'th') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, value);
    }

    return value;
  };

  const switchLanguage = (language: 'en' | 'th') => {
    setCurrentLanguage(language);
  };

  return {
    t,
    currentLanguage,
    switchLanguage,
  };
};
```

### 7. HTTP Interceptor for Token Management

Create `src/services/api.ts`:
```tsx
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export * from './authAPI';
```

## Testing Criteria
- [ ] Login form validation works correctly
- [ ] Authentication state persists across page reloads
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Token refresh works automatically
- [ ] Logout clears authentication state
- [ ] Language switching works on login page
- [ ] Password visibility toggle functions
- [ ] Remember me functionality works
- [ ] Error messages display correctly
- [ ] Loading states show during authentication

## Related Issues
- **Depends on**: Issue #04 (Authentication System), Issue #05 (API Controllers), Issue #06 (Frontend Design System)
- **Blocks**: Issue #08 (User Management Frontend), Issue #09 (Role Management Frontend)

## Notes
- Ensure proper error handling for network failures
- Implement proper accessibility features for the login form
- Add proper security measures for token storage
- Consider implementing biometric authentication for future phases
- Ensure the design matches the wireframe specifications exactly
