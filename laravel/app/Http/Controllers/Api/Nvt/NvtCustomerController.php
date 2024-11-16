<?php

namespace App\Http\Controllers\Api\Nvt;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerDataSource;
use App\Models\CustomerSale;
use App\Models\CustomerStatus;
use App\Models\NvtStudentModel;
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
            $customer = Customer::join('customer_status', 'customers.status_id', '=', 'customer_status.id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('customer_sales', 'customers.id', '=', 'customer_sales.customer_id')
                ->join('users', 'customer_sales.user_id', '=', 'users.id')
                ->select(
                    'customers.*',
                    'customer_status.name as status_name',
                    'customer_data_source.name as source_name',
                    'users.name as sales_names'
                )
                ->orderBy('created_at', 'desc')
                ->where('customer_data_source.source', 'novateen')
                ->paginate(20);

            $statuses = CustomerStatus::select('id', 'name', 'color')->get();
            $dataSources = CustomerDataSource::select('id', 'name')->where('source', 'novateen')->get();
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
            $dataSources = CustomerDataSource::select('id', 'name')->where('source', 'novateen')->get();
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
            $student->student_note = $request->student_note;
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
}
