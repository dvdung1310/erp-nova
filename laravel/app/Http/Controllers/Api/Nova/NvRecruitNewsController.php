<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\RecruitNewsResource;
use App\Models\CrmRecruitNewsModel;
use Illuminate\Http\Request;

class NvRecruitNewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            // $data = CrmRecruitNewsModel::get();
            // dd( );
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitNewsModel::paginate(10)
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $data = CrmRecruitNewsModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $data
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
    public function show($nvrecruitnews)
    {
        try {
            $recruitNews = CrmRecruitNewsModel::join('crm_recruit_target', 'crm_recruit_news.target_id', '=', 'crm_recruit_target.target_id')
                ->select(
                    'crm_recruit_news.*',
                    'crm_recruit_target.target_position'
                )
              ->where('news_id',$nvrecruitnews)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $recruitNews
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
    public function edit($nvrecruitnews)
    {
        try {
            $recruitNews = CrmRecruitNewsModel::join('crm_recruit_target', 'crm_recruit_news.target_id', '=', 'crm_recruit_target.target_id')
                ->select(
                    'crm_recruit_news.*',
                    'crm_recruit_target.target_position'
                )
              ->where('news_id',$nvrecruitnews)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $recruitNews
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
    public function update(Request $request, $id)
    {
        // Tìm kiếm bản ghi với ID đã cho
        $nvrecruitnews = CrmRecruitNewsModel::find($id);
    
        if (!$nvrecruitnews) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ], 404); // Trả về mã lỗi 404 nếu không tìm thấy
        }
    
        try {
            // Cập nhật bản ghi
            $nvrecruitnews->update($request->all());
    
            return response()->json([
                'error' => false,
                'message' => 'Customers updated successfully.',
                'data' => $nvrecruitnews // Trả về bản ghi đã cập nhật
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Failed to update customer. ' . $th->getMessage(), // Hiển thị thông điệp lỗi cụ thể
                'data' => []
            ], 500); // Trả về mã lỗi 500 cho lỗi máy chủ
        }
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            // Tìm bản ghi theo ID
            $nvrecruitnews = CrmRecruitNewsModel::findOrFail($id);
            
            // Xóa bản ghi
            $nvrecruitnews->delete();
            
            return response()->json([
                'error' => false,
                'message' => 'Customer deleted successfully.',
                'data' => CrmRecruitNewsModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customer found. ' . $th->getMessage(),  // Sử dụng getMessage() để lấy thông điệp lỗi
                'data' => []
            ]);
        }
    }
   
   
}
