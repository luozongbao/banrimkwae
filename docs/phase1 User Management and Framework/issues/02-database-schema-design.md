# Issue #02: Database Schema Design and Migration

## Title
Design and Implement Core Database Schema for User Management

## Priority
**High** - Required for authentication and user management

## Estimated Time
3-4 hours

## Description
Create comprehensive database schema for user management, roles, permissions, and settings with proper relationships and constraints.

## Acceptance Criteria
- [ ] Database migrations for all core tables created
- [ ] Proper foreign key relationships established
- [ ] Seeders for initial data created
- [ ] Database factory classes for testing
- [ ] Schema documentation updated

## Implementation Details

### Database Tables

#### 1. Users Table Migration
```php
<?php
// database/migrations/2024_01_01_000001_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('username')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('force_password_change')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->json('preferences')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            $table->index(['status', 'email']);
            $table->index(['department', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
```

#### 2. Settings Table Migration
```php
<?php
// database/migrations/2024_01_01_000002_create_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json, etc.
            $table->string('category')->default('general');
            $table->string('group')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('is_editable')->default(true);
            $table->json('validation_rules')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['category', 'is_public']);
            $table->index(['group', 'sort_order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
};
```

#### 3. Activity Log Table (Spatie)
```php
<?php
// This will be created by Spatie package
// php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
```

#### 4. Roles and Permissions Tables (Spatie)
```php
<?php
// These will be created by Spatie Permission package
// php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### Database Seeders

#### 1. Default Settings Seeder
```php
<?php
// database/seeders/SettingsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            // General Settings
            [
                'key' => 'app.name',
                'value' => 'Banrimkwae Resort Management',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Application name',
                'is_public' => true,
            ],
            [
                'key' => 'app.logo',
                'value' => null,
                'type' => 'file',
                'category' => 'general',
                'description' => 'Application logo',
                'is_public' => true,
            ],
            [
                'key' => 'resort.name',
                'value' => 'Banrimkwae Resort',
                'type' => 'string',
                'category' => 'resort',
                'description' => 'Resort name',
                'is_public' => true,
            ],
            [
                'key' => 'resort.address',
                'value' => 'Kanchanaburi, Thailand',
                'type' => 'text',
                'category' => 'resort',
                'description' => 'Resort address',
                'is_public' => true,
            ],
            [
                'key' => 'resort.phone',
                'value' => null,
                'type' => 'string',
                'category' => 'resort',
                'description' => 'Resort phone number',
                'is_public' => true,
            ],
            [
                'key' => 'resort.email',
                'value' => null,
                'type' => 'email',
                'category' => 'resort',
                'description' => 'Resort email address',
                'is_public' => true,
            ],
            
            // Security Settings
            [
                'key' => 'security.password_min_length',
                'value' => '8',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Minimum password length',
                'is_public' => false,
            ],
            [
                'key' => 'security.require_uppercase',
                'value' => 'true',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require uppercase letters in password',
                'is_public' => false,
            ],
            [
                'key' => 'security.require_numbers',
                'value' => 'true',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require numbers in password',
                'is_public' => false,
            ],
            [
                'key' => 'security.require_special_chars',
                'value' => 'true',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require special characters in password',
                'is_public' => false,
            ],
            [
                'key' => 'security.session_timeout',
                'value' => '30',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Session timeout in minutes',
                'is_public' => false,
            ],
            [
                'key' => 'security.max_login_attempts',
                'value' => '5',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Maximum login attempts before lockout',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
```

#### 2. Roles and Permissions Seeder
```php
<?php
// database/seeders/RolesAndPermissionsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User Management
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.manage',
            
            // Role Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'roles.assign',
            
            // Settings Management
            'settings.view',
            'settings.edit',
            'settings.manage',
            
            // System Administration
            'system.admin',
            'system.logs',
            'system.backup',
            
            // Profile Management
            'profile.view',
            'profile.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $managerRole = Role::create(['name' => 'manager']);
        $managerRole->givePermissionTo([
            'users.view', 'users.create', 'users.edit',
            'roles.view', 'roles.assign',
            'settings.view', 'settings.edit',
            'profile.view', 'profile.edit',
        ]);

        $officerRole = Role::create(['name' => 'officer']);
        $officerRole->givePermissionTo([
            'users.view',
            'profile.view', 'profile.edit',
        ]);

        $staffRole = Role::create(['name' => 'staff']);
        $staffRole->givePermissionTo([
            'profile.view', 'profile.edit',
        ]);

        $guestRole = Role::create(['name' => 'guest']);
        $guestRole->givePermissionTo([
            'profile.view', 'profile.edit',
        ]);
    }
}
```

#### 3. Default User Seeder
```php
<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        $admin = User::create([
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@banrimkwae.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'department' => 'Administration',
            'position' => 'System Administrator',
            'status' => 'active',
            'start_date' => now(),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create manager user
        $manager = User::create([
            'first_name' => 'Resort',
            'last_name' => 'Manager',
            'email' => 'manager@banrimkwae.com',
            'username' => 'manager',
            'password' => Hash::make('password'),
            'department' => 'Management',
            'position' => 'Resort Manager',
            'status' => 'active',
            'start_date' => now(),
            'email_verified_at' => now(),
        ]);
        $manager->assignRole('manager');
    }
}
```

### Database Factory

#### User Factory
```php
<?php
// database/factories/UserFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition()
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'username' => fake()->unique()->userName(),
            'phone' => fake()->phoneNumber(),
            'department' => fake()->randomElement(['Front Office', 'Housekeeping', 'Restaurant', 'Activities', 'Maintenance']),
            'position' => fake()->jobTitle(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'status' => fake()->randomElement(['active', 'inactive']),
            'start_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified()
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function inactive()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
```

## Commands to Run
```bash
# Run migrations
php artisan migrate

# Publish Spatie packages
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

# Run additional migrations
php artisan migrate

# Run seeders
php artisan db:seed
```

## Testing Criteria
- [ ] All migrations run successfully
- [ ] Database tables created with proper structure
- [ ] Foreign key constraints work correctly
- [ ] Seeders populate default data
- [ ] Factory classes generate test data

## Dependencies
- Issue #01: Project Setup and Infrastructure

## Related Issues
- #03: Laravel Models and Relationships
- #04: Authentication System

## Files to Create/Modify
- `database/migrations/` - All migration files
- `database/seeders/` - All seeder files
- `database/factories/` - Factory files
- `docs/database-schema.md` - Schema documentation
