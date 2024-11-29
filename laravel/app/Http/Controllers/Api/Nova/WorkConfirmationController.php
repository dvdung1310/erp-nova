<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmEmployeeModel;
use App\Models\CrmDepartmentModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\Devices;
use App\Models\Notification;
use App\Models\Role;
use App\Models\EmployeeWorkConfirmation;
use App\Models\EmployeeWorkConfirmationDetails;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WorkConfirmationController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    //
    public function store(Request $request)
    {
        $request->validate([
            'confirmations' => 'required|array',
            'confirmations.*.workDate' => 'required|date',
            'confirmations.*.time' => 'required|string|max:20',
            'confirmations.*.workNumber' => 'required',
            'confirmations.*.workContent' => 'required|string',
            'confirmations.*.reason' => 'required|string',
        ]);
        $employee = CrmEmployeeModel::where('account_id', Auth::id())->first();

        $workConfirmation = EmployeeWorkConfirmation::create([
            'employee_id' => $employee->employee_id,
        ]);

        foreach ($request->confirmations as $confirmation) {
            EmployeeWorkConfirmationDetails::create([
                'work_confirmation_id' => $workConfirmation->id,
                'work_date' => $confirmation['workDate'],
                'time' => $confirmation['time'],
                'work_number' => $confirmation['workNumber'],
                'work_content' => $confirmation['workContent'],
                'reason' => $confirmation['reason'],
            ]);
        }

        return response()->json(
            [
                'message' => 'Hoàn thành lưu xác nhận công , hãy gửi xác nhận công này cho Leader',
                'workConfirmationId' => $workConfirmation->id
            ],
            201
        );
    }

    public function storeWorkConfirmationManager(Request $request)
    {
        $request->validate([
            'confirmations.workConfirmationId' => 'required|integer|exists:employee_work_confirmation,id',
            'confirmations.list_members' => 'required|array',
        ]);

        $confirmations = $request->confirmations;
        $list_members = json_encode($confirmations['list_members']);
        $EmployeeWorkConfirmation = EmployeeWorkConfirmation::find($confirmations['workConfirmationId']);

        if ($EmployeeWorkConfirmation) {
            $EmployeeWorkConfirmation->manager_id = $list_members; // Lưu danh sách members
            $EmployeeWorkConfirmation->save();
            // Gửi thông báo cho members
            $members = json_decode($list_members);
            $pathname = $request->input('confirmations.pathname');
            $pathname = $pathname . '/' . $EmployeeWorkConfirmation->id;
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => 'Đã gửi một đề xuất xác nhận công',
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
                Http::post($this->nodeUrl . '/new-work-confirmation', $payload);
            }

            return response()->json(['message' => 'Hoàn Thành gửi xác nhận công'], 200);
        } else {
            return response()->json(['message' => 'Có lỗi xảy ra'], 404);
        }
    }


    public function detailWorkConfirmation($id)
    {
        $employeeWorkConfirmation = EmployeeWorkConfirmation::with(['employee', 'details'])
            ->find($id);

        if (!$employeeWorkConfirmation) {
            return response()->json(['message' => 'Không tìm thấy xác nhận công việc'], 404);
        }

        // phòng ban
        $department_name = CrmDepartmentModel::where('department_id', $employeeWorkConfirmation->employee->department_id)->pluck('department_name')->first();
        // chức vụ
        $employee = CrmEmployeeModel::where('account_id', Auth::id())->first();
        $level_name = CrmEmployeeLevelModel::where('level_id', $employee->level_id)->pluck('level_name')->first();
        $result = [
            'work_confirmation_id' => $id,
            'status' => $employeeWorkConfirmation->status,
            'employee_name' => $employeeWorkConfirmation->employee->employee_name,
            'employee_id' => $employeeWorkConfirmation->employee->employee_id,
            'department_name' => $department_name,
            'level_name' => $level_name,
            'work_confirmation_details' => $employeeWorkConfirmation->details->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'work_date' => $detail->work_date,
                    'time' => $detail->time,
                    'work_number' => $detail->work_number,
                    'work_content' => $detail->work_content,
                    'reason' => $detail->reason
                ];
            })
        ];

        return response()->json($result);
    }

    public function deleteDetailworkconfirmation($id)
    {
        try {
            $detail = EmployeeWorkConfirmationDetails::find($id);
            if ($detail) {
                $detail->delete();
                return response()->json(['message' => 'Xóa dữ liệu thành công!'], 200);
            } else {
                return response()->json(['message' => 'Dữ liệu không tồn tại!'], 404);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi trong quá trình xóa dữ liệu!', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateDetailWorkConfimation(Request $request)
    {
        $detail = EmployeeWorkConfirmationDetails::find($request->detailconfirmations['id']);
        $detail->work_date = $request->detailconfirmations['id'];
        $detail->time = $request->detailconfirmations['time'];
        $detail->work_date = $request->detailconfirmations['work_date'];
        $detail->work_number = $request->detailconfirmations['work_number'];
        $detail->work_content = $request->detailconfirmations['work_content'];
        $detail->reason = $request->detailconfirmations['reason'];
        $detail->save();
        return response()->json(['message' => 'Hoàn thành cập nhật xác nhận công'], 200);
    }

    public function listWorkConfimationUser()
    {
        $employee = CrmEmployeeModel::where('account_id', Auth::id())->first();
        $listWork = EmployeeWorkConfirmation::where('employee_id', $employee->employee_id)->get();

        foreach ($listWork as $work) {
            if ($work->manager_id) {
                $managerIds = json_decode($work->manager_id);
                $managers = User::whereIn('id', $managerIds)->get(['id', 'name', 'avatar']);
                $work->managers = $managers;
            } else {
                $work->managers = [];
            }
        }

        return response()->json($listWork);
    }

    public function deleteworkconfirmation($id)
    {
        try {
            $detail = EmployeeWorkConfirmation::find($id);
            if ($detail) {
                $detail->delete();
                return response()->json(['message' => 'Xóa dữ liệu thành công!'], 200);
            } else {
                return response()->json(['message' => 'Dữ liệu không tồn tại!'], 404);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi trong quá trình xóa dữ liệu!', 'error' => $e->getMessage()], 500);
        }
    }


    public function getEmployeeConfirmations()
    {
        $confirmations = EmployeeWorkConfirmation::whereJsonContains('manager_id', Auth::id())
            ->get(['id', 'employee_id', 'created_at', 'updated_at', 'status']);
        $confirmations = $confirmations->map(function ($confirmation) {
            $employee = CrmEmployeeModel::where('employee_id', $confirmation->employee_id)->first();
            $user = User::where('id', $employee->account_id)->first();
            $confirmation->employee_name = $employee ? $employee->employee_name : null;
            $confirmation->avatar = $user ? $user->avatar : null;
            return $confirmation;
        });

        return response()->json($confirmations);
    }

    public function listWorkConfimationStatus1()
    {
        $confirmations = EmployeeWorkConfirmation::all();
        $confirmations = $confirmations->map(function ($confirmation) {
            $employee = CrmEmployeeModel::where('employee_id', $confirmation->employee_id)->first();
            $user = User::where('id', $employee->account_id)->first();
            $confirmation->employee_name = $employee ? $employee->employee_name : null;
            $confirmation->avatar = $user ? $user->avatar : null;
            return $confirmation;
        });
        return response()->json($confirmations);
    }

    public function updateStatus($id, $status)
    {
        $confirmations = EmployeeWorkConfirmation::find($id);
        $confirmations->status = $status;
        $confirmations->save();
        // Gửi thông báo cho người tạo
        $confirmation_status = $confirmations->status;
        $statusMessage = '';
        if ($confirmation_status == 1) {
            $statusMessage = 'Đã duyệt';
        } else {
            $statusMessage = 'Không duyệt';
        }
        $user_id = User::where('id', $confirmations->employee->account_id)->pluck('id')->first();
        $members = [$user_id];
        $pathname = '/admin/nhan-su/chi-tiet-xac-nhan-cong/' . $id;
        $createByUserName = auth()->user()->name;
        $create_by_user_id = auth()->user()->id;
        $notifications = [];
        foreach ($members as $user_id) {
            if ($user_id != $create_by_user_id) {
                $notifications[] = [
                    'user_id' => $user_id,
                    'create_by_user_id' => $create_by_user_id,
                    'notification_title' => 'Đã xem xét đề xuất xác nhận công của bạn' . '(' . $statusMessage . ')',
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
            Http::post($this->nodeUrl . '/update-work-confirmation', $payload);
        }
        return response()->json([
            'message' => 'Hoàn thành xác nhận công',
            'data' => $user_id
        ], 200);
    }
}
