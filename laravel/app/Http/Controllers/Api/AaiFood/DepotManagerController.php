<?php

namespace App\Http\Controllers\Api\AaiFood;

use App\Http\Controllers\Controller;
use App\Models\AaiAgencyModel;
use App\Models\AaiCostModel;
use App\Models\AaiOrderDetailModel;
use App\Models\AaiOrderModel;
use App\Models\AaiProductModel;
use App\Models\AaiSuppliersModel;
use App\Models\CrmEmployeeModel;
use App\Models\Devices;
use App\Models\Notification;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use PayOS\PayOS;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DepotManagerController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

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
            $data->product_id = $request->product_id;
            $data->product_name = $request->product_name;
            $data->product_unit = $request->product_unit;
            $product_input_price = $request->product_input_price;
            $product_output_price = $request->product_output_price;

            // Loại bỏ dấu phẩy và đảm bảo giá trị là số thực
            $product_input_price = str_replace(',', '', $product_input_price);
            $product_output_price = str_replace(',', '', $product_output_price);

            // Chuyển đổi thành số thực và đảm bảo có 3 chữ số sau dấu thập phân
            $data->product_input_price = number_format((float)$product_input_price, 3, '.', '');
            $data->product_output_price = number_format((float)$product_output_price, 3, '.', '');
            $data->product_input_quantity = $request->product_input_quantity;
            $data->product_quantity_remaining = $request->product_input_quantity;
            $data->suppliers_id = $request->suppliers_id;
            $data->product_date_manufacture = $request->product_date_manufacture;
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
            $data->product_id = $request->product_id;
            $data->product_name = $request->product_name;
            $product_input_price = $request->product_input_price;
            $product_output_price = $request->product_output_price;

            // Loại bỏ dấu phẩy và đảm bảo giá trị là số thực
            $product_input_price = str_replace(',', '', $product_input_price);
            $product_output_price = str_replace(',', '', $product_output_price);

            // Chuyển đổi thành số thực và đảm bảo có 3 chữ số sau dấu thập phân
            $data->product_input_price = number_format((float)$product_input_price, 3, '.', '');
            $data->product_output_price = number_format((float)$product_output_price, 3, '.', '');
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
            $user_id = auth()->user()->id;
            $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('crm_employee.department_id', 'users.role_id')
                ->where('users.id', $user_id)->first();
            if ($user->department_id === 1 || $user->department_id === 8 || $user->role_id === 1) {
                $order_retail = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('customer_id', null)
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->orderBy('order_date', 'desc')->get();
                $order_agency = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->join('aai_agency', 'aai_order.customer_id', '=', 'aai_agency.agency_id')
                    ->select('aai_order.*', 'users.name', 'aai_agency.agency_name', 'aai_agency.agency_phone', 'aai_agency.agency_address', 'aai_agency.agency_level')
                    ->whereNotNull('customer_id')
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->orderBy('order_date', 'desc')->get();
            } else {
                $order_retail = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('customer_id', null)
                    ->where('sale_id', $user_id)
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->orderBy('order_date', 'desc')->get();
                $order_agency = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->join('aai_agency', 'aai_order.customer_id', '=', 'aai_agency.agency_id')
                    ->select('aai_order.*', 'users.name', 'aai_agency.agency_name', 'aai_agency.agency_phone', 'aai_agency.agency_address', 'aai_agency.agency_level')
                    ->whereNotNull('customer_id')
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->where('sale_id', $user_id)->orderBy('order_date', 'desc')->get();
            }

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
            // return $request->all();
            $order_total_bill = $request->order_total;
            $order_total = (int)filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);
            $order = new AaiOrderModel();
            $order->customer_name = $request->customer_name;
            $order->customer_phone = $request->customer_phone;
            $order->customer_address = $request->customer_address;
            $order->order_total = $order_total;
            $order->order_date = today();
            $order->payos_status = 0;
            $order->sale_id = Auth::id();
            $order->type_payment = 'aaifood';
            $order->save();
            $order_id = $order->order_id;

            $products = $request->products;
            foreach ($products as $product) {
                $order_detail = new AaiOrderDetailModel();
                $order_detail->order_id = $order_id;
                $order_detail->product_id = $product['product_id']; // Dùng cú pháp mảng
                $order_detail->product_quantity = $product['quantity'];
                $order_detail->product_price_input = number_format($product['product_price_input'], 3, '.', '');
                $order_detail->product_price_output = number_format($product['product_price_output'], 3, '.', '');
                $order_detail->save();

                $updated = AaiProductModel::where('product_id', $product['product_id'])
                    ->where('product_quantity_remaining', '>=', $product['quantity']) // Kiểm tra nếu số lượng còn lại đủ
                    ->update(['product_quantity_remaining' => DB::raw('product_quantity_remaining - ' . $product['quantity'])]);
                if (!$updated) {
                    // Nếu không tìm thấy sản phẩm hoặc số lượng không đủ, bạn có thể xử lý lỗi ở đây
                    throw new \Exception("Không đủ số lượng sản phẩm hoặc sản phẩm không tồn tại trong kho.");
                }
            }

            $YOUR_DOMAIN = $request->getSchemeAndHttpHost();
            $data = [
                "orderCode" => $order_id,
                // "amount" => 2000,
                "amount" => $order_total,
                "description" => "AaiPharma - #{$order->order_id}",
                "returnUrl" => $YOUR_DOMAIN . "/success",
                "cancelUrl" => $YOUR_DOMAIN . "/cancel"
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

    public function store_order_handmade(Request $request)
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
            $order->type_payment = 'aaifood';
            $order->save();
            $order_id = $order->order_id;

            // Xử lý sản phẩm
            $products = json_decode($request->products, true); // Decode danh sách sản phẩm từ JSON
            foreach ($products as $product) {
                $order_detail = new AaiOrderDetailModel();
                $order_detail->order_id = $order_id;
                $order_detail->product_id = $product['product_id'];
                $order_detail->product_quantity = $product['quantity'];
                $order_detail->product_price_input = number_format($product['product_price_input'], 3, '.', '');
                $order_detail->product_price_output = number_format($product['product_price_output'], 3, '.', '');
                $order_detail->save();

                $updated = AaiProductModel::where('product_id', $product['product_id'])
                    ->where('product_quantity_remaining', '>=', $product['quantity']) // Kiểm tra nếu số lượng còn lại đủ
                    ->update(['product_quantity_remaining' => DB::raw('product_quantity_remaining - ' . $product['quantity'])]);
                if (!$updated) {
                    // Nếu không tìm thấy sản phẩm hoặc số lượng không đủ, bạn có thể xử lý lỗi ở đây
                    throw new \Exception("Không đủ số lượng sản phẩm hoặc sản phẩm không tồn tại trong kho.");
                }
            }

            // Xử lý ảnh (nếu có)


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
            $order_total = (int)filter_var($order_total_bill, FILTER_SANITIZE_NUMBER_INT);
            $order = new AaiOrderModel();
            $order->customer_id = $request->agency_id;
            $order->order_total = $order_total;
            $order->order_date = $request->order_date;
            $order->sale_id = Auth::id();
            $order->type_payment = 'aaifood';
            $order->save();
            $order_id = $order->order_id;

            $products = $request->products;
            foreach ($products as $product) {
                $order_detail = new AaiOrderDetailModel();
                $order_detail->order_id = $order_id;
                $order_detail->product_id = $product['product_id']; // Dùng cú pháp mảng
                $order_detail->product_quantity = $product['quantity'];
                $order_detail->product_price_input = number_format($product['product_price_input'], 3, '.', '');
                $order_detail->product_price_output = number_format($product['product_price_output'], 3, '.', '');
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
            $data->cost_name = $request->cost_name;
            $price = str_replace(',', '', $request->cost_total);
            // Chuyển đổi thành số thực và đảm bảo có 3 chữ số sau dấu thập phân
            $data->cost_total = number_format((float)$price, 3, '.', '');
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

    public function update_payment_slip(Request $request, $cost_id)
    {
        try {
            $data = AaiCostModel::findorFail($cost_id);
            $data['cost_name'] = $request->cost_name;
            $price = str_replace(',', '', $request->cost_total);
            $data['cost_total'] = number_format((float)$price, 3, '.', '');
            $data['cost_date'] = Carbon::parse($request->cost_date)->format('Y-m-d');
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

    public function report_revenue()
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
                    ->where('type_payment', '=', 'aaifood')
                    ->sum('order_total');
                // Lợi nhuận trong tuần
                $revenue_week = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'aaifood')
                    ->whereBetween('order_date', [$start_of_week, $end_of_week]) // So sánh ngày trong tuần
                    ->sum('order_total');

                // Lợi nhuận trong tháng
                $revenue_month = AaiOrderModel::where('payos_status', 2)
                    ->where('type_payment', '=', 'aaifood')
                    ->whereBetween('order_date', [$startOfMonth, $endOfMonth]) // So sánh ngày trong tháng
                    ->sum('order_total');

                // Lợi nhuận toàn thời gian
                $revenue_all_time = AaiOrderModel::where('payos_status', 2)->where('type_payment', '=', 'aaifood')
                    ->sum('order_total');
            } else {
                $revenue_today = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'aaifood')
                    ->whereDate('order_date', '=', $today) // So sánh chỉ ngày
                    ->sum('order_total');
                // Lợi nhuận trong tuần
                $revenue_week = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'aaifood')
                    ->whereBetween('order_date', [$start_of_week, $end_of_week]) // So sánh ngày trong tuần
                    ->sum('order_total');

                // Lợi nhuận trong tháng
                $revenue_month = AaiOrderModel::where('payos_status', 2)
                    ->where('sale_id', $user_id)
                    ->where('type_payment', '=', 'aaifood')
                    ->whereBetween('order_date', [$startOfMonth, $endOfMonth]) // So sánh ngày trong tháng
                    ->sum('order_total');

                // Lợi nhuận toàn thời gian
                $revenue_all_time = AaiOrderModel::where('payos_status', 2)
                ->where('type_payment', '=', 'aaifood')
                    ->where('sale_id', $user_id)
                    ->sum('order_total');
            }

            // Lấy danh sách các nhân viên bán hàng
            $list_sales = AaiOrderModel::join('users', 'aai_order.sale_id', '=', 'users.id')
                ->select('users.name', 'users.id')
                ->where('aai_order.type_payment', '=', 'aaifood')
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
    // public function revenue()
    // {
    //     try {
    //         $today = Carbon::today()->toDateString();
    //         $startOfWeek = Carbon::now()->startOfWeek()->toDateString();
    //         $endOfWeek = Carbon::now()->endOfWeek()->toDateString();
    //         $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
    //         $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

    //         // Lợi nhuận ngày hôm nay
    //         $profit_today_product = AaiOrderModel::join('aai_order_detail', 'aai_order.order_id', '=', 'aai_order_detail.order_id')
    //         ->where('aai_order.payos_status', 2) // Lọc trạng thái thanh toán
    //         ->whereDate('aai_order.order_date', '=', now()->toDateString()) // Lọc theo ngày hôm nay
    //         ->selectRaw('
    //             SUM(aai_order.order_total - (aai_order_detail.product_quantity * aai_order_detail.product_price_input)) AS total_profit
    //         ')
    //         ->value('total_profit');

    //         // Tính tổng chi phí cho ngày hôm nay từ bảng cost
    //         $total_cost_day = DB::table('aai_cost')
    //             ->whereRaw('DATE(cost_date) = ?', [$today]) // Chuyển cost_date về dạng ngày
    //             ->sum('cost_total');

    //         $profit_today = $profit_today_product - $total_cost_day;

    //         // Lợi nhuận tuần này
    //         $profit_this_week = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
    //             ->join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
    //             ->whereBetween('aai_order.order_date', [$startOfWeek, $endOfWeek])
    //             ->where('aai_order.payos_status', 2)
    //             ->selectRaw('
    //                 SUM(aai_order.order_total) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS revenue
    //             ')
    //             ->value('revenue');
    //         $total_cost_week = DB::table('aai_cost')
    //             ->whereBetween('cost_date', [$startOfWeek, $endOfWeek])
    //             ->sum('cost_total');
    //         $profit_this_week -= $total_cost_week;

    //         // Lợi nhuận tháng này
    //         $profit_this_month = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
    //             ->join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
    //             ->whereBetween('aai_order.order_date', [$startOfMonth, $endOfMonth])
    //             ->where('aai_order.payos_status', 2)
    //             ->selectRaw('
    //                 SUM(aai_order.order_total) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS revenue
    //             ')
    //             ->value('revenue');
    //         $total_cost_month = DB::table('aai_cost')
    //             ->whereBetween('cost_date', [$startOfMonth, $endOfMonth])
    //             ->sum('cost_total');
    //         $profit_this_month -= $total_cost_month;

    //         // Lợi nhuận tổng thể
    //         $profit_all = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
    //             ->join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
    //             ->where('aai_order.payos_status', 2)
    //             ->selectRaw('
    //                 SUM(aai_order.order_total) - SUM(aai_order_detail.product_quantity * aai_product.product_input_price) AS revenue
    //             ')
    //             ->value('revenue');
    //         $total_cost_all = DB::table('aai_cost')
    //             ->sum('cost_total');
    //         $profit_all -= $total_cost_all;

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Lợi nhuận tính toán thành công',
    //             'profit_today' => $profit_today,
    //             'profit_this_week' => $profit_this_week,
    //             'profit_this_month' => $profit_this_month,
    //             'profit_all' => $profit_all
    //         ], 201);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi tính toán lợi nhuận',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function order_detail($order_id)
    {
        try {
            $order = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
                ->select('aai_order_detail.*', 'aai_product.product_name', 'aai_product.product_shelf_life')
                ->where('aai_order_detail.order_id', $order_id)->get();
            return response()->json([
                'success' => true,
                'message' => 'Danh sách sản phẩm',
                'data' => $order
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lấy danh sách sản phẩm thất bại' . $e->getMessage(),
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

    public function delete_payment_slip($cost_id)
    {
        try {
            AaiCostModel::where('cost_id', $cost_id)->delete();
            return response()->json([
                'success' => true,
                'message' => 'Xóa phiếu chi thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xóa phiếu chi thất bại' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function check_role_food()
    {
        $user_id = auth()->user()->id;
        $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
            ->select('crm_employee.department_id', 'users.role_id', 'crm_employee.level_id')
            ->where('users.id', $user_id)->first();
        // if($user->department_id == 1 || $user->department_id == 8 ||  $user->role_id == 1){
        //     $check_role = true;
        // }
        return response()->json([
            'success' => true,
            'message' => 'Kiểm tra quyền',
            'data' => $user
        ], 201);
    }

    public function result_payment_success($orderCode)
    {
        try {
            $customer = AaiOrderModel::where('order_id', $orderCode)->first();
            $order_detail = AaiOrderDetailModel::join('aai_product', 'aai_order_detail.product_id', '=', 'aai_product.product_id')
                ->select('aai_product.product_name', 'aai_product.product_output_price', 'aai_order_detail.product_quantity', 'aai_order_detail.product_id')
                ->where('order_id', $orderCode)->get();
            return response()->json([
                'success' => true,
                'message' => 'Chi tiết hóa đơn',
                'customer' => $customer,
                'order_detail' => $order_detail,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lấy hóa đơn thất bại' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function confirm_payment($order_id)
    {
        try {
            $data = AaiOrderModel::findorFail($order_id);
            $data['payos_status'] = 2;
            $data->save();
            //
            $pathname = '/admin/aaifood/chi-tiet-phieu-thu/' . $order_id;
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            $members = User::where('id', 48)->pluck('id')->toArray();
            $notification_title = 'AAIFOOD đã có đơn hàng mới được kế toán xác nhận cần được giao';
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_type' => 3,
                        'notification_title' => $notification_title,
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
            $notification = Notification::where('notification_title', $notification_title)
                ->first();
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'content' => $notification_title,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/aaifood-new-order-confirm', $payload);
            }

            //
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([

                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function confirm_payment_change($order_id)
    {
        try {
            $data = AaiOrderModel::findorFail($order_id);
            $data['payos_status'] = 1;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật trạng thái thất bại',
            ], 422);
        }
    }

    public function filter_revenue_food(Request $request)
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
                $query_retail = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('aai_order.payos_status', 2)
                    ->where('customer_id', null)
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->orderBy('order_date', 'desc');

                // Truy vấn đơn hàng đại lý
                $query_agency = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->join('aai_agency', 'aai_order.customer_id', '=', 'aai_agency.agency_id')
                    ->select('aai_order.*', 'users.name', 'aai_agency.agency_name', 'aai_agency.agency_phone', 'aai_agency.agency_address', 'aai_agency.agency_level')
                    ->where('aai_order.payos_status', 2)
                    ->whereNotNull('customer_id')
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->orderBy('order_date', 'desc');


                // Lọc theo ngày bắt đầu và kết thúc
                if ($start_date && $end_date) {
                    $query_retail->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                    $query_agency->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                    if ($sale_id && $sale_id != '0') {
                        $query_retail->where(function ($query_retail) use ($sale_id) {
                            $query_retail->where('aai_order.sale_id', $sale_id);
                        });
                        $query_agency->where(function ($query_agency) use ($sale_id) {
                            $query_agency->where('aai_order.sale_id', $sale_id);
                        });
                    }
                } else {
                    if ($start_date) {
                        $query_retail->whereDate('aai_order.order_date', $start_date);
                        $query_agency->whereDate('aai_order.order_date', $start_date);
                        if ($sale_id && $sale_id != '0') {
                            $query_retail->where(function ($query_retail) use ($sale_id) {
                                $query_retail->where('aai_order.sale_id', $sale_id);
                            });
                            $query_agency->where(function ($query_agency) use ($sale_id) {
                                $query_agency->where('aai_order.sale_id', $sale_id);
                            });
                        }
                    }
                    if ($end_date) {
                        $query_retail->whereDate('aai_order.order_date', $end_date);
                        $query_agency->whereDate('aai_order.order_date', $end_date);
                        if ($sale_id && $sale_id != '0') {
                            $query_retail->where(function ($query_retail) use ($sale_id) {
                                $query_retail->where('aai_order.sale_id', $sale_id);
                            });
                            $query_agency->where(function ($query_agency) use ($sale_id) {
                                $query_agency->where('aai_order.sale_id', $sale_id);
                            });
                        }
                    }
                    if ($sale_id && $sale_id != '0') {
                        $query_retail->where(function ($query_retail) use ($sale_id) {
                            $query_retail->where('aai_order.sale_id', $sale_id);
                        });
                        $query_agency->where(function ($query_agency) use ($sale_id) {
                            $query_agency->where('aai_order.sale_id', $sale_id);
                        });
                    }
                }
                // Lấy dữ liệu
                $all_order_retail = $query_retail->get();
                $all_order_agency = $query_agency->get();
                // Tính tổng tiền từ các đơn hàng bán lẻ và đại lý
                $total_retail = $all_order_retail->sum('order_total');
                $total_agency = $all_order_agency->sum('order_total');
                // Trả về kết quả
                $total_revenue = $total_retail + $total_agency;
            } else {
                $query_retail = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->select('aai_order.*', 'users.name')
                    ->where('aai_order.payos_status', 2)
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->where('customer_id', null)
                    ->where('aai_order.sale_id', $user_id)
                    ->orderBy('order_date', 'desc');

                // Truy vấn đơn hàng đại lý
                $query_agency = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                    ->join('aai_agency', 'aai_order.customer_id', '=', 'aai_agency.agency_id')
                    ->select('aai_order.*', 'users.name', 'aai_agency.agency_name', 'aai_agency.agency_phone', 'aai_agency.agency_address', 'aai_agency.agency_level')
                    ->where('aai_order.payos_status', 2)
                    ->where('aai_order.type_payment', '=', 'aaifood')
                    ->where('aai_order.sale_id', $user_id)
                    ->whereNotNull('customer_id')
                    ->orderBy('order_date', 'desc');


                // Lọc theo ngày bắt đầu và kết thúc
                if ($start_date && $end_date) {
                    $query_retail->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                    $query_agency->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                    if ($sale_id && $sale_id != '0') {
                        $query_retail->where(function ($query_retail) use ($sale_id) {
                            $query_retail->where('aai_order.sale_id', $sale_id);
                        });
                        $query_agency->where(function ($query_agency) use ($sale_id) {
                            $query_agency->where('aai_order.sale_id', $sale_id);
                        });
                    }
                } else {
                    if ($start_date) {
                        $query_retail->whereDate('aai_order.order_date', $start_date);
                        $query_agency->whereDate('aai_order.order_date', $start_date);
                        if ($sale_id && $sale_id != '0') {
                            $query_retail->where(function ($query_retail) use ($sale_id) {
                                $query_retail->where('aai_order.sale_id', $sale_id);
                            });
                            $query_agency->where(function ($query_agency) use ($sale_id) {
                                $query_agency->where('aai_order.sale_id', $sale_id);
                            });
                        }
                    }
                    if ($end_date) {
                        $query_retail->whereDate('aai_order.order_date', $end_date);
                        $query_agency->whereDate('aai_order.order_date', $end_date);
                        if ($sale_id && $sale_id != '0') {
                            $query_retail->where(function ($query_retail) use ($sale_id) {
                                $query_retail->where('aai_order.sale_id', $sale_id);
                            });
                            $query_agency->where(function ($query_agency) use ($sale_id) {
                                $query_agency->where('aai_order.sale_id', $sale_id);
                            });
                        }
                    }
                    if ($sale_id && $sale_id != '0') {
                        $query_retail->where(function ($query_retail) use ($sale_id) {
                            $query_retail->where('aai_order.sale_id', $sale_id);
                        });
                        $query_agency->where(function ($query_agency) use ($sale_id) {
                            $query_agency->where('aai_order.sale_id', $sale_id);
                        });
                    }
                }
                // Lấy dữ liệu
                $all_order_retail = $query_retail->get();
                $all_order_agency = $query_agency->get();
                // Tính tổng tiền từ các đơn hàng bán lẻ và đại lý
                $total_retail = $all_order_retail->sum('order_total');
                $total_agency = $all_order_agency->sum('order_total');
                // Trả về kết quả
                $total_revenue = $total_retail + $total_agency;
            }
            return response()->json([
                'success' => true,
                'message' => 'Kết quả lọc',
                'all_order_retail' => $all_order_retail,
                'all_order_agency' => $all_order_agency,
                'total_revenue' => $total_revenue
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lọc thất bại',
            ], 422);
        }
    }

    public function report_profit()
    {
        try {
            $today = Carbon::now('Asia/Ho_Chi_Minh')->toDateString(); // Lấy ngày hôm nay theo múi giờ Việt Nam
            $start_of_week = Carbon::now('Asia/Ho_Chi_Minh')->startOfWeek()->toDateString(); // Đầu tuần theo múi giờ Việt Nam
            $end_of_week = Carbon::now('Asia/Ho_Chi_Minh')->endOfWeek()->toDateString(); // Cuối tuần theo múi giờ Việt Nam
            $startOfMonth = Carbon::now('Asia/Ho_Chi_Minh')->startOfMonth()->toDateString(); // Đầu tháng theo múi giờ Việt Nam
            $endOfMonth = Carbon::now('Asia/Ho_Chi_Minh')->endOfMonth()->toDateString(); // Cuối tháng theo múi giờ Việt Nam

            // Lợi nhuận ngày hôm nay
            $profit_today_product = DB::table('aai_order as o')
                ->join('aai_order_detail as od', 'o.order_id', '=', 'od.order_id')
                ->selectRaw('
                SUM((od.product_quantity * od.product_price_output) - (od.product_quantity * od.product_price_input)) AS today_profit
            ')
                ->where('o.payos_status', 2)
                ->whereDate('o.order_date', today())
                ->where('o.type_payment', '=', 'aaifood')
                ->value('today_profit');

            // Tính tổng chi phí cho ngày hôm nay từ bảng cost
            $total_cost_day = DB::table('aai_cost')
                ->whereRaw('DATE(cost_date) = ?', [$today]) // Chuyển cost_date về dạng ngày
                ->sum('cost_total');

            $profit_today = $profit_today_product - $total_cost_day;

            // Lợi nhuận tuần này
            $profit_this_week =  DB::table('aai_order as o')
                ->join('aai_order_detail as od', 'o.order_id', '=', 'od.order_id')
                ->selectRaw('
                SUM((od.product_quantity * od.product_price_output) - (od.product_quantity * od.product_price_input)) AS today_profit')
                ->where('o.payos_status', 2)
                ->where('o.type_payment', '=', 'aaifood')
                ->whereBetween('o.order_date', [$start_of_week, $end_of_week])
                ->value('today_profit');
            $total_cost_week = DB::table('aai_cost')
                ->whereBetween('cost_date', [$start_of_week, $end_of_week])
                ->sum('cost_total');
            $profit_this_week -= $total_cost_week;

            // Lợi nhuận tháng này
            $profit_this_month =  DB::table('aai_order as o')
                ->join('aai_order_detail as od', 'o.order_id', '=', 'od.order_id')
                ->selectRaw('
                SUM((od.product_quantity * od.product_price_output) - (od.product_quantity * od.product_price_input)) AS today_profit')
                ->where('o.payos_status', 2)
                ->where('o.type_payment', '=', 'aaifood')
                ->whereBetween('o.order_date', [$startOfMonth, $endOfMonth])
                ->value('today_profit');
            $total_cost_month = DB::table('aai_cost')
                ->whereBetween('cost_date', [$startOfMonth, $endOfMonth])
                ->sum('cost_total');
            $profit_this_month -= $total_cost_month;

            // Lợi nhuận tổng thể
            $profit_all =
                DB::table('aai_order as o')
                ->join('aai_order_detail as od', 'o.order_id', '=', 'od.order_id')
                ->selectRaw('
                SUM((od.product_quantity * od.product_price_output) - (od.product_quantity * od.product_price_input)) AS today_profit')
                ->where('o.payos_status', 2)
                ->where('o.type_payment', '=', 'aaifood')
                ->value('today_profit');
            $total_cost_all = DB::table('aai_cost')
                ->sum('cost_total');
            $profit_all -= $total_cost_all;

            return response()->json([
                'success' => true,
                'message' => 'Lợi nhuận tính toán thành công',
                'profit_today' => $profit_today,
                'profit_this_week' => $profit_this_week,
                'profit_this_month' => $profit_this_month,
                'profit_all' => $profit_all
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tính toán lợi nhuận',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function filter_profit_food(Request $request)
    {
        try {

            $user_id = auth()->user()->id;
            $user = CrmEmployeeModel::join('users', 'crm_employee.account_id', '=', 'users.id')
                ->select('crm_employee.department_id', 'users.role_id')
                ->where('users.id', $user_id)->first();
            // Truy vấn đơn hàng bán lẻ
            $start_date = $request->startDate;
            $end_date = $request->endDate;

            // Truy vấn đơn hàng bán lẻ
            $query_retail = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                ->select('aai_order.*', 'users.name')
                ->where('aai_order.payos_status', 2)
                ->where('customer_id', null)
                ->where('aai_order.type_payment', '=', 'aaifood')
                ->orderBy('order_date', 'desc');

            // Truy vấn đơn hàng đại lý
            $query_agency = AaiOrderModel::leftjoin('users', 'aai_order.sale_id', '=', 'users.id')
                ->join('aai_agency', 'aai_order.customer_id', '=', 'aai_agency.agency_id')
                ->select('aai_order.*', 'users.name', 'aai_agency.agency_name', 'aai_agency.agency_phone', 'aai_agency.agency_address', 'aai_agency.agency_level')
                ->where('aai_order.payos_status', 2)
                ->where('aai_order.type_payment', '=', 'aaifood')
                ->whereNotNull('customer_id')
                ->orderBy('order_date', 'desc');

            // Truy vấn chi phí
            $query_payment_slip = AaiCostModel::select('aai_cost.*');

            // Truy vấn lợi nhuận
            $query_profit = AaiOrderDetailModel::join('aai_order', 'aai_order_detail.order_id', '=', 'aai_order.order_id')
                ->where('aai_order.payos_status', 2);

            // Lọc theo ngày bắt đầu và kết thúc
            if ($start_date && $end_date) {
                $query_retail->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                $query_agency->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
                $query_payment_slip->whereBetween(DB::raw('DATE(aai_cost.cost_date)'), [$start_date, $end_date]);
                $query_profit->whereBetween(DB::raw('DATE(aai_order.order_date)'), [$start_date, $end_date]);
            } else {
                if ($start_date) {
                    $query_retail->whereDate('aai_order.order_date', $start_date);
                    $query_agency->whereDate('aai_order.order_date', $start_date);
                    $query_payment_slip->whereDate('aai_cost.cost_date', $start_date);
                    $query_profit->whereDate('aai_order.order_date', $start_date);
                }
                if ($end_date) {
                    $query_retail->whereDate('aai_order.order_date', $end_date);
                    $query_agency->whereDate('aai_order.order_date', $end_date);
                    $query_payment_slip->whereDate('aai_cost.cost_date', $end_date);
                    $query_profit->whereDate('aai_order.order_date', $end_date);
                }
            }

            // Lấy dữ liệu
            $all_order_retail =  $query_retail->get();
            $all_order_agency =  $query_agency->get();
            $all_payment_slip =  $query_payment_slip->get();

            // Tính tổng tiền từ các đơn hàng bán lẻ và đại lý
            $total_payment_slip = $all_payment_slip->sum('cost_total'); // Tổng chi phí từ các phiếu chi
            // Tính lợi nhuận từ đơn hàng
            $total_profit = $query_profit->selectRaw('
        SUM((aai_order_detail.product_quantity * aai_order_detail.product_price_output) - (aai_order_detail.product_quantity * aai_order_detail.product_price_input)) AS today_profit
    ')
                ->value('today_profit');

            // Tính tổng lợi nhuận
            $total_profit_all = $total_profit - $total_payment_slip;

            // Trả về kết quả
            return response()->json([
                'success' => true,
                'message' => 'Kết quả lọc',
                'all_order_retail' => $all_order_retail,
                'all_order_agency' => $all_order_agency,
                'total_profit_all' => $total_profit_all,
                'all_payment_slip' => $all_payment_slip
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lọc thất bại',
            ], 422);
        }
    }
    public function order_delivery_status(Request $request)
    {
        try {
            $order = AaiOrderModel::find($request->order_id);
            if (!$order) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng!'], 404);
            }

            $order->delivery_status = $request->shipping_status;
            $order->save();

            return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái vận chuyển thành công!']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Có lỗi xảy ra khi cập nhật trạng thái!', 'error' => $e->getMessage()], 500);
        }
    }
}
