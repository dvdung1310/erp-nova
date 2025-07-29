<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use App\Models\Group;
use App\Models\GroupTask;
use App\Models\Message;
use App\Models\MessageTask;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskHistoryUpdate;
use App\Models\TaskMember;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
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

    public function create(Request $request): JsonResponse
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

            // if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
            //     return response()->json([
            //         'error' => true,
            //         'message' => 'Bạn không có quyền thực hiện hành động này',
            //         'data' => $role_id
            //     ], 403);
            // }
            $create_by_user_id = auth()->user()->id;
            if (!$request->group_task_id) {
                $task = Task::create(array_merge($validatedData, ['create_by_user_id' => $create_by_user_id]));
            } else {
                $task = Task::create(array_merge($validatedData, ['create_by_user_id' => $create_by_user_id, 'group_task_id' => $request->group_task_id]));
            }
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
            $project_id = $validatedData['project_id'];
            $task = Task::select('work_tasks.*', 'work_group_task.group_task_name', 'work_tasks.group_task_id')
                ->leftJoin('work_group_task', 'work_tasks.group_task_id', '=', 'work_group_task.group_task_id')
                ->where('work_tasks.project_id', $project_id)
                ->with(['users' => function ($query) {
                    $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                }])
                ->get()
                ->makeHidden('pivot')
                ->groupBy(function ($task) {
                    return $task->group_task_id ? $task->group_task_name : 'Chưa có nhóm công việc';
                })
                ->map(function ($group, $groupName) {
                    return [
                        'group_task_name' => $groupName,
                        'group_task_id' => $group->first()->group_task_id,
                        'tasks' => $group
                    ];
                })
                ->values();
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

    public function getTaskByProjectId(Request $request, $project_id): JsonResponse
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
            if ($role_id == 5 || $user_id == $leader_id) {
                $tasks = Task::select('work_tasks.*', 'work_group_task.group_task_name', 'work_tasks.group_task_id')
                    ->leftJoin('work_group_task', 'work_tasks.group_task_id', '=', 'work_group_task.group_task_id')
                    ->where('work_tasks.project_id', $project_id)
                    ->with(['users' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    }])
                    ->get()
                    ->makeHidden('pivot')
                    ->groupBy(function ($task) {
                        return $task->group_task_id ? $task->group_task_name : 'Chưa có nhóm công việc';
                    })
                    ->map(function ($group, $groupName) {
                        return [
                            'group_task_name' => $groupName,
                            'group_task_id' => $group->first()->group_task_id,
                            'tasks' => $group
                        ];
                    })
                    ->values();
            } else {
                $tasks = Task::select('work_tasks.*', 'work_group_task.group_task_name', 'work_tasks.group_task_id')
                    ->leftJoin('work_group_task', 'work_tasks.group_task_id', '=', 'work_group_task.group_task_id')
                    ->where('work_tasks.project_id', $project_id)
                    ->whereHas('users', function ($query) use ($user_id) {
                        $query->where('users.id', $user_id);
                    })
                    ->with(['users' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    }])
                    ->get()
                    ->makeHidden('pivot')
                    ->groupBy(function ($task) {
                        return $task->group_task_id ? $task->group_task_name : 'Chưa có nhóm công việc';
                    })
                    ->map(function ($group, $groupName) {
                        return [
                            'group_task_name' => $groupName,
                            'group_task_id' => $group->first()->group_task_id,
                            'tasks' => $group
                        ];
                    })
                    ->values();
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
            if (!empty($membersToAdd)) {
                $startMonth = Carbon::now()->startOfMonth();
                $endMonth = Carbon::now()->endOfMonth();
                foreach ($membersToAdd as $user_id) {
                    // check score kpi user
                    $taskByUserInMonth = Task::whereHas('users', function ($query) use ($user_id) {
                        $query->where('users.id', $user_id);
                    })
//                        ->where('task_start_date', '>=', $startMonth)
//                        ->where('task_end_date', '<=', $endMonth)
                        ->get();
                    if ($taskByUserInMonth->isEmpty()) {
                        continue;
                    }
                    $totalScoreKpi = 0;
                    foreach ($taskByUserInMonth as $taskItem) {
                        $totalScoreKpi += $taskItem->task_score_kpi;
                    }
                    $userName = User::where('id', $user_id)->first()->name;

                    if ($totalScoreKpi >= 80) {
                        return response()->json([
                            'error' => true,
                            'message' => 'Điểm kpi của ' . $userName . ' trong tháng đã vượt quá 80 điểm, còn lại ' . (80 - $totalScoreKpi) . ' điểm',
                            'data' => $totalScoreKpi
                        ], 400);
                    }
                    //
                }
            }
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

    public function update(Request $request, $task_id): JsonResponse
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

    public function delete(Request $request, $task_id): JsonResponse
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
            // if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2) {
            //     return response()->json([
            //         'error' => true,
            //         'message' => 'Bạn không có quyền thực hiện hành động này',
            //         'data' => $role_id
            //     ], 403);
            // }

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
            $old_value = $task->task_name;
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
            $new_value = $task->task_name;
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
            // insert history update
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => $user_id,
                'type' => 'name',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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
                try {
                    Http::post($this->nodeUrl . '/update-name-task', $payload);
                } catch (\Exception $e) {
                    // Log the error or handle it as needed
                    \Log::error('Failed to send request to Node.js server: ' . $e->getMessage());
                    // Optionally, you can return a response or take other actions
                }
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

    public function updateProgress(Request $request, $task_id): JsonResponse
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
                'task_progress' => 'required|numeric',
            ]);
            $old_value = $task->task_progress;
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
            $oldProgress = $task->task_progress;
            if ($validatedData['task_progress'] == 100) {
                $validatedData['task_status'] = 2;
                $validatedData['task_date_update_status_completed'] = now();
            }
            $task->update($validatedData);
            $new_value = $task->task_progress;
            // insert comment
            $message = Message::create([
                'text' => 'Cập nhật tiến độ công việc' . ' ' . $oldProgress . '% ' . '->' . ' ' . $task->task_progress . '%',
                'message_type' => 3,
                'message_by_user_id' => $user_id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            // insert history update
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => $user_id,
                'type' => 'progress',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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
                        'notification_title' => ' Đã cập nhật tiến độ công việc: ' . $task->task_name . ' ' . $oldProgress . '% ' . '->' . ' ' . $task->task_progress . '%',
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
                Http::post($this->nodeUrl . '/update-progress-task', $payload);
            }
//
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

    public function updateScoreKpi(Request $request, $task_id): JsonResponse
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
                'task_score_kpi' => 'required|numeric',
            ]);
            $old_value = $task->task_score_kpi;
            $members = $task->users->pluck('id');
            $project = Project::find($task->project_id);
            // checl role
            $group_id = $project->group_id;
            $role_id = auth()->user()->role_id;
            $group = Group::find($group_id);
            $user_id = auth()->user()->id;
            if ($project->leader_id != $user_id && $role_id != 1 && $role_id != 2 && $group->leader_id != $user_id) {
                return response()->json([
                    'error' => true,
                    'message' => 'Bạn không có quyền thực hiện hành động này',
                    'data' => $role_id
                ], 403);
            }
            // check score kpi user
            $scoreKpi = $validatedData['task_score_kpi'];
            $listUser = $task->users;
            $startMonth = Carbon::now()->startOfMonth();
            $endMonth = Carbon::now()->endOfMonth();
            foreach ($listUser as $user) {
                $taskByUserInMonth = Task::whereHas('users', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                })
