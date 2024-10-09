<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmDepartmentModel;
use App\Models\CrmEmployeeDayOffModel;
use App\Models\CrmEmployeeModel;
use Illuminate\Http\Request;

class NvEmployeeDayOffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $day_off = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_employee_day_off.*',
                    'crm_department.department_name',
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $day_off
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
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => [
                    'departments' => $department
                ]
            ]);
        } catch (\Throwable $th) {
            // Bắt lỗi và trả về thông báo lỗi
            return response()->json([
                'error' => true,
                'message' => 'An error occurred: ' . $th->getMessage(),
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
            CrmEmployeeDayOffModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeDayOffModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($nvdayoff)
    {
        try {
            $day_off = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_employee_day_off.*',
                    'crm_department.department_name',
                )
              ->where('off_id',$nvdayoff)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $day_off
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
    public function edit($nvdayoff)
    {
        try {
            $day_off = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_employee_day_off.*',
                    'crm_department.department_name',
                )
              ->where('off_id',$nvdayoff)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $day_off
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
    public function update(Request $request, CrmEmployeeDayOffModel $nvdayoff)
    {
        try {
            $nvdayoff->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeDayOffModel::paginate(10)
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
     * Remove the specified resource from storage.
     */
    public function destroy(CrmEmployeeDayOffModel $nvdayoff)
    {
        try {
            $nvdayoff->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeDayOffModel::paginate(10)
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
