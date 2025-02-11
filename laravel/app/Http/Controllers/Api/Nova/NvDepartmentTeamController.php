<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvDepartmentTeamResource;
use App\Models\CrmDepartmentModel;
use App\Models\CrmDepartmentTeamModel;
use Illuminate\Http\Request;

class NvDepartmentTeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $team = CrmDepartmentTeamModel::join('crm_department', 'crm_department_team.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_department_team.*',
                    'crm_department.department_name'
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $team
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.'.$th,
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

            // Trả về dữ liệu dưới dạng JSON
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => $department
            ]);
        } catch (\Exception $th) {
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
            $request->validate(
                [
                    'team_name' => 'required',
                    'department_id' => 'required',
                    'team_status' => 'required',
                ]
            );
            $data = CrmDepartmentTeamModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $data
            ]);
        } catch (\Exception $th) {
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
    public function show(CrmDepartmentTeamModel $nvdepartmentteam)
    {
        try {
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvdepartmentteam
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CrmDepartmentTeamModel $nvdepartmentteam)
    {
        try {
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvdepartmentteam
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmDepartmentTeamModel $nvdepartmentteam)
    {
        try {
            $nvdepartmentteam->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmDepartmentTeamModel::paginate(10)
            ]);
        } catch (\Exception $th) {
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
    public function destroy(CrmDepartmentTeamModel $nvdepartmentteam)
    {
        try {
            $nvdepartmentteam->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmDepartmentTeamModel::paginate(10)
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
    public function getdepartmentteam($department_id){
        try {
            $department_team = CrmDepartmentTeamModel::where('department_id',$department_id)->get();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $department_team
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
}
