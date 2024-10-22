<?php

namespace App\Http\Controllers;

use App\Models\Devices;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function register(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|max:55',
                'email' => 'email|required|unique:users',
                'password' => 'required',
            ]);

            $validatedData['password'] = bcrypt($request->password);

            $user = User::create($validatedData);

            return response([
                'message' => 'User registered successfully',
                'error' => false,
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function login(Request $request)
    {
        try {
            $loginData = $request->validate([
                'email' => 'email|required',
                'password' => 'required'
            ]);
            if (!auth()->attempt($loginData)) {
                return response([
                    'message' => 'Tài khoản hoặc mật khẩu không đúng',
                    'error' => true,
                    'data' => null
                ], 400);
            }

            $user = auth()->user();

            $personalAccessTokenResult = $user->createToken('token');
            $accessToken = $personalAccessTokenResult->token;
            $accessToken->expires_at = Carbon::now()->addDays(7); // Set the token to expire in 30 seconds
            $accessToken->save();

            $accessTokenString = $personalAccessTokenResult->accessToken;

            return response([
                'message' => 'User logged in successfully',
                'error' => false,
                'data' => [
                    'access_token' => $accessTokenString,
                    'user_id' => $user->id,
                ]
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
    }

    public function profile()
    {
        try {
            $user = auth()->guard('api')->user();
            if (!$user) {
                return response([
                    'message' => 'User not authenticated',
                    'error' => true,
                    'data' => null
                ], 401);
            }
            return response([
                'message' => 'User profile fetched successfully',
                'error' => false,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = auth()->guard('api')->user();
            $user_id = $user->id;
            if (!$user) {
                return response([
                    'message' => 'User not authenticated',
                    'error' => true,
                    'data' => null
                ], 401);
            }
            Devices::where('user_id', $user_id)->delete();
            $user->token()->revoke();

            return response([
                'message' => 'Successfully logged out',
                'error' => false,
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
    }

    public function getAll()
    {
        try {
            // check passport token
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

    public function getById(Request $request)
    {
        try {
            $user = User::find($request->id);
            if (!$user) {
                return response([
                    'message' => 'User not found',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            return response([
                'message' => 'User fetched successfully',
                'error' => false,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function update(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|max:55',
                'email' => 'email|required',
                'phone_number' => 'required||string',
            ]);
            $user = User::find($request->id);

            if (!$user) {
                return response([
                    'message' => 'User not found',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            $user->update($validatedData);
            return response([
                'message' => 'User updated successfully',
                'error' => false,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function delete(Request $request)
    {
        try {
            $user = User::find($request->id);
            $userLogin = auth()->guard('api')->user();
            if ($userLogin->role_id != 1) {
                return response([
                    'message' => 'You are not authorized to delete this user',
                    'error' => true,
                    'data' => null
                ], 401);
            }
            if ($userLogin->id == $request->id) {
                return response([
                    'message' => 'You can not delete yourself',
                    'error' => true,
                    'data' => null
                ], 401);
            }
            if (!$user) {
                return response([
                    'message' => 'User not found',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            $user->delete();
            return response([
                'message' => 'User deleted successfully',
                'error' => false,
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function updateRole(Request $request)
    {
        try {
            $user = User::find($request->id);
            if (!$user) {
                return response([
                    'message' => 'User not found',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            $user->update($request->only('role_id'));
            return response([
                'message' => 'User role updated successfully',
                'error' => false,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function changePassword(Request $request)
    {
        try {

            $validatedData = $request->validate([
                'old_password' => 'required',
                'new_password' => 'required'
            ]);

            $user = auth()->guard('api')->user();
            if (!auth()->attempt(['email' => $user->email, 'password' => $request->old_password])) {
                return response([
                    'message' => 'Old password is incorrect',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            $user->update(['password' => bcrypt($request->new_password)]);
            return response([
                'message' => 'Password updated successfully',
                'error' => false,
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }

    public function uploadAvatar(Request $request)
    {
        try {
            $user = auth()->guard('api')->user();

            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,svg',
            ]);
            $avatarName = time() . '.' . $request->avatar->extension();

            // Lưu ảnh vào disk 'public'
            $avatarPath = $request->avatar->storeAs('avatars', $avatarName, 'public');

            // Lấy url của ảnh
            $url_avatar = Storage::url($avatarPath);
            // Cập nhật avatar trong database
            $user->avatar = $url_avatar;
            $user->save();

            Http::post($this->nodeUrl . '/update-avatar', [
                'avatar' => $url_avatar,
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'error' => false,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }

    }
}
