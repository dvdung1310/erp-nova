<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageTask;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    //
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
            $validatedData = $request->validate([
                'project_id' => 'required',
                'task_name' => 'nullable|string|max:255',
                'task_description' => 'nullable|string',
                'task_start_date' => 'nullable',
                'task_end_date' => 'nullable',
                'task_date_update_status_completed' => 'nullable',
                'members' => 'nullable|array',
                'members.*' => 'exists:users,id',
            ]);
            $project = Project::find($validatedData['project_id']);
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $group_id = $project->group_id;
            $group = Group::find($group_id);

            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            $create_by_user_id = auth()->user()->id;
            $task = Task::create(array_merge($validatedData, ['create_by_user_id' => $create_by_user_id]));
            $membersData = [];
            foreach ($request->members as $user_id) {
                $membersData[] = [
                    'task_id' => $task->task_id,
                    'user_id' => $user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            TaskMember::insert($membersData);
            // create message
            $message = Message::create([
                'text' => 'Tạo công việc ' . $task->task_name,
                'message_type' => 3,
                'message_by_user_id' => $create_by_user_id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            //
            return response()->json([
                'error' => false,
                'message' => 'task created successfully',
                'data' => $task
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function getTaskByProjectId(Request $request, $project_id)
    {
        try {
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $tasks = [];
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $leader_id = $project->leader_id;
            if ($role_id != 5 || $user_id == $leader_id) {
                $tasks = Task::where('project_id', $project_id)
                    ->with(['users' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    }])
                    ->get()
                    ->makeHidden('pivot');
            } else {
                $tasks = Task::where('project_id', $project_id)
                    ->whereHas('users', function ($query) use ($user_id) {
                        $query->where('users.id', $user_id);
                    })
                    ->with(['users' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    }])
                    ->get()
                    ->makeHidden('pivot');
            }

            $project = Project::with(['users', 'creator'])->find($project_id);
            $creator = $project->creator;
            $userProject = $project ? $project->users : [];
            return response()->json([
                'error' => false,
                'message' => 'Tasks found',
                'data' => [
                    'tasks' => $tasks,
                    'project' => $project,
                    'userProject' => $userProject,
                    'creator' => $creator
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }


    }

    public function updateMember(Request $request, $task_id)
    {
        try {
            $task = Task::find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $project = Project::find($task->project_id);
            $group_id = $project->group_id;
            $group = Group::find($group_id);
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            $members = $request->members;
            $taskMembers = TaskMember::where('task_id', $task_id)->pluck('user_id')->toArray();
            $membersToAdd = array_values(array_diff($members, $taskMembers));
            $membersToRemove = array_values(array_diff($taskMembers, $members));
            TaskMember::where('task_id', $task_id)->delete();
            $membersData = [];
            foreach ($members as $user_id) {
                $membersData[] = [
                    'task_id' => $task_id,
                    'user_id' => $user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            TaskMember::insert($membersData);
            $taskResponse = Task::with('users')->find($task_id);
            $message = Message::create([
                'text' => 'Cập nhật thành viên công việc ',
                'message_type' => 3,
                'message_by_user_id' => $user_id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            //
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];

            if (!empty($membersToAdd)) {
                foreach ($membersToAdd as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'task_id' => $task_id,
                            'create_by_user_id' => $create_by_user_id,
                            'notification_title' => ' Đã thêm bạn vào công việc ' . $task->task_name,
                            'notification_link' => $this->ClientUrl . $pathname,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
            if (!empty($membersToRemove)) {
                foreach ($membersToRemove as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'task_id' => $task_id,
                            'create_by_user_id' => $create_by_user_id,
                            'notification_title' => ' Đã xóa bạn khỏi công việc ' . $task->task_name,
                            'notification_link' => $this->ClientUrl . $pathname,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
            Notification::insert($notifications);

            if (!empty($membersToAdd)) {
                $devices = Devices::whereIn('user_id', $membersToAdd)
                    ->where('user_id', '!=', $create_by_user_id)
                    ->get();
                $devices = $devices->map(function ($device) {
                    return json_decode($device->endpoint, true);
                })->filter()->values()->toArray();
                $notification = Notification::where('task_id', $task_id)
                    ->where('create_by_user_id', $create_by_user_id)
                    ->with('createByUser')
                    ->latest()
                    ->first();
                if (!empty($notifications)) {
                    $taskName = $task->task_name;
                    $payload = [
                        'members' => $membersToAdd,
                        'devices' => $devices,
                        'createByUserName' => $createByUserName,
                        'taskName' => $taskName,
                        'notification' => $notification,
                        'createByUserId' => $create_by_user_id,
                        'pathname' => $pathname,
                    ];
                    Http::post($this->nodeUrl . '/update-add-members-task', $payload);
                }
            }
            if (!empty($membersToRemove)) {
                $devices = Devices::whereIn('user_id', $membersToRemove)
                    ->where('user_id', '!=', $create_by_user_id)
                    ->get();
                $devices = $devices->map(function ($device) {
                    return json_decode($device->endpoint, true);
                })->filter()->values()->toArray();
                $notification = Notification::where('task_id', $task_id)
                    ->where('create_by_user_id', $create_by_user_id)
                    ->with('createByUser')
                    ->latest()
                    ->first();
                if (!empty($notifications)) {
                    $taskName = $task->task_name;
                    $payload = [
                        'members' => $membersToRemove,
                        'devices' => $devices,
                        'createByUserName' => $createByUserName,
                        'taskName' => $taskName,
                        'notification' => $notification,
                        'createByUserId' => $create_by_user_id,
                        'pathname' => $pathname,
                    ];
                    Http::post($this->nodeUrl . '/update-remove-members-task', $payload);
                }
            }

            //
            return response()->json([
                'error' => false,
                'message' => 'Task members updated successfully',
                'data' => $taskResponse
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function update(Request $request, $task_id)
    {
        try {
            $task = Task::find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_name' => 'required|max:255',
                'task_description' => 'nullable|string',
                'task_priority' => 'required|in:0,1,2',
                'task_status' => 'required|in:0,1,2',
                'task_start_date' => 'required',
                'task_end_date' => 'required',
                'task_date_update_status_completed' => 'nullable',
                'members' => 'required|array',
                'members.*' => 'exists:users,id',
            ]);
            $task->update($validatedData);
            TaskMember::where('task_id', $task_id)->delete();
            $membersData = [];
            foreach ($request->members as $user_id) {
                $membersData[] = [
                    'task_id' => $task_id,
                    'user_id' => $user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            TaskMember::insert($membersData);
            return response()->json([
                'error' => false,
                'message' => 'Task updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }


    public function delete(Request $request, $task_id)
    {
        try {
            $task = Task::find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $project = Project::find($task->project_id);
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }

            // Delete related task members
            TaskMember::where('task_id', $task_id)->delete();
            // Delete the notification
            Notification::where('task_id', $task_id)->delete();

            $messageTask = MessageTask::where('task_id', $task_id);
            $messageIds = $messageTask->pluck('message_id');
            $messageTask->delete();

            // Retrieve file URLs from Message table
            $fileUrls = Message::whereIn('message_id', $messageIds)->pluck('file_url');
            $imageUrls = Message::whereIn('message_id', $messageIds)->pluck('image_url');
            foreach ($imageUrls as $imageUrl) {
                // Remove the leading slash if present
                $array = explode('/', $imageUrl);
                $imageUrl = array_pop($array);
                Storage::disk('public_messages')->delete($imageUrl);
            }

            // Delete files from public directory
            foreach ($fileUrls as $fileUrl) {
                // Remove the leading slash if present
                $array = explode('/', $fileUrl);
                $fileUrl = array_pop($array);
                Storage::disk('public_messages')->delete($fileUrl);
            }


            // Delete messages from Message table
            Message::whereIn('message_id', $messageIds)->delete();

            // Delete the task
            $task->delete();

            return response()->json([
                'error' => false,
                'message' => 'Task deleted successfully',
                'data' => null
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function updateName(Request $request, $task_id)
    {
        try {
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_name' => 'nullable|string|max:255',
            ]);
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $members = array_unique($members->toArray());
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $project = Project::find($task->project_id);
            $group_id = $project->group_id;
            $group = Group::find($group_id);
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            $task->update($validatedData);
            // insert comment
            $message = Message::create([
                'text' => 'Cập nhật tên công việc ',
                'message_type' => 3,
                'message_by_user_id' => $user_id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            //
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'notification_status' => 0,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => ' Đã cập nhật tên công việc: ' . $task->task_name,
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
            $notification = Notification::where('task_id', $task_id)
                ->where('create_by_user_id', $create_by_user_id)
                ->with('createByUser')
                ->latest()
                ->first();
            if (!empty($notifications)) {
                $taskName = $task->task_name;
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'taskName' => $taskName,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-name-task', $payload);
            }
//
            return response()->json([
                'error' => false,
                'message' => 'Task name updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function updateDescription(Request $request, $task_id)
    {
        try {
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_description' => 'nullable|string',
            ]);
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $members = array_unique($members->toArray());
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $project = Project::find($task->project_id);
            $group_id = $project->group_id;
            $group = Group::find($group_id);
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            $task->update($validatedData);
            // insert comment
            $message = Message::create([
                'text' => 'Cập nhật mô tả công việc công việc ',
                'message_type' => 3,
                'message_by_user_id' => $user_id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            //
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'notification_status' => 0,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => ' Đã cập nhật mô tả công việc: ' . $task->task_name,
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
            $notification = Notification::where('task_id', $task_id)
                ->where('create_by_user_id', $create_by_user_id)
                ->with('createByUser')
                ->latest()
                ->first();
            if (!empty($notifications)) {
                $taskName = $task->task_name;
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'taskName' => $taskName,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-description-task', $payload);
            }
//
            return response()->json([
                'error' => false,
                'message' => 'Task description updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function updateStatus(Request $request, $task_id)
    {
        try {
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_status' => 'required|in:0,1,2,3,4',
            ]);

            if ($validatedData['task_status'] == 2) {
                $validatedData['task_date_update_status_completed'] = now();
            }
            if ($validatedData['task_status'] == 3) {
                $user_id = auth()->user()->id;
                $role_id = auth()->user()->role_id;
                $project = Project::find($task->project_id);
                if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2) {
                    return response()->json([
                        'error' => true,
                        'message' => 'Bạn không có quyền thực hiện hành động này',
                        'data' => $role_id
                    ], 403);
                }
            }
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $members = array_unique($members->toArray());
            $oldStatus = $task->task_status;
            $task->update($validatedData);

            //
            $status = $request->input('task_status');
            $statusMessage = '';

            if ($status == 0) {
                $statusMessage = 'Đang chờ';
            } elseif ($status == 1) {
                $statusMessage = 'Đang làm';
            } elseif ($status == 2) {
                $statusMessage = 'Hoàn thành';
            } elseif ($status == 3) {
                $statusMessage = 'Leader đã xác nhận';
            } elseif ($status == 4) {
                $statusMessage = 'Tạm dừng';
            }
            $oldStatusMessage = '';
            if ($oldStatus == 0) {
                $oldStatusMessage = 'Đang chờ';
            } elseif ($oldStatus == 1) {
                $oldStatusMessage = 'Đang làm';
            } elseif ($oldStatus == 2) {
                $oldStatusMessage = 'Hoàn thành';
            } elseif ($oldStatus == 3) {
                $oldStatusMessage = 'Leader đã xác nhận';
            } elseif ($oldStatus == 4) {
                $oldStatusMessage = 'Tạm dừng';
            }
            // insert comment
            $status = $request->input('task_status');
            $message = Message::create([
                'text' => 'Cập nhật trạng thái công việc ' . $task->task_name . ' (' . $oldStatusMessage . ') ' . 'thành' . ' (' . $statusMessage . ')',
                'message_type' => 3,
                'message_by_user_id' => auth()->user()->id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => ' Đã cập nhật tên công việc: ' . $task->task_name . '(' . $statusMessage . ')',
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
            $notification = Notification::where('task_id', $task_id)
                ->where('create_by_user_id', $create_by_user_id)
                ->with('createByUser')
                ->latest()
                ->first();
            if (!empty($notifications)) {
                $taskName = $task->task_name;
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'statusMessage' => $statusMessage,
                    'createByUserName' => $createByUserName,
                    'taskName' => $taskName,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-status-task', $payload);
            }


            //
            return response()->json([
                'error' => false,
                'message' => 'Task status updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function updateStartDate(Request $request, $task_id)
    {
        try {
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_start_date' => 'required',
            ]);
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $members = array_unique($members->toArray());
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $project = Project::find($task->project_id);
            $group_id = $project->group_id;
            $group = Group::find($group_id);
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            $task->update($validatedData);
            // insert comment
            $message = Message::create([
                'text' => 'Cập nhật ngày bắt đầu công việc',
                'message_type' => 3,
                'message_by_user_id' => auth()->user()->id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            //
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => ' Đã cập nhật ngày bắt đầu công việc: ' . $task->task_name,
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
            $notification = Notification::where('task_id', $task_id)
                ->where('create_by_user_id', $create_by_user_id)
                ->with('createByUser')
                ->latest()
                ->first();
            if (!empty($notifications)) {
                $taskName = $task->task_name;
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'taskName' => $taskName,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-start-date-task', $payload);
            }

            //
            return response()->json([
                'error' => false,
                'message' => 'Task start date updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function updateEndDate(Request $request, $task_id)
    {
        try {
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_end_date' => 'required',
            ]);
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $members = array_unique($members->toArray());
            $user_id = auth()->user()->id;
            $role_id = auth()->user()->role_id;
            $project = Project::find($task->project_id);
            $group_id = $project->group_id;
            $group = Group::find($group_id);
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            $task->update($validatedData);
            // insert comment
            $message = Message::create([
                'text' => 'Cập nhật ngày kết thúc công việc',
                'message_type' => 3,
                'message_by_user_id' => auth()->user()->id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            //
            $pathname = $request->input('pathname');
            $createByUserName = auth()->user()->name;
            $create_by_user_id = auth()->user()->id;
            $notifications = [];
            foreach ($members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'create_by_user_id' => $create_by_user_id,
                        'notification_title' => ' Đã cập nhật ngày kết thúc công việc: ' . $task->task_name,
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
            $notification = Notification::where('task_id', $task_id)
                ->where('create_by_user_id', $create_by_user_id)
                ->with('createByUser')
                ->latest()
                ->first();
            if (!empty($notifications)) {
                $taskName = $task->task_name;
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'taskName' => $taskName,
                    'notification' => $notification,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-end-date-task', $payload);
            }
            //
            return response()->json([
                'error' => false,
                'message' => 'Task end date updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function updatePriority(Request $request, $task_id)
    {
        try {
            $task = Task::with('users')->find($task_id);
            if (!$task) {
                return response()->json([
                    'error' => true,
                    'message' => 'Task not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'task_priority' => 'required|in:0,1,2',
            ]);
            $task->update($validatedData);
            return response()->json([
                'error' => false,
                'message' => 'Task priority updated successfully',
                'data' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function getTaskUnfinishedByUserId(Request $request)
    {
        try {
            $user_id = auth()->user()->id;

            // Fetch tasks
            $tasks = Task::whereHas('users', function ($query) use ($user_id) {
                $query->where('users.id', $user_id);
            })
                ->with([
                    'users' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    },
                    'project' => function ($query) {
                        $query->select('work_projects.project_id', 'work_projects.project_name'); // Adjust the fields as needed
                    }
                ])
                ->where('task_status', '!=', 3)
                ->orderBy('project_id')
                ->get();
            return response()->json([
                'error' => false,
                'message' => 'Tasks found',
                'data' => [
                    'tasks' => $tasks,
                ]
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
