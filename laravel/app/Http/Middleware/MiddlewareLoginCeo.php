<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class MiddlewareLoginCeo
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response([
                'message' => 'you are not authorized',
                'error' => true,
                'data' => null
            ], 401);
        }

        try {
            $user = JWTAuth::parseToken()->authenticate();
            $jwtToken = JWTAuth::fromUser($user);

            // Check if the token is valid and not expired
            if (!$jwtToken || JWTAuth::setToken($jwtToken)->check() === false) {
                return response([
                    'message' => 'token is not valid or has expired',
                    'error' => true,
                    'data' => null
                ], 401);
            }
            if ((string)$user->role_id !== '1' && (string)$user->role_id !== '2') {
                return response([
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'error' => true,
                    'data' => null
                ], 401);
            }
        } catch (\Exception $e) {
            return response([
                'message' => 'token is not valid or has expired',
                'error' => true,
                'data' => null
            ], 401);
        }

        return $next($request);
    }
}
