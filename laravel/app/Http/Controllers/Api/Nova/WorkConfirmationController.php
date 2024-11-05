<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmEmployeeModel;
use App\Models\CrmDepartmentModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\Role;
use App\Models\EmployeeWorkConfirmation;
use App\Models\EmployeeWorkConfirmationDetails;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class WorkConfirmationController extends Controller
{
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

    public function updateDetailWorkConfimation(Request $request){
       return 2;
    }

    public function listWorkConfimationUser()
    {
        $employee = CrmEmployeeModel::where('account_id', Auth::id())->first();
        $listWork = EmployeeWorkConfirmation::where('employee_id', $employee->employee_id)->get();
        return response()->json($listWork);
    }
}