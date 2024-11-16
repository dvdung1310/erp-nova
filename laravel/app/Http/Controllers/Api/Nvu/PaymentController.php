<?php

namespace App\Http\Controllers\Api\Nvu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NvuRoomBooking;
use App\Models\NvuRoom;
use App\Models\CustomerPaymentHistory;
use App\Models\NvuBookingHistory;
use  App\Models\Customer;
use  App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

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
            'id_customer_booking' => 'required',
            'date' => 'required',
            'money' => 'required',
            'type' => 'required',
            'image' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048',
        ]);

        $filePath = null;
        if ($request->hasFile('image')) {
            $filePath = $request->file('image')->store('novaup', 'public');
        }

        try {
            $customerPaymentHistory = CustomerPaymentHistory::findOrFail($validatedData['id']);

            $customerPaymentHistory->update([
                'name' => $validatedData['id_customer_booking'],
                'money' =>  $validatedData['money'],
                'date' => $validatedData['date'],
                'image' => $filePath,
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
}
