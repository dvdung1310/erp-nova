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
            $startOfExtraDay1 = Carbon::create(2024, 11, 1)->startOfDay();
            $startOfExtraDay2 = Carbon::create(2024, 11, 2)->startOfDay();
            $startOfExtraDay3 = Carbon::create(2024, 11, 3)->startOfDay();
            $schedules = WorkSchedule::with('user')
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay, $startOfExtraDay1, $startOfExtraDay2, $startOfExtraDay3) {
                    $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->orWhere('date', $startOfExtraDay)
                        ->orWhere('date', $startOfExtraDay1)
                        ->orWhere('date', $startOfExtraDay2)
                        ->orWhere('date', $startOfExtraDay3);
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

    public function getWorkScheduleForWeekByUserId()
    {
        $userId = Auth::id();
        $today = Carbon::now();
        $startOfWeek = $today->startOfWeek()->format('Y-m-d'); 
        $endOfWeek = $today->endOfWeek()->format('Y-m-d');  
        
        $schedule = WorkSchedule::where('user_id', $userId)
            ->whereBetween('date', [$startOfWeek, $endOfWeek])
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
