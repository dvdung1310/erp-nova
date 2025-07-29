<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\WorkSchedule;
use App\Models\CrmEmployeeModel;
use App\Models\CrmDepartmentModel;
use App\Models\TaskHistoryUpdate;
use App\Models\WorksCheduleTimekeepingModel;
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
                ->whereHas('user', function ($query) {
                    $query->where('status', 1);
                })
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay, $startOfExtraDay1, $startOfExtraDay2, $startOfExtraDay3, $startOfExtraDay4, $startOfExtraDay0, $startOfExtraDay00) {
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
        } elseif ($month == 2) {
            $startOfExtraDay0 = Carbon::create(2025, 3, 1)->startOfDay();
            $startOfExtraDay1 = Carbon::create(2025, 3, 2)->startOfDay();
            $schedules = WorkSchedule::with('user')
                ->whereHas('user', function ($query) {
                    $query->where('status', 1);
                })
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay1, $startOfExtraDay0) {
                    $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->orWhere('date', $startOfExtraDay0)
                        ->orWhere('date', $startOfExtraDay1);
                })
                ->get()
                ->groupBy('user_id');
        } else if ($month == 7) {
            $startOfExtraDay00 = Carbon::create(2025, 6, 30)->startOfDay();
            $startOfExtraDay0 = Carbon::create(2025, 7, 1)->startOfDay();
            $startOfExtraDay = Carbon::create(2025, 7, 2)->startOfDay();
            $startOfExtraDay1 = Carbon::create(2025, 7, 3)->startOfDay();
            $startOfExtraDay2 = Carbon::create(2025, 7, 4)->startOfDay();
            $startOfExtraDay3 = Carbon::create(2025, 7, 5)->startOfDay();
            $startOfExtraDay4 = Carbon::create(2025, 7, 6)->startOfDay();
            $startOfExtraDay80 = Carbon::create(2025, 8, 1)->startOfDay();
            $startOfExtraDay81 = Carbon::create(2025, 8, 2)->startOfDay();
            $startOfExtraDay82 = Carbon::create(2025, 8, 3)->startOfDay();
            $schedules = WorkSchedule::with('user')
                ->whereHas('user', function ($query) {
                    $query->where('status', 1);
                })
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay, $startOfExtraDay1, $startOfExtraDay2, $startOfExtraDay3, $startOfExtraDay4, $startOfExtraDay0, $startOfExtraDay00,$startOfExtraDay80,$startOfExtraDay81,$startOfExtraDay82) {
                    $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->orWhere('date', $startOfExtraDay)
                        ->orWhere('date', $startOfExtraDay1)
                        ->orWhere('date', $startOfExtraDay2)
                        ->orWhere('date', $startOfExtraDay3)
                        ->orWhere('date', $startOfExtraDay4)
                        ->orWhere('date', $startOfExtraDay0)
                        ->orWhere('date', $startOfExtraDay00)
                        ->orWhere('date', $startOfExtraDay80)
                        ->orWhere('date', $startOfExtraDay81)
                        ->orWhere('date', $startOfExtraDay82);
                })
                ->get()
                ->groupBy('user_id');
        } else if ($month == 10) {
            $startOfExtraDay0 = Carbon::create(2025, 9, 29)->startOfDay();
            $startOfExtraDay1 = Carbon::create(2025, 9, 30)->startOfDay();
            $startOfExtraDay2 = Carbon::create(2025, 11, 1)->startOfDay();
            $startOfExtraDay3 = Carbon::create(2025, 11, 2)->startOfDay();
            $schedules = WorkSchedule::with('user')
                ->whereHas('user', function ($query) {
                    $query->where('status', 1);
                })
                ->where(function ($query) use ($startOfMonth, $endOfMonth, $startOfExtraDay1, $startOfExtraDay0,$startOfExtraDay3,$startOfExtraDay2) {
                    $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->orWhere('date', $startOfExtraDay0)
                        ->orWhere('date', $startOfExtraDay1)
                        ->orWhere('date', $startOfExtraDay2)
                        ->orWhere('date', $startOfExtraDay3);
                })
                ->get()
                ->groupBy('user_id');
        } else {
            $schedules = WorkSchedule::with('user')
                ->whereHas('user', function ($query) {
                    $query->where('status', 1);
                })
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

    public function store_excel(Request $request)
    {
        $dataExcel = $request->input('dataExcel');
        foreach ($dataExcel as $record) {

            $user = User::where('manv', $record['manv'])->first();
            if (!$user) {
                continue;
            }
            WorksCheduleTimekeepingModel::updateOrCreate(
                ['manv' => $record['manv'], 'date' => $record['date']],

                [
                    'user_id' => $user->id,
                    'check_in_time' => $record['time_in'],
                    'check_out_time' => $record['time_out'],
                ]
            );
        }
        return response()->json(['message' => 'Dữ liệu đã được lưu hoặc cập nhật thành công!'], 200);
    }

    public function getWorkSchedulesByMonthTimekeeping($month)
    {
        $year = date('Y');
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        // Lấy dữ liệu từ bảng WorkSchedule (lịch làm việc)
        $workSchedulesQuery = WorkSchedule::with('user')
            ->whereBetween('date', [$startOfMonth, $endOfMonth]);

        if ($month == 1) {
            $extraDays = [
                Carbon::create($year - 1, 12, 30),
                Carbon::create($year - 1, 12, 31),
                Carbon::create($year, 1, 1),
                Carbon::create($year, 1, 2),
                Carbon::create($year, 1, 3),
                Carbon::create($year, 1, 4),
                Carbon::create($year, 1, 5),
            ];

            $workSchedulesQuery->orWhere(function ($query) use ($extraDays) {
                foreach ($extraDays as $day) {
                    $query->orWhere('date', $day);
                }
            });
        }

        if ($month == 2) {
            $extraDays = [
                Carbon::create($year, 3, 1),
                Carbon::create($year, 3, 2),
            ];
            $workSchedulesQuery->orWhere(function ($query) use ($extraDays) {
                foreach ($extraDays as $day) {
                    $query->orWhere('date', $day);
                }
            });
        }

        $workSchedules = $workSchedulesQuery->get()->groupBy('user_id');

        // Lấy dữ liệu từ bảng WorkScheduleTimekeeping (chấm công)
        $timekeepingRecords = WorksCheduleTimekeepingModel::whereBetween('date', [$startOfMonth, $endOfMonth])->get()->groupBy('user_id');

        $workReports = TaskHistoryUpdate::whereRaw('DATE(update_time) BETWEEN ? AND ?', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->get()
            ->groupBy('user_id');

        $result = $workSchedules->map(function ($userSchedules, $userId) use ($timekeepingRecords, $workReports) {
            $user = $userSchedules->first()->user;
            $employee = CrmEmployeeModel::where('account_id', $user->id)->first();
            $department = $employee ? CrmDepartmentModel::where('department_id', $employee->department_id)->first() : null;

            $formattedSchedule = $userSchedules->mapWithKeys(function ($schedule) use ($timekeepingRecords, $workReports, $userId) {
                $date = $schedule->date;
                $registeredCode = $schedule->code;

                // Kiểm tra chấm công
                $timekeeping = $timekeepingRecords->get($userId)?->firstWhere('date', $date);
                $workingHours = 0;

                if ($timekeeping && $timekeeping->check_in_time && $timekeeping->check_out_time) {
                    // Tính tổng thời gian làm việc
                    $checkIn = Carbon::parse($timekeeping->check_in_time);
                    $checkOut = Carbon::parse($timekeeping->check_out_time);
                    $totalMinutes = $checkIn->diffInMinutes($checkOut);

                    // Tính số công bằng cách lấy tổng số phút chia cho 480 (8 tiếng = 480 phút)
                    $checkedIn = $totalMinutes / 480;

                    // Giới hạn số công tối đa là 1
                    if ($checkedIn > 1) {
                        $checkedIn = 1;
                    }
                    $checkedIn = round($checkedIn, 3);
                } else {
                    $checkedIn = 0; // Không đủ cả check-in và check-out
                }


                // $checkedIn = $timekeeping && $timekeeping->check_in_time && $timekeeping->check_out_time ? '1' : '0';

                // Kiểm tra đăng ký lịch làm việc
                $hasRegisteredWork = strpos($registeredCode, '1') !== false ? '1' : '0';

                // Kiểm tra bảng báo cáo để xác định ký tự thứ 3
                $hasReport = $workReports->get($userId)?->first(function ($report) use ($date) {
                    return Carbon::parse($report->update_time)->toDateString() === $date;
                }) ? '1' : '0';

                $finalCode = "{$checkedIn}-{$hasRegisteredWork}-{$hasReport}";
                return [
                    $date => $finalCode,
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

    public function getWorkSchedulesByMonthTimekeepingExportExcel($month)
    {
        $year = date('Y');
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        $workSchedulesQuery = WorkSchedule::with('user')
            ->whereBetween('date', [$startOfMonth, $endOfMonth]);

        $workSchedules = $workSchedulesQuery->get()->groupBy('user_id');
        // Lấy dữ liệu từ bảng WorkScheduleTimekeeping (chấm công)
        $timekeepingRecords = WorksCheduleTimekeepingModel::whereBetween('date', [$startOfMonth, $endOfMonth])->get()->groupBy('user_id');

        $workReports = TaskHistoryUpdate::whereRaw('DATE(update_time) BETWEEN ? AND ?', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->get()
            ->groupBy('user_id');

        $result = $workSchedules->map(function ($userSchedules, $userId) use ($timekeepingRecords, $workReports) {
            $user = $userSchedules->first()->user;
            $employee = CrmEmployeeModel::where('account_id', $user->id)->first();
            $department = $employee ? CrmDepartmentModel::where('department_id', $employee->department_id)->first() : null;

            $formattedSchedule = $userSchedules->mapWithKeys(function ($schedule) use ($timekeepingRecords, $workReports, $userId) {
                $date = $schedule->date;
                $registeredCode = $schedule->code;

                // Kiểm tra chấm công
                $timekeeping = $timekeepingRecords->get($userId)?->firstWhere('date', $date);
                $workingHours = 0;
                $checkIn = 'N/A';
                $checkOut = 'N/A';
                if (isset($timekeeping->check_in_time)) {
                    $checkIn = $timekeeping->check_in_time;
                }
                if (isset($timekeeping->check_out_time)) {
                    $checkOut = $timekeeping->check_out_time;
                }
                if ($timekeeping && $timekeeping->check_in_time && $timekeeping->check_out_time) {
                    // Tính tổng thời gian làm việc
                    $checkIn = Carbon::parse($timekeeping->check_in_time);
                    $checkOut = Carbon::parse($timekeeping->check_out_time);
                    $totalMinutes = $checkIn->diffInMinutes($checkOut);

                    // Tính số công bằng cách lấy tổng số phút chia cho 480 (8 tiếng = 480 phút)
                    $checkedIn = $totalMinutes / 480;
                    $checkIn = $timekeeping->check_in_time;
                    $checkOut = $timekeeping->check_out_time;
                    // Giới hạn số công tối đa là 1
                    if ($checkedIn > 1) {
                        $checkedIn = 1;
                    }
                    $checkedIn = round($checkedIn, 3);
                } else {
                    $checkedIn = 0; // Không đủ cả check-in và check-out
                }


                // $checkedIn = $timekeeping && $timekeeping->check_in_time && $timekeeping->check_out_time ? '1' : '0';

                // Kiểm tra đăng ký lịch làm việc
                $hasRegisteredWork = strpos($registeredCode, '1') !== false ? '1' : '0';

                // Kiểm tra bảng báo cáo để xác định ký tự thứ 3
                $hasReport = $workReports->get($userId)?->first(function ($report) use ($date) {
                    return Carbon::parse($report->update_time)->toDateString() === $date;
                }) ? '1' : '0';

                $finalCode = "{$checkIn}-{$checkOut}-{$checkedIn}-{$hasRegisteredWork}-{$hasReport}";
                return [
                    $date => $finalCode,
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

    public function get_user_workschedule_timekeeping($month, $name)
    {
        $year = date('Y');
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        // Tìm user theo tên
        $user = User::where('name', $name)->first();
        if (!$user) {
            return response()->json(['error' => 'Bạn hãy điền đầy đủ tên nhân sự'], 404);
        }

        // Lấy lịch làm việc của user đó trong tháng
        $workSchedules = WorkSchedule::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        // Lấy dữ liệu chấm công của user trong tháng
        $timekeepingRecords = WorksCheduleTimekeepingModel::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        // Lấy dữ liệu báo cáo công việc
        $workReports = TaskHistoryUpdate::where('user_id', $user->id)
            ->whereRaw('DATE(update_time) BETWEEN ? AND ?', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->get();

        $employee = CrmEmployeeModel::where('account_id', $user->id)->first();
        $department = $employee ? CrmDepartmentModel::where('department_id', $employee->department_id)->first() : null;

        $formattedSchedule = $workSchedules->mapWithKeys(function ($schedule) use ($timekeepingRecords, $workReports, $user) {
            $date = $schedule->date;
            $registeredCode = $schedule->code;

            // Kiểm tra chấm công
            $timekeeping = $timekeepingRecords->firstWhere('date', $date);
            $checkIn = $timekeeping?->check_in_time ?? 'N/A';
            $checkOut = $timekeeping?->check_out_time ?? 'N/A';
            $checkedIn = 0;

            if ($timekeeping && $timekeeping->check_in_time && $timekeeping->check_out_time) {
                $checkInTime = Carbon::parse($timekeeping->check_in_time);
                $checkOutTime = Carbon::parse($timekeeping->check_out_time);
                $totalMinutes = $checkInTime->diffInMinutes($checkOutTime);
                $checkedIn = min(1, round($totalMinutes / 480, 3)); // Giới hạn tối đa 1 công
            }

            // Kiểm tra lịch làm việc
            $hasRegisteredWork = strpos($registeredCode, '1') !== false ? '1' : '0';

            // Kiểm tra báo cáo công việc
            $hasReport = $workReports->first(fn($report) => Carbon::parse($report->update_time)->toDateString() === $date) ? '1' : '0';

            $finalCode = "{$checkIn}-{$checkOut}-{$checkedIn}-{$hasRegisteredWork}-{$hasReport}";

            return [$date => $finalCode];
        });

        return response()->json([
            'name' => $user->name,
            'department_name' => $department?->department_name ?? 'No Department',
            'schedule' => $formattedSchedule,
        ]);
    }
}
