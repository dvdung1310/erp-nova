<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmCategoryFileModel;
use App\Models\CrmEmployeeFileModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
    // public function store(Request $request)
    // {
    //     try {
    //         CrmEmployeeFileModel::create($request->all());
    //         return response()->json([
    //             'error' => false,
    //             'message' => 'Customers retrieved successfully.',
    //             'data' => CrmEmployeeFileModel::paginate(10)
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => true,
    //             'message' => 'No customers found.' . $e->getMessage(),
    //             'data' => []
    //         ]);
    //     }
    // }
    public function store(Request $request)
    {
        try {
            $cvPath = null;
    
            if ($request->hasFile('file')) {
                $file = $request->file('file');
    
                if ($file->isValid()) {
                    $allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    $fileMimeType = $file->getMimeType();
    
                    if (!in_array($fileMimeType, $allowedMimeTypes)) {
                        return response()->json([
                            'error' => true,
                            'message' => 'Chỉ hỗ trợ upload file PDF hoặc ảnh.',
                        ]);
                    }
    
                    $cvPath = $file->store('uploads/employee', 'public');
                }
            }
    
            $employeeFile = CrmEmployeeFileModel::create([
                'file_name' => $request->input('file_name'),
                'file_discription' => $request->input('file_discription'),
                'file_date' => $request->input('file_date'),
                'category_id' => $request->input('category_id'),
                'employee_id' => $request->input('employee_id'),
                'file_status' => $request->input('file_status'),
                'candidates_status' => 0,
                'file' => $cvPath,
            ]);
    
            return response()->json([
                'error' => false,
                'message' => 'Hồ sơ được lưu thành công.',
                'data' => $employeeFile,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Không thể lưu hồ sơ: ' . $e->getMessage(),
            ]);
        }
    }
    
    public function update(Request $request, $id)
    {
        try {
            $employeeFile = CrmEmployeeFileModel::findOrFail($id);
            $cvPath = $employeeFile->file;
            // Kiểm tra nếu có file mới được tải lên
            if ($request->hasFile('file')) {
                // Xóa CV cũ nếu tồn tại
                if ($cvPath) {
                    Storage::disk('public')->delete($cvPath);
                }
                $file = $request->file('file');
                if ($file->isValid()) {
                    $cvPath = $file->store('uploads/employee', 'public');
                }
            }
            $updateData = [
                'file_name' => $request->input('file_name', $employeeFile->file_name),
                'file_discription' => $request->input('file_discription', $employeeFile->file_discription),
                'file_date' => $request->input('file_date', $employeeFile->file_date),
                'category_id' => $request->input('category_id', $employeeFile->category_id),
                'employee_id' => $request->input('employee_id', $employeeFile->employee_id), 
                'file_status' => $request->input('file_status', $employeeFile->file_status), 
                'file' => $cvPath,
            ];
            $employeeFile->update($updateData);
            return response()->json([
                'error' => false,
                'message' => 'employeeFile updated successfully.',
                'data' => $employeeFile,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Could not update employeeFile: ' . $e->getMessage(),
                'data' => [],
            ], 400);
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
                ->where('file_id', $nvemployeefile)->first();
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
                ->where('file_id', $nvemployeefile)->first();
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
    // public function update(Request $request, CrmEmployeeFileModel $nvemployeefile)
    // {
    //     try {
    //         // Lấy dữ liệu đầu vào từ request
    //         $data = $request->all();

    //         // Cập nhật bản ghi
    //         $nvemployeefile->update($data);

    //         // Trả về phản hồi thành công
    //         return response()->json([
    //             'success' => true,  // Đồng bộ với logic client-side
    //             'message' => 'Cập nhật nhân sự thành công.',
    //             'data' => $nvemployeefile,
    //         ]);
    //     } catch (\Throwable $th) {
    //         return response()->json([
    //             'success' => false,  // Đồng bộ với client
    //             'message' => 'Cập nhật thất bại: ' . $th->getMessage(),
    //             'data' => [],
    //         ], 500);
    //     }
    // }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmEmployeeFileModel $nvemployeefile)
    {
        try {
            $nvemployeefile->delete();
            return response()->json([
                'success' => true,  // Đổi từ 'error' thành 'success'
                'message' => 'Xóa nhân sự thành công.',  // Thông báo phù hợp hơn
                'data' => $nvemployeefile
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,  // Đồng bộ với logic client
                'message' => 'Xóa nhân sự thất bại: ' . $th->getMessage(),
                'data' => []
            ]);
        }
    }
}