//                    ->where('task_start_date', '>=', $startMonth)
//                    ->where('task_end_date', '<=', $endMonth)
                    ->get();
                if ($taskByUserInMonth->isEmpty()) {
                    continue;
                }
                $totalScoreKpi = 0;
                foreach ($taskByUserInMonth as $taskItem) {
                    $totalScoreKpi += $taskItem->task_score_kpi;
                }

                if (in_array($task_id, $taskByUserInMonth->pluck('task_id')->toArray())) {
                    $existingScore = $task ? $task->task_score_kpi : 0;
                    $newTotalScore = $totalScoreKpi - $existingScore + $scoreKpi;
                    if ($newTotalScore > 80) {
                        return response()->json([
                            'error' => true,
                            'message' => 'Điểm kpi của ' . $user->name . ' trong tháng đã vượt quá 80 điểm còn lại' . ' ' . (80 - $totalScoreKpi + $existingScore) . ' điểm',
                            'data' => $newTotalScore
                        ], 400);
                    }
                }
            }
            $leader_id = $project->leader_id;
            $members[] = $leader_id;
            $members = array_unique($members->toArray());
            $oldScoreKpi = $task->task_score_kpi;
            $task->update($validatedData);
            $new_value = $task->task_score_kpi;
            // insert comment
            $message = Message::create([
                'text' => 'Cập nhật điểm kpi công việc ' . $oldScoreKpi . ' -> ' . $task->task_score_kpi,
                'message_type' => 3,
                'message_by_user_id' => $user_id,
            ]);
            MessageTask::create([
                'message_id' => $message->message_id,
                'task_id' => $task->task_id,
            ]);
            // insert history update
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => $user_id,
                'type' => 'score_kpi',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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
                        'notification_title' => ' Đã cập nhật điểm kpi công việc: ' . $task->task_name . ' ' . $oldScoreKpi . '->' . $task->task_score_kpi,
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
                Http::post($this->nodeUrl . '/update-score-kpi-task', $payload);
            }
//
            return response()->json([
                'error' => false,
                'message' => 'Task name updated successfully',
                'data' => $task,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function updateDescription(Request $request, $task_id): JsonResponse
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
            $old_value = $task->task_description;
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
            $new_value = $task->task_description;
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
            //insert task history update
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => $user_id,
                'type' => 'description',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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

    public function updateStatus(Request $request, $task_id): JsonResponse
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
            $old_value = $task->task_status;

            if ($validatedData['task_status'] == 2 || $validatedData['task_status'] == 3) {
                $validatedData['task_progress'] = 100;
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
            $new_value = $task->task_status;

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
            // insert history update
            $user_id = auth()->user()->id;
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => $user_id,
                'type' => 'status',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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
                        'notification_title' => ' Đã cập nhật trạng thái công việc: ' . $task->task_name . '(' . $statusMessage . ')',
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

    public function updateStartDate(Request $request, $task_id): JsonResponse
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
            $old_value = $task->task_start_date;
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
            $new_value = $task->task_start_date;
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
            // insert history update
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => auth()->user()->id,
                'type' => 'start_date',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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

    public function updateEndDate(Request $request, $task_id): JsonResponse
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
            $old_value = $task->task_end_date;
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
            $new_value = $task->task_end_date;
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
            // insert history update
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => auth()->user()->id,
                'type' => 'end_date',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
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

    public function updatePriority(Request $request, $task_id): JsonResponse
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
            $old_value = $task->task_priority;
            $task->update($validatedData);
            $new_value = $task->task_priority;
            // insert history update
            $user_id = auth()->user()->id;
            TaskHistoryUpdate::create([
                'task_id' => $task_id,
                'user_id' => $user_id,
                'type' => 'priority',
                'update_time' => now(),
                'old_value' => $old_value,
                'new_value' => $new_value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

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

    public function getTaskUnfinishedByUserId(Request $request): JsonResponse
    {
        try {
            $user_id = auth()->user()->id;

            // Fetch tasks
            $tasks = Task::select('work_tasks.*', 'work_group_task.group_task_name', 'work_tasks.group_task_id')
                ->leftJoin('work_group_task', 'work_tasks.group_task_id', '=', 'work_group_task.group_task_id')
                ->whereHas('users', function ($query) use ($user_id) {
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
                ->orderBy('task_id', 'desc')
                ->get()
                ->makeHidden('pivot')
                ->groupBy(function ($task) {
                    return $task->group_task_id ? $task->group_task_name : 'Chưa có nhóm công việc';
                })
                ->map(function ($group, $groupName) {
                    return [
                        'group_task_name' => $groupName,
                        'group_task_id' => $group->first()->group_task_id,
                        'tasks' => $group
                    ];
                })
                ->values();
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

    public function createGroup(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'group_task_name' => 'required|string',
                'project_id' => 'required',
            ]);
            $groupTask = GroupTask::create($validatedData);
            return response()->json([
                'error' => false,
                'message' => 'Group created successfully',
                'data' => $groupTask
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function updateGroup(Request $request, $group_task_id): JsonResponse
    {
        try {
            $groupTask = GroupTask::find($group_task_id);
            if (!$groupTask) {
                return response()->json([
                    'error' => true,
                    'message' => 'Group not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'group_task_name' => 'required',
            ]);
            $groupTask->update($validatedData);
            return response()->json([
                'error' => false,
                'message' => 'Group updated successfully',
                'data' => $groupTask
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function getTaskInDay(): JsonResponse
    {
        try {

            $now = Carbon::now();

            $tasks = Task::where('task_start_date', '<=', $now)
                ->where('task_end_date', '>=', $now)
                ->with([
                    'users' => function ($query) {
                        $query->where('status', 1)
                            ->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    },
                    'project' => function ($query) {
                        $query->select('work_projects.project_id', 'work_projects.project_name'); // Adjust the fields as needed
                    },
                    'createByUser' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.avatar');
                    }
                ])
                ->orderBy('task_id', 'desc')
                ->get()
                ->makeHidden('pivot')
                ->filter(function ($task) {
                    return $task->users->isNotEmpty();
                })
                ->groupBy(function ($task) {
                    return $task->users->first()->id;
                })
                ->map(function ($tasks) {
                    return $tasks;
                })
                ->values()
                ->collapse();
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
