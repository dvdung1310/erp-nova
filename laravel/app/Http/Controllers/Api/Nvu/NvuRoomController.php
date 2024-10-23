<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuRoomCollection;
use App\Models\NvuRoomModel;
use Illuminate\Http\Request;

class NvuRoomController extends Controller
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
                'data' => new NvuRoomCollection(NvuRoomModel::paginate(10))
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
                    'room_name' => 'required',
                    'room_address' => 'required',
                    'room_description' => 'required',
                    'room_color' => 'required',
                    'room_status' => 'required',
                ]
            );
            $data = NvuRoomModel::create($request->all());
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
     * Display the specified resource.
     */
    public function show(NvuRoomModel $nvuroom)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvuroom
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
    public function edit(NvuRoomModel $nvuroom)
    {
        try {
          
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvuroom
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
    public function update(Request $request, NvuRoomModel $nvuroom)
    {
        try {
            $nvuroom->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuRoomCollection(NvuRoomModel::paginate(10))
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
    public function destroy(NvuRoomModel $nvuroom)
    {
        try {
            $nvuroom->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuRoomCollection(NvuRoomModel::paginate(10))
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
