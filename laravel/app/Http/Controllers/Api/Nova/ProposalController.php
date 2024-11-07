<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EmployeeProposal;
use App\Models\CrmEmployeeModel;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProposalController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'members' => 'required|json',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Có Lỗi nhập dữ liệu',
                'errors' => $validator->errors(),
            ], 422);
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('proposals', 'public');
        }
        $list_manager =  $request->members;
        $proposal = EmployeeProposal::create([
            'user_id' => Auth::id(),
            'manager_id' => $list_manager,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 0,
            'file' => $filePath,
        ]);

        return response()->json([
            'message' => 'Thêm dữ liệu thành công',
            'data' => $proposal,
        ], 201);
    }

    public function index()
    {
        $listProposal = EmployeeProposal::where('user_id', Auth::id())->get();
        foreach ($listProposal as $proposal) {
            if ($proposal->manager_id) {
                $managerIds = json_decode($proposal->manager_id);
                $managers = User::whereIn('id', $managerIds)->get(['id', 'name', 'avatar']);
                $proposal->managers = $managers;
            } else {
                $proposal->managers = [];
            }
        }

        return response()->json($listProposal);
    }

    public function delete($id)
    {
        try {
            $proposal = EmployeeProposal::find($id);

            if (!$proposal) {
                return response()->json([
                    'message' => 'Không tìm thấy đề xuất cần xóa.',
                ], 404);
            }
            if ($proposal->file) {
                Storage::disk('public')->delete($proposal->file);
            }
            $proposal->delete();

            return response()->json([
                'message' => 'Xóa đề xuất thành công.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi xóa đề xuất: ' . $e->getMessage(),
            ], 500);
        }
    }
}
