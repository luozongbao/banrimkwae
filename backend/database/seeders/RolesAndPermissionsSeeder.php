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

        // Create permissions for multiple guards
        $guards = ['web', 'api', 'sanctum'];
        foreach ($guards as $guard) {
            foreach ($permissions as $permission) {
                Permission::create(['name' => $permission, 'guard_name' => $guard]);
            }
        }

        // Create roles and assign permissions for multiple guards
        foreach ($guards as $guard) {
            $adminRole = Role::create(['name' => 'admin', 'guard_name' => $guard]);
            $adminRole->givePermissionTo(Permission::where('guard_name', $guard)->get());

            $managerRole = Role::create(['name' => 'manager', 'guard_name' => $guard]);
            $managerRole->givePermissionTo(Permission::where('guard_name', $guard)->whereIn('name', [
                'users.view', 'users.create', 'users.edit',
                'roles.view', 'roles.assign',
                'settings.view', 'settings.edit',
                'profile.view', 'profile.edit',
            ])->get());

            $officerRole = Role::create(['name' => 'officer', 'guard_name' => $guard]);
            $officerRole->givePermissionTo(Permission::where('guard_name', $guard)->whereIn('name', [
                'users.view',
                'profile.view', 'profile.edit',
            ])->get());

            $staffRole = Role::create(['name' => 'staff', 'guard_name' => $guard]);
            $staffRole->givePermissionTo(Permission::where('guard_name', $guard)->whereIn('name', [
                'profile.view', 'profile.edit',
            ])->get());

            $guestRole = Role::create(['name' => 'guest', 'guard_name' => $guard]);
            $guestRole->givePermissionTo(Permission::where('guard_name', $guard)->whereIn('name', [
                'profile.view', 'profile.edit',
            ])->get());
        }
    }
}
