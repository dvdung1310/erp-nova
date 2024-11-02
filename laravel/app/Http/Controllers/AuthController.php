<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ForgotPasswordMail;
use App\Mail\InviteUserMail;
use App\Models\Devices;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use function Laravel\Prompts\error;
use Illuminate\Support\Str;

// Import the Validator facade


class AuthController extends Controller
{
    protected $nodeUrl;
    protected $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function register(): JsonResponse
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

    public function login(): JsonResponse
    {
        try {
            $validator = Validator::make(request()->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
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

    public function me(): JsonResponse
    {
        return response()->json([
            'data' => auth()->user(),
            'error' => false,
            'message' => 'User information'
        ]);
    }

    public function changePassword(Request $request)
    {
        try {

            $validatedData = $request->validate([
                'old_password' => 'required',
                'new_password' => 'required'
            ]);

            $user = auth()->user();
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

    public function updateProfile(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|max:55',
                'email' => 'email|required',
                'phone' => 'required|string',
            ]);
            $avatar = $request->input('avatar') || $request->file('avatar');
            $user = auth()->user();
            if ($avatar) {
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
            }
            $user->name = $request->input('name');
            $user->email = $request->input('email');
            $user->phone = $request->input('phone');
            $user->save();

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

    public function logout()
    {
        try {
            $user_id = auth()->user()->id;
            $device = Devices::where('user_id', $user_id)->first();
            if ($device) {
                $device->delete();
            }
            auth()->logout();
            auth()->invalidate(true); // Thêm token vào danh sách đen
            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null

            ], 500);
        }
    }

    public function refresh()
    {
        return response()->json([
            'accessToken' => auth()->refresh(),
            'error' => false,
            'message' => 'Token refreshed'
        ]);
        // return $this->respondWithToken(auth()->refresh());
    }

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

    public function forgotPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ]);
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response([
                    'message' => 'Email không tồn tại !!',
                    'error' => true,
                    'data' => null
                ], 400);
            }


            $newPassword = Str::random(10);
            $user->update(['password' => bcrypt($newPassword)]);
            $link = $this->ClientUrl;
            // Send email
            $inviteData = [
                'link' => $link,
                'password' => $newPassword,
                'shared_at' => now(),
            ];

            // Send the email
            Mail::to($validated['email'])->send(new ForgotPasswordMail($inviteData));
            return response([
                'message' => 'New password sent to your email',
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
}
