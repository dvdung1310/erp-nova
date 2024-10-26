<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use http\Env\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use function Laravel\Prompts\error;

// Import the Validator facade


class AuthController extends Controller
{

    /**
     * Register a User.
     *
     * @return JsonResponse
     */
    public function register()
    {
        try {
            $validator = Validator::make(request()->all(), [
                'name' => 'required',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'data' => null,
                    'error' => true,
                    'message' => $validator->errors()
                ], 400);
            }

            $user = new User;
            $user->name = request()->name;
            $user->email = request()->email;
            $user->password = bcrypt(request()->password);
            $user->save();

            return response()->json([
                'data' => 'User successfully registered',
                'user' => $user,
                'error' => false
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }

    }


    /**
     * Get a JWT via given credentials.
     *
     * @return JsonResponse
     */
    public function login()
    {
        try {
            $validator = Validator::make(request()->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'data' => null,
                    'error' => true,
                    'message' => $validator->errors()
                ], 400);
            }
            $credentials = request(['email', 'password']);

            if (!$token = auth()->attempt($credentials)) {
                return response()->json([
                    'message' => 'Tài khoản không đúng',
                    'error' => true,
                    'data' => null
                ], 401);
            }
            $accessToken = $this->respondWithToken($token)->original['access_token'];
            $role_id = auth()->user()->role_id;
            $user_id = auth()->user()->id;
            return response()->json([
                'data' => [
                    'accessToken' => $accessToken,
                    'role_id' => $role_id,
                    'user_id' => $user_id
                ],
                'error' => false,
                'message' => 'Đăng nhập thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the authenticated User.
     *
     * @return JsonResponse
     */
    public function me()
    {
        return response()->json([
            'data' => auth()->user(),
            'error' => false,
            'message' => 'User information'
        ]);
    }

    /**
     * Log the user.js out (Invalidate the token).
     *
     * @return JsonResponse
     */
    public function logout()
    {
        try {
            auth()->logout();
            auth()->invalidate(true); // Thêm token vào danh sách đen

            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to log out, please try again.'], 500);
        }
    }

    /**
     * Refresh a token.
     *
     * @return JsonResponse
     */
    public function refresh()
    {
        return response()->json([
            'accessToken' => auth()->refresh(),
            'error' => false,
            'message' => 'Token refreshed'
        ]);
        // return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param string $token
     *
     * @return JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }

    public function getAllUser()
    {
        try {
            $users = User::select('id', 'name', 'email', 'avatar', 'role_id')->get();
            return response([
                'message' => 'Users fetched successfully',
                'error' => false,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function checkToken()
    {
        try {
            return [
                'message' => 'Token valid',
                'error' => false,
                'data' => null
            ];
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }
}
