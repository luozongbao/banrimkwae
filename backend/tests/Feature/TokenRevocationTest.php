<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class TokenRevocationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_deleted_token_returns_unauthorized()
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create a token manually
        $token = $user->createToken('test-token');
        $plainTextToken = $token->plainTextToken;
        $tokenId = $token->accessToken->id;

        // Verify the token works
        $response = $this->withHeader('Authorization', 'Bearer ' . $plainTextToken)
            ->getJson('/api/auth/me');
        $response->assertOk();

        // Manually delete the token from database
        PersonalAccessToken::find($tokenId)->delete();

        // Verify the token no longer works
        $response = $this->withHeader('Authorization', 'Bearer ' . $plainTextToken)
            ->getJson('/api/auth/me');
        $response->assertUnauthorized();
    }

    public function test_logout_via_api_revokes_token()
    {
        // Create a user and get a token
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

        // Verify token works
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me')
            ->assertOk();

        // Logout via API
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout')
            ->assertOk();

        // Create a new request instance to avoid any cached authentication
        $this->refreshApplication();
        
        // Verify token no longer works
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }
}
