<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\WorkSchedule;
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
            return response()->json(['message' => 'Lịch làm việc đã được lưu thành công !']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function getWorkSchedulesByMonth($month)
    {
        $year = date('Y');
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        if ($month == 10) {
            $startOfExtraDay = Carbon::create(2024, 9, 30)->startOfDay();
            $schedules = WorkSchedule::with('user')
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay) {
                    $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->orWhere('date', $startOfExtraDay);
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
            $formattedSchedule = $userSchedules->mapWithKeys(function ($schedule) {
                return [
                    $schedule->date => $schedule->code,
                ];
            });
            return [
                'name' => $user->name,
                'schedule' => $formattedSchedule,
            ];
        });
        return response()->json($result->values());
    }
}
