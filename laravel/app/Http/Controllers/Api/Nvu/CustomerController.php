<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\CustomerDataSource;
use App\Models\CustomerStatus;
use App\Models\CustomerSale;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function index()
    {
        try {
            $customers = Customer::with(['status', 'dataSource', 'sales'])
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
                        'status_name' => $customer->status ? $customer->status->name : 'Không xác định',
                        'source_name' => $customer->dataSource ? $customer->dataSource->name : 'Không xác định',
                        'status_id' => $customer->status->id ,
                        'source_id' => $customer->dataSource->id,
                        'sales_names' => $salesNames,
                        'created_at' => $customer->created_at,
                    ];
                });

            $statuses = CustomerStatus::select('id', 'name', 'color')->get();
            $dataSources = CustomerDataSource::select('id', 'name')->get();

            return response()->json([
                'success' => true,
                'customers' => $customers,
                'statuses' => $statuses,
                'data_sources' => $dataSources,
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
            'file_infor' => 'nullable|string',
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
        }else{
            $email = $validatedData['email'];
        }
        try {
            $customer = Customer::create([
                'name' => $validatedData['name'],
                'phone' => $validatedData['phone'],
                'date' => $date,
                'email' => $email,
                'file_infor' => $validatedData['file_infor'] ?? null,
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
            'email' => 'nullable|string',
            'file_infor' => 'nullable|string',
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
            }else{
                $email = $validatedData['email'];
            }
            $customer->update([
                'name' => $validatedData['name'] ?? $customer->name,
                'phone' => $validatedData['phone'] ?? $customer->phone,
                'date' => $date,
                'email' => $email,
                'file_infor' => $validatedData['file_infor'] ?? $customer->file_infor ?? null,
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
