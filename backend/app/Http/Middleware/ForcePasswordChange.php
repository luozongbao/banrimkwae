<?php

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
