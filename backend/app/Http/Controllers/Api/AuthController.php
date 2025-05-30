<?php

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

        // For API authentication, we need to manually validate credentials
        $user = User::where($field, $credentials[$field])->first();
        
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($key);
            
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

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
        
        // Get the token from the Authorization header and find it in the database
        $authHeader = $request->header('Authorization');
        $providedToken = $authHeader ? str_replace('Bearer ', '', $authHeader) : null;
        
        if ($providedToken) {
            $tokenHash = hash('sha256', explode('|', $providedToken)[1]);
            $tokenToDelete = $user->tokens()->where('token', $tokenHash)->first();
            
            if ($tokenToDelete) {
                $tokenToDelete->delete();
            }
        } else {
            // Fallback to currentAccessToken() if no Authorization header
            $currentToken = $request->user()->currentAccessToken();
            if ($currentToken) {
                $currentToken->delete();
            }
        }

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
