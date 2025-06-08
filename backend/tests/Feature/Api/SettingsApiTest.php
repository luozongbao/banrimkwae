<?php

use App\Models\User;
use App\Models\Setting;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder']);
});

describe('Settings API', function () {
    it('can get public settings without authentication', function () {
        Setting::create([
            'key' => 'app.name',
            'value' => 'Test App',
            'is_public' => true,
            'category' => 'app'
        ]);

        Setting::create([
            'key' => 'private.setting',
            'value' => 'secret',
            'is_public' => false,
            'category' => 'private'
        ]);

        $response = $this->getJson('/api/settings/public');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'app.name'
                ]
            ])
            ->assertJsonMissing(['private.setting' => 'secret']);
    });

    it('can list all settings with authentication', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        Setting::factory()->count(10)->create();

        $response = $this->getJson('/api/settings');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'key',
                        'value',
                        'type',
                        'category',
                        'description',
                        'is_public',
                        'is_editable',
                        'validation_rules',
                        'sort_order',
                    ]
                ]
            ]);
    });

    it('can filter settings by category', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        Setting::create(['key' => 'app.name', 'category' => 'app', 'value' => 'Test']);
        Setting::create(['key' => 'mail.driver', 'category' => 'mail', 'value' => 'smtp']);
        Setting::create(['key' => 'app.version', 'category' => 'app', 'value' => '1.0']);

        $response = $this->getJson('/api/settings?category=app');

        $response->assertOk();
        $data = $response->json('data');
        expect($data)->toHaveCount(2);
        expect(collect($data)->pluck('category')->unique()->first())->toBe('app');
    });

    it('can show a specific setting', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'test.setting',
            'value' => 'test value',
            'type' => 'string',
            'category' => 'test',
            'description' => 'Test setting description'
        ]);

        $response = $this->getJson("/api/settings/{$setting->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'key',
                    'value',
                    'type',
                    'category',
                    'description',
                    'is_public',
                    'is_editable',
                ]
            ])
            ->assertJsonFragment(['key' => 'test.setting']);
    });

    it('can update a setting', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'test.setting',
            'value' => 'old value',
            'type' => 'string',
            'is_editable' => true
        ]);

        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'new value',
            'description' => 'Updated description'
        ]);

        $response->assertOk()
            ->assertJsonFragment(['value' => 'new value']);

        $this->assertDatabaseHas('settings', [
            'id' => $setting->id,
            'value' => 'new value',
        ]);
    });

    it('cannot update non-editable setting', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'readonly.setting',
            'value' => 'readonly value',
            'is_editable' => false
        ]);

        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'new value'
        ]);

        $response->assertForbidden();
    });

    it('can batch update settings', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting1 = Setting::create([
            'key' => 'app.name',
            'value' => 'Old App',
            'is_editable' => true
        ]);

        $setting2 = Setting::create([
            'key' => 'app.version',
            'value' => '1.0',
            'is_editable' => true
        ]);

        $response = $this->patchJson('/api/settings/batch', [
            'settings' => [
                ['id' => $setting1->id, 'value' => 'New App Name'],
                ['id' => $setting2->id, 'value' => '2.0'],
            ]
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('settings', [
            'id' => $setting1->id,
            'value' => 'New App Name',
        ]);

        $this->assertDatabaseHas('settings', [
            'id' => $setting2->id,
            'value' => '2.0',
        ]);
    });

    it('validates setting values based on type', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'test.boolean',
            'value' => 'true',
            'type' => 'boolean',
            'is_editable' => true
        ]);

        // Valid boolean value
        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => false
        ]);
        $response->assertOk();

        // Invalid boolean value should be handled gracefully
        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'invalid-boolean'
        ]);
        $response->assertUnprocessable();
    });

    it('validates setting values with custom validation rules', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'test.email',
            'value' => 'test@example.com',
            'type' => 'string',
            'validation_rules' => ['email'],
            'is_editable' => true
        ]);

        // Valid email
        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'new@example.com'
        ]);
        $response->assertOk();

        // Invalid email
        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'invalid-email'
        ]);
        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['value']);
    });

    it('can get settings grouped by category', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        Setting::create(['key' => 'app.name', 'category' => 'app', 'value' => 'Test App']);
        Setting::create(['key' => 'app.version', 'category' => 'app', 'value' => '1.0']);
        Setting::create(['key' => 'mail.driver', 'category' => 'mail', 'value' => 'smtp']);

        $response = $this->getJson('/api/settings?grouped=true');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'app' => [
                        'app.name',
                        'app.version'
                    ],
                    'mail' => [
                        'mail.driver'
                    ]
                ]
            ]);
    });

    it('requires authentication for protected settings endpoints', function () {
        $response = $this->getJson('/api/settings');
        $response->assertUnauthorized();

        $response = $this->putJson('/api/settings/1', []);
        $response->assertUnauthorized();
    });

    it('requires proper permissions for settings management', function () {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff);

        $setting = Setting::factory()->create();

        $response = $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'new value'
        ]);

        $response->assertForbidden();
    });

    it('tracks setting changes in audit log', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'test.setting',
            'value' => 'old value',
            'is_editable' => true
        ]);

        $this->putJson("/api/settings/{$setting->id}", [
            'value' => 'new value'
        ]);

        $auditLog = $setting->fresh()->getAuditLog();
        expect($auditLog)->toHaveCount(2); // creation + update
        expect($auditLog->last()['description'])->toBe('updated');
    });

    it('can search settings by key or description', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        Setting::create([
            'key' => 'app.name',
            'value' => 'Test App',
            'description' => 'Application name setting'
        ]);

        Setting::create([
            'key' => 'mail.driver',
            'value' => 'smtp',
            'description' => 'Email driver configuration'
        ]);

        // Search by key
        $response = $this->getJson('/api/settings?search=app');
        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);

        // Search by description
        $response = $this->getJson('/api/settings?search=email');
        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
    });

    it('handles type casting correctly', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $setting = Setting::create([
            'key' => 'test.number',
            'value' => '42',
            'type' => 'integer',
            'is_editable' => true
        ]);

        $response = $this->getJson("/api/settings/{$setting->id}");
        
        $response->assertOk();
        $value = $response->json('data.value');
        expect($value)->toBe(42);
        expect($value)->toBeInt();
    });
});
