<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ForgotPasswordMail;
use App\Mail\InviteUserMail;
use App\Models\CrmEmployeeModel;
use App\Models\Devices;
use App\Models\Project;
use App\Models\Records;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use function Laravel\Prompts\error;
use Illuminate\Support\Str;

// Import the Validator facade


class AuthController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

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
            $credentials['status'] = 1;

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
            // xóa ảnh cũ
            if ($user->avatar && $avatar) {
                $array = explode('/', $user->avatar);
                $avatar = array_pop($array);
                Storage::disk('public_avatars')->delete($avatar);
            }
            //
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
            $user_id = $user->id;
            $employee = CrmEmployeeModel::where('account_id', $user_id)->first();
            if ($employee) {
                $employee->employee_name = $user->name;
                $employee->employee_email = $user->email;
                $employee->employee_phone = $user->phone;
                $employee->save();
            }
            $payload = [
                'user' => $user,
                'user_id' => $user->id
            ];
            Http::post($this->nodeUrl . '/update-profile', $payload);
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
        try {
            return response()->json([
                'accessToken' => auth()->refresh(),
                'error' => false,
                'message' => 'Token refreshed'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
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
            $users = User::join('crm_employee', 'users.id', '=', 'crm_employee.account_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftJoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.avatar',
                    'users.role_id',
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name'
                )
                ->get();
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

    public function calculatorKpi(Request $request, $user_id)
    {
        try {
            $user = User::find($user_id);
            $startMonth = now()->startOfMonth();
            $endMonth = now()->endOfMonth();
            if (!$user) {
                return response([
                    'message' => 'User not found',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            $employee = CrmEmployeeModel::where('account_id', $user_id)
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->select('crm_employee.*', 'crm_department.department_name', 'crm_employee_level.level_name')
                ->first();
            $record = Records::where('user_id', $user_id)
                ->where('record_status', 1)
                ->get();
            $totalRecordLevelOne = 0;
            $totalRecordLevelTwo = 0;
            $totalRecordLevelThree = 0;
            $totalRecordLevelFour = 0;
            if ($record) {
                foreach ($record as $item) {
                    if ($item->record_level == 1) {
                        $totalRecordLevelOne += 1;
                    }
                    if ($item->record_level == 2) {
                        $totalRecordLevelTwo += 1;
                    }
                    if ($item->record_level == 3) {
                        $totalRecordLevelThree += 1;
                    }
                    if ($item->record_level == 4) {
                        $totalRecordLevelFour += 1;
                    }
                }
            }
            if (!$employee) {
                return response([
                    'message' => 'Employee not found',
                    'error' => true,
                    'data' => null
                ], 400);
            }
            // tinh kpi
            $taskByUserInMonth = Task::whereHas('users', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
                ->where('task_start_date', '>=', $startMonth)
                ->where('task_end_date', '<=', $endMonth)
                ->get();
            $projectByUserInMonth = Project::whereHas('users', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
                ->where('project_start_date', '>=', $startMonth)
                ->where('project_end_date', '<=', $endMonth)
                ->get();

            $totalProject = $projectByUserInMonth->count();
            $totalScoreKpiTaskDone = 0; // công việc đã được leader xác nhận
            $totalTask = 0;
            $totalTaskDone = 0;
            foreach ($taskByUserInMonth as $task) {
                $totalTask += 1;
                if ($task->task_status == 3) {
                    $totalScoreKpiTaskDone += $task->task_score_kpi;
                    $totalTaskDone += 1;
                }
            }
            $totalScoreKpiRemaining = $totalScoreKpiTaskDone - $totalRecordLevelOne
                - $totalRecordLevelTwo * 2 - $totalRecordLevelThree * 3 - $totalRecordLevelFour * 4 + 20;
            $payload = [
                'user' => $user,
                'employee' => $employee,
                'totalScoreKpiTaskDone' => $totalScoreKpiTaskDone,
                'totalProject' => $totalProject,
                'totalTask' => $totalTask,
                'totalTaskDone' => $totalTaskDone,
                'totalScoreKpiRemaining' => $totalScoreKpiRemaining,
                'record' => [
                    'totalRecordLevelOne' => $totalRecordLevelOne,
                    'totalRecordLevelTwo' => $totalRecordLevelTwo,
                    'totalRecordLevelThree' => $totalRecordLevelThree,
                    'totalRecordLevelFour' => $totalRecordLevelFour
                ]
            ];
            return response([
                'message' => 'KPI calculated successfully',
                'error' => false,
                'data' => $payload
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
