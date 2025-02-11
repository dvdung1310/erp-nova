<?php

namespace App\Http\Controllers\Api\Nvt;

use App\Http\Controllers\Controller;
use App\Models\AaiOrderModel;
use App\Models\CrmEmployeeModel;
use App\Models\Customer;
use App\Models\CustomerPaymentHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PayOS\PayOS;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class NvtPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $payment = CustomerPaymentHistory::join('customers', 'customer_payment_history.customer_id', '=', 'customers.id')
                ->join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('nvt_student', 'customers.id', '=', 'nvt_student.parent_id')
                ->join('users', 'customer_payment_history.sale_id', '=', 'users.id')
                ->select('customer_payment_history.*', 'customers.name as parent_name', 'nvt_student.student_name', 'users.name as sale_name')
                ->where('customer_data_source.source', 'novateen')
                ->orderBy('customer_payment_history.date', 'desc')->get();
            return response()->json([
                'error' => false,
                'message' => 'Danh sách hóa đơn NovaTeen',
                'data' => $payment,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Không tìm thấy hóa đơn NovaTeeb.' . $th,
                'data' => []
            ]);
        }
    }
    public function nvt_customer()
    {
        try {
            $customer = Customer::join('customer_data_source', 'customers.source_id', '=', 'customer_data_source.id')
                ->join('nvt_student', 'customers.id', '=', 'nvt_student.parent_id')
                ->select(
                    'customers.*',
                    'nvt_student.student_name'
                )
                ->orderBy('created_at', 'desc')
                ->where('customer_data_source.source', 'novateen')
                ->get();
            return response()->json([
                'error' => false,
                'message' => 'Danh sách khánh hàng NovaTeen',
                'data' => $customer
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Không tìm thấy danh sách khánh hàng.' . $th,
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


    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_id' => 'required',
            'money' => 'required',
            'date' => 'required',  // Đảm bảo rằng trường date là bắt buộc
            'file' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048', // Kiểm tra file
        ]);

        // Chuyển đổi định dạng ngày nếu cần
        try {
            $date = Carbon::parse($validatedData['date'])->format('Y-m-d H:i:s'); // Chuyển đổi thành 'YYYY-MM-DD HH:MM:SS'
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ngày không hợp lệ.',
                'error' => $e->getMessage(),
            ], 400);
        }

        // Xử lý file upload (nếu có)
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('uploads', 'public');
        }

        try {
            $user_id = auth()->user()->id;
            $customerPaymentHistory = CustomerPaymentHistory::create([
                'customer_id' => $request->customer_id,
                'money' => $validatedData['money'],
                'date' => $date,  // Lưu ngày đã chuyển đổi
                'image' => $filePath,  // Lưu đường dẫn file
                'status' => 0,
                'sale_id' => $user_id,
            ]);

            return response()->json([
                'message' => 'Giao dịch đã được tạo thành công.',
                'data' => $customerPaymentHistory,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Giao dịch tạo thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'customer_id' => 'required',
            'money' => 'required',
            'date' => 'required',  // Đảm bảo rằng trường date là bắt buộc
            'file' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048', // Kiểm tra file
        ]);

        // Chuyển đổi định dạng ngày nếu cần
        try {
            $date = Carbon::parse($validatedData['date'])->format('Y-m-d H:i:s'); // Chuyển đổi thành 'YYYY-MM-DD HH:MM:SS'
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ngày không hợp lệ.',
                'error' => $e->getMessage(),
            ], 400);
        }

        // Tìm bản ghi cần cập nhật
        $customerPaymentHistory = CustomerPaymentHistory::find($id);

        if (!$customerPaymentHistory) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch cần cập nhật.',
            ], 404);
        }

        // Xử lý file upload (nếu có)
        $filePath = $customerPaymentHistory->image; // Giữ nguyên file cũ nếu không có file mới
        if ($request->hasFile('file')) {
            // Xóa file cũ nếu có
            if ($filePath && \Storage::disk('public')->exists($filePath)) {
                \Storage::disk('public')->delete($filePath);
            }

            // Lưu file mới
            $filePath = $request->file('file')->store('uploads', 'public');
        }

        try {
            // Cập nhật bản ghi
            $customerPaymentHistory->update([
                'customer_id' => $request->customer_id,
                'money' => $validatedData['money'],
                'date' => $date, // Lưu ngày đã chuyển đổi
                'image' => $filePath, // Lưu đường dẫn file mới
                'status' => $customerPaymentHistory->status, // Giữ nguyên trạng thái
                'sale_id' => $customerPaymentHistory->sale_id, // Giữ nguyên ID của người bán
            ]);

            return response()->json([
                'message' => 'Giao dịch đã được cập nhật thành công.',
                'data' => $customerPaymentHistory,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật giao dịch thất bại.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function delete_payment($id)
    {
        try {
            CustomerPaymentHistory::where('id', $id)->delete();
            return response()->json([
                'message' => 'Xóa giao dịch thành công.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xóa giao dịch thất bại.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_status_payment(Request $request, $id)
    {
        // Validate input
        $validatedData = $request->validate([
            'status' => 'required|in:0,1',  // Kiểm tra trạng thái chỉ có thể là 0 hoặc 1
        ]);

        try {
            // Tìm giao dịch theo ID
            $payment = CustomerPaymentHistory::find($id); // Sử dụng find thay vì findOrFail nếu muốn xử lý lỗi thủ công

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Giao dịch không tồn tại.'
                ], 404); // Trả về lỗi 404 nếu không tìm thấy giao dịch
            }

            // Kiểm tra trạng thái hiện tại và toggle trạng thái
            $newStatus = $payment->status == 0 ? 1 : 0; // Nếu status là 0 thì đổi thành 1, nếu là 1 thì đổi thành 0
            $payment->status = $newStatus;
            $payment->save();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'status' => $newStatus // Trả về trạng thái mới để dễ dàng xử lý ở phía client
            ]);
        } catch (\Exception $e) {
            // Xử lý lỗi nếu có
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật trạng thái',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    public function store_receipts_novateen(Request $request)
    {
        try {
            // return $request->all();
            $order_total_bill = $request->order_total;
            $order_total_new = str_replace(',', '', $order_total_bill); // Loại bỏ dấu phẩy
            $order_total = (float)$order_total_new;
            // $order_total = (int)filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);
            $order = new AaiOrderModel();
            $order->customer_name = $request->customer_name;
            $order->customer_phone = $request->customer_phone;
            $order->customer_address = $request->customer_address;
            $order->customer_description = $request->customer_description;
            $order->order_total = $order_total;
            $order->order_date = today();
            $order->payos_status = 0;
            $order->sale_id = Auth::id();
            $order->type_payment = 'novateen';
            $order->save();
            $order_id = $order->order_id;
            $YOUR_DOMAIN = $request->getSchemeAndHttpHost();
            $data = [
                "orderCode" => $order_id,
                // "amount" => 2000,
                "amount" => $order_total,
                "description" => "NovaTeen - #{$order->order_id}",
                "returnUrl" => $YOUR_DOMAIN . "/success_novateen",
                "cancelUrl" => $YOUR_DOMAIN . "/cancel_novateen"
            ];

            error_log($data['orderCode']);
            $payOS = new PayOS('4fe8a597-f02c-48fc-83a1-b7535e147f5b', '1ff91cae-41d9-4190-bb38-031c92f64200', '65a39357af95ed8ac934dc1cd55a519663226a84ccaa53d2d62ad98f6609d966');

            $response = $payOS->createPaymentLink($data);
            return response()->json([
                'data' => $response['checkoutUrl'],
                'success' => true,
                'message' => 'Tạo phiếu bán hàng thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo phiếu bán hàng thất bại',
                $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function all_recipts_novateen(){
        try {
            $user_id = auth()->user()->id;
            $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('crm_employee.department_id', 'users.role_id')
                ->where('users.id', $user_id)->first();
            if ($user->department_id === 1 || $user->department_id === 8 || $user->role_id === 1) {
                $all_recipts = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('customer_id', null)
                    ->where('aai_order.type_payment', '=', 'novateen')
                    ->orderBy('order_date', 'desc')->get();
            } else {
                $all_recipts = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('customer_id', null)
                    ->where('sale_id', $user_id)
                    ->where('aai_order.type_payment', '=', 'novateen')
                    ->orderBy('order_date', 'desc')->get();
            }

            return response()->json([
                'success' => true,
                'message' => 'Danh sách phiếu thu',
                'all_recipts' => $all_recipts
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy phiếu thu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function report_revenue_novateen(){
        try {

            $today = Carbon::now('Asia/Ho_Chi_Minh')->toDateString();
            $start_of_week = Carbon::now('Asia/Ho_Chi_Minh')->startOfWeek()->toDateString();
            $end_of_week = Carbon::now('Asia/Ho_Chi_Minh')->endOfWeek()->toDateString();
            $startOfMonth = Carbon::now('Asia/Ho_Chi_Minh')->startOfMonth()->toDateString();
            $endOfMonth = Carbon::now('Asia/Ho_Chi_Minh')->endOfMonth()->toDateString();
            $user_id =  Auth::id();
            $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('crm_employee.department_id', 'users.role_id')
                ->where('users.id', $user_id)->first();
            if ($user->department_id === 1 || $user->department_id === 8 || $user->role_id === 1) {
                // Lợi nhuận ngày hôm nay
                $revenue_today = AaiOrderModel::where('payos_status', 2)
                    ->whereDate('order_date', '=', $today)
                    ->where('type_payment', '=', 'novateen')
                    ->sum('order_total');
                // Lợi nhuận trong tuần
                $revenue_week = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'novateen')
                    ->whereBetween('order_date', [$start_of_week, $end_of_week]) // So sánh ngày trong tuần
                    ->sum('order_total');
                // Lợi nhuận trong tháng
                $revenue_month = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'novateen')
                    ->whereBetween('order_date', [$startOfMonth, $endOfMonth]) // So sánh ngày trong tháng
                    ->sum('order_total');
                // Lợi nhuận toàn thời gian
                $revenue_all_time = AaiOrderModel::where('payos_status', 2)->where('type_payment', '=', 'novateen')
                    ->sum('order_total');
            } else {
                $revenue_today = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'novateen')
                    ->whereDate('order_date', '=', $today) // So sánh chỉ ngày
                    ->sum('order_total');
                // Lợi nhuận trong tuần
                $revenue_week = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'novateen')
                    ->whereBetween('order_date', [$start_of_week, $end_of_week]) // So sánh ngày trong tuần
                    ->sum('order_total');
                // Lợi nhuận trong tháng
                $revenue_month = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'novateen')
                    ->whereBetween('order_date', [$startOfMonth, $endOfMonth]) // So sánh ngày trong tháng
                    ->sum('order_total');
                // Lợi nhuận toàn thời gian
                $revenue_all_time = AaiOrderModel::where('payos_status', 2)
                ->where('type_payment', '=', 'novateen')
                    ->where('sale_id', $user_id)
                    ->sum('order_total');
            }
            // Lấy danh sách các nhân viên bán hàng
            $list_sales = AaiOrderModel::join('users', 'aai_order.sale_id', '=', 'users.id')
                ->select('users.name', 'users.id')
                ->where('aai_order.type_payment', '=', 'novateen')
                ->distinct()
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Lợi nhuận tính toán thành công',
                'revenue_today' => $revenue_today,
                'revenue_week' => $revenue_week,
                'revenue_month' => $revenue_month,
                'revenue_all_time' => $revenue_all_time,
                'list_sales' => $list_sales
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tính toán lợi nhuận',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function filter_revenue_novateen(Request $request)
    {
        try {
            $start_date = $request->startDate;
            $end_date = $request->endDate;
            $sale_id = $request->sale_id;

            $user_id = auth()->user()->id;
            $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('crm_employee.department_id', 'users.role_id')
                ->where('users.id', $user_id)->first();
            if ($user->department_id === 1 || $user->department_id === 8 || $user->role_id === 1) {
                // Truy vấn đơn hàng bán lẻ
                $query_receipts = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('aai_order.payos_status', 2)
                    ->where('customer_id', null)
                    ->where('aai_order.type_payment', '=', 'novateen')
                    ->orderBy('order_date', 'desc');


                // Lọc theo ngày bắt đầu và kết thúc
                if ($start_date && $end_date) {
                    $query_receipts->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                    if ($sale_id && $sale_id != '0') {
                        $query_receipts->where(function ($query_receipts) use ($sale_id) {
                            $query_receipts->where('aai_order.sale_id', $sale_id);
                        });
                    }
                } else {
                    if ($start_date) {
                        $query_receipts->whereDate('aai_order.order_date', $start_date);
                       
                        if ($sale_id && $sale_id != '0') {
                            $query_receipts->where(function ($query_receipts) use ($sale_id) {
                                $query_receipts->where('aai_order.sale_id', $sale_id);
                            });
                        }
                    }
                    if ($end_date) {
                        $query_receipts->whereDate('aai_order.order_date', $end_date);
                        if ($sale_id && $sale_id != '0') {
                            $query_receipts->where(function ($query_receipts) use ($sale_id) {
                                $query_receipts->where('aai_order.sale_id', $sale_id);
                            });
                        }
                    }
                    if ($sale_id && $sale_id != '0') {
                        $query_receipts->where(function ($query_receipts) use ($sale_id) {
                            $query_receipts->where('aai_order.sale_id', $sale_id);
                        });
                    }
                }
                // Lấy dữ liệu
                $all_receipts = $query_receipts->get();
                // Tính tổng tiền từ các đơn hàng bán lẻ và đại lý
                $total_revenua = $all_receipts->sum('order_total');
            } else {
                $query_receipts = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('aai_order.payos_status', 2)
                    ->where('aai_order.type_payment', '=', 'novateen')
                    ->where('customer_id', null)
                    ->where('aai_order.sale_id', $user_id)
                    ->orderBy('order_date', 'desc');

                // Lọc theo ngày bắt đầu và kết thúc
                if ($start_date && $end_date) {
                    $query_receipts->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                    
                    if ($sale_id && $sale_id != '0') {
                        $query_receipts->where(function ($query_receipts) use ($sale_id) {
                            $query_receipts->where('aai_order.sale_id', $sale_id);
                        });
                        
                    }
                } else {
                    if ($start_date) {
                        $query_receipts->whereDate('aai_order.order_date', $start_date);
                        
                        if ($sale_id && $sale_id != '0') {
                            $query_receipts->where(function ($query_receipts) use ($sale_id) {
                                $query_receipts->where('aai_order.sale_id', $sale_id);
                            });
                            
                        }
                    }
                    if ($end_date) {
                        $query_receipts->whereDate('aai_order.order_date', $end_date);
                        
                        if ($sale_id && $sale_id != '0') {
                            $query_receipts->where(function ($query_receipts) use ($sale_id) {
                                $query_receipts->where('aai_order.sale_id', $sale_id);
                            });
                            
                        }
                    }
                    if ($sale_id && $sale_id != '0') {
                        $query_receipts->where(function ($query_receipts) use ($sale_id) {
                            $query_receipts->where('aai_order.sale_id', $sale_id);
                        });
                        
                    }
                }
                // Lấy dữ liệu
                $all_receipts = $query_receipts->get();

                // Tính tổng tiền từ các đơn hàng bán lẻ và đại lý
                $total_revenua = $all_receipts->sum('order_total');
    
            }
            return response()->json([
                'success' => true,
                'message' => 'Kết quả lọc',
                'all_receipts' => $all_receipts,
                'total_revenue' => $total_revenua
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lọc thất bại',
            ], 422);
        }
    }
    public function store_order_handmade_novateen(Request $request)
    {
        try {
            $order_total_bill = $request->order_total;
            $order_total = (int)filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);

            // Tạo đơn hàng
            $order = new AaiOrderModel();
            $order->customer_name = $request->customer_name;
            $order->customer_phone = $request->customer_phone;
            $order->customer_address = $request->customer_address;
            $order->customer_description = $request->customer_description;
            $order->order_total = $order_total;
            $order->order_date = today();
            $order->payos_status = 1;
            $order->sale_id = Auth::id();
            if ($request->hasFile('payment_img')) {
                $image = $request->file('payment_img');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('uploads/orders'), $imageName); // Di chuyển ảnh vào thư mục uploads
                $order->payment_img = 'uploads/orders/' . $imageName; // Lưu đường dẫn ảnh vào DB
            }
            $order->type_payment = 'novateen';
            $order->save();
            return response()->json([
                'success' => true,
                'message' => 'Tạo phiếu bán hàng thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo phiếu bán hàng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
