<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvEmployeeResource;
use App\Models\CrmDepartmentModel;
use App\Models\CrmDepartmentTeamModel;
use App\Models\CrmEmployeeFileModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\CrmEmployeeModel;
use App\Models\User;
use Illuminate\Http\Request;

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
                ->where('users.id', $user_id)->first();
            $employee = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftjoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->leftjoin('users', 'crm_employee.account_id', '=', 'users.id')
                ->select(
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name',
                    'users.avatar'
                )
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'Customers get successfully.',
                'user_login' => $user_login,
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
                $user['role_id'] = $request->level_id;
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
    public function show($nvemployee)
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
    public function destroy(CrmEmployeeModel $nvemployee)
    {
        try {
            $nvemployee = CrmEmployeeModel::find($nvemployee->employee_id);
            $user_id = $nvemployee->account_id;
            if (!$nvemployee) {
                return response()->json([
                    'error' => true,
                    'message' => 'No customers found.',
                    'data' => []
                ]);
            }
            $nvemployee->delete();
            $delete_user = User::where('id', $user_id)->delete();
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
}
