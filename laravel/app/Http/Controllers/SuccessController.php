<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AaiOrderModel;
class SuccessController extends Controller
{
    public function __construct()
    {
    }
    public function successPayment(Request $request)
    {
        try {
            // Nhận thông tin từ cổng thanh toán
            $orderCode = $request->input('orderCode'); // Mã đơn hàng từ thanh toán
            $status = $request->input('status'); // Trạng thái thanh toán (success, failed)
            if ($status !== 'PAID') {
                throw new \Exception("Thanh toan khong thanh cong.");
            }
            $order = AaiOrderModel::where('order_id', $orderCode)->first();

            if (!$order) {
                throw new \Exception("Không tìm thấy đơn hàng với mã: $orderCode");
            }

            $order->payos_status = 1; // Đã thanh toán thành công
            $order->save();
            return redirect()->away("https://erp.novaedu.vn/admin/aaifood/ket-qua-thanh-toan/$orderCode");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xu ly thanh toán that bai.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function cancelPayment(Request $request) {
        return redirect()->away('https://erp.novaedu.vn/admin/aaifood/tao-phieu-ban-le');
    }

    public function successPaymentNovateen(Request $request)
    {
        try {
            // Nhận thông tin từ cổng thanh toán
            $orderCode = $request->input('orderCode'); // Mã đơn hàng từ thanh toán
            $status = $request->input('status'); // Trạng thái thanh toán (success, failed)
            if ($status !== 'PAID') {
                throw new \Exception("Thanh toan khong thanh cong.");
            }
            $order = AaiOrderModel::where('order_id', $orderCode)->first();

            if (!$order) {
                throw new \Exception("Không tìm thấy đơn hàng với mã: $orderCode");
            }

            $order->payos_status = 1; // Đã thanh toán thành công
            $order->save();
            return redirect()->away("https://erp.novaedu.vn/admin/novateen/phieu-thu");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xu ly thanh toán that bai.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function cancelPaymentNovaTeen(Request $request) {
        return redirect()->away('https://erp.novaedu.vn/admin/novateen/tao-phieu-thu');
    }

    public function successPaymentNovaup(Request $request)
    {
        try {
            // Nhận thông tin từ cổng thanh toán
            $orderCode = $request->input('orderCode'); // Mã đơn hàng từ thanh toán
            $status = $request->input('status'); // Trạng thái thanh toán (success, failed)
            if ($status !== 'PAID') {
                throw new \Exception("Thanh toan khong thanh cong.");
            }
            $order = AaiOrderModel::where('order_id', $orderCode)->first();

            if (!$order) {
                throw new \Exception("Không tìm thấy đơn hàng với mã: $orderCode");
            }

            $order->payos_status = 1; // Đã thanh toán thành công
            $order->save();
            return redirect()->away("https://erp.novaedu.vn/admin/novaup/phieu-thu");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xu ly thanh toán that bai.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function cancelPaymentNovaup(Request $request) {
        return redirect()->away('https://erp.novaedu.vn/admin/novaup/tao-phieu-thu');
    }
    
}
