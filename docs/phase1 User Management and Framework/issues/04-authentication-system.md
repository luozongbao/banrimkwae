# Issue #04: Authentication System Implementation

## Title
Implement Laravel Sanctum Authentication with Role-Based Access Control

## Priority
**Critical** - Required for all user interactions

## Estimated Time
4-5 hours

## Description
Create a complete authentication system using Laravel Sanctum with login, logout, registration, password reset, and role-based access control for the resort management system.

## Acceptance Criteria
- [ ] Laravel Sanctum authentication configured
- [ ] Login/logout functionality implemented
- [ ] Password reset functionality implemented
- [ ] Role-based middleware implemented
- [ ] Authentication API endpoints created
- [ ] Proper security measures implemented
- [ ] Authentication tests created

## Implementation Details

### 1. Authentication Configuration

#### Sanctum Configuration
```php
<?php
// config/sanctum.php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

#### CORS Configuration
```php
<?php
// config/cors.php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

### 2. Authentication Controllers

#### Auth Controller
```php
<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $key = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => [__('auth.throttle', ['seconds' => $seconds])],
            ]);
        }

        $credentials = $request->only('email', 'password');
        
        // Support both email and username login
        $field = filter_var($credentials['email'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [$field => $credentials['email'], 'password' => $credentials['password']];

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($key);
            
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $user = Auth::user();

        // Check if user is active
        if (!$user->canAccessSystem()) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Your account is not active or verified.'],
            ]);
        }

        // Update last login
        $user->updateLastLogin($request->ip());

        // Clear rate limiter
        RateLimiter::clear($key);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log activity
        activity()
            ->performedOn($user)
            ->withProperties(['ip' => $request->ip(), 'user_agent' => $request->userAgent()])
            ->log('User logged in');

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'avatar' => $user->avatar_url,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'preferences' => $user->preferences,
                'force_password_change' => $user->force_password_change,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        // Log activity
        activity()
            ->performedOn($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('User logged out');

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Revoke all tokens
        $user->tokens()->delete();

        // Log activity
        activity()
            ->performedOn($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('User logged out from all devices');

        return response()->json([
            'message' => 'Logged out from all devices',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'username' => $user->username,
                'phone' => $user->phone,
                'department' => $user->department,
                'position' => $user->position,
                'avatar' => $user->avatar_url,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'preferences' => $user->preferences,
                'status' => $user->status,
                'last_login_at' => $user->last_login_at,
                'force_password_change' => $user->force_password_change,
            ],
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => __($status),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'force_password_change' => false,
                ])->setRememberToken(Str::random(60));

                $user->save();

                // Revoke all existing tokens
                $user->tokens()->delete();

                // Log activity
                activity()
                    ->performedOn($user)
                    ->log('Password reset');
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => __($status),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'force_password_change' => false,
        ]);

        // Log activity
        activity()
            ->performedOn($user)
            ->log('Password changed');

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    public function refreshToken(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Revoke current token
        $request->user()->currentAccessToken()->delete();
        
        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }

    protected function throttleKey(Request $request): string
    {
        return Str::lower($request->input('email')).'|'.$request->ip();
    }
}
```

### 3. Form Requests

#### Login Request
```php
<?php
// app/Http/Requests/Auth/LoginRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email or username is required.',
            'password.required' => 'Password is required.',
        ];
    }
}
```

#### Register Request
```php
<?php
// app/Http/Requests/Auth/RegisterRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['nullable', 'string', 'max:255', 'unique:users', 'alpha_dash'],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
```

#### Change Password Request
```php
<?php
// app/Http/Requests/Auth/ChangePasswordRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
```

#### Forgot Password Request
```php
<?php
// app/Http/Requests/Auth/ForgotPasswordRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users,email'],
        ];
    }
}
```

#### Reset Password Request
```php
<?php
// app/Http/Requests/Auth/ResetPasswordRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
```

### 4. Middleware

#### Force Password Change Middleware
```php
<?php
// app/Http/Middleware/ForcePasswordChange.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && auth()->user()->force_password_change) {
            // Allow access to password change and logout routes
            $allowedRoutes = [
                'api.auth.change-password',
                'api.auth.logout',
                'api.auth.me',
            ];

            if (!in_array($request->route()->getName(), $allowedRoutes)) {
                return response()->json([
                    'message' => 'Password change required',
                    'force_password_change' => true,
                ], 403);
            }
        }

        return $next($request);
    }
}
```

#### Role Middleware
```php
<?php
// app/Http/Middleware/RoleMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\UnauthorizedException;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!auth()->check()) {
            throw UnauthorizedException::notLoggedIn();
        }

        $user = auth()->user();

        if (!$user->hasAnyRole($roles)) {
            throw UnauthorizedException::forRoles($roles);
        }

        return $next($request);
    }
}
```

