<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuCustomerCollection;
use App\Models\NvuCustomerModel;
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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate(
                [
                    'customer_name' => 'required',
                    'customer_phone' => 'required',
                    'customer_date_receipt' => 'required',
                    'customer_source' => 'required',
                    'customer_description' => 'required',
                    'customer_sale' => 'required',
                    'customer_status' => 'required',
                ]
            );
            $customer = NvuCustomerModel::create($request->all());

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                 'data' =>  $customer
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.'.$th,
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
