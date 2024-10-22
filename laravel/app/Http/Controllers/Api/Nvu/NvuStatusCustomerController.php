<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuStatusCustomerCollection;
use App\Models\NvuStatusCustomerModel;
use Illuminate\Http\Request;

class NvuStatusCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuStatusCustomerCollection(NvuStatusCustomerModel::paginate(10))
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
                    'status_name' => 'required',
                    'status_color' => 'required',
                    'status' => 'required',
                ]
            );
            NvuStatusCustomerModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuStatusCustomerCollection(NvuStatusCustomerModel::paginate(10))
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
    public function show(NvuStatusCustomerModel $nvustatus)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvustatus
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
    public function edit(NvuStatusCustomerModel $nvustatus)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvustatus
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
    public function update(Request $request, NvuStatusCustomerModel $nvustatus)
    {
        try {
            $nvustatus->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
               'data' => NvuStatusCustomerModel::paginate(10)
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
    public function destroy(NvuStatusCustomerModel $nvustatus)
    {
        try {
            $nvustatus->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuStatusCustomerCollection(NvuStatusCustomerModel::paginate(10))
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