### 5. API Routes

#### Authentication Routes
```php
<?php
// routes/api.php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->name('api.auth.')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
});

// Protected routes
Route::middleware(['auth:sanctum'])->prefix('auth')->name('api.auth.')->group(function () {
    Route::get('/me', [AuthController::class, 'me'])->name('me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
    Route::post('/refresh-token', [AuthController::class, 'refreshToken'])->name('refresh-token');
});

// Protected routes with forced password change check
Route::middleware(['auth:sanctum', 'force.password.change'])->group(function () {
    // Other protected routes will go here
});
```

### 6. Password Validation Rules

#### Custom Password Rule
```php
<?php
// app/Rules/PasswordRule.php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use App\Models\Setting;

class PasswordRule implements Rule
{
    public function passes($attribute, $value)
    {
        $minLength = Setting::get('security.password_min_length', 8);
        $requireUppercase = Setting::get('security.require_uppercase', true);
        $requireNumbers = Setting::get('security.require_numbers', true);
        $requireSpecialChars = Setting::get('security.require_special_chars', true);

        if (strlen($value) < $minLength) {
            return false;
        }

        if ($requireUppercase && !preg_match('/[A-Z]/', $value)) {
            return false;
        }

        if ($requireNumbers && !preg_match('/[0-9]/', $value)) {
            return false;
        }

        if ($requireSpecialChars && !preg_match('/[^A-Za-z0-9]/', $value)) {
            return false;
        }

        return true;
    }

    public function message()
    {
        $minLength = Setting::get('security.password_min_length', 8);
        $requirements = ["at least {$minLength} characters"];

        if (Setting::get('security.require_uppercase', true)) {
            $requirements[] = 'uppercase letter';
        }

        if (Setting::get('security.require_numbers', true)) {
            $requirements[] = 'number';
        }

        if (Setting::get('security.require_special_chars', true)) {
            $requirements[] = 'special character';
        }

        return 'Password must contain ' . implode(', ', $requirements) . '.';
    }
}
```

### 7. Authentication Tests

#### Auth Controller Test
```php
<?php
// tests/Feature/Auth/AuthControllerTest.php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_user_can_login_with_email()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id', 'name', 'email', 'avatar', 'roles', 'permissions'
                ],
                'token'
            ]);
    }

    public function test_user_can_login_with_username()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password' => Hash::make('password'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'testuser',
            'password' => 'password',
        ]);

        $response->assertOk();
    }

    public function test_login_fails_with_invalid_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'invalid@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logout successful']);

        // Token should be revoked
        $this->assertCount(0, $user->tokens);
    }

    public function test_user_can_get_profile()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonStructure([
                'user' => [
                    'id', 'name', 'email', 'roles', 'permissions'
                ]
            ]);
    }

    public function test_user_can_change_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/change-password', [
                'current_password' => 'oldpassword',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertOk();

        // Verify password was changed
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_password_change_fails_with_wrong_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/change-password', [
                'current_password' => 'wrongpassword',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);
    }
}
```

## Commands to Run
```bash
# Install Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# Create controllers
php artisan make:controller Api/AuthController

# Create form requests
php artisan make:request Auth/LoginRequest
php artisan make:request Auth/RegisterRequest
php artisan make:request Auth/ChangePasswordRequest
php artisan make:request Auth/ForgotPasswordRequest
php artisan make:request Auth/ResetPasswordRequest

# Create middleware
php artisan make:middleware ForcePasswordChange
php artisan make:middleware RoleMiddleware

# Create password rule
php artisan make:rule PasswordRule

# Register middleware in Kernel.php
# Add to $routeMiddleware array:
# 'role' => \App\Http\Middleware\RoleMiddleware::class,
# 'force.password.change' => \App\Http\Middleware\ForcePasswordChange::class,

# Run tests
php artisan test --filter AuthControllerTest
```

## Testing Criteria
- [ ] Users can login with email or username
- [ ] Authentication tokens are properly generated
- [ ] Logout revokes tokens correctly
- [ ] Password change functionality works
- [ ] Password reset flow works
- [ ] Rate limiting prevents brute force attacks
- [ ] Inactive users cannot login
- [ ] Role-based access control works
- [ ] All tests pass

## Dependencies
- Issue #03: Laravel Models and Relationships

## Related Issues
- #05: API Controllers and Routes
- #06: Frontend Authentication Implementation

## Files to Create/Modify
- `app/Http/Controllers/Api/AuthController.php` - Authentication controller
- `app/Http/Requests/Auth/` - Form request classes
- `app/Http/Middleware/` - Custom middleware
- `app/Rules/PasswordRule.php` - Password validation
- `routes/api.php` - API routes
- `config/sanctum.php` - Sanctum configuration
- `tests/Feature/Auth/` - Authentication tests
