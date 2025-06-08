<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder']);
});

describe('Role API', function () {
    it('can list all roles', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/roles');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'guard_name',
                        'permissions',
                        'users_count',
                        'created_at',
                        'updated_at',
                    ]
                ]
            ]);

        // Should have at least the default roles
        expect(count($response->json('data')))->toBeGreaterThanOrEqual(3);
    });

    it('can show a specific role', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::findByName('admin');

        $response = $this->getJson("/api/roles/{$role->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'guard_name',
                    'permissions' => [
                        '*' => [
                            'id',
                            'name',
                            'guard_name',
                        ]
                    ],
                    'users' => [
                        '*' => [
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                        ]
                    ],
                ]
            ])
            ->assertJsonFragment(['name' => 'admin']);
    });

    it('can create a new role', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $permissions = Permission::where('guard_name', 'api')->take(3)->pluck('name')->toArray();

        $roleData = [
            'name' => 'custom-role',
            'permissions' => $permissions,
        ];

        $response = $this->postJson('/api/roles', $roleData);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'permissions',
                ]
            ])
            ->assertJsonFragment(['name' => 'custom-role']);

        $this->assertDatabaseHas('roles', [
            'name' => 'custom-role',
        ]);

        $role = Role::findByName('custom-role', 'api');
        expect($role->permissions()->count())->toBe(3);
    });

    it('validates role creation data', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/roles', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('prevents duplicate role names', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/roles', [
            'name' => 'admin', // Already exists
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('can update a role', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);
        $permissions = Permission::where('guard_name', 'api')->take(2)->pluck('name')->toArray();

        $updateData = [
            'name' => 'updated-role',
            'permissions' => $permissions,
        ];

        $response = $this->putJson("/api/roles/{$role->id}", $updateData);

        $response->assertOk()
            ->assertJsonFragment(['name' => 'updated-role']);

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'updated-role',
        ]);

        expect($role->fresh()->permissions()->count())->toBe(2);
    });

    it('can delete a role', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::create(['name' => 'deletable-role', 'guard_name' => 'api']);

        $response = $this->deleteJson("/api/roles/{$role->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('roles', [
            'id' => $role->id,
        ]);
    });

    it('cannot delete system roles', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $adminRole = Role::findByName('admin');

        $response = $this->deleteJson("/api/roles/{$adminRole->id}");

        $response->assertForbidden()
            ->assertJson([
                'message' => 'Cannot delete system role'
            ]);
    });

    it('cannot delete role with assigned users', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $response = $this->deleteJson("/api/roles/{$role->id}");

        $response->assertForbidden()
            ->assertJson([
                'message' => 'Cannot delete role that has assigned users'
            ]);
    });

    it('requires authentication for role endpoints', function () {
        $response = $this->getJson('/api/roles');
        $response->assertUnauthorized();

        $response = $this->postJson('/api/roles', []);
        $response->assertUnauthorized();
    });

    it('requires admin permissions for role management', function () {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff);

        $response = $this->getJson('/api/roles');
        $response->assertForbidden();

        $response = $this->postJson('/api/roles', [
            'name' => 'test-role'
        ]);
        $response->assertForbidden();
    });

    it('can search roles by name', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        Role::create(['name' => 'test-manager', 'guard_name' => 'api']);
        Role::create(['name' => 'test-supervisor', 'guard_name' => 'api']);
        Role::create(['name' => 'other-role', 'guard_name' => 'api']);

        $response = $this->getJson('/api/roles?search=test');

        $response->assertOk();
        $data = $response->json('data');
        expect($data)->toHaveCount(2);
        expect(collect($data)->pluck('name'))->toContain('test-manager', 'test-supervisor');
    });

    it('includes user count in role listing', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);
        $users = User::factory()->count(3)->create();
        $users->each(fn($user) => $user->assignRole($role));

        $response = $this->getJson('/api/roles');

        $response->assertOk();
        $roleData = collect($response->json('data'))
            ->firstWhere('name', 'test-role');
        
        expect($roleData['users_count'])->toBe(3);
    });

    it('can get available permissions', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/roles/permissions');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'guard_name',
                        'group',
                    ]
                ]
            ]);

        expect(count($response->json('data')))->toBeGreaterThan(0);
    });

    it('groups permissions by category', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/roles/permissions?grouped=true');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'users' => [],
                    'roles' => [],
                    'settings' => [],
                ]
            ]);
    });

    it('can assign role to multiple users', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);
        $users = User::factory()->count(3)->create();
        $userIds = $users->pluck('id')->toArray();

        $response = $this->postJson("/api/roles/{$role->id}/assign-users", [
            'user_ids' => $userIds
        ]);

        $response->assertOk();

        foreach ($users as $user) {
            expect($user->hasRole('test-role'))->toBeTrue();
        }
    });

    it('can remove role from multiple users', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);
        $users = User::factory()->count(3)->create();
        $users->each(fn($user) => $user->assignRole($role));
        $userIds = $users->pluck('id')->toArray();

        $response = $this->postJson("/api/roles/{$role->id}/remove-users", [
            'user_ids' => $userIds
        ]);

        $response->assertOk();

        foreach ($users as $user) {
            expect($user->fresh()->hasRole('test-role'))->toBeFalse();
        }
    });

    it('validates permission IDs when creating/updating roles', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/roles', [
            'name' => 'test-role',
            'permissions' => [99999] // Non-existent permission ID
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['permissions.0']);
    });

    it('can clone a role', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $originalRole = Role::findByName('manager');
        
        $response = $this->postJson("/api/roles/{$originalRole->id}/clone", [
            'name' => 'cloned-manager'
        ]);

        $response->assertCreated();

        $clonedRole = Role::findByName('cloned-manager');
        expect($clonedRole)->not->toBeNull();
        expect($clonedRole->permissions()->count())->toBe($originalRole->permissions()->count());
    });
});
