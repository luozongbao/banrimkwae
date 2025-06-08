<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder']);
});

describe('User API', function () {
    it('can list users with pagination', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        User::factory()->count(25)->create();

        $response = $this->getJson('/api/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'status',
                        'department',
                        'avatar_url',
                        'full_name',
                        'is_active',
                        'roles',
                        'created_at',
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
                'links'
            ]);

        expect($response->json('meta.per_page'))->toBe(15);
        expect($response->json('data'))->toHaveCount(15);
    });

    it('can search and filter users', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        User::factory()->create(['first_name' => 'John', 'department' => 'IT']);
        User::factory()->create(['first_name' => 'Jane', 'department' => 'HR']);
        User::factory()->create(['first_name' => 'Bob', 'department' => 'IT']);

        // Search by name
        $response = $this->getJson('/api/users?search=John');
        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);

        // Filter by department
        $response = $this->getJson('/api/users?department=IT');
        $response->assertOk();
        expect($response->json('data'))->toHaveCount(2);

        // Filter by status
        $response = $this->getJson('/api/users?status=active');
        $response->assertOk();
        expect(count($response->json('data')))->toBeGreaterThan(0);
    });

    it('can show a specific user', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create();

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone',
                    'department',
                    'position',
                    'status',
                    'avatar_url',
                    'preferences',
                    'roles',
                    'permissions',
                    'last_login_at',
                    'created_at',
                    'updated_at',
                ]
            ]);
    });

    it('can create a new user', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+1234567890',
            'department' => 'IT',
            'position' => 'Developer',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['staff']
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'status',
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
    });

    it('validates user creation data', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/users', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'first_name',
                'last_name',
                'email',
                'password',
            ]);
    });

    it('prevents duplicate email on user creation', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/users', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('can update a user', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create();

        $updateData = [
            'first_name' => 'Updated Name',
            'department' => 'HR',
            'position' => 'Manager',
        ];

        $response = $this->putJson("/api/users/{$user->id}", $updateData);

        $response->assertOk()
            ->assertJsonFragment(['first_name' => 'Updated Name']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => 'Updated Name',
            'department' => 'HR',
        ]);
    });

    it('can delete a user', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    });

    it('can activate a user', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create(['status' => 'inactive']);

        $response = $this->patchJson("/api/users/{$user->id}/activate");

        $response->assertOk()
            ->assertJsonFragment(['status' => 'active']);

        expect($user->fresh()->status)->toBe('active');
    });

    it('can deactivate a user', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create(['status' => 'active']);

        $response = $this->patchJson("/api/users/{$user->id}/deactivate");

        $response->assertOk()
            ->assertJsonFragment(['status' => 'inactive']);

        expect($user->fresh()->status)->toBe('inactive');
    });

    it('requires authentication for user endpoints', function () {
        $response = $this->getJson('/api/users');
        $response->assertUnauthorized();

        $response = $this->postJson('/api/users', []);
        $response->assertUnauthorized();
    });

    it('requires proper permissions for user management', function () {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff);

        // Staff should not be able to create users
        $response = $this->postJson('/api/users', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertForbidden();
    });

    it('can upload user avatar', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create();

        Storage::fake('public');
        $file = UploadedFile::fake()->image('avatar.jpg', 500, 500);

        $response = $this->postJson("/api/users/{$user->id}/avatar", [
            'avatar' => $file
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['avatar_url']
            ]);

        Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    });

    it('can remove user avatar', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create(['avatar' => 'avatars/test.jpg']);

        $response = $this->deleteJson("/api/users/{$user->id}/avatar");

        $response->assertOk();
        expect($user->fresh()->avatar)->toBeNull();
    });

    it('validates avatar upload', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $user = User::factory()->create();

        // Test with invalid file type
        $file = UploadedFile::fake()->create('document.pdf');

        $response = $this->postJson("/api/users/{$user->id}/avatar", [
            'avatar' => $file
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar']);
    });
});
