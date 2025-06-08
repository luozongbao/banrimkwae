<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder']);
});

describe('Auth API', function () {
    it('can login with valid credentials', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'user' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'roles',
                        'permissions',
                    ],
                    'token',
                    'expires_at',
                ]
            ]);

        expect($user->fresh()->last_login_at)->not->toBeNull();
    });

    it('cannot login with invalid credentials', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'These credentials do not match our records.'
            ]);
    });

    it('cannot login with inactive account', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Your account is not active or verified.'
            ]);
    });

    it('cannot login with unverified email', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Your account is not active or verified.'
            ]);
    });

    it('validates login request', function () {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    });

    it('can get authenticated user info', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'roles',
                    'permissions',
                    'preferences',
                ]
            ])
            ->assertJsonFragment(['id' => $user->id]);
    });

    it('can logout', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test-token');
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->plainTextToken,
        ])->postJson('/api/auth/logout');

        $response->assertOk();
        
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    });

    it('can logout from all devices', function () {
        $user = User::factory()->create();
        $token1 = $user->createToken('token1');
        $token2 = $user->createToken('token2');
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token1->plainTextToken,
        ])->postJson('/api/auth/logout-all');

        $response->assertOk();
        
        expect($user->tokens()->count())->toBe(0);
    });

    it('can change password', function () {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/change-password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk();
        
        expect(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue();
    });

    it('validates current password when changing', function () {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/change-password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);
    });

    it('can request password reset', function () {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'We have emailed your password reset link.'
            ]);
    });

    it('can reset password with valid token', function () {
        $user = User::factory()->create(['email' => 'test@example.com']);
        
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk();
        
        expect(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue();
    });

    it('cannot reset password with invalid token', function () {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => 'invalid-token',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('can refresh token', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test-token');
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->plainTextToken,
        ])->postJson('/api/auth/refresh-token');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'expires_at',
                ]
            ]);

        // Old token should be revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    });

    it('requires authentication for protected auth endpoints', function () {
        $response = $this->getJson('/api/auth/me');
        $response->assertUnauthorized();

        $response = $this->postJson('/api/auth/logout');
        $response->assertUnauthorized();

        $response = $this->postJson('/api/auth/change-password', []);
        $response->assertUnauthorized();
    });

    it('handles rate limiting on login attempts', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Make multiple failed login attempts
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
        }

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(429); // Too Many Requests
    });

    it('tracks login attempts and IP addresses', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->withServerVariables([
            'REMOTE_ADDR' => '192.168.1.100'
        ])->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        
        expect($user->fresh()->last_login_ip)->toBe('192.168.1.100');
    });
});
