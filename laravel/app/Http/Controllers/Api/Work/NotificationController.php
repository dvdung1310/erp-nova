<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class NotificationController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function create(Request $request)
    {
        try {
            $allUserIds = User::where('id', '!=', auth()->user()->id)->pluck('id')->toArray();
            $members = $allUserIds ?? [];
            $create_by_user_id = auth()->user()->id;
            $pathname = $request->pathname;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'notification_status' => 0,
                        'notification_type' => 1,
                        'notification_content' => $request->notification_content,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => $request->notification_title,
                        'notification_link' => $this->ClientUrl . $pathname,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            Notification::insert($notifications);
            $notification = Notification::where('create_by_user_id', $create_by_user_id)
                ->with('createByUser')
                ->latest()
                ->first();
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $devices = Devices::whereIn('user_id', $members)
                ->where('user_id', '!=', $create_by_user_id)
                ->get();
            $devices = $devices->map(function ($device) {
                return json_decode($device->endpoint, true);
            })->filter()->values()->toArray();
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/create-notification-all', $payload);
            }
            return response()->json([
                'error' => false,
                'message' => 'Notification created successfully',
                'data' => $notification
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'error' => true,
                'message' => $e->getMessage()
            ]);
        }

    }

    //
    public function getNotificationByUserId()
    {
        try {
            $user_id = auth()->user()->id;
            $notifications = Notification::where('user_id', $user_id)
                ->with('createByUser') // Assuming the relationship is defined in the Notification model
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
