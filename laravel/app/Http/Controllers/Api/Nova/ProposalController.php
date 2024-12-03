<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\EmployeeProposal;
use App\Models\CrmEmployeeModel;
use App\Models\CrmDepartmentModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProposalController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

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
        $list_manager = $request->members;
        $proposal = EmployeeProposal::create([
            'user_id' => Auth::id(),
            'manager_id' => $list_manager,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 0,
            'file' => $filePath,
        ]);
        // gửi thông báo cho người quản lý
        $members = json_decode($request->members, true);
        $pathname = $request->input('pathname');
        $pathname = $pathname . '/' . $proposal->id;
        $createByUserName = auth()->user()->name;
        $create_by_user_id = auth()->user()->id;
        $notifications = [];
        foreach ($members as $user_id) {
            if ($user_id != $create_by_user_id) {
                $notifications[] = [
                    'user_id' => $user_id,
                    'create_by_user_id' => $create_by_user_id,
                    'notification_title' => 'Đã gửi một đề xuất mới',
                    'notification_link' => $this->ClientUrl . $pathname,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        Notification::insert($notifications);
        $devices = Devices::whereIn('user_id', $members)
            ->where('user_id', '!=', $create_by_user_id)
            ->get();
        $devices = $devices->map(function ($device) {
            return json_decode($device->endpoint, true);
        })->filter()->values()->toArray();
        $notification = Notification::where('notification_link', $this->ClientUrl . $pathname)->first();
        if (!empty($notifications)) {
            $payload = [
                'members' => $members,
                'devices' => $devices,
                'createByUserName' => $createByUserName,
                'notification' => $notification,
                'createByUserId' => $create_by_user_id,
                'pathname' => $pathname,
            ];
            Http::post($this->nodeUrl . '/new-proposals', $payload);
        }

        return response()->json([
            'message' => 'Thêm dữ liệu thành công',
            'data' => $proposal,
        ], 201);
    }


    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|Integer',
            'members' => 'required|json',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Có lỗi nhập dữ liệu',
                'errors' => $validator->errors(),
            ], 422);
        }

        $proposal = EmployeeProposal::findOrFail($request->key);
        if ($proposal->user_id !== Auth::id()) {
            return response()->json(['message' => 'Không có quyền cập nhật'], 403);
        }

        if ($request->hasFile('file')) {
            if ($proposal->file) {
                Storage::disk('public')->delete($proposal->file);
            }
            $filePath = $request->file('file')->store('proposals', 'public');
        } else {
            $filePath = $proposal->file;
        }

        $proposal->update([
            'manager_id' => $request->members,
            'title' => $request->title,
            'description' => $request->description,
            'file' => $filePath,
        ]);

        return response()->json([
            'message' => 'Cập nhật dữ liệu thành công',
            'data' => $proposal,
        ], 200);
    }

    public function detail($id)
    {
        $proposal = EmployeeProposal::with('user')
            ->findOrFail($id);
        $employee = CrmEmployeeModel::where('account_id', $proposal->user_id)->first();
        // phòng ban
        $department_name = CrmDepartmentModel::where('department_id', $employee->department_id)->pluck('department_name')->first();
        $level_name = CrmEmployeeLevelModel::where('level_id', $employee->level_id)->pluck('level_name')->first();

        return response()->json([
            'message' => 'Lấy dữ liệu thành công',
            'data' => $proposal,
            'employee' => $employee,
            'department_name' => $department_name,
            'level_name' => $level_name
        ], 200);
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

    // kiểm tra danh sách đề Xuất
    public function getEmployeeConfirmations()
    {
        $proposals = EmployeeProposal::whereJsonContains('manager_id', Auth::id())
            ->get(['id', 'user_id', 'created_at', 'updated_at', 'status']);
        $proposals = $proposals->map(function ($proposal) {
            $user = User::find($proposal->user_id);
            $proposal->avatar = $user ? $user->avatar : null;
            $proposal->employee_name = $user ? $user->name : null;
            return $proposal;
        });
        return response()->json($proposals);
    }

    public function updateStatus($id, $status)
    {
        $proposals = EmployeeProposal::find($id);
        if (!$proposals) {
            return response()->json(['message' => 'Không tìm thấy đề xuất'], 404);
        }
        $proposals->approved_by = auth()->user()->id;
        $proposals->status = $status;
        $proposals->save();
        // Gửi thông báo cho người tạo
        $proposals_status = $proposals->status;
        $statusMessage = '';
        if ($proposals_status == 1) {
            $statusMessage = 'Đã duyệt';
        } else {
            $statusMessage = 'Không duyệt';
        }
        $user_id = User::where('id', $proposals->user_id)->pluck('id')->first();
        $members = [$user_id];
        $pathname = '/admin/de-xuat/chi-tiet/' . $id;
        $createByUserName = auth()->user()->name;
        $create_by_user_id = auth()->user()->id;
        $notifications = [];
        foreach ($members as $user_id) {
            if ($user_id != $create_by_user_id) {
                $notifications[] = [
                    'user_id' => $user_id,
                    'create_by_user_id' => $create_by_user_id,
                    'notification_title' => 'Đã xem xét đề xuất của bạn' . '(' . $statusMessage . ')',
                    'notification_link' => $this->ClientUrl . $pathname,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        Notification::insert($notifications);
        $devices = Devices::whereIn('user_id', $members)
            ->where('user_id', '!=', $create_by_user_id)
            ->get();
        $devices = $devices->map(function ($device) {
            return json_decode($device->endpoint, true);
        })->filter()->values()->toArray();
        $notification = Notification::where('notification_link', $this->ClientUrl . $pathname)->first();
        if (!empty($notifications)) {
            $payload = [
                'members' => $members,
                'devices' => $devices,
                'createByUserName' => $createByUserName,
                'notification' => $notification,
                'createByUserId' => $create_by_user_id,
                'pathname' => $pathname,
                'statusMessage' => $statusMessage
            ];
            Http::post($this->nodeUrl . '/update-proposals', $payload);
        }
        return response()->json([
            'data' => $proposals,
            'message' => 'Duyệt đề xuất thành công'
        ], 200);
    }
}
