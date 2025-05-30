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

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  phone?: string;
  avatar?: string;
  role: Role;
  department?: string;
  department_id?: number;
  position?: string;
  start_date?: string;
  is_active: boolean;
  last_login_at?: string;
  email_verified_at?: string;
  expires_at?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  username?: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  department_id?: number;
  position?: string;
  start_date?: string;
  avatar?: File | null;
  is_active: boolean;
  send_welcome_email: boolean;
  require_password_change: boolean;
  expires_at?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  department: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserActivity {
  id: number;
  type: string;
  description: string;
  timestamp?: string;
  created_at?: string;
  ipAddress?: string;
  ip_address?: string;
  userAgent?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}
