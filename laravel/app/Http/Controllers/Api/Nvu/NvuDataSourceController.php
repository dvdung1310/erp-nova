<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuDataSourceCollection;
use App\Models\NvuDataSourceModel;
use Illuminate\Http\Request;

class NvuDataSourceController extends Controller
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
                'data' => new NvuDataSourceCollection(NvuDataSourceModel::paginate(10))
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
                    'source_name' => 'required',
                    'source_status' => 'required',
                ]
            );
            NvuDataSourceModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuDataSourceCollection(NvuDataSourceModel::paginate(10))
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
     * Display the specified resource.
     */
    public function show(NvuDataSourceModel $nvudatasource)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvudatasource
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
    public function edit(NvuDataSourceModel $nvudatasource)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvudatasource
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
    public function update(Request $request, NvuDataSourceModel $nvudatasource)
    {
        try {
            $nvudatasource->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuDataSourceCollection(NvuDataSourceModel::paginate(10))
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
    public function destroy(NvuDataSourceModel $nvudatasource)
    {
        try {
            $nvudatasource->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuDataSourceCollection(NvuDataSourceModel::paginate(10))
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
