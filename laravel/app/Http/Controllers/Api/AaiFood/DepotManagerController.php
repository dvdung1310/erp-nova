<?php

namespace App\Http\Controllers\Api\AaiFood;

use App\Http\Controllers\Controller;
use App\Models\AaiAgencyModel;
use App\Models\AaiCostModel;
use App\Models\AaiOrderDetailModel;
use App\Models\AaiOrderModel;
use App\Models\AaiProductModel;
use App\Models\AaiSuppliersModel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DepotManagerController extends Controller
{
    public function all_suppliers()
    {
        try {
            $data = AaiSuppliersModel::all();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo thư mục thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_suppliers(Request $request)
    {
        try {
            $data = new AaiSuppliersModel();
            $data->suppliers_id = $request->suppliers_id;
            $data->suppliers_name = $request->suppliers_name;
            $data->suppliers_mst = $request->suppliers_mst;
            $data->suppliers_phone = $request->suppliers_phone;
            $data->suppliers_address = $request->suppliers_address;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Tạo nhà cung cấp thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo nhà cung cấp thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_suppliers(Request $request, $id)
    {
        try {
            $data = AaiSuppliersModel::findorFail($id);
            $data['suppliers_name'] = $request->suppliers_name;
            $data['suppliers_mst'] = $request->suppliers_mst;
            $data['suppliers_phone'] = $request->suppliers_phone;
            $data['suppliers_address'] = $request->suppliers_address;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật nhà cung cấp thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật nhà cung cấp thất bại',
            ], 422);
        }
    }

    public function all_product()
    {
        try {
            $data = AaiProductModel::leftjoin('aai_suppliers', 'aai_product.suppliers_id', '=', 'aai_suppliers.suppliers_id')
                ->select('aai_product.*', 'aai_suppliers.suppliers_name')
                ->orderBy('product_shelf_life', 'desc')->get();
            $suppliers = AaiSuppliersModel::all();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'data' => $data,
                'suppliers' => $suppliers
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo thư mục thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_product(Request $request)
    {
        try {
            $data = new AaiProductModel();
            $data->product_id  = $request->product_id;
            $data->product_name = $request->product_name;
            $data->product_input_price = $request->product_input_price;
            $data->product_output_price = $request->product_output_price;
            $data->product_input_quantity = $request->product_input_quantity;
            $data->product_quantity_remaining = $request->product_input_quantity;
            $data->suppliers_id = $request->suppliers_id;
            $data->product_shelf_life = $request->product_shelf_life;
            $data->product_input_date = $request->product_input_date;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Nhập kho sản phẩm thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Nhập kho sản phẩm thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_product(Request $request, $id)
    {
        try {
            $data = AaiProductModel::findorFail($id);
            $data->product_id  = $request->product_id;
            $data->product_name = $request->product_name;
            $data->product_input_price = $request->product_input_price;
            $data->product_output_price = $request->product_output_price;
            $data->product_input_quantity = $request->product_input_quantity;
            $data->product_quantity_remaining = $request->product_input_quantity;
            $data->suppliers_id = $request->suppliers_id;
            $data->product_shelf_life = $request->product_shelf_life;
            $data->product_input_date = $request->product_input_date;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật nhà cung cấp thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật nhà cung cấp thất bại',
            ], 422);
        }
    }
    public function all_agency()
    {
        try {
            $data = AaiAgencyModel::leftjoin('aai_agency_level', 'aai_agency.agency_level', '=', 'aai_agency_level.id')
                ->select('aai_agency.*', 'aai_agency_level.level_name')
                ->orderBy('aai_agency.id', 'desc')->get();
            $agency_level = DB::table('aai_agency_level')->get();
            return response()->json([
                'success' => true,
                'message' => 'Danh sách đại lý',
                'data' => $data,
                'agency_level' => $agency_level
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đại lý',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_agency(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'agency_id' => 'required|unique:aai_agency,agency_id',
            ], [
                'agency_id.unique' => 'Mã đại lý đã tồn tại. Vui lòng chọn mã khác.',
            ]);

            // Create a new agency record
            $data = new AaiAgencyModel();
            $data->agency_id = $request->agency_id;
            $data->agency_name = $request->agency_name;
            $data->agency_phone = $request->agency_phone;
            $data->agency_address = $request->agency_address;
            $data->agency_level = $request->agency_level;
            $data->agency_discount = $request->agency_discount;
            $data->save();

            return response()->json([
                'success' => true,
                'message' => 'Thêm đại lý thành công',
                'data' => $data,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity for validation errors
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm đại lý thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_agency(Request $request, $id)
    {
        try {
            // Validate the reques
            // Create a new agency record
            $data = AaiAgencyModel::findorFail($id);
            $data->agency_name = $request->agency_name;
            $data->agency_phone = $request->agency_phone;
            $data->agency_address = $request->agency_address;
            $data->agency_level = $request->agency_level;
            $data->agency_discount = $request->agency_discount;
            $data->save();

            return response()->json([
                'success' => true,
                'message' => 'Thêm đại lý thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm đại lý thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function all_order()
    {
        try {
            $order_retail = AaiOrderModel::where('customer_id', null)->orderBy('order_date', 'desc')->get();
            $order_agency = AaiOrderModel::join('aai_agency', 'aai_order.customer_id', '=', 'aai_agency.agency_id')
                ->select('aai_order.*', 'aai_agency.agency_name', 'aai_agency.agency_phone', 'aai_agency.agency_address', 'aai_agency.agency_level')
                ->whereNotNull('customer_id')->orderBy('order_date', 'desc')->get();
            return response()->json([
                'success' => true,
                'message' => 'Danh sách đại lý',
                'order_retail' => $order_retail,
                'order_agency' => $order_agency
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đại lý',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function create_bill()
    {
        try {
            $product = AaiProductModel::all();
            $agency = AaiAgencyModel::all();
            return response()->json([
                'success' => true,
                'message' => 'Danh sách đại lý',
                'all_product' => $product,
                'all_agency' => $agency
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đại lý',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_order_retail(Request $request)
    {
        try {
            $order_total_bill = $request->order_total;
            $order_total = (int) filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);
            $order = new AaiOrderModel();
            $order->customer_name = $request->customer_name;
            $order->customer_phone = $request->customer_phone;
            $order->customer_address = $request->customer_address;
            $order->order_total = $order_total;
            $order->order_date = $request->order_date;
            $order->save();
            $order_id = $order->order_id;

            $products = $request->products;
            foreach ($products as $product) {
                $order_detail = new AaiOrderDetailModel();
                $order_detail->order_id =  $order_id;
                $order_detail->product_id = $product['product_id']; // Dùng cú pháp mảng
                $order_detail->product_quantity = $product['quantity']; // Dùng cú pháp mảng
                $order_detail->save();

                $updated = AaiProductModel::where('product_id', $product['product_id'])
                    ->where('product_quantity_remaining', '>=', $product['quantity']) // Kiểm tra nếu số lượng còn lại đủ
                    ->update(['product_quantity_remaining' => DB::raw('product_quantity_remaining - ' . $product['quantity'])]);
                if (!$updated) {
                    // Nếu không tìm thấy sản phẩm hoặc số lượng không đủ, bạn có thể xử lý lỗi ở đây
                    throw new \Exception("Không đủ số lượng sản phẩm hoặc sản phẩm không tồn tại trong kho.");
                }
            }
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
    public function store_order_agency(Request $request)
    {
        try {
            $order_total_bill = $request->order_total;
            $order_total = (int) filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);
            $order = new AaiOrderModel();
            $order->customer_id = $request->agency_id;
            $order->order_total = $order_total;
            $order->order_date = $request->order_date;
            $order->save();
            $order_id = $order->order_id;

            $products = $request->products;
            foreach ($products as $product) {
                $order_detail = new AaiOrderDetailModel();
                $order_detail->order_id =  $order_id;
                $order_detail->product_id = $product['product_id']; // Dùng cú pháp mảng
                $order_detail->product_quantity = $product['quantity']; // Dùng cú pháp mảng
                $order_detail->save();

                $updated = AaiProductModel::where('product_id', $product['product_id'])
                    ->where('product_quantity_remaining', '>=', $product['quantity']) // Kiểm tra nếu số lượng còn lại đủ
                    ->update(['product_quantity_remaining' => DB::raw('product_quantity_remaining - ' . $product['quantity'])]);
                if (!$updated) {
                    // Nếu không tìm thấy sản phẩm hoặc số lượng không đủ, bạn có thể xử lý lỗi ở đây
                    throw new \Exception("Không đủ số lượng sản phẩm hoặc sản phẩm không tồn tại trong kho.");
                }
            }
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

    public function all_payment_slip()
    {
        try {
            $all_payment_slip = AaiCostModel::orderBy('cost_date', 'desc')->get();
            $total_payment_slip = AaiCostModel::sum('cost_total');
            return response()->json([
                'success' => true,
                'message' => 'Danh sách đại lý',
                'data' => $all_payment_slip,
                'total_payment_slip' => $total_payment_slip
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đại lý',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_payment_slip(Request $request)
    {
        try {
            $data = new AaiCostModel();
            $data->cost_name  = $request->cost_name;
            $data->cost_total = $request->cost_total;
            $data->cost_date = Carbon::parse($request->cost_date)->format('Y-m-d');
            $data->cost_description = $request->cost_description;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Nhập kho sản phẩm thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Nhập kho sản phẩm thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_payment_slip(Request $request,$cost_id){
        try {
            $data = AaiCostModel::findorFail($cost_id);
            $data['cost_name'] = $request->cost_name;
            $data['cost_total'] = $request->cost_total;
            $data['cost_date'] =  Carbon::parse($request->cost_date)->format('Y-m-d');
            $data['cost_description'] = $request->cost_description;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật phiếu chi thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật phiếu chi cấp thất bại',
            ], 422);
        }
    }
    public function revenue()
    {
        try {
            $today = Carbon::today()->toDateString();
            $startOfWeek = Carbon::now()->startOfWeek()->toDateString(); // Ngày đầu tuần (thứ hai)
            $endOfWeek = Carbon::now()->endOfWeek()->toDateString(); // Ngày cuối tuần (chủ nhật)
            $startOfMonth = Carbon::now()->startOfMonth()->toDateString(); // Ngày đầu tháng
            $endOfMonth = Carbon::now()->endOfMonth()->toDateString(); // Ngày cuối tháng
            // $capital_price = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
            //     ->selectRaw('SUM(aai_order_detail.product_quantity * aai_product.product_input_price) as total_cost')
            //     ->value('total_cost');
            // $totalOrder = AaiOrderModel::sum('order_total');

            // $profit = $totalOrder - $capital_price;
             // ---------lợi nhuận ngày---------------
            $profit_today = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
                ->join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
                ->whereDate('aai_order.order_date', '=', $today) // Lọc theo ngày thanh toán (order_date)
                ->selectRaw('
            (SELECT SUM(order_total) FROM aai_order WHERE order_date = ?) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS revenue', [$today])
                ->value('revenue');

            // Tính tổng chi phí cho ngày hôm đó từ bảng cost
            $total_cost_day = DB::table('aai_cost')
                ->whereDate('cost_date', '=', $today)
                ->sum('cost_total');
            // Tính lợi nhuận ngày
            $profit_today -= $total_cost_day;
            // ---------lợi nhuận tuần----------------
            $profit_this_week = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
                ->join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
                ->whereBetween('aai_order.order_date', [$startOfWeek, $endOfWeek]) // Lọc theo ngày trong tuần này
                ->selectRaw('
                (SELECT SUM(order_total) FROM aai_order WHERE order_date BETWEEN ? AND ?) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS profit
            ', [$startOfWeek, $endOfWeek])
                ->value('profit');
            $total_cost_week = DB::table('aai_cost')
                ->whereBetween('cost_date', [$startOfWeek, $endOfWeek])
                ->sum('cost_total');
            $profit_this_week -=  $total_cost_week;
             // ---------lợi nhuận tháng----------------
            $profit_this_month = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
                ->join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
                ->whereBetween('aai_order.order_date', [$startOfMonth, $endOfMonth]) // Lọc theo ngày trong tháng này
                ->selectRaw('
                (SELECT SUM(order_total) FROM aai_order WHERE order_date BETWEEN ? AND ?) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS profit
            ', [$startOfMonth, $endOfMonth])
                ->value('profit');
                $total_cost_month = DB::table('aai_cost')
                ->whereBetween('cost_date', [$startOfMonth, $endOfMonth])
                ->sum('cost_total');
                $profit_this_month -= $total_cost_month;
            // ---------lợi nhuận tổng----------------
            $profit_all = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
                ->selectRaw('
        (SELECT SUM(order_total) FROM aai_order) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS profit')
                ->value('profit');
                $total_cost_all = DB::table('aai_cost')
                ->sum('cost_total');
                $profit_all -= $total_cost_all;
                 // ---------lợi nhuận tổng----------------
            return response()->json([
                'success' => true,
                'message' => 'Nhập kho sản phẩm thành công',
                'profit_today' => $profit_today,
                'profit_this_week' => $profit_this_week,
                'profit_this_month' => $profit_this_month,
                'profit_all' => $profit_all
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Nhập kho sản phẩm thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function order_detail($order_id){
       try {
        $order = AaiOrderDetailModel::join('aai_product','aai_order_detail.product_id','=','aai_product.product_id')
        ->select('aai_order_detail.*','aai_product.product_name','aai_product.product_output_price','aai_product.product_shelf_life')
        ->where('aai_order_detail.order_id',$order_id)->get();
        return response()->json([
            'success' => true,
            'message' => 'Danh sách sản phẩm',
            'data' => $order
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lấy danh sách sản phẩm thất bại'.$e->getMessage(),
            'error' => $e->getMessage(),
        ], 500);
    }
    }
    public function delete_order($order_id)
    {
        // Lấy thông tin chi tiết đơn hàng trước khi xóa
        $orderDetails = AaiOrderDetailModel::where('order_id', $order_id)->get();
        // Xóa đơn hàng
        $delete_order = AaiOrderModel::where('order_id', $order_id)->delete();
        if ($delete_order) {
            // Xóa chi tiết đơn hàng
            $delete_order_detail = AaiOrderDetailModel::where('order_id', $order_id)->delete();
            if ($delete_order_detail) {
                // Cập nhật lại số lượng sản phẩm trong kho
                foreach ($orderDetails as $detail) {
                    $product = AaiProductModel::where('product_id', $detail->product_id)->first();
                    if ($product) {
                        // Cộng lại số lượng sản phẩm đã bị trừ trước đó
                        $product->product_quantity_remaining += $detail->product_quantity;
                        $product->save();
                    }
                }
                // Trả về kết quả thành công
                return response()->json(['success' => true, 'message' => 'Đã xóa đơn hàng và cập nhật kho thành công.']);
            }
        }
    
        // Trả về kết quả thất bại
        return response()->json(['success' => false, 'message' => 'Xóa đơn hàng thất bại.']);
    }

    public function delete_payment_slip($cost_id){
        try {
            AaiCostModel::where('cost_id',$cost_id)->delete();
            return response()->json([
                'success' => true,
                'message' => 'Xóa phiếu chi thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xóa phiếu chi thất bại'.$e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
