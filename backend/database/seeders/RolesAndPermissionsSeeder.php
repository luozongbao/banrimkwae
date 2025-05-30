<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
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
