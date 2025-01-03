<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvDepartmentCollection;
use App\Http\Resources\Api\Nova\NvDepartmentResource;
use App\Models\CrmDepartmentModel;
use App\Models\CrmDepartmentTeamModel;
use Illuminate\Http\Request;

class NvDepartmentController extends Controller
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
                'data' => new NvDepartmentCollection(CrmDepartmentModel::paginate(10))
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
           
            $data = CrmDepartmentModel::create($request->all());
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
    public function show($nvdepartment)
    {
        try {
            $data = CrmDepartmentModel::where('department_id',$nvdepartment)->get();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $data
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
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
