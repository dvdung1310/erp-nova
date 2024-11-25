<?php

namespace App\Http\Controllers\Api\Nvt;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerDataSource;
use App\Models\CustomerSale;
use App\Models\CustomerStatus;
use App\Models\NvtStudentModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class NvtCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $customer = Customer::join('nvt_student', 'customers.id', '=', 'nvt_student.parent_id')
                ->leftJoin('customer_status', 'customers.status_id', '=', 'customer_status.id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('customer_sales', 'customers.id', '=', 'customer_sales.customer_id')
                ->join('users', 'customer_sales.user_id', '=', 'users.id')
                ->select(
                    'customers.*',
                    'customer_status.name as status_name',
                    'customer_data_source.name as source_name',
                    'users.name as sales_names',
                    'nvt_student.student_name'
                )
                ->orderBy('created_at', 'desc')
                ->whereNotNull('customer_sales.user_id')
                ->where('customer_data_source.source', 'novateen')
                ->paginate(20);
            $statuses = CustomerStatus::select('id', 'name', 'color')->get();
            $dataSources = CustomerDataSource::select('id', 'name')->where('source', 'novateen')->where('status', 1)->get();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $customer,
                'statuses' => $statuses,
                'data_sources' => $dataSources,
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storestudent(Request $request)
    {
        $user_id = auth()->user()->id;

        // Xử lý giá trị của 'date' nếu có
        $date = !empty($request->date) && $request->date !== 'null'
            ? Carbon::parse($request->date)->format('Y-m-d')
            : null;

        // Chuyển đổi student_subject sang JSON
        $student_subject = json_encode($request->student_subject, JSON_UNESCAPED_UNICODE);

        try {
            // Lưu thông tin khách hàng
            $customer = Customer::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'date' => $date,
                'file_infor' => $request->file_infor ?? null,
                'status_id' => $request->status_id,
                'source_id' => $request->source_id,
            ]);

            // Lưu thông tin sinh viên
            NvtStudentModel::create([
                'student_name' => $request->student_name,
                'student_birthday' => $date,
                'parent_id' => $customer->id,
                'student_note' => $request->student_note,
                'student_subject' => $student_subject,
                'student_status' => 1,
            ]);

            // Tạo bản ghi liên kết giữa khách hàng và nhân viên
            CustomerSale::create([
                'customer_id' => $customer->id,
                'user_id' => $user_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Khách hàng đã được tạo thành công.',
                'data' => $customer,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Display the specified resource.
     */
    public function show($nvtcustomer)
    {
        try {
            $customer = Customer::join('customer_status', 'customers.status_id', '=', 'customer_status.id')
                ->join('nvt_student', 'customers.id', '=', 'nvt_student.parent_id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('customer_sales', 'customers.id', '=', 'customer_sales.customer_id')
                ->join('users', 'customer_sales.user_id', '=', 'users.id')
                ->select(
                    'customers.*',
                    'customer_status.name as status_name',
                    'customer_data_source.name as source_name',
                    'users.name as sales_names',
                    'nvt_student.student_id',
                    'nvt_student.student_name',
                    'nvt_student.student_birthday',
                    'nvt_student.student_note',
                    'nvt_student.student_subject',
                    'nvt_student.student_status'
                )
                ->orderBy('created_at', 'desc')
                ->where('customers.id', $nvtcustomer)->first();
            $statuses = CustomerStatus::select('id', 'name', 'color')->get();
            $dataSources = CustomerDataSource::select('id', 'name')->where('source', 'novateen')->where('status', 1)->get();
            return response()->json([
                'success' => true,
                'message' => 'Khách hàng đã được tạo thành công.',
                'data' => $customer,
                'statuses' => $statuses,
                'data_sources' => $dataSources,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update_parent(Request $request, $id)
    {
        try {
            // return response()->json([
            //     'id' => $id,
            //     'request_data' => $request->all(),
            // ]);
            $parent = Customer::findOrFail($id);
            // Cập nhật thông tin khách hàng
            $parent->name = $request->name;
            $parent->phone = $request->phone;
            $parent->date = $request->student_birthday;
            $parent->email = $request->email;
            $parent->status_id = $request->status_id;
            $parent->source_id = $request->source_id;
            $parent->save();

            // Cập nhật thông tin học sinh
            $student_id = $request->student_id;
            if (!$student_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin học sinh không hợp lệ',
                ], 400);
            }

            $student = NvtStudentModel::findOrFail($student_id);
            $student->student_name = $request->student_name;
            $student->student_birthday = $request->student_birthday;
            // $student->student_note = $request->student_note;
            $student->student_subject = $request->student_subject;
            $student->save();

            // Trả về thông tin đã cập nhật
            $customer = Customer::join('customer_status', 'customers.status_id', '=', 'customer_status.id')
                ->join('nvt_student', 'customers.id', '=', 'nvt_student.parent_id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('customer_sales', 'customers.id', '=', 'customer_sales.customer_id')
                ->join('users', 'customer_sales.user_id', '=', 'users.id')
                ->select(
                    'customers.*',
                    'customer_status.name as status_name',
                    'customer_data_source.name as source_name',
                    'users.name as sales_names',
                    'nvt_student.student_id',
                    'nvt_student.student_name',
                    'nvt_student.student_birthday',
                    'nvt_student.student_note',
                    'nvt_student.student_subject',
                    'nvt_student.student_status'
                )
                ->where('customers.id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin khách hàng thành công.',
                'data' => $customer,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    public function data_source_novateen()
    {
        try {
            $data = CustomerDataSource::where('source', 'novateen')->get();
            return response()->json([
                'success' => true,
                'message' => 'Nguồn khách hàng',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy nguồn khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_source_novateen(Request $request)
    {
        try {
            $data = new CustomerDataSource();
            $data['name'] = $request->name;
            $data['status'] = $request->status;
            $data['source'] = 'novateen';
            $data->save();
            // $getdata = $this->data_source_novateen();
            return response()->json([
                'success' => true,
                'message' => 'Nguồn khách hàng',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy nguồn khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_source_novateen(Request $request)
    {
        $id = $request->input('id');
        $status = CustomerDataSource::find($id);
        if (!$status) {
            return response()->json(['message' => 'Nguồn khách hàng không tồn tại.'], 404);
        }
        $status->update($request->only(['name', 'status']));

        return response()->json(['message' => 'Cập nhật nguồn khách hàng thành công!', 'status' => $status], 200);
    }

    public function nvt_import_data(Request $request)
    {
        try {
            $user_id = auth()->user()->id;

            // Kiểm tra nếu file không tồn tại
            if (!$request->hasFile('file')) {
                return response()->json(['error' => 'Vui lòng tải lên file CSV'], 400);
            }

            $file = $request->file('file');

            // Kiểm tra định dạng file (chỉ chấp nhận CSV)
            $extension = $file->getClientOriginalExtension();
            if ($extension !== 'csv') {
                return response()->json(['error' => 'Chỉ chấp nhận file CSV'], 400);
            }

            // Mở file CSV để đọc
            if (($handle = fopen($file->getRealPath(), 'r')) !== false) {
                $header = fgetcsv($handle, 1000, ','); // Đọc dòng đầu tiên làm tiêu đề

                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    try {
                        // Kiểm tra và định dạng ngày tháng
                        $formattedDate = isset($row[2]) ? Carbon::parse($row[2])->format('Y-m-d') : null;

                        // Kiểm tra nếu cột "Nguồn data" trống
                        $sourceId = empty($row[6]) ? null : explode('|', $row[6])[0];

                        // Kiểm tra xem khách hàng đã tồn tại chưa (dựa vào số điện thoại)
                        $existingCustomer = Customer::where('phone', $row[3] ?? null)->first();
                        if ($existingCustomer) {
                            continue; // Bỏ qua nếu khách hàng đã tồn tại
                        }

                        // Tạo khách hàng mới
                        $customer = Customer::create([
                            'name' => $row[0] ?? null,
                            'phone' => $row[3] ?? null,
                            'date' => $formattedDate,
                            'email' => $row[4] ?? null,
                            'source_id' => $sourceId,
                            'status_id ' => 1,
                        ]);

                        // Tạo bản ghi bán hàng cho khách hàng
                        CustomerSale::create([
                            'customer_id' => $customer->id,
                            'manager_sale' => $user_id,
                        ]);

                        // Kiểm tra xem học sinh đã tồn tại chưa (dựa vào tên và ngày sinh)
                        $existingStudent = NvtStudentModel::where('student_name', $row[1] ?? null)
                            ->where('student_birthday', $formattedDate)
                            ->first();
                        if ($existingStudent) {
                            continue; // Bỏ qua nếu học sinh đã tồn tại
                        }

                        // Tạo học sinh mới
                        NvtStudentModel::create([
                            'student_name' => $row[1] ?? null,
                            'student_birthday' => $formattedDate,
                            'parent_id' => $customer->id,
                            'student_note' => $row[5] ?? null,
                            'student_status' => 1,
                        ]);
                    } catch (\Exception $e) {
                        // Ghi log lỗi hoặc bỏ qua dòng lỗi
                        \Log::error('Error importing row: ' . json_encode($row) . ' - ' . $e->getMessage());
                        continue; // Bỏ qua dòng bị lỗi
                    }
                }

                fclose($handle); // Đóng file
            } else {
                return response()->json(['error' => 'Không thể mở file CSV'], 400);
            }

            return response()->json([
                'error' => false,
                'message' => 'Dữ liệu đã được nhập thành công.',
                'data' => $customer,
            ]);
        } catch (\Exception $th) {
            return response()->json([
                'error' => true,
                'message' => 'Nhập dữ liệu thất bại.' . $th->getMessage(),

            ]);
        }
    }
    public function nvt_list_data_import()
    {
        try {
            $customer = Customer::join('nvt_student', 'customers.id', '=', 'nvt_student.parent_id')
                ->leftjoin('customer_status', 'customers.status_id', '=', 'customer_status.id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('customer_sales', 'customers.id', '=', 'customer_sales.customer_id')
                // ->join('users', 'customer_sales.user_id', '=', 'users.id')
                ->select(
                    'customers.*',
                    'customer_status.name as status_name',
                    'customer_data_source.name as source_name',
                    'nvt_student.student_name'
                    // 'users.name as sales_names'
                )
                ->orderBy('created_at', 'desc')
                ->where('customer_data_source.source', 'novateen')
                ->whereNull('customer_sales.user_id')
                ->paginate(20);
            $sales = User::join('crm_employee', 'users.id', '=', 'crm_employee.account_id')
                ->select('crm_employee.employee_name', 'crm_employee.account_id')
                ->where('department_id', 4)->orderBy('level_id', 'asc')->get();
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $customer,
                'sale' => $sales
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Nhập dữ liệu thất bại.' . $th->getMessage(),

            ]);
        }
    }
    public function nvt_divide_data(Request $request)
    {
        $data_quantity = $request->data_quantity;
        $sale_id = $request->sale_id;

        // Lấy danh sách khách hàng cần phân data
        try {
            $customers = Customer::select('customers.id')
                ->leftJoin('customer_sales', 'customers.id', '=', 'customer_sales.customer_id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->where('customer_data_source.source', 'novateen')
                ->whereNull('customer_sales.user_id')
                ->orderBy('customers.created_at', 'asc')
                ->take($data_quantity)
                ->get();

            // Kiểm tra nếu không có dữ liệu
            if ($customers->isEmpty()) {
                return response()->json([
                    'message' => 'Không có khách hàng phù hợp để phân data.'
                ], 404);
            }

            // Gán dữ liệu cho sale
            foreach ($customers as $customer) {
                CustomerSale::updateOrCreate(
                    ['customer_id' => $customer->id],
                    ['user_id' => $sale_id]
                );
            }

            // Trả về phản hồi thành công
            return response()->json([
                'error' => false,
                'message' => 'Phân data thành công',
            ], 200);
        } catch (\Throwable $th) {
            // Log lỗi hoặc trả về thông báo chi tiết
            return response()->json([
                'error' => true,
                'message' => 'Phân data thất bại: ' . $th->getMessage(),
            ], 500); // Trả về mã lỗi 500
        }
    }
}
