<?php

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
