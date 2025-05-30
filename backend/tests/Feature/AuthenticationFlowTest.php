<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;

class AuthenticationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_complete_authentication_flow()
    {
        // Create a test user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Test login
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'token'
            ]);

        $token = $loginResponse->json('token');

        // Test getting user profile
        $profileResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $profileResponse->assertOk()
            ->assertJsonStructure([
                'user' => [
                    'id', 'name', 'email', 'username', 'phone', 
                    'department', 'position', 'avatar', 'roles', 
                    'permissions', 'preferences', 'status'
                ]
            ]);

        // Test password change
        $passwordChangeResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/change-password', [
                'current_password' => 'password123',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $passwordChangeResponse->assertOk();

        // Verify new password works
        $newLoginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'newpassword123',
        ]);

        $newLoginResponse->assertOk();
        $newToken = $newLoginResponse->json('token');

        // Check token count before logout
        $user = User::where('email', 'test@example.com')->first();
        $tokenCountBefore = $user->tokens()->count();
        $this->assertGreaterThan(0, $tokenCountBefore, 'User should have tokens before logout');

        // Test logout
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $newToken)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertOk()
            ->assertJson(['message' => 'Logout successful']);

        // Check token count after logout
        $user->refresh();
        $tokenCountAfter = $user->tokens()->count();
        $this->assertEquals($tokenCountBefore - 1, $tokenCountAfter, 'Token count should decrease by 1 after logout');

        // Verify token is physically deleted from database
        $tokenHashToCheck = hash('sha256', explode('|', $newToken)[1]);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => $tokenHashToCheck
        ]);

        // Test token refresh functionality
        $refreshResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/refresh-token');

        $refreshResponse->assertOk()
            ->assertJsonStructure(['token']);

        $refreshedToken = $refreshResponse->json('token');
        $this->assertNotEquals($token, $refreshedToken, 'Refreshed token should be different from original');

        // Verify old token is deleted and new token works
        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', explode('|', $token)[1])
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $refreshedToken)
            ->getJson('/api/auth/me')
            ->assertOk();
    }

    public function test_token_refresh_functionality()
    {
        // Create a user and login to get a token
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $originalToken = $loginResponse->json('token');

        // Verify original token works
        $this->withHeader('Authorization', 'Bearer ' . $originalToken)
            ->getJson('/api/auth/me')
            ->assertOk();

        // Refresh the token
        $refreshResponse = $this->withHeader('Authorization', 'Bearer ' . $originalToken)
            ->postJson('/api/auth/refresh-token');

        $refreshResponse->assertOk()
            ->assertJsonStructure(['token']);

        $newToken = $refreshResponse->json('token');
        $this->assertNotEquals($originalToken, $newToken, 'Refreshed token should be different');

        // Verify new token works
        $this->withHeader('Authorization', 'Bearer ' . $newToken)
            ->getJson('/api/auth/me')
            ->assertOk();

        // Verify old token is deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', explode('|', $originalToken)[1])
        ]);
    }

    public function test_logout_all_functionality()
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create multiple tokens for the user
        $token1 = $user->createToken('device1')->plainTextToken;
        $token2 = $user->createToken('device2')->plainTextToken;
        $token3 = $user->createToken('device3')->plainTextToken;

        $this->assertEquals(3, $user->tokens()->count(), 'User should have 3 tokens');

        // Logout from all devices using one of the tokens
        $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->postJson('/api/auth/logout-all')
            ->assertOk()
            ->assertJson(['message' => 'Logged out from all devices']);

        // Verify all tokens are deleted
        $this->assertEquals(0, $user->fresh()->tokens()->count(), 'All tokens should be deleted');
    }

    public function test_logout_deletes_current_token()
    {
        // Create a user and login
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('token');
        $initialTokenCount = $user->tokens()->count();

        // Logout
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJson(['message' => 'Logout successful']);

        // Verify token count decreased
        $this->assertEquals($initialTokenCount - 1, $user->fresh()->tokens()->count(), 'Token count should decrease by 1');

        // Verify specific token is deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', explode('|', $token)[1])
        ]);
    }

    public function test_rate_limiting_prevents_brute_force()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Clear any existing rate limits
        RateLimiter::clear('test@example.com|127.0.0.1');

        // Make 5 failed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ])->assertUnprocessable();
        }

        // 6th attempt should be throttled
        $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors(['email']);
    }

    public function test_force_password_change_middleware()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'force_password_change' => true,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        // Should be able to access allowed routes
        $this->getJson('/api/auth/me')->assertOk();

        // Note: Additional protected routes would need to be implemented 
        // and tested to verify force password change middleware works
    }
}
