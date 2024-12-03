<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\CustomerDataSource;
use App\Models\CustomerStatus;
use App\Models\CustomerSale;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller
{
    public function index(Request $request)
    {

        try {
            $query = Customer::with(['status', 'dataSource', 'sales']);

            if ($request->has('status_id') && $request->status_id) {
                $query->where('status_id', $request->status_id);
            }

            if ($request->has('source_id') && $request->source_id) {
                $query->where('source_id', $request->source_id);
            }

            // Lọc theo tên sales (nếu có)
            if ($request->has('sales_name') && $request->sales_name) {
                $query->whereHas('sales', function ($q) use ($request) {
                    $q->whereIn('user_id', User::where('name', 'like', '%' . $request->sales_name . '%')->pluck('id')->toArray());
                });
            }

            // Lọc theo ngày (nếu có)
            if ($request->has('date') && $request->date) {
                $query->where('date', 'like', '%' . $request->date . '%');
            }

            // Lọc theo tên khách hàng (nếu có)
            if ($request->has('name') && $request->name) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }

            // Thực hiện truy vấn
            $customers = $query->orderBy('date', 'desc')
                ->get()
                ->map(function ($customer) {
                    $userIds = $customer->sales->pluck('user_id')->toArray();
                    $salesNames = User::whereIn('id', $userIds)->pluck('name')->toArray();
                    return [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'phone' => $customer->phone,
                        'date' => $customer->date,
                        'email' => $customer->email,
                        'file_infor' => $customer->file_infor,
                        'content' => $customer->customer_comment,
                        'status_name' => $customer->status ? $customer->status->name : 'Không xác định',
                        'source_name' => $customer->dataSource ? $customer->dataSource->name . ' - ' .  $customer->dataSource->source : 'Không xác định',
                        'status_id' => $customer->status->id ?? null,
                        'source_id' => $customer->dataSource->id ?? null,
                        'sales_names' => $salesNames,
                        'created_at' => $customer->created_at,
                    ];
                });

            // Lấy danh sách status và dataSource
            $statuses = CustomerStatus::select('id', 'name', 'color')->get();
            $data_sources = CustomerDataSource::select('id', 'name', 'source')->get();

            $data_sources = $data_sources->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name_source' => $item->name . ' - ' . $item->source,
                ];
            });

            // Trả về kết quả
            return response()->json([
                'success' => true,
                'customers' => $customers,
                'statuses' => $statuses,
                'data_sources' => $data_sources,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách khách hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'date' => 'nullable',
            'email' => 'nullable|string',
            'content' => 'nullable|string',
            // 'file_infor' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'status_id' => 'required|exists:customer_status,id',
            'source_id' => 'required|exists:customer_data_source,id',
        ]);

        if (!empty($validatedData['date']) && $validatedData['date'] !== 'null' && $validatedData['date'] !== 'undefined') {
            $date = $validatedData['date'];
        } else {
            $date = null;
        }

        if (empty($validatedData['email'])  || $validatedData['email'] == 'null') {
            $email = null;
        } else {
            $email = $validatedData['email'];
        }

        if (empty($validatedData['content'])  || $validatedData['content'] == 'null') {
            $content = null;
        } else {
            $content = $validatedData['content'];
        }
        $filePaths = [];
        if ($request->hasFile('file_infor')) {
            foreach ($request->file('file_infor') as $file) {
                $filePaths[] = $file->store('customer', 'public');
            }
        }
        try {
            $customer = Customer::create([
                'name' => $validatedData['name'],
                'phone' => $validatedData['phone'],
                'date' => $date,
                'email' => $email,
                'file_infor' => json_encode($filePaths),
                'customer_comment' =>  $content,
                'status_id' => $validatedData['status_id'],
                'source_id' => $validatedData['source_id'],
            ]);
            CustomerSale::create([
                'customer_id' => $customer->id,
                'user_id' => Auth::id(),
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

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'required|Integer',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'date' => 'nullable',
            'content' => 'nullable',
            'email' => 'nullable|string',
            // 'file_infor' => 'nullable|string',
            'status_id' => 'nullable|exists:customer_status,id',
            'source_id' => 'nullable|exists:customer_data_source,id',
        ]);

        try {
            $customer = Customer::findOrFail($validatedData['id']);

            if (!empty($validatedData['date']) && $validatedData['date'] !== 'null' && $validatedData['date'] !== 'undefined') {
                $date = $validatedData['date'];
            } else {
                $date = null;
            }

            if (empty($validatedData['email'])  || $validatedData['email'] == 'null') {
                $email = null;
            } else {
                $email = $validatedData['email'];
            }

            if (empty($validatedData['content'])  || $validatedData['content'] == 'null') {
                $content = null;
            } else {
                $content = $validatedData['content'];
            }

            $filePaths = [];
            if ($request->hasFile('file_infor')) {
                if (!empty($customer->file_infor)) {
                    $oldFiles = json_decode($customer->file_infor, true);
                    foreach ($oldFiles as $oldFile) {
                        \Storage::disk('public')->delete($oldFile);
                    }
                }
                foreach ($request->file('file_infor') as $file) {
                    $filePaths[] = $file->store('customer', 'public');
                }
            } else {
                $filePaths = $customer->file_infor ? json_decode($customer->file_infor, true) : [];
            }

            $customer->update([
                'name' => $validatedData['name'] ?? $customer->name,
                'phone' => $validatedData['phone'] ?? $customer->phone,
                'date' => $date,
                'email' => $email,
                'customer_comment' =>$content,
                'file_infor' => !empty($filePaths) ? json_encode($filePaths) : $customer->file_infor,
                'status_id' => $validatedData['status_id'] ?? $customer->status_id,
                'source_id' => $validatedData['source_id'] ?? $customer->source_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thông tin khách hàng đã được cập nhật.',
                'data' => $customer,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật khách hàng.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        try {

            $customer = Customer::findOrFail($id);
            if (!empty($customer->file_infor)) {
                $files = json_decode($customer->file_infor, true);
                foreach ($files as $file) {
                    if (Storage::disk('public')->exists($file)) {
                        Storage::disk('public')->delete($file);
                    }
                }
            }
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
}
