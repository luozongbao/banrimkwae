# Banrimkwae Resort Management System

A comprehensive resort management system built with Laravel backend and React frontend.

## Project Structure

```
├── backend/           # Laravel 12+ API backend
├── frontend/          # React 18+ TypeScript frontend
├── docs/              # Project documentation
├── config/            # Configuration files
└── database/          # Database files and backups
```

## Quick Start

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```

## Development Servers

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3001

## Tech Stack

### Backend
- Laravel 12+
- MariaDB Database
- Laravel Sanctum (Authentication)
- Spatie Laravel Permission (Role Management)
- Spatie Laravel ActivityLog (Activity Logging)
- Maatwebsite Excel (Export/Import)

### Frontend
- React 18+
- TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Query (Data Fetching)
- React Router (Routing)
- React Hook Form (Forms)
- Headless UI (Components)

## Project Status

- ✅ **Phase 1 Issue #01**: Project Setup and Infrastructure - **COMPLETED**
- ✅ **Phase 1 Issue #02**: Authentication System - **COMPLETED**
- ✅ **Phase 1 Issue #03**: Database Schema Design - **COMPLETED**
- ✅ **Phase 1 Issue #04**: Design System Implementation - **COMPLETED**
- ✅ **Phase 1 Issue #05**: API Controllers and Routes for User Management - **COMPLETED**
- ✅ **Phase 1 Issue #06**: Frontend Design System Implementation - **COMPLETED**

## Recently Implemented (Phase 1 Issue #06)

### Frontend Design System Implementation

Successfully implemented a comprehensive design system for the React frontend using TypeScript and Tailwind CSS, providing a foundation for all future UI components.

#### ✅ Completed Features:

**Enhanced Tailwind Configuration**
- Extended color palette with comprehensive brand colors (Resort Blue, Forest Green, Warm Orange, Sunset Red)
- Custom typography scales with optimized line heights
- Custom spacing, shadows, and border radius values
- Smooth animations and transitions with custom keyframes

**Base UI Components**
- **Button Component**: Multiple variants (primary, secondary, accent, outline, ghost, link, destructive), sizes, loading states, and icon support
- **Input Component**: Form inputs with labels, error states, helper text, icons, and size variants
- **Card Component**: Flexible card system with header, content, footer sections and multiple variants
- **Badge Component**: Status indicators with color variants and sizes

**Layout Components**
- **Header Component**: Responsive navigation header with user menu, notifications, settings, and mobile hamburger menu
- **Sidebar Component**: Collapsible sidebar navigation with permission-based menu items, phase indicators, and responsive behavior

**Utility Functions and Hooks**
- **Utils Library**: Class name merging, date formatting, currency formatting, text truncation, and initials generation
- **Auth Hook**: Authentication context provider with user management, login/logout functionality, and permission checking

**Global Styles and Typography**
- Custom CSS with Tailwind layers for base, components, and utilities
- Inter and Sarabun font integration for international support
- Custom scrollbar styling and component-specific utility classes

#### 📁 Files Created:

**UI Components:**
- `src/components/ui/Button.tsx` - Flexible button component with variants
- `src/components/ui/Input.tsx` - Form input component with validation states
- `src/components/ui/Card.tsx` - Card component system
- `src/components/ui/Badge.tsx` - Status badge component
- `src/components/ui/index.ts` - Component exports

**Layout Components:**
- `src/components/layout/Header.tsx` - Application header
- `src/components/layout/Sidebar.tsx` - Navigation sidebar
- `src/components/layout/index.ts` - Layout exports

**Utilities and Hooks:**
- `src/lib/utils.ts` - Utility functions
- `src/hooks/useAuth.tsx` - Authentication hook and context
- `src/styles/globals.css` - Global styles and design tokens

**Demo and Integration:**
- `src/components/DesignSystemDemo.tsx` - Interactive design system showcase
- Updated `src/App.tsx` - Demo integration
- Updated `tailwind.config.js` - Enhanced design tokens

#### 🎨 Design System Features:

**Color System:**
- Primary: Resort Blue (#2E86AB) with full 50-900 scale
- Secondary: Forest Green (#A23B72) with variants
- Accent: Warm Orange (#F18F01) for highlights
- Alert: Sunset Red (#C73E1D) for warnings/errors
- Status Colors: Success, Warning, Error, Info with full scales

**Typography & Layout:**
- Responsive font sizes from xs (12px) to 4xl (32px)
- Optimized line heights for readability
- Support for Thai language with Sarabun font
- Mobile-first responsive design approach

**Component Variants:**
- Consistent variant naming across all components
- Size system: sm, default, lg, xl, icon
- State management: loading, error, success, disabled

The design system is now ready for use in subsequent frontend development tasks including user management interfaces and authentication components.

## Previous Implementation (Phase 1 Issue #05)

### API Controllers and Routes for User Management

Successfully implemented comprehensive REST API endpoints for user management, role management, and system settings with proper validation, authorization, and error handling.

#### ✅ Completed Features:

**User Management API**
- Complete CRUD operations for users
- User search, filtering, and pagination
- User activation/deactivation
- Avatar upload and management
- Role assignment and management
- Password management with force change support

**Role Management API**
- Complete CRUD operations for roles
- Permission assignment to roles
- Protection of default system roles
- User count tracking per role

**Settings Management API**
- Settings retrieval with categorization
- Public settings endpoint (unauthenticated)
- Individual and batch settings updates
- Validation rule enforcement
- Settings type casting and value validation

**Security & Authorization**
- Permission-based access control using Spatie Laravel Permission
- Sanctum authentication middleware
- Force password change middleware integration
- Proper authorization checks for all operations

**Data Transformation & Validation**
- API Resources for consistent data formatting
- Form Request classes with comprehensive validation rules
- File upload validation (avatars with 2MB limit)
- Unique constraint handling for updates

**Activity Logging**
- Complete audit trail for all user operations
- Settings change tracking
- Role modification logging
- User creation/update/deletion tracking

#### 📁 Files Created/Modified:

**Controllers:**
- `app/Http/Controllers/Api/UserController.php` - User management endpoints
- `app/Http/Controllers/Api/RoleController.php` - Role management endpoints  
- `app/Http/Controllers/Api/SettingController.php` - Settings management endpoints

**Form Requests:**
- `app/Http/Requests/User/StoreUserRequest.php` - User creation validation
- `app/Http/Requests/User/UpdateUserRequest.php` - User update validation
- `app/Http/Requests/Role/StoreRoleRequest.php` - Role creation validation
- `app/Http/Requests/Role/UpdateRoleRequest.php` - Role update validation
- `app/Http/Requests/Setting/UpdateSettingRequest.php` - Single setting update validation
- `app/Http/Requests/Setting/UpdateSettingsRequest.php` - Batch settings update validation

**API Resources:**
- `app/Http/Resources/UserResource.php` - User data transformation
- `app/Http/Resources/RoleResource.php` - Role data transformation
- `app/Http/Resources/SettingResource.php` - Setting data transformation

**Routes:**
- `routes/api.php` - Added comprehensive API routes for all controllers

**Storage:**
- Created symbolic link for file uploads (`public/storage` → `storage/app/public`)

#### 🚀 API Endpoints Available:

**User Management:**
```
GET    /api/users                     - List users with filtering/search
POST   /api/users                     - Create new user
GET    /api/users/{user}              - Get specific user
PUT    /api/users/{user}              - Update user
DELETE /api/users/{user}              - Delete user
PATCH  /api/users/{user}/activate     - Activate user
PATCH  /api/users/{user}/deactivate   - Deactivate user
POST   /api/users/{user}/avatar       - Upload user avatar
DELETE /api/users/{user}/avatar       - Remove user avatar
```

**Role Management:**
```
GET    /api/roles                     - List all roles
POST   /api/roles                     - Create new role
GET    /api/roles/{role}              - Get specific role
PUT    /api/roles/{role}              - Update role
DELETE /api/roles/{role}              - Delete role
```

**Settings Management:**
```
GET    /api/settings/public           - Get public settings (no auth)
GET    /api/settings                  - List settings with filtering
GET    /api/settings/{setting}        - Get specific setting
PUT    /api/settings/{setting}        - Update setting
PATCH  /api/settings/batch            - Batch update settings
```

All endpoints include proper error handling, validation, and consistent JSON responses.

## Documentation

See the `docs/` folder for detailed documentation on each phase of development.
