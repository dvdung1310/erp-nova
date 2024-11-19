<?php

namespace App\Http\Controllers\Api\Nvu;
use App\Http\Controllers\Controller;
use App\Models\CustomerDataSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SourceController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $status = new CustomerDataSource();
        $status->name = $request->name;
        $status->status = $request->status;
        $status->save();

        return response()->json(['message' => 'Nguồn khách hàng đã được thêm thành công!', 'status' => $status], 201);
    }

    public function index()
    {
        $statuses = CustomerDataSource::all();
        return response()->json($statuses);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:customer_status,id',
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $status = CustomerDataSource::find($id);
        if (!$status) {
            return response()->json(['message' => 'Nguồn khách hàng không tồn tại.'], 404);
        }
        $status->update($request->only(['name', 'status']));

        return response()->json(['message' => 'Cập nhật nguồn khách hàng thành công!', 'status' => $status], 200);
    }
    public function delete($id)
    {
        $status = CustomerDataSource::find($id);
        if (!$status) {
            return response()->json(['message' => 'Nguồn khách hàng không tồn tại.'], 404);
        }
        $status->delete();

        return response()->json(['message' => 'Xóa nguồn khách hàng thành công!'], 200);
    }
}
