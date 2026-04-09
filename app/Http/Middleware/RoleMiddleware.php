<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Check if the logged-in user has the required roles.
     * Use pipe (|) to separate multiple allowed roles, e.g. 'role:national_admin|conference_admin'
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (! $request->user()) {
            return redirect('login');
        }

        $allowedRoles = explode('|', $roles);

        if (! in_array($request->user()->role, $allowedRoles)) {
            abort(403, 'Unauthorized action. You do not have the required permissions.');
        }

        return $next($request);
    }
}
