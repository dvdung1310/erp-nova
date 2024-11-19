<?php

namespace App\Http\Controllers\Api\Nvt;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerPaymentHistory;
use Illuminate\Http\Request;
use Carbon\Carbon;

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



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
