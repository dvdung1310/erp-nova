<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvEmployeeResource;
use App\Models\CrmDepartmentModel;
use App\Models\CrmDepartmentTeamModel;
use App\Models\CrmEmployeeFileModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\CrmEmployeeModel;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class NvEmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $user_id = auth()->user()->id;
            $user_login = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('users.*', 'crm_employee.department_id')
                ->where('users.id', $user_id)
                ->first();

            $isAdminOrDept9 = false;
            if ($user_login->role_id == 1 || $user_login->department_id == 9) {
                $isAdminOrDept9 = true;
            } else {
                $isAdminOrDept9;
            }
            $employee = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftjoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->leftjoin('users', 'crm_employee.account_id', '=', 'users.id')
                ->select(
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name',
                    'users.avatar',
                    'users.role_id'
                )
                ->get();
            $rule_employee = Role::all();
            //nhân viên theo phòng ban
            $employee_department = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_department.department_name',
                    'crm_department.department_id',
                    DB::raw('COUNT(crm_employee.employee_id) as employee_count')
                )
                ->groupBy('crm_department.department_name', 'crm_department.department_id') // Nhóm theo cả department_name và department_id
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'Customers get successfully.',
                'user_login' => $isAdminOrDept9,
                'data' => $employee,
                'rule_employee' => $rule_employee,
                'employee_department' => $employee_department
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }
    public function list_employee_department($department_id){
         try {
            $user_id = auth()->user()->id;
            $user_login = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('users.*', 'crm_employee.department_id')
                ->where('users.id', $user_id)
                ->first();

            $isAdminOrDept9 = false;
            if ($user_login->role_id == 1 || $user_login->department_id == 9) {
                $isAdminOrDept9 = true;
            } else {
                $isAdminOrDept9;
            }
            $employee = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftjoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->leftjoin('users', 'crm_employee.account_id', '=', 'users.id')
                ->select(
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name',
                    'users.avatar',
                    'users.role_id'
                )
                ->where('crm_employee.department_id',$department_id)
                ->get();
            $rule_employee = Role::all();
            $department_name = CrmDepartmentModel::where('department_id', $department_id)->pluck('department_name')->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers get successfully.',
                'user_login' => $isAdminOrDept9,
                'data' => $employee,
                'rule_employee' => $rule_employee,
                'department_name'=>$department_name
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.'.$th->getMessage(),
                'data' => []
            ]);
        
    }
}


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            // Lấy tất cả các department có status = 1
            $department = CrmDepartmentModel::where('department_status', 1)->get();
            $department_team = CrmDepartmentTeamModel::where('team_status', 1)->get();
            $employee_level = CrmEmployeeLevelModel::where('level_status', 1)->get();
            // Trả về dữ liệu dưới dạng JSON
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => [
                    'departments' => $department,
                    'department_teams' => $department_team,
                    'employee_levels' => $employee_level
                ]
            ]);
        } catch (\Exception $e) {
            // Bắt lỗi và trả về thông báo lỗi
            return response()->json([
                'error' => true,
                'message' => 'An error occurred: ' . $e->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $employee_name = $request->employee_name;
            $employee_email = $request->employee_email;
            $employee_email_nova = $request->employee_email_nova;

            // Kiểm tra nếu `employee_email` hoặc `employee_email_nova` đã tồn tại trong bảng `User`
            $existingUser = User::where('email', $employee_email)
                ->orWhere('email', $employee_email_nova)
                ->first();

            if ($existingUser) {
                // Trả về lỗi nếu email đã tồn tại
                return response()->json([
                    'error' => true,
                    'message' => 'Email đã tồn tại trong hệ thống.',
                    'data' => []
                ]);
            } else {

                $user = new User();
                $user['name'] = $employee_name;
                $user['email'] = $employee_email;
                $user['password'] = bcrypt(123456);
                // $user['role_id'] = $request->level_id;
                $user->save();
                $user_id = $user->id;
                $employee = new CrmEmployeeModel();
                $employee['employee_name'] = $employee_name;
                $employee['employee_email'] = $employee_email;
                $employee['employee_email_nova'] = $employee_email_nova;
                $employee['employee_phone'] = $request->employee_phone;
                $employee['employee_address'] = $request->employee_address;
                $employee['employee_identity'] = $request->employee_identity;
                $employee['employee_bank_number'] = $request->employee_bank_number;
                $employee['employee_date_join'] = $request->employee_date_join;
                $employee['department_id'] = $request->department_id;
                $employee['team_id'] = $request->team_id;
                $employee['level_id'] = $request->level_id;
                $employee['employee_status'] = $request->employee_status;
                $employee['account_id'] = $user_id;
                $employee->save();

                return response()->json([
                    'error' => false,
                    'message' => 'Nhân viên được thêm thành công.',
                    'data' => CrmEmployeeModel::paginate(10)
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Không thể thêm nhân viên. Lỗi: ' . $e->getMessage(),
                'data' => []
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $employee = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->join('users', 'crm_employee.account_id', '=', 'users.id')
                ->leftjoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')

                ->select(
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name',
                    'users.avatar'
                )
                ->where('employee_id', $id)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $employee
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($nvemployee)
    {
        try {
            $employee = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftjoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->select(
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name',
                )
                ->where('employee_id', $nvemployee)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $employee
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmEmployeeModel $nvemployee)
    {
        try {
            $nvemployee->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeModel::paginate(10)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $e->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($nvemployee)
    {
        return $nvemployee;
        try {
            $employee_id = $nvemployee;
            $nvemployee = CrmEmployeeModel::find($employee_id);
            $user_id = $nvemployee->account_id;
            User::where('id',$user_id)->update(['status'=>0]);
            CrmEmployeeModel::where('employee_id',$employee_id)->delete();
            CrmEmployeeFileModel::where('employee_id',$user_id)->delete();
          
            return response()->json([
                'error' => false, // Đã sửa thành true
                'message' => 'Xóa nhân sự thành công!',
                'employee_id' => $nvemployee
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
    public function delete_employee($id)
    {
        try {
            $employee_id = $id;
            $nvemployee = CrmEmployeeModel::find($employee_id);
            $user_id = $nvemployee->account_id;
            User::where('id',$user_id)->update(['status'=>0]);
            CrmEmployeeModel::where('employee_id',$employee_id)->delete();
            CrmEmployeeFileModel::where('employee_id',$user_id)->delete();
          
            return response()->json([
                'error' => false, // Đã sửa thành true
                'message' => 'Xóa nhân sự thành công!',
                'employee_id' => $nvemployee
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    public function showEmployeeFile($employee_id)
    {
        try {
            $files = CrmEmployeeFileModel::where('employee_id', $employee_id)->get();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $files

            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $e->getMessage(),
                'data' => []
            ]);
        }
    }
    public function employeeLogin()
    {
        try {
            $user_id = auth()->user()->id;
            $employee = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->leftjoin('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftjoin('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->where('users.id', $user_id)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $employee

            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $e->getMessage(),
                'data' => []
            ]);
        }
    }
    public function updatEployeeLogin(Request $request)
    {
        try {
            $id = auth()->user()->id;
            $employee_id = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->where('crm_employee.account_id', $id)
                ->pluck('crm_employee.employee_id')
                ->first();

            $employee_name = $request->employee_name;
            $employee_email = $request->employee_email;
            $employee_phone = $request->employee_phone;
            $employee_email_nova = $request->employee_email_nova;
            $existingUser = User::where(function ($query) use ($employee_email, $employee_email_nova) {
                $query->where('email', $employee_email)
                    ->orWhere('email', $employee_email_nova);
            })
                ->where('id', '!=', $id) // Loại trừ bản ghi có ID bằng với người dùng hiện tại
                ->first();

            if ($existingUser) {
                // Trả về lỗi nếu email đã tồn tại
                return response()->json([
                    'error' => true,
                    'message' => 'Email đã tồn tại trong hệ thống.',
                    'data' => []
                ]);
            }

            $data = CrmEmployeeModel::findOrFail($employee_id);
            $data->employee_name = $employee_name;
            $data->employee_email = $employee_email;
            $data->employee_email_nova = $employee_email_nova;
            $data->employee_phone = $employee_phone;
            $data->employee_address = $request->employee_address;
            $data->employee_identity = $request->employee_identity;
            $data->employee_bank_number = $request->employee_bank_number;
            $data->employee_date_join = $request->employee_date_join;
            $data->save();
            $user = User::findOrFail($id);
            $user->name = $employee_name;
            $user->phone = $employee_phone;
            $user->email = $employee_email;
            $user->save();
            $employee = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->where('users.id', $id)->first();
            return response([
                'message' => 'User updated successfully',
                'error' => false,
                'data' =>  $employee
            ]);
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
    }
    public function updateEmployeeAvatar(Request $request)
    {
        try {
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
            $user->save();
        } catch (\Exception $e) {
            return response([
                'message' => 'Error: ' . $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
    }
    public function update_role_user(Request $request)
    {
        try {
            $id = $request->account_id;
            $data = User::findOrFail($id);
            $data->role_id = $request->role;
            $data->save();
            return response([
                'message' => 'User updated successfully',
                'error' => false,
                'data' =>  $data
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
