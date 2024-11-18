<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Models\CustomerStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StatusController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'status' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $status = new CustomerStatus();
        $status->name = $request->name;
        $status->color = $request->color;
        $status->status = $request->status;
        $status->save();

        return response()->json(['message' => 'Trạng thái đã được thêm thành công!', 'status' => $status], 201);
    }

    public function index()
    {
        $statuses = CustomerStatus::all();
        return response()->json($statuses);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:customer_status,id',
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'status' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $status = CustomerStatus::find($id);
        if (!$status) {
            return response()->json(['message' => 'Trạng thái không tồn tại.'], 404);
        }
        $status->update($request->only(['name', 'color', 'status']));

        return response()->json(['message' => 'Cập nhật trạng thái thành công!', 'status' => $status], 200);
    }
    public function delete($id)
    {
        $status = CustomerStatus::find($id);
        if (!$status) {
            return response()->json(['message' => 'Trạng thái không tồn tại.'], 404);
        }
        $status->delete();

        return response()->json(['message' => 'Xóa trạng thái thành công!'], 200);
    }
}
