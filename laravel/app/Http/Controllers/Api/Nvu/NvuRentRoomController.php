<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nvu\NvuRentRoomCollection;
use App\Http\Resources\Api\Nvu\NvuRoomRentCollection;
use App\Http\Resources\Api\Nvu\NvuRoomRentResource;
use App\Models\NvuRoomRentModel;
use Illuminate\Http\Request;

class NvuRentRoomController extends Controller
{
    public function index()
    {
        try {
            $roomRent = NvuRoomRentModel::join('nvu_customer', 'nvu_room_rent.rent_customer', '=', 'nvu_customer.customer_id')
                ->join('nvu_room', 'nvu_room_rent.rent_room', '=', 'nvu_room.room_id')
                ->select('nvu_room_rent.*', 'nvu_room.room_name', 'nvu_customer.customer_name')
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuRoomRentCollection($roomRent)
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
            $roomRent = NvuRoomRentModel::create($request->all());

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuRoomRentResource($roomRent)
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
    public function show( $nvuroomrent)
    {
        try {
            $roomRent = NvuRoomRentModel::join('nvu_customer', 'nvu_room_rent.rent_customer', '=', 'nvu_customer.customer_id')
                ->join('nvu_room', 'nvu_room_rent.rent_room', '=', 'nvu_room.room_id')
                ->select('nvu_room_rent.*', 'nvu_room.room_name', 'nvu_customer.customer_name')
                ->where('nvu_room_rent.rent_id',$nvuroomrent)
                ->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $roomRent
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
    public function edit( $nvuroomrent)
    {
        try {
            $roomRent = NvuRoomRentModel::join('nvu_customer', 'nvu_room_rent.rent_customer', '=', 'nvu_customer.customer_id')
                ->join('nvu_rooms', 'nvu_room_rent.rent_room', '=', 'nvu_rooms.room_id')
                ->select('nvu_room_rent.*', 'nvu_rooms.room_name', 'nvu_customer.customer_name')
                ->where('nvu_room_rent.rent_id',$nvuroomrent)
                ->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' =>  $roomRent
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
    public function update(Request $request, NvuRoomRentModel $nvuroomrent)
    {
        try {
            $nvuroomrent->update($request->all());
         
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuRoomRentResource($nvuroomrent)
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
    public function destroy(NvuRoomRentModel $nvuroomrent)
    {
        try {
            $nvuroomrent->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => new NvuRoomRentCollection(NvuRoomRentModel::paginate(10))
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
