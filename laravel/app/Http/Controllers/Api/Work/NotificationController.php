<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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
            $validated = $request->validate([
                'notification_title' => 'required',
                'notification_content' => 'required',
                'pathname' => 'required',
            ]);
            $notification_file = '';
            $files = $request->input('files') || $request->file('files');
            if ($files) {
                $files = $request->file('files');
                $fileNames = [];
                foreach ($files as $file) {
                    $file_url = rand(1000, 9999) . '_' . $file->getClientOriginalName();

                    // Lưu ảnh vào disk 'public'
                    $filePath = $file->storeAs('notification', $file_url, 'public');

                    // Lấy url của ảnh
                    $url_avatar = Storage::url($filePath);
                    // Cập nhật avatar trong database
                    $fileNames[] = $url_avatar;
                }
                $files = json_encode($fileNames);
                $notification_file = $files;

            }
            $allUserIds = User::pluck('id')->toArray();
            $members = $allUserIds ?? [];
            $create_by_user_id = auth()->user()->id;
            $pathname = $request->input('pathname');
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'notification_status' => 0,
                        'notification_type' => 1,
                        'notification_content' => $request->notification_content,
                        'notification_file' => $notification_file,
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
                    'notification_file' => $notification_file,
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

    public function getNotificationById($notification_id)
    {
        try {
            $notification = Notification::where('notification_id', $notification_id)
                ->with('createByUser')
                ->first();
            $notification_file = json_decode($notification->notification_file);
            $notification->notification_file = $notification_file;
            if (!$notification) {
                return response()->json([
                    'error' => true,
                    'message' => 'Notification not found',
                    'data' => null
                ], 404);
            }
            return response()->json([
                'error' => false,
                'message' => 'Notification found',
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

    public function getNotificationByUserIdPaginate()
    {
        try {
            $user_id = auth()->user()->id;
            $notifications = Notification::where('user_id', $user_id)
                ->with('createByUser') // Assuming the relationship is defined in the Notification model
                ->orderBy('notification_status', 'asc')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
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
