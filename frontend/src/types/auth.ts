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
