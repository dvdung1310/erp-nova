<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuCustomerCollection;
use App\Models\NvuCustomerModel;
use App\Models\NvuDataSourceModel;
use App\Models\NvuStatusCustomerModel;
use Illuminate\Http\Request;

class NvuCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $customer = NvuCustomerModel::join('nvu_data_source', 'nvu_customer.customer_source', '=', 'nvu_data_source.source_id')
                ->join('nvu_status_customer', 'nvu_customer.customer_status', '=', 'nvu_status_customer.status_id')
                ->select(
                    'nvu_customer.*', // Lấy toàn bộ cột từ bảng nvu_customer
                    'nvu_data_source.source_name', // Lấy cột source_name từ bảng nvu_data_source
                    'nvu_status_customer.status_name' // Lấy cột status_name từ bảng nvu_status_customer
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuCustomerCollection($customer)
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
            $dataSource = NvuDataSourceModel::where('source_status', 1)->get();
            $dataStatus = NvuStatusCustomerModel::where('status', 1)->get();
            // Trả về dữ liệu dưới dạng JSON
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => [
                    'dataSource' => $dataSource,
                    'dataStatus' => $dataStatus
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
           
            $customer = NvuCustomerModel::create($request->all());

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                 'data' =>  $customer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found11111111111.'.$e->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($nvucustomer)
    {
        try {
            $customerWithOrders = NvuCustomerModel::join('nvu_data_source', 'nvu_customer.customer_source', '=', 'nvu_data_source.source_id')
                ->join('nvu_status_customer', 'nvu_customer.customer_status', '=', 'nvu_status_customer.status_id')
                ->where('nvu_customer.customer_id', $nvucustomer)
                ->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $customerWithOrders
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
    public function edit( $nvucustomer)
    {
        try {
            $customerWithOrders = NvuCustomerModel::join('nvu_data_source', 'nvu_customer.customer_source', '=', 'nvu_data_source.source_id')
                ->join('nvu_status_customer', 'nvu_customer.customer_status', '=', 'nvu_status_customer.status_id')
                ->where('nvu_customer.customer_id', $nvucustomer)
                ->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $customerWithOrders
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
    public function update(Request $request, NvuCustomerModel $nvucustomer)
    {
        try {
            $nvucustomer->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuCustomerCollection(NvuCustomerModel::paginate(10))
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
    public function destroy(NvuCustomerModel $nvucustomer)
    {
        try {
            $nvucustomer->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuCustomerCollection(NvuCustomerModel::paginate(10))
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }
}
