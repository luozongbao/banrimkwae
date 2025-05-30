# Database Schema Documentation
## Banrimkwae Resort Management System - Phase 1

### Overview
This document outlines the database schema design for Phase 1 of the Banrimkwae Resort Management System, focusing on user management, roles, permissions, and system settings.

### Database Tables

#### 1. Users Table
**Table Name:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| first_name | varchar(255) | NOT NULL | User's first name |
| last_name | varchar(255) | NOT NULL | User's last name |
| email | varchar(255) | NOT NULL, UNIQUE | User's email address |
| username | varchar(255) | UNIQUE, NULLABLE | User's username |
| phone | varchar(255) | NULLABLE | User's phone number |
| department | varchar(255) | NULLABLE | User's department |
| position | varchar(255) | NULLABLE | User's job position |
| email_verified_at | timestamp | NULLABLE | Email verification timestamp |
| password | varchar(255) | NOT NULL | Hashed password |
| avatar | varchar(255) | NULLABLE | Avatar file path |
| status | enum('active', 'inactive', 'suspended') | DEFAULT 'active' | User status |
| start_date | date | NULLABLE | Employment start date |
| end_date | date | NULLABLE | Employment end date |
| force_password_change | boolean | DEFAULT false | Force password change flag |
| last_login_at | timestamp | NULLABLE | Last login timestamp |
| last_login_ip | varchar(255) | NULLABLE | Last login IP address |
| preferences | json | NULLABLE | User preferences |
| remember_token | varchar(100) | NULLABLE | Remember token for sessions |
| created_at | timestamp | NOT NULL | Record creation timestamp |
| updated_at | timestamp | NOT NULL | Record update timestamp |

**Indexes:**
- `users_status_email_index` on (status, email)
- `users_department_status_index` on (department, status)

#### 2. Settings Table
**Table Name:** `settings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| key | varchar(255) | NOT NULL, UNIQUE | Setting key |
| value | text | NULLABLE | Setting value |
| type | varchar(255) | DEFAULT 'string' | Data type (string, integer, boolean, json) |
| category | varchar(255) | DEFAULT 'general' | Setting category |
| group | varchar(255) | NULLABLE | Setting group |
| description | text | NULLABLE | Setting description |
| is_public | boolean | DEFAULT false | Whether setting is publicly accessible |
| is_editable | boolean | DEFAULT true | Whether setting can be edited |
| validation_rules | json | NULLABLE | Validation rules for the setting |
| sort_order | integer | DEFAULT 0 | Display sort order |
| created_at | timestamp | NOT NULL | Record creation timestamp |
| updated_at | timestamp | NOT NULL | Record update timestamp |

**Indexes:**
- `settings_category_is_public_index` on (category, is_public)
- `settings_group_sort_order_index` on (group, sort_order)

#### 3. Roles Table (Spatie Permission)
**Table Name:** `roles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | varchar(255) | NOT NULL | Role name |
| guard_name | varchar(255) | NOT NULL | Guard name |
| created_at | timestamp | NOT NULL | Record creation timestamp |
| updated_at | timestamp | NOT NULL | Record update timestamp |

**Unique Index:** `roles_name_guard_name_unique` on (name, guard_name)

#### 4. Permissions Table (Spatie Permission)
**Table Name:** `permissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | varchar(255) | NOT NULL | Permission name |
| guard_name | varchar(255) | NOT NULL | Guard name |
| created_at | timestamp | NOT NULL | Record creation timestamp |
| updated_at | timestamp | NOT NULL | Record update timestamp |

**Unique Index:** `permissions_name_guard_name_unique` on (name, guard_name)

#### 5. Model Has Roles Table (Spatie Permission)
**Table Name:** `model_has_roles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | bigint unsigned | FOREIGN KEY | Reference to roles.id |
| model_type | varchar(255) | NOT NULL | Model class name |
| model_id | bigint unsigned | NOT NULL | Model instance ID |

**Foreign Keys:**
- `model_has_roles_role_id_foreign` references `roles(id)` ON DELETE CASCADE

