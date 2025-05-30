<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create a user
$user = User::factory()->create([
    'email' => 'debug@example.com',
    'password' => Hash::make('password123'),
    'status' => 'active',
    'email_verified_at' => now(),
]);

echo "Created user ID: {$user->id}\n";

// Create a token
$token = $user->createToken('debug-token')->plainTextToken;
echo "Created token: {$token}\n";

// Check token count
echo "Token count after creation: " . $user->tokens()->count() . "\n";

// Find the token model
$tokenModel = $user->tokens()->first();
echo "Token ID: " . $tokenModel->id . "\n";
echo "Token name: " . $tokenModel->name . "\n";

// Simulate the logout process
$tokenModel->delete();

// Check token count after deletion
echo "Token count after deletion: " . $user->fresh()->tokens()->count() . "\n";

// Try to find the token again
$deletedToken = $user->tokens()->find($tokenModel->id);
echo "Token found after deletion: " . ($deletedToken ? 'YES' : 'NO') . "\n";

// Clean up
$user->delete();

echo "Test completed.\n";
