<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvEmployeeResource;
use App\Models\CrmDepartmentModel;
use App\Models\CrmDepartmentTeamModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\CrmEmployeeModel;
use Illuminate\Http\Request;

class NvEmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $employee = CrmEmployeeModel::join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->leftjoin('crm_department_team', 'crm_employee.team_id', '=', 'crm_department_team.team_id')
                ->join('crm_employee_level', 'crm_employee.level_id', '=', 'crm_employee_level.level_id')
                ->select(
                    'crm_employee.*',
                    'crm_department.department_name',
                    'crm_department_team.team_name',
                    'crm_employee_level.level_name',
                )
                ->get();
            
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $employee
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
                'message' => 'An error occurred: '. $e->getMessage(),
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
            CrmEmployeeModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeModel::paginate(10)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.'.$e->getMessage(),
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
                'data' =>  $employee
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
                'data' =>  $employee
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
                'message' => 'No customers found.'.$e->getMessage(),
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
            $nvemployee->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
}
