<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmCategoryFileModel;
use App\Models\CrmEmployeeFileModel;
use Illuminate\Http\Request;

class NvEmployeeFileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $employeeFile = CrmEmployeeFileModel::join('crm_employee', 'crm_employee_file.employee_id', '=', 'crm_employee.employee_id')
                ->leftjoin('crm_category_file', 'crm_employee_file.category_id', '=', 'crm_category_file.category_id')
                ->select(
                    'crm_employee_file.*',
                    'crm_employee.employee_name',
                    'crm_category_file.category_name',
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $employeeFile
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
            $categoryFile = CrmCategoryFileModel::where('category_status', 1)->get();
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => [
                    'categoryFile' => $categoryFile
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
            CrmEmployeeFileModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeFileModel::paginate(10)
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
     * Display the specified resource.
     */
    public function show($nvemployeefile)
    {
        try {
            $employeeFile = CrmEmployeeFileModel::join('crm_employee', 'crm_employee_file.employee_id', '=', 'crm_employee.employee_id')
                ->leftjoin('crm_category_file', 'crm_employee_file.category_id', '=', 'crm_category_file.category_id')
                ->select(
                    'crm_employee_file.*',
                    'crm_employee.employee_name',
                    'crm_category_file.category_name',
                )
               ->where('file_id',$nvemployeefile)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $employeeFile
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
    public function edit($nvemployeefile)
    {
        try {
            $employeeFile = CrmEmployeeFileModel::join('crm_employee', 'crm_employee_file.employee_id', '=', 'crm_employee.employee_id')
                ->leftjoin('crm_category_file', 'crm_employee_file.category_id', '=', 'crm_category_file.category_id')
                ->select(
                    'crm_employee_file.*',
                    'crm_employee.employee_name',
                    'crm_category_file.category_name',
                )
               ->where('file_id',$nvemployeefile)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $employeeFile
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
    public function update(Request $request, CrmEmployeeFileModel $nvemployeefile)
{
    try {

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('uploads/files', 'public'); // Store in 'storage/app/public/uploads/files'
            $validatedData['file'] = $filePath;
        }

        // Update the employee file record
        $nvemployeefile->update($validatedData);

        // Return success response with updated data
        return response()->json([
            'error' => false,
            'message' => 'Employee file updated successfully.',
            'data' => CrmEmployeeFileModel::paginate(10),
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => 'Failed to update employee file.',
            'data' => [],
        ], 500);
    }
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmEmployeeFileModel $nvemployeefile)
    {
        try {
            $nvemployeefile->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
               
                
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.'. $th,
                'data' => []
            ]);
        }
    }
}
