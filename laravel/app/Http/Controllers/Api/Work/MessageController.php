<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use App\Models\Message;
use App\Models\MessageTask;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    //
    public function create(Request $request)
    {
        try {
            $request->validate([
                'text' => 'nullable',
                'image_url' => 'nullable',
                'file_url' => 'nullable',
                'message_type' => 'nullable||in:0,1,2',
                'task_id' => 'required'
            ]);
            $task_id = $request->task_id;
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'message' => 'Task not found',
                    'error' => true
                ], 404);
            }

            if ($request->image_url) {
                $request->validate([
                    'image_url' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                ]);
                $image_url = time() . '.' . $request->image_url->extension();

                // Lưu ảnh vào disk 'public'
                $avatarPath = $request->image_url->storeAs('messages', $image_url, 'public');

                // Lấy url của ảnh
                $url_image = Storage::url($avatarPath);
                $request->image_url = $url_image;
            }
            if ($request->file_url) {
                $request->validate([
                    'file_url' => 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:2048',
                ]);
                $file_url = rand(1000, 9999) . '_' . $request->file_url->getClientOriginalName();

                // Lưu file vào disk 'public'
                $filePath = $request->file_url->storeAs('messages', $file_url, 'public');

                if (!$filePath) {
                    return response()->json([
                        'message' => 'Upload file failed',
                        'error' => true
                    ], 400);
                }
                // Lấy url của file
                $url_file = Storage::url($filePath);
                $request->file_url = $url_file;
            }

            $message_by_user_id = auth()->user()->id;
            $payload = [
                'text' => $request->text,
                'image_url' => $request->image_url,
                'file_url' => $request->file_url,
                'message_type' => $request->message_type,
                'message_by_user_id' => $message_by_user_id,
                'task_id' => $request->task_id
            ];
            $message = Message::create([
                'text' => $request->text,
                'image_url' => $request->image_url,
                'file_url' => $request->file_url,
                'message_type' => $request->message_type,
                'message_by_user_id' => $message_by_user_id,
                'task_id' => $request->task_id
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $request->task_id
            ]);
            $message = Message::where('message_id', $message->message_id)
                ->with('user')
                ->first();
            // Thông báo cho các thành viên khác trong task
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            if ($request->text) {
                $content = Str::limit($request->text, 20, '...');
            } elseif ($request->image_url) {
                $content = 'Ảnh';
            } elseif ($request->file_url) {
                $content = 'File';
            } else {
                $content = 'No content';
            }
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'notification_title' => $createByUserName . ' Đã thêm bình luận công việc: ' . $task->task_name . '"' . $content . '"',
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

            if (!empty($notifications)) {
                $taskName = $task->task_name;
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'taskName' => $taskName,
                    'notification' => $notifications[0],
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                    'content' => $content,
                ];
                Http::post($this->nodeUrl . '/create-comment-task', $payload);
            }

            //
            return response()->json([
                'message' => 'Message created successfully',
                'error' => false,
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true
            ], 400);
        }

    }

    public function getMessageByTask(Request $request, $task_id)
    {
        try {
            $messages = MessageTask::where('task_id', $task_id)
                ->with(['message.user']) // Eager load the user.js relationship
                ->get()
                ->pluck('message');
            return response()->json([
                'message' => 'Get messages successfully',
                'error' => false,
                'data' => $messages
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true
            ], 500);
        }

    }
}
