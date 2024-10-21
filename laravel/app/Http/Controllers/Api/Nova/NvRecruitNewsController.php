<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
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
            $recruitNews = CrmRecruitNewsModel::join('crm_recruit_target', 'crm_recruit_news.target_id', '=', 'crm_recruit_target.target_id')
                ->select(
                    'crm_recruit_news.*',
                    'crm_recruit_target.target_position'
                )
                ->paginate(10);
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
            CrmRecruitNewsModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitNewsModel::paginate(10)
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
    public function update(Request $request, CrmRecruitNewsModel $nvrecruitnews)
    {
        try {
            $nvrecruitnews->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitNewsModel::paginate(10)
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
    public function destroy(CrmRecruitNewsModel $nvrecruitnews)
    {
        try {
            $nvrecruitnews->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitNewsModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }
}
