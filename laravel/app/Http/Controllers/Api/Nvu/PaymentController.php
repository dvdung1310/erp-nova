<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use App\Models\AaiOrderModel;
use App\Models\CrmEmployeeModel;
use Illuminate\Http\Request;
use App\Models\NvuRoomBooking;
use App\Models\NvuRoom;
use App\Models\CustomerPaymentHistory;
use App\Models\NvuBookingHistory;
use  App\Models\Customer;
use  App\Models\User;
use Carbon\Carbon;
use PayOS\PayOS;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        try {
            $payments = CustomerPaymentHistory::with(['bookingHistories.roomBooking.customer'])
                ->get()
                ->map(function (CustomerPaymentHistory $payment) {
                    $userIds = $payment->sale_id;
                    $salesNames = User::where('id', $userIds)->pluck('name');
                    return [
                        'id' => $payment->id,
                        'name' => $payment->name,
                        'money' => $payment->money,
                        'date' => $payment->date,
                        'image' => $payment->image,
                        'status' => $payment->status,
                        'type' => $payment->type,
                        'sale_names' => $salesNames,
                        'booking_histories' => $payment->bookingHistories->map(function ($bookingHistory) {
                            return [
                                'room_booking_id' => $bookingHistory->room_booking_id,
                                'customer_name' => $bookingHistory->roomBooking->customer->name ?? null,
                                'customer_phone' => $bookingHistory->roomBooking->customer->phone ?? null,
                                'room_name' => $bookingHistory->roomBooking->room->name ?? null,
                                'start_date' => $bookingHistory->roomBooking->start_time ?? null,
                                'end_date' => $bookingHistory->roomBooking->end_time ?? null,
                            ];
                        })
                    ];
                });


            return response()->json([
                'payments' => $payments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([

                'message' => 'Không thể lấy danh sách khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'id_customer_booking' => 'required',
            'date' => 'required',
            'money' => 'required',
            'type' => 'required',
            'image' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048',
        ]);

        $customer = NvuRoomBooking::where('id', $validatedData['id_customer_booking'])->first();
        $filePath = null;
        if ($request->hasFile('image')) {
            $filePath = $request->file('image')->store('novaup', 'public');
        }

        try {
            $customerPaymentHistory = CustomerPaymentHistory::create([
                'name' => $validatedData['id_customer_booking'],
                'money' =>  $validatedData['money'],
                'date' => $validatedData['date'],
                'image' => $filePath,
                'status' => 0,
                'type' => $validatedData['type'],
                'customer_id' => $customer->customer_id,
                'sale_id' => Auth::id()
            ]);
            NvuBookingHistory::create([
                'payment_history_id' => $customerPaymentHistory->id,
                'room_booking_id' => $validatedData['id_customer_booking'],
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

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'required',
            'id_customer_booking' => 'required',
            'date' => 'required',
            'money' => 'required',
            'type' => 'required',
            'image' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048',
        ]);

        try {
            $customerPaymentHistory = CustomerPaymentHistory::findOrFail($validatedData['id']);

            $filePath = $customerPaymentHistory->image;
            if ($request->hasFile('image')) {
                $filePath = $request->file('image')->store('novaup', 'public');
            }

            $customerPaymentHistory->update([
                'name' => $validatedData['id_customer_booking'],
                'money' =>  $validatedData['money'],
                'date' => $validatedData['date'],
                'image' => $filePath,
                'type' => $validatedData['type'],
                'status' => 0,
            ]);

            return response()->json([
                'message' => 'Giao dịch đã được cập nhật.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể cập nhật khách hàng.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        try {

            $customer = CustomerPaymentHistory::findOrFail($id);

            $customer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Khách hàng đã được xóa thành công.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa khách hàng.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getBookingConnectCumstomer()
    {
        $getBookingConnectCumstomer = NvuRoomBooking::with(['room', 'customer'])
            ->get()
            ->map(function ($customer_booking_room) {
                return [
                    'id' => $customer_booking_room->id,
                    'customer_name' => $customer_booking_room->customer->name,
                    'room_name' => $customer_booking_room->room->name,
                    'date_time' => Carbon::parse($customer_booking_room->created_at)->format('d/m/Y H:i'),
                ];
            });
        return  $getBookingConnectCumstomer;
    }

    public function all_recipts_novaup()
    {
        try {
            $user_id = auth()->user()->id;
            $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('crm_employee.department_id', 'users.role_id')
                ->where('users.id', $user_id)->first();
            if ($user->department_id === 1 || $user->department_id === 8 || $user->role_id === 1) {
                $all_recipts = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('customer_id', null)
                    ->where('aai_order.type_payment', '=', 'novaup')
                    ->orderBy('order_date', 'desc')->get();
            } else {
                $all_recipts = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('customer_id', null)
                    ->where('sale_id', $user_id)
                    ->where('aai_order.type_payment', '=', 'novaup')
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
    public function store_receipts_novaup(Request $request)
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
            $order->type_payment = 'novaup';
            $order->save();
            $order_id = $order->order_id;
            $YOUR_DOMAIN = $request->getSchemeAndHttpHost();
            $data = [
                "orderCode" => $order_id,
                // "amount" => 2000,
                "amount" => $order_total,
                "description" => "NovaUp - #{$order->order_id}",
                "returnUrl" => $YOUR_DOMAIN . "/success_novaup",
                "cancelUrl" => $YOUR_DOMAIN . "/cancel_novaup"
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
    public function report_revenue_novaup()
    {
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
                    ->where('type_payment', '=', 'novaup')
                    ->sum('order_total');
                // Lợi nhuận trong tuần
                $revenue_week = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'novaup')
                    ->whereBetween('order_date', [$start_of_week, $end_of_week]) // So sánh ngày trong tuần
                    ->sum('order_total');
                // Lợi nhuận trong tháng
                $revenue_month = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'novaup')
                    ->whereBetween('order_date', [$startOfMonth, $endOfMonth]) // So sánh ngày trong tháng
                    ->sum('order_total');
                // Lợi nhuận toàn thời gian
                $revenue_all_time = AaiOrderModel::where('payos_status', 2)->where('type_payment', '=', 'novaup')
                    ->sum('order_total');
            } else {
                $revenue_today = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'novaup')
                    ->whereDate('order_date', '=', $today) // So sánh chỉ ngày
                    ->sum('order_total');
                // Lợi nhuận trong tuần
                $revenue_week = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'novaup')
                    ->whereBetween('order_date', [$start_of_week, $end_of_week]) // So sánh ngày trong tuần
                    ->sum('order_total');
                // Lợi nhuận trong tháng
                $revenue_month = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'novaup')
                    ->whereBetween('order_date', [$startOfMonth, $endOfMonth]) // So sánh ngày trong tháng
                    ->sum('order_total');
                // Lợi nhuận toàn thời gian
                $revenue_all_time = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'novaup')
                    ->where('sale_id', $user_id)
                    ->sum('order_total');
            }
            // Lấy danh sách các nhân viên bán hàng
            $list_sales = AaiOrderModel::join('users', 'aai_order.sale_id', '=', 'users.id')
                ->select('users.name', 'users.id')
                ->where('aai_order.type_payment', '=', 'novaup')
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
    public function filter_revenue_novaup(Request $request)
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
                    ->where('aai_order.type_payment', '=', 'novaup')
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
                    ->where('aai_order.type_payment', '=', 'novaup')
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
    public function store_order_handmade_novaup(Request $request)
    {
        try {
            $order_total_bill = $request->order_total;
            $order_total = (int)filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);

            // Tạo đơn hàng
            $order = new AaiOrderModel();
            $order->customer_name = $request->customer_name;
            $order->customer_phone = $request->customer_phone;
            $order->customer_address = $request->customer_address;
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
            $order->type_payment = 'novaup';
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
