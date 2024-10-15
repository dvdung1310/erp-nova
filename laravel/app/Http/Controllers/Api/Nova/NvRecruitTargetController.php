<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmRecruitTargetModel;
use Illuminate\Http\Request;

class NvRecruitTargetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $recruitTarget = CrmRecruitTargetModel::join('crm_department', 'crm_recruit_target.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_recruit_target.*',
                    'crm_department.department_name'
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $recruitTarget
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
            $RecruitTarget = CrmRecruitTargetModel::where('target_status', 1)->get();
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => [
                    'categoryFile' => $RecruitTarget
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
            CrmRecruitTargetModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitTargetModel::paginate(10)
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
    public function show($nvrecruittarget)
    {
        try {
            $recruitTarget = CrmRecruitTargetModel::join('crm_department', 'crm_recruit_target.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_recruit_target.*',
                    'crm_department.department_name'
                )
              ->where('target_id',$nvrecruittarget)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $recruitTarget
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
    public function edit($nvrecruittarget)
    {
        try {
            $recruitTarget = CrmRecruitTargetModel::join('crm_department', 'crm_recruit_target.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_recruit_target.*',
                    'crm_department.department_name'
                )
              ->where('target_id',$nvrecruittarget)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $recruitTarget
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
    public function update(Request $request, CrmRecruitTargetModel $nvrecruittarget)
    {
        try {
            $nvrecruittarget->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitTargetModel::paginate(10)
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
    public function destroy(CrmRecruitTargetModel $nvrecruittarget)
    {
        try {
            $nvrecruittarget->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitTargetModel::paginate(10)
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
