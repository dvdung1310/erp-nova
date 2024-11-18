<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Models\NvuRoom;
use App\Models\NvuRoomBooking;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;


class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|integer', 
            'room_id' => 'required|integer', 
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $roomBooking = new NvuRoomBooking();
        $roomBooking->customer_id = $request->customer_id;
        $roomBooking->room_id = $request->room_id;
        $roomBooking->start_time = $request->start_datetime;
        $roomBooking->end_time = $request->end_datetime;
        $roomBooking->sale_id = Auth::id();
        $roomBooking->save();

        return response()->json(['message' => 'Đặt phòng  thành công!', 'room' => $roomBooking], 201);
    }

    public function index()
    {
        $rooms = NvuRoom::where('status',1)->get(['id','name','color']);
        $customers= Customer::where('status_id',1)->get(['id','name']);
        $bookings= NvuRoomBooking::with(['room','customer'])->get();
        return response()->json(
            [
                'rooms' => $rooms,
                'customers' => $customers,
                'data_booking' => $bookings
            ]
        );
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $validator = Validator::make($request->all(), [
           'customer_id' => 'required|integer', 
            'room_id' => 'required|integer', 
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $roomBooking = NvuRoomBooking::find($id);
        if (!$roomBooking) {
            return response()->json(['message' => 'Phòng không tồn tại.'], 404);
        }
        
        $roomBooking->customer_id = $request->customer_id;
        $roomBooking->room_id = $request->room_id;
        $roomBooking->start_time = $request->start_datetime;
        $roomBooking->end_time = $request->end_datetime;
        $roomBooking->sale_id = Auth::id();
        $roomBooking->save();

        return response()->json(['message' => 'Cập nhật phòng thành công!', 'booking' => $roomBooking], 200);
    }
    public function delete($id)
    {
        $roomBooking = NvuRoomBooking::find($id);
        if (!$roomBooking) {
            return response()->json(['message' => 'Đặt phòng không tồn tại.'], 404);
        }
        $roomBooking->delete();

        return response()->json(['message' => 'Xóa đặt phòng thành công!'], 200);
    }
}
