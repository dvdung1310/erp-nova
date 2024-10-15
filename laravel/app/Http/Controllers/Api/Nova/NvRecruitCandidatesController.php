<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvRecruitCandidatesResource;
use App\Models\CrmRecruitCandidatesModel;
use Illuminate\Http\Request;

class NvRecruitCandidatesController extends Controller
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
                'data' => new NvRecruitCandidatesResource(CrmRecruitCandidatesModel::paginate(10))
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
            CrmRecruitCandidatesModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitCandidatesModel::paginate(10)
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
    public function show(CrmRecruitCandidatesModel $nvrecruitcandidates)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvrecruitcandidates
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
    public function edit(CrmRecruitCandidatesModel $nvrecruitcandidates)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvrecruitcandidates
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
    public function update(Request $request, CrmRecruitCandidatesModel $nvrecruitcandidates)
    {
        try {
            $nvrecruitcandidates->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvRecruitCandidatesResource(CrmRecruitCandidatesModel::paginate(10))
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
    public function destroy(CrmRecruitCandidatesModel $nvrecruitcandidates)
    {
        try {
            $nvrecruitcandidates->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitCandidatesModel::paginate(10)
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