#### 6. Model Has Permissions Table (Spatie Permission)
**Table Name:** `model_has_permissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| permission_id | bigint unsigned | FOREIGN KEY | Reference to permissions.id |
| model_type | varchar(255) | NOT NULL | Model class name |
| model_id | bigint unsigned | NOT NULL | Model instance ID |

**Foreign Keys:**
- `model_has_permissions_permission_id_foreign` references `permissions(id)` ON DELETE CASCADE

#### 7. Role Has Permissions Table (Spatie Permission)
**Table Name:** `role_has_permissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| permission_id | bigint unsigned | FOREIGN KEY | Reference to permissions.id |
| role_id | bigint unsigned | FOREIGN KEY | Reference to roles.id |

**Foreign Keys:**
- `role_has_permissions_permission_id_foreign` references `permissions(id)` ON DELETE CASCADE
- `role_has_permissions_role_id_foreign` references `roles(id)` ON DELETE CASCADE

#### 8. Activity Log Table (Spatie Activity Log)
**Table Name:** `activity_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| log_name | varchar(255) | NULLABLE | Log name/channel |
| description | text | NOT NULL | Activity description |
| subject_type | varchar(255) | NULLABLE | Subject model type |
| event | varchar(255) | NULLABLE | Event type |
| subject_id | bigint unsigned | NULLABLE | Subject model ID |
| causer_type | varchar(255) | NULLABLE | Causer model type |
| causer_id | bigint unsigned | NULLABLE | Causer model ID |
| properties | json | NULLABLE | Additional properties |
| batch_uuid | char(36) | NULLABLE | Batch UUID |
| created_at | timestamp | NOT NULL | Record creation timestamp |
| updated_at | timestamp | NOT NULL | Record update timestamp |

**Indexes:**
- `subject` on (subject_type, subject_id)
- `causer` on (causer_type, causer_id)
- `activity_log_log_name_index` on (log_name)

### Default Data

#### Roles
- **admin**: Full system access
- **manager**: User and settings management
- **officer**: Limited user viewing
- **staff**: Profile management only
- **guest**: Basic profile access

#### Permissions
- User Management: view, create, edit, delete, manage
- Role Management: view, create, edit, delete, assign
- Settings Management: view, edit, manage
- System Administration: admin, logs, backup
- Profile Management: view, edit

#### Default Users
- **admin@banrimkwae.com**: System Administrator (admin role)
- **manager@banrimkwae.com**: Resort Manager (manager role)

#### Default Settings
- Application settings (name, logo)
- Resort information (name, address, contact)
- Security settings (password requirements, session timeout)

### Relationships

#### User Model Relationships
- Has many roles (through Spatie Permission)
- Has many permissions (through Spatie Permission)
- Has many activity logs (as causer)
- Can be subject of activity logs

#### Setting Model Relationships
- No direct relationships (standalone configuration)

### Migration Files
1. `0001_01_01_000000_create_users_table.php` - Users table
2. `2024_01_01_000002_create_settings_table.php` - Settings table
3. `2025_05_30_014139_create_permission_tables.php` - Spatie Permission tables
4. `2025_05_30_014147_create_activity_log_table.php` - Activity log table
5. `2025_05_30_014148_add_event_column_to_activity_log_table.php` - Activity log event column
6. `2025_05_30_014149_add_batch_uuid_column_to_activity_log_table.php` - Activity log batch UUID

### Seeder Files
1. `RolesAndPermissionsSeeder.php` - Initial roles and permissions
2. `SettingsSeeder.php` - Default application settings
3. `UserSeeder.php` - Default admin and manager users
4. `DatabaseSeeder.php` - Main seeder orchestrator

### Factory Files
1. `UserFactory.php` - User model factory for testing
2. `SettingFactory.php` - Setting model factory for testing

### Performance Considerations
- Indexes added on frequently queried columns
- JSON columns used for flexible data storage
- Proper foreign key constraints for data integrity
- Optimized for read-heavy operations typical in user management systems

### Security Features
- Password hashing using Laravel's built-in bcrypt
- Role-based access control through Spatie Permission
- Activity logging for audit trails
- Session management with remember tokens
- Force password change capability
- User status management (active/inactive/suspended)
