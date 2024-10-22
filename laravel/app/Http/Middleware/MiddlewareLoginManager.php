<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Passport\Token;
use Symfony\Component\HttpFoundation\Response;

class MiddlewareLoginManager
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->guard('api')->user();
        $token = $request->bearerToken();
        $passportToken = $user ? Token::where('id', $user->token()->id)->first() : null;
        if (!$token || !$user || ($passportToken && $passportToken->expires_at->isPast())) {
            return [
                'message' => 'Bạn không có quyền thực hiện hành động này',
                'error' => true,
                'data' => null
            ];
        }

        if ((string)$user->role_id !== '2' && (string)$user->role_id !== '1' && (string)$user->role_id !== '3') {
            return [
                'message' => 'Bạn không có quyền thực hiện hành động này',
                'error' => true,
                'data' => null
            ];
        }

        return $next($request);
    }
}
