<?php

namespace App\Http\Controllers;

use App\Mail\InviteUserMail;
use App\Models\Devices;
use App\Models\Message;
use App\Models\MessageTask;
use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\TaskMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    protected $nodeUrl;
    protected $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function create(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'project_name' => 'required|max:255',
                'project_description' => 'nullable|string',
                'group_id' => 'required',
                'pathname' => 'nullable|string',
                'project_start_date' => 'required',
                'project_end_date' => 'required',
            ]);
            $create_by_user_id = auth()->guard('api')->user()->id;
            $project = Project::create(array_merge($validatedData, ['create_by_user_id' => $create_by_user_id]));
            return response()->json([
                'error' => false,
                'message' => 'Project created successfully',
                'data' => $project
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function update(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'project_name' => 'required|max:255',
                'project_description' => 'nullable|string',
                'group_id' => 'required',
                'project_start_date' => 'required',
                'project_end_date' => 'required',
                'members' => 'required|array',
            ]);
            ProjectMember::where('project_id', $project_id)->delete();
            $membersData = [];
            foreach ($request->members as $user_id) {
                $membersData[] = [
                    'project_id' => $project_id,
                    'user_id' => $user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            ProjectMember::insert($membersData);
            $project->update($validatedData);
            $projectResponse = Project::with('projectMembers.user')->find($project_id);

            // Send notification to all members
            $pathname = $request->input('pathname');
            $createByUserName = auth()->guard('api')->user()->name;
            $create_by_user_id = auth()->guard('api')->user()->id;
            $notifications = [];
            foreach ($request->members as $user_id) {
                if ($user_id != $create_by_user_id) {
                    $notifications[] = [
                        'user_id' => $user_id,
                        'project_id' => $project->project_id,
                        'notification_title' => $createByUserName . 'Đã cập nhật dự án: ' . $project->project_name,
                        'notification_link' => $this->ClientUrl . $pathname,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            Notification::insert($notifications);
            $devices = Devices::whereIn('user_id', $request->members)
                ->where('user_id', '!=', $create_by_user_id)
                ->get();
            $devices = $devices->map(function ($device) {
                return json_decode($device->endpoint, true);
            })->filter()->values()->toArray();
            $projectName = $project->project_name;
            if (!empty($notifications)) {
                $payload = [
                    'members' => $request->members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'projectName' => $projectName,
                    'notification' => $notifications[0],
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-project', $payload);
            }
            //
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $request->all()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function updateNameAndDescription(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'project_name' => 'required|max:255',
                'project_description' => 'nullable|string',
            ]);
            $project->update($validatedData);
            $projectResponse = Project::with('projectMembers.user')->find($project_id);
            // Send notification to all members
            $pathname = $request->input('pathname');
            $pathname = $pathname ? $pathname : '/groups/' . $project->group_id;
            $createByUserName = auth()->guard('api')->user()->name;
            $create_by_user_id = auth()->guard('api')->user()->id;
            $notifications = [];
            $members = ProjectMember::where('project_id', $project_id)->pluck('user_id')->toArray();
            if (!empty($members)) {
                foreach ($members as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'project_id' => $project->project_id,
                            'notification_title' => $createByUserName . ' Đã cập nhật tên dự án: ' . $project->project_name,
                            'notification_link' => $this->ClientUrl . $pathname,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }

            Notification::insert($notifications);
            $devices = Devices::whereIn('user_id', $members)
                ->where('user_id', '!=', $create_by_user_id)
                ->get();
            $devices = $devices->map(function ($device) {
                return json_decode($device->endpoint, true);
            })->filter()->values()->toArray();
            $projectName = $project->project_name;
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'projectName' => $projectName,
                    'notification' => $notifications[0],
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-name-project', $payload);
            }
            //
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $projectResponse
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function updateStatus(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'project_status' => 'required',
            ]);
            $project->update($validatedData);
            $projectResponse = Project::with('projectMembers.user')->find($project_id);
            // Send notification to all members
            $pathname = $request->input('pathname');
            $pathname = $pathname ? $pathname : '/groups/' . $project->group_id;
            $createByUserName = auth()->guard('api')->user()->name;
            $create_by_user_id = auth()->guard('api')->user()->id;
            $notifications = [];
            $members = ProjectMember::where('project_id', $project_id)->pluck('user_id')->toArray();
            if (!empty($members)) {
                foreach ($members as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'project_id' => $project->project_id,
                            'notification_title' => $createByUserName . ' Đã cập nhật trạng thái của dự án: ' . $project->project_name,
                            'notification_link' => $this->ClientUrl . $pathname,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }

            Notification::insert($notifications);
            $devices = Devices::whereIn('user_id', $members)
                ->where('user_id', '!=', $create_by_user_id)
                ->get();
            $devices = $devices->map(function ($device) {
                return json_decode($device->endpoint, true);
            })->filter()->values()->toArray();
            $projectName = $project->project_name;
            $status = $request->project_status;
            $statusMessage = '';

            if ($status == 0) {
                $statusMessage = 'Đang chờ';
            } elseif ($status == 1) {
                $statusMessage = 'Đang làm';
            } elseif ($status == 2) {
                $statusMessage = 'Hoàn thành';
            }
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'projectName' => $projectName,
                    'notification' => $notifications[0],
                    'statusMessage' => $statusMessage,
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-status-project', $payload);
            }
            //
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $projectResponse
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function updateMembers(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'members' => 'required|array',
            ]);
            $members = $request->members;
            $projectMembers = ProjectMember::where('project_id', $project_id)->pluck('user_id')->toArray();
            $membersToAdd = array_values(array_diff($members, $projectMembers));
            $membersToRemove = array_values(array_diff($projectMembers, $members));
            ProjectMember::where('project_id', $project_id)->delete();
            $membersData = [];
            foreach ($members as $user_id) {
                $membersData[] = [
                    'project_id' => $project_id,
                    'user_id' => $user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            ProjectMember::insert($membersData);
            $projectResponse = Project::with('projectMembers.user')->find($project_id);
            // Send notification to all members
            $pathname = $request->input('pathname');
            $pathname = $pathname ? $pathname : '/groups/' . $project->group_id;
            $createByUserName = auth()->guard('api')->user()->name;
            $create_by_user_id = auth()->guard('api')->user()->id;
            $notifications = [];

            if (!empty($membersToRemove)) {
                foreach ($membersToRemove as $user_id) {
                    TaskMember::where('user_id', $user_id)->delete();
                }
            }

            if (!empty($membersToAdd)) {
                foreach ($membersToAdd as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'project_id' => $project_id,
                            'notification_title' => $createByUserName . ' Đã thêm bạn vào dự án ' . $project->project_name,
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
                            'project_id' => $project_id,
                            'notification_title' => $createByUserName . ' Đã xóa bạn khỏi dự án ' . $project->project_name,
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

                if (!empty($notifications)) {
                    $projectName = $project->project_name;
                    $payload = [
                        'members' => $membersToAdd,
                        'devices' => $devices,
                        'createByUserName' => $createByUserName,
                        'projectName' => $projectName,
                        'notification' => $notifications[0],
                        'createByUserId' => $create_by_user_id,
                        'pathname' => $pathname,
                    ];
                    Http::post($this->nodeUrl . '/update-add-members-project', $payload);
                }
            }
            if (!empty($membersToRemove)) {
                $devices = Devices::whereIn('user_id', $membersToRemove)
                    ->where('user_id', '!=', $create_by_user_id)
                    ->get();
                $devices = $devices->map(function ($device) {
                    return json_decode($device->endpoint, true);
                })->filter()->values()->toArray();

                if (!empty($notifications)) {
                    $projectName = $project->project_name;
                    $payload = [
                        'members' => $membersToRemove,
                        'devices' => $devices,
                        'createByUserName' => $createByUserName,
                        'projectName' => $projectName,
                        'notification' => $notifications[0],
                        'createByUserId' => $create_by_user_id,
                        'pathname' => $pathname,
                    ];
                    Http::post($this->nodeUrl . '/update-remove-members-project', $payload);
                }
            }

            //
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $projectResponse
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public
    function updateStartDate(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'project_start_date' => 'required',
            ]);
            $project->update($validatedData);
            $projectResponse = Project::with('projectMembers.user')->find($project_id);
            // Send notification to all members
            $pathname = $request->input('pathname');
            $pathname = $pathname ? $pathname : '/groups/' . $project->group_id;
            $createByUserName = auth()->guard('api')->user()->name;
            $create_by_user_id = auth()->guard('api')->user()->id;
            $notifications = [];
            $members = ProjectMember::where('project_id', $project_id)->pluck('user_id')->toArray();
            if (!empty($members)) {
                foreach ($members as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'project_id' => $project->project_id,
                            'notification_title' => $createByUserName . ' Đã cập nhật ngày bắt đầu của dự án: ' . $project->project_name,
                            'notification_link' => $this->ClientUrl . $pathname,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }

            Notification::insert($notifications);
            $devices = Devices::whereIn('user_id', $members)
                ->where('user_id', '!=', $create_by_user_id)
                ->get();
            $devices = $devices->map(function ($device) {
                return json_decode($device->endpoint, true);
            })->filter()->values()->toArray();
            $projectName = $project->project_name;
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'projectName' => $projectName,
                    'notification' => $notifications[0],
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-start-date-project', $payload);
            }
            //
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $projectResponse
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public
    function updateEndDate(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validatedData = $request->validate([
                'project_end_date' => 'required',
            ]);
            $project->update($validatedData);
            $projectResponse = Project::with('projectMembers.user')->find($project_id);
            // Send notification to all members
            $pathname = $request->input('pathname');
            $pathname = $pathname ? $pathname : '/groups/' . $project->group_id;
            $createByUserName = auth()->guard('api')->user()->name;
            $create_by_user_id = auth()->guard('api')->user()->id;
            $notifications = [];
            $members = ProjectMember::where('project_id', $project_id)->pluck('user_id')->toArray();
            if (!empty($members)) {
                foreach ($members as $user_id) {
                    if ($user_id != $create_by_user_id) {
                        $notifications[] = [
                            'user_id' => $user_id,
                            'project_id' => $project->project_id,
                            'notification_title' => $createByUserName . ' Đã cập nhật ngày kết thúc của dự án: ' . $project->project_name,
                            'notification_link' => $this->ClientUrl . $pathname,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }

            Notification::insert($notifications);
            $devices = Devices::whereIn('user_id', $members)
                ->where('user_id', '!=', $create_by_user_id)
                ->get();
            $devices = $devices->map(function ($device) {
                return json_decode($device->endpoint, true);
            })->filter()->values()->toArray();
            $projectName = $project->project_name;
            if (!empty($notifications)) {
                $payload = [
                    'members' => $members,
                    'devices' => $devices,
                    'createByUserName' => $createByUserName,
                    'projectName' => $projectName,
                    'notification' => $notifications[0],
                    'createByUserId' => $create_by_user_id,
                    'pathname' => $pathname,
                ];
                Http::post($this->nodeUrl . '/update-end-date-project', $payload);
            }
            //
            return response()->json([
                'error' => false,
                'message' => 'Project updated successfully',
                'data' => $projectResponse
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public
    function delete(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }

            // Delete related task members
            $tasks = Task::where('project_id', $project_id)->get();
            foreach ($tasks as $task) {
                $task->taskMembers()->delete();
            }

// Delete related tasks
            $task_ids = Task::where('project_id', $project_id)->pluck('task_id');

// Delete related task members
            TaskMember::whereIn('task_id', $task_ids)->delete();

// Delete the notifications
            Notification::whereIn('task_id', $task_ids)->delete();

            // Delete message tasks and retrieve message IDs
            $messageIds = MessageTask::whereIn('task_id', $task_ids)->pluck('message_id');
            MessageTask::whereIn('task_id', $task_ids)->delete();

            // Retrieve file URLs from Message table
            $fileUrls = Message::whereIn('message_id', $messageIds)->pluck('file_url');
            $imageUrls = Message::whereIn('message_id', $messageIds)->pluck('image_url');
            // Delete files from public directory
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

// Delete the tasks
            Task::whereIn('task_id', $task_ids)->delete();

            // Delete the task
            $task->delete();

            // Delete related project members
            ProjectMember::where('project_id', $project_id)->delete();
            // Delete related notifications
            Notification::where('project_id', $project_id)->delete();
            // Delete the project
            $project->delete();


            return response()->json([
                'error' => false,
                'message' => 'Project deleted successfully',
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

    public
    function getAllProjects()
    {
        try {
            $projects = Project::all();
            return response()->json([
                'error' => false,
                'message' => 'Projects fetched successfully',
                'data' => $projects
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public
    function getProjectsByGroupId($group_id)
    {
        try {
            $projects = Project::where('group_id', $group_id)->get();
            return response()->json([
                'error' => false,
                'message' => 'Projects fetched successfully',
                'data' => $projects
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public
    function getProjectByUserId()
    {
        try {
            $user_id = auth()->guard('api')->user()->id;
            $projects = ProjectMember::where('user_id', $user_id)
                ->with(['project' => function ($query) {
                    $query->with(['projectMembers.user'])->orderBy('created_at');
                }])
                ->get()
                ->map(function ($projectMember) {
                    $project = $projectMember->project;
                    $project->user = $projectMember->user; // Add user information to the project
                    return $project;
                });

            return response()->json([
                'error' => false,
                'message' => 'Projects fetched successfully',
                'data' => $projects
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function memberJoinProject(Request $request, $project_id)
    {
        try {
            $project = Project::find($project_id);
            if (!$project) {
                return response()->json([
                    'error' => true,
                    'message' => 'Project not found',
                    'data' => null
                ], 404);
            }
            $validated = $request->validate([
                'email_to' => 'required|email',
                'message' => 'nullable|string',
            ]);

            $userExit = User::where('email', $validated['email_to'])->first();
            $newUser = null;
            if (!$userExit) {
                $newUser = User::create([
                    'name' => $validated['email_to'], // You can customize this
                    'email' => $validated['email_to'],
                    'password' => bcrypt('123456'), // You should generate a secure password or send a password reset link
                ]);
            }
            $user = auth()->guard('api')->user();
            $pathname = $request->input('pathname');
            $pathname = $pathname ? $pathname : '/groups/' . $project->group_id;
            $link = $this->ClientUrl . $pathname;
            // add notification
            $createByUserName = auth()->guard('api')->user()->name;
            $notifications = []; // Initialize the notifications array

            $notifications[] = [
                'user_id' => $newUser->id ?? $userExit->id,
                'project_id' => $project->project_id, // Corrected key
                'notification_title' => $createByUserName . ' đã mời bạn tham gia dự án: ' . $project->project_name,
                'notification_link' => $this->ClientUrl . $pathname,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            Notification::insert($notifications);

            // Prepare email data
            $inviteData = [
                'group_name' => $project->project_name,
                'user_name' => $user->name,
                'message' => $validated['message'],
                'link' => $link,
                'shared_at' => now(),
            ];

            // Send the email
            Mail::to($validated['email_to'])->send(new InviteUserMail($inviteData));
            return response()->json([
                'error' => false,
                'data' => $newUser,
                'message' => 'Invitation sent successfully!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }

    }

    public function getProjectByCeo()
    {
        try {

            $projects = Project::with(['projectMembers.user'])
                ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                    $query->where('task_status', 2); // Assuming 2 is the status for completed tasks
                }])
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json([
                'error' => false,
                'message' => 'Projects fetched successfully',
                'data' => $projects
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
