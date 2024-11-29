<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\CrmDepartmentModel;
use App\Models\CrmEmployeeDayOffModel;
use App\Models\CrmEmployeeModel;
use App\Models\Devices;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class NvEmployeeDayOffController extends Controller
{
    protected $nodeUrl;
    protected $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $day_off = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_employee_day_off.*',
                    'crm_department.department_name',
                )
                ->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $day_off
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            // Lấy tất cả các department có status = 1
            $department = CrmDepartmentModel::where('department_status', 1)->get();
            return response()->json([
                'error' => false,
                'message' => 'Departments retrieved successfully.',
                'data' => [
                    'departments' => $department
                ]
            ]);
        } catch (\Throwable $th) {
            // Bắt lỗi và trả về thông báo lỗi
            return response()->json([
                'error' => true,
                'message' => 'An error occurred: ' . $th->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            CrmEmployeeDayOffModel::create($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeDayOffModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($nvdayoff)
    {
        try {
            $day_off = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_employee_day_off.*',
                    'crm_department.department_name',
                )
                ->where('off_id', $nvdayoff)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $day_off
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($nvdayoff)
    {
        try {
            $day_off = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->join('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select(
                    'crm_employee_day_off.*',
                    'crm_department.department_name',
                )
                ->where('off_id', $nvdayoff)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $day_off
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmEmployeeDayOffModel $nvdayoff)
    {
        try {
            $nvdayoff->update($request->all());
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeDayOffModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmEmployeeDayOffModel $nvdayoff)
    {
        try {
            $nvdayoff->delete();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmEmployeeDayOffModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    public function getemployeedayoff()
    {

        try {
            $user_id = auth()->user()->id;
            $employee_id = CrmEmployeeModel::where('account_id', $user_id)
                ->pluck('employee_id')
                ->first();
            $dayOff = CrmEmployeeDayOffModel::where('employee_id', $employee_id)->orderBy('day_off_start', 'desc')->paginate(10);
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'employee_id' => $employee_id,
                'data' => $dayOff
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    public function storeemployeedayoff(Request $request)
    {
        try {
            $list_manager = $request->manager_id; // This should be an array of IDs
            // Check if it's not an array and convert it to an array

            // Convert the array of manager IDs into a comma-separated string

            $manager_ids = json_encode($list_manager);

            $data = new CrmEmployeeDayOffModel();
            $data->off_title = $request->off_title;
            $data->off_content = $request->off_content;
            $data->day_off_start = $request->day_off_start;
            $data->day_off_end = $request->day_off_end;
            $data->manager_id = $manager_ids; // Save as a comma-separated string
            $data->employee_id = $request->employee_id; // Assuming you want to keep this as an array
            $data->off_status = 0;

            // Save the data to the database
            $data->save(); // Don't forget to save the model
            // gửi thông báo cho manager
            $members = $list_manager;
            $pathname = $request->pathName;
            $pathname = $pathname . '/' . $data->off_id;
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => 'Đã gửi một đề xuất nghỉ phép',
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
                Http::post($this->nodeUrl . '/new-day-off', $payload);
            }


            ///

            return response()->json([
                'error' => false,
                'message' => 'Day off stored successfully.',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'An error occurred: ' . $e->getMessage(),
                'data' => []
            ]);
        }

    }

    public function getdayoffdetail($off_id)
    {

        try {
            $data = CrmEmployeeDayOffModel::where('off_id', $off_id)->first();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $data
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    public function updatestatusdayoff($off_id, $off_status)
    {
        try {
            $data = CrmEmployeeDayOffModel::where('off_id', $off_id)->update(['off_status' => $off_status]);
            $off = CrmEmployeeDayOffModel::where('off_id', $off_id)->first();
            $statusMessage = '';
            if ($off_status == 1) {
                $statusMessage = 'Đã duyệt';
            } else {
                $statusMessage = 'Không duyệt';
            }
            $employee_id = $off->employee_id;
            $employee = CrmEmployeeModel::where('employee_id', $employee_id)->pluck('account_id')->first();
            $user_id = User::where('id', $employee)->pluck('id')->first();
            // gửi thông báo cho manager
            $members = [$user_id];
            $pathname = '/admin/nhan-su/nghi-phep';
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => 'Đã xem xét đề xuất nghỉ phép của bạn' . '(' . $statusMessage . ')',
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
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'notification' => $notifications[0],
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                    'statusMessage' => $statusMessage
                ];
                Http::post($this->nodeUrl . '/update-day-off', $payload);
            }


            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $off
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

    public function listdayoff($employee_id)
    {
        try {
            $user_id = CrmEmployeeModel::where('employee_id', $employee_id)
                ->pluck('account_id')
                ->first();
            $data = CrmEmployeeDayOffModel::join('crm_employee', 'crm_employee_day_off.employee_id', '=', 'crm_employee.employee_id')
                ->leftjoin('crm_department', 'crm_employee.department_id', '=', 'crm_department.department_id')
                ->select('crm_employee_day_off.*', 'crm_employee.employee_name', 'crm_department.department_name')
                ->whereJsonContains('crm_employee_day_off.manager_id', $user_id)
                ->get();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $data
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.' . $th,
                'data' => []
            ]);
        }
    }

}
