<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuPaymentCollection;
use App\Http\Resources\Api\Nvu\NvuPaymentResource;
use App\Models\NvuPaymentModel;
use Illuminate\Http\Request;

class NvuPaymentController extends Controller
{
    public function index()
    {
        try {
            $payment = NvuPaymentModel::join('nvu_customer', 'nvu_payment.payment_customer', '=', 'nvu_customer.customer_id')
                ->select(
                    'nvu_payment.*', 
                    'nvu_customer.customer_name', 
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuPaymentCollection($payment)
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
                    'payment_customer' => 'required',
                    'payment_date' => 'required',
                    'payment_amount' => 'required',
                    'payment_image' => 'required',
                    'payment_option_money' => 'required',
                    'payment_description' => 'required', 
                    'payment_status' => 'required', 
                ]
            );
            $payment = NvuPaymentModel::create($request->all());

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuPaymentResource($payment)
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
    public function show($nvupayment)
    {
        try {
            $payment = NvuPaymentModel::join('nvu_customer', 'nvu_payment.payment_customer', '=', 'nvu_customer.customer_id')
            ->select(
                'nvu_payment.*', 
                'nvu_customer.customer_name', 
            )
                ->where('nvu_payment.payment_id',$nvupayment)
                ->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $payment
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
    public function edit($nvupayment)
    {
        try {
            $payment = NvuPaymentModel::join('nvu_customer', 'nvu_payment.payment_customer', '=', 'nvu_customer.customer_id')
            ->select(
                'nvu_payment.*', 
                'nvu_customer.customer_name', 
            )
                ->where('nvu_payment.payment_id',$nvupayment)
                ->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $payment
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
    public function update(Request $request, NvuPaymentModel $nvupayment)
    {
        try {
            $nvupayment->update($request->all());

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuPaymentResource($nvupayment)
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
    public function destroy(NvuPaymentModel $nvupayment)
    {
        try {
            $nvupayment->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuPaymentCollection(NvuPaymentModel::paginate(10))
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
