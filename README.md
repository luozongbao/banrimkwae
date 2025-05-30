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

## Recently Implemented (Phase 1 Issue #05)

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
