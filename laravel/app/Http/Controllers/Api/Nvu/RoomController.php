<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Models\NvuRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class RoomController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'color' => 'string|max:20',
            'status' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $room = new NvuRoom();
        $room->name = $request->name;
        $room->address = $request->address;
        if($request->infor == 'undefined' || $request->infor == 'null'){
            $room->infor = '';
        }else{
            $room->infor = $request->infor;
        }

        if($request->color == 'undefined'){
            $room->color = '#000';
        }else{
            $room->color = $request->color;
        }
    
        $room->status = $request->status;
        $room->save();

        return response()->json(['message' => 'Phòng đã được thêm thành công!', 'status' => $room], 201);
    }

    public function index()
    {
        $room = NvuRoom::all();
        return response()->json($room);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:customer_status,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'color' => 'string|max:20',
            'status' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $status = NvuRoom::find($id);
        if (!$status) {
            return response()->json(['message' => 'Phòng không tồn tại.'], 404);
        }
        if($request->infor == 'undefined' || $request->infor == 'null'){
            $status->infor = '';
        }else{
            $status->infor = $request->infor;
        }
        $status->update($request->only(['name', 'status']));

        return response()->json(['message' => 'Cập nhật phòng thành công!', 'status' => $status], 200);
    }
    public function delete($id)
    {
        $status = NvuRoom::find($id);
        if (!$status) {
            return response()->json(['message' => 'Nguồn khách hàng không tồn tại.'], 404);
        }
        $status->delete();

        return response()->json(['message' => 'Xóa nguồn khách hàng thành công!'], 200);
    }
}
