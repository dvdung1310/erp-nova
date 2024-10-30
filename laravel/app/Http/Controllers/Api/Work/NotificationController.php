<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    //
    public function getNotificationByUserId()
    {
        try {
            $user_id = auth()->user()->id;
            $notifications = Notification::where('user_id', $user_id)
                ->orderBy('notification_status', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $notifications
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }

    }

    public function updateStatus(Request $request, $notification_id)
    {
        try {
            $notification = Notification::find($notification_id);
            if (!$notification) {
                return response()->json([
                    'error' => true,
                    'message' => 'Notification not found',
                    'data' => null
                ], 404);
            }
            $notification->notification_status = $request->notification_status;
            $notification->save();
            return response()->json([
                'error' => false,
                'message' => 'Notification updated successfully',
                'data' => $notification
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }
}
