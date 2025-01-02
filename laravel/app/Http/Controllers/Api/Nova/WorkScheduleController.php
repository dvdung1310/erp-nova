<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\WorkSchedule;
use App\Models\CrmEmployeeModel;
use App\Models\CrmDepartmentModel;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WorkScheduleController extends Controller
{
    public function store(Request $request)
    {
        try {
            $scheduleData = $request->input('schedule');
            foreach ($scheduleData as $day) {
                $date = \Carbon\Carbon::createFromFormat('d/m/Y', $day['date'])->format('Y-m-d');
                $code = ($day['morning'] ? '1' : '0') . ($day['afternoon'] ? '1' : '0') . ($day['evening'] ? '1' : '0');
                WorkSchedule::updateOrCreate(
                    [
                        'user_id' => Auth::id(),
                        'date' => $date,
                    ],
                    [
                        'code' => $code,
                    ]
                );
            }
            return response()->json(['message' => 'Lịch làm việc đã được lưu thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function getWorkSchedulesByMonth($month)
    {
        $year = date('Y');
        $startOfMonth = Carbon::createFromDate(2024, $month, 1)->startOfDay();
        $endOfMonth = Carbon::createFromDate(2025, $month, 1)->endOfMonth()->endOfDay();
        if ($month == 1) {
            $startOfExtraDay00 = Carbon::create(2024, 12, 30)->startOfDay();
            $startOfExtraDay0 = Carbon::create(2024, 12, 31)->startOfDay();
            $startOfExtraDay = Carbon::create(2025, 1, 1)->startOfDay();
            $startOfExtraDay1 = Carbon::create(2025, 1, 2)->startOfDay();
            $startOfExtraDay2 = Carbon::create(2025, 1, 3)->startOfDay();
            $startOfExtraDay3 = Carbon::create(2025, 1, 4)->startOfDay();
            $startOfExtraDay4 = Carbon::create(2025, 1, 5)->startOfDay();
            $schedules = WorkSchedule::with('user')
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay, $startOfExtraDay1, $startOfExtraDay2, $startOfExtraDay3 , $startOfExtraDay4,$startOfExtraDay0 , $startOfExtraDay00) {
                    $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->orWhere('date', $startOfExtraDay)
                        ->orWhere('date', $startOfExtraDay1)
                        ->orWhere('date', $startOfExtraDay2)
                        ->orWhere('date', $startOfExtraDay3)
                        ->orWhere('date', $startOfExtraDay4)
                        ->orWhere('date', $startOfExtraDay0)
                        ->orWhere('date', $startOfExtraDay00);
                })
                ->get()
                ->groupBy('user_id');
        } else {
            $schedules = WorkSchedule::with('user')
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->get()
                ->groupBy('user_id');
        }

        $result = $schedules->map(function ($userSchedules) {
            $user = $userSchedules->first()->user;
            $employee = CrmEmployeeModel::where('account_id', $user->id)->first();
            $department = $employee ? CrmDepartmentModel::where('department_id', $employee->department_id)->first() : null;
            $formattedSchedule = $userSchedules->mapWithKeys(function ($schedule) {
                return [
                    $schedule->date => $schedule->code,
                ];
            });
            return [
                'name' => $user->name,
                'department_name' => $department ? $department->department_name : 'No Department',
                'schedule' => $formattedSchedule,
            ];
        });
        return response()->json($result->values());
    }

    public function getWorkScheduleForWeekByUserId()
    {
        $userId = Auth::id();
        $today = Carbon::now();
        $startOfMonth = $today->copy()->startOfMonth()->subDays(3)->format('Y-m-d');
        $endOfMonth = $today->copy()->endOfMonth()->addDays(3)->format('Y-m-d');
        
        $schedule = WorkSchedule::where('user_id', $userId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get(['date', 'code']);
    
        $result = $schedule->map(function ($item) {
            $code = str_pad($item->code, 3, '0', STR_PAD_LEFT); 
            return [
                'date' => Carbon::parse($item->date)->format('d/m/Y'),
                'morning' => $code[0] === '1',  
                'afternoon' => $code[1] === '1',
                'evening' => $code[2] === '1', 
            ];
        });
    
        return response()->json($result);
    }
    
}
