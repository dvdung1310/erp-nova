<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\CrmEmployeeModel;
use App\Models\Group;
use App\Models\MessageTask;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GroupController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function getAllGroupParent()
    {
        try {
            $groups = Group::whereNull('parent_group_id')->get();
            return response([
                'message' => 'Groups fetched successfully',
                'data' => $groups,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response([
                'data' => null,
                'message' => $e->getMessage(),
                'error' => true
            ], 400);
        }
    }

    public function create(Request $request)
    {
        try {
            $group = Group::firstOrNew([
                'parent_group_id' => $request->parent_group_id,
                'group_name' => $request->group_name,
            ]);
            if ($group->exists) {
                return response([
                    'message' => 'Group already exists',
                    'data' => null,
                    'error' => true
                ], 400);
            }
            $group->parent_group_id = isset($request->parent_group_id) ? $request->parent_group_id : null;
            $group->department_id = $request->department_id ?? null;
            $group->group_description = $request->group_description ?? '';
            $group->color = $request->color ?? '';
            $group->leader_id = $request->leader_id ?? null;
            $user_id = auth()->user()->id;
            $user_role = auth()->user()->role_id;

            $parent_group_id = $request->parent_group_id;
            $leaderIds = $this->getAllLeaderIds($parent_group_id);
            if (isset($parent_group_id)) {
                if ((string)$user_role == '1' || (string)$user_role == '2' || (string)$user_role == '3' || (string)$user_role == '4') {
                    $group->save();
                    $group_id = $group->group_id;
                    $dataResponse = Group::where('group_id', $group_id)
                        ->with('leader') // Assuming there is a relationship defined in the Group.js model
                        ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                        ->first();


                    return response([
                        'message' => 'Group created successfully',
                        'data' => $dataResponse,
                        'error' => false
                    ], 200);
                }
                if (!in_array($user_id, $leaderIds)) {
                    return response([
                        'message' => 'Bạn không có quyền thực hiện hành động này!',
                        'data' => null,
                        'error' => true
                    ], 400);

                }
            }
            $group->save();
            $group_id = $group->group_id;
            $dataResponse = Group::where('group_id', $group_id)
                ->with('leader') // Assuming there is a relationship defined in the Group.js model
                ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                ->first();


            return response([
                'message' => 'Group created successfully',
                'data' => $dataResponse,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response([
                'data' => null,
                'message' => $e->getMessage(),
                'error' => true
            ], 400);
        }
    }

    private function getAllLeaderIds($parent_group_id = null): array
    {
        $groups = Group::where('group_id', $parent_group_id)->get();
        $leaderIds = [];

        foreach ($groups as $group) {
            if ($group->leader_id) {
                $leaderIds[] = $group->leader_id;
            }
            if ($group->parent_group_id) {
                $leaderIds = array_merge($leaderIds, $this->getAllLeaderIds($group->parent_group_id));
                $leaderIds = array_unique($leaderIds);
                $leaderIds = array_values($leaderIds);
            }
        }
        return $leaderIds;
    }

    public function getGroupByParentGroupId(Request $request, $parent_group_id)
    {
        try {
            $groups = Group::where('parent_group_id', $parent_group_id)
                ->with('leader') // Assuming there is a relationship defined in the Group.js model
                ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                ->get();
            $project = Project::where('group_id', $parent_group_id)
                ->with(['projectMembers.user', 'leader'])
                ->withCount(['tasks as total_tasks', 'tasks as completed_tasks' => function ($query) {
                    $query->where('task_status', 2);
                }])
                ->get();
            $currentGroup = Group::where('group_id', $parent_group_id)->first();
            return response([
                'data' => [
                    'groups' => $groups,
                    'projects' => $project,
                    'currentGroup' => $currentGroup
                ],
                'error' => false,
                'message' => 'Groups fetched successfully'
            ], 200);
        } catch (\Exception $e) {
            return response([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }
    }

    public function delete(Request $request, $group_id)
    {
        try {
            $group = Group::find($group_id);

            if (!$group) {
                return response([
                    'message' => 'Group not found',
                    'data' => null,
                    'error' => true
                ], 404);
            }
            //
            $parent_group_id = $group->parent_group_id;
            $user_id = auth()->user()->id;
            $user_role = auth()->user()->role_id;
            $leaderIds = $this->getAllLeaderIds($parent_group_id);
            $leaderIds[] = $group->leader_id;
            if (isset($parent_group_id)) {
                if ($user_role == 1) {
                    // Recursive function to delete all child groups
                    $this->deleteChildGroups($group_id);
                    // Delete associated task members first
                    $projects = Project::where('group_id', $group_id)->get();
                    foreach ($projects as $project) {
                        $tasks = $project->tasks()->get();
                        foreach ($tasks as $task) {
                            $task->taskMembers()->delete();
                            Notification::where('task_id', $task->task_id)->delete();
                        }
                        // delete notifications
                        Notification::where('project_id', $project->project_id)->delete();
                        $project->tasks()->delete();
                    }

                    // Delete associated project members
                    foreach ($projects as $project) {
                        $project->projectMembers()->delete();
                    }

                    // Delete associated projects
                    Project::where('group_id', $group_id)->delete();

                    // Delete the group
                    $group->delete();


                    return response([
                        'message' => 'Group deleted successfully',
                        'data' => null,
                        'error' => false
                    ], 200);
                }
                if (!in_array($user_id, $leaderIds)) {
                    return response([
                        'message' => 'Bạn không có quyền thực hiện hành động này!',
                        'data' => null,
                        'error' => true
                    ], 400);

                }
            }

            // Recursive function to delete all child groups
            $this->deleteChildGroups($group_id);
            // Delete associated task members first
            $projects = Project::where('group_id', $group_id)->get();
            foreach ($projects as $project) {
                $tasks = $project->tasks()->get();
                foreach ($tasks as $task) {
                    $task->taskMembers()->delete();
                    Notification::where('task_id', $task->task_id)->delete();
                    MessageTask::where('task_id', $task['task_id'])->delete();
                    $task->delete();
                }
                // delete notifications
                Notification::where('project_id', $project->project_id)->delete();
                $project->tasks()->delete();
            }

            // Delete associated project members
            foreach ($projects as $project) {
                $project->projectMembers()->delete();
            }

            // Delete associated projects
            Project::where('group_id', $group_id)->delete();

            // Delete the group
            $group->delete();


            return response([
                'message' => 'Group.js deleted successfully',
                'data' => null,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }
    }

    private function deleteChildGroups($group_id)
    {
        $childGroups = Group::where('parent_group_id', $group_id)->get()->toArray();

        if (empty($childGroups)) {
            return;
        }

        foreach ($childGroups as $childGroup) {
            $this->deleteChildGroups($childGroup['group_id']); // Recursively delete child groups

            // Delete associated projects and their related data
            $projects = Project::where('group_id', $childGroup['group_id'])->get()->toArray();
            foreach ($projects as $project) {
                $tasks = Project::find($project['project_id'])->tasks()->get()->toArray();
                foreach ($tasks as $task) {
                    Task::find($task['task_id'])->taskMembers()->delete();
                    Notification::where('task_id', $task['task_id'])->delete();
                    MessageTask::where('task_id', $task['task_id'])->delete();
                    $task->delete();
                }
                Project::find($project['project_id'])->tasks()->delete();
                Notification::where('project_id', $project['project_id'])->delete();
                Project::find($project['project_id'])->projectMembers()->delete();
            }
            Project::where('group_id', $childGroup['group_id'])->delete();

            Group::find($childGroup['group_id'])->delete();
        }
    }

    public function update(Request $request, $group_id)
    {
        try {
            $group = Group::find($group_id);
            if (!$group) {
                return response([
                    'message' => 'Group not found',
                    'data' => null,
                    'error' => true
                ], 404);
            }
            $group->group_name = $request->group_name ?? $group->group_name;
            $group->department_id = $request->department_id ?? $group->department_id;
            $group->group_description = $request->group_description ?? $group->group_description;
            $group->color = $request->color ?? $group->color;
            $group->leader_id = $request->leader_id ?? $group->leader_id;
            $leader_id = $group->leader_id;
            //

            $parent_group_id = $group->parent_group_id;
            $user_id = auth()->user()->id;
            $user_role = auth()->user()->role_id;
            $leaderIds = $this->getAllLeaderIds($parent_group_id);
            $leaderIds[] = $group->leader_id;
            if (isset($parent_group_id)) {
                if ($user_role == 1 || $user_role == 2) {
                    $group->save();
                    if (!$group->parent_group_id) {
                        Http::post($this->nodeUrl . '/change-group');
                    }
                    $dataResponse = Group::where('group_id', $group_id)
                        ->with('leader') // Assuming there is a relationship defined in the Group.js model
                        ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                        ->first();
                    return response([
                        'message' => 'Group created successfully',
                        'data' => $dataResponse,
                        'error' => false
                    ], 200);
                }
                if (!in_array($user_id, $leaderIds)) {
                    return response([
                        'message' => 'Bạn không có quyền thực hiện hành động này!',
                        'data' => null,
                        'error' => true
                    ], 400);

                }
            }
            //
            $group->save();
            if (!$group->parent_group_id) {
                Http::post($this->nodeUrl . '/change-group');
            }
            $dataResponse = Group::where('group_id', $group_id)
                ->with('leader') // Assuming there is a relationship defined in the Group.js model
                ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                ->first();
            return response([
                'message' => 'Group updated successfully',
                'data' => $dataResponse,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }

    }

    public function getGroupByUserId(Request $request)
    {
        try {
            $user_id = auth()->user()->id;

            if ((string)auth()->user()->role_id == '1' || (string)auth()->user()->role_id == '2') {
                $groups = Group::whereNull('parent_group_id')
                    ->with('leader') // Assuming there is a relationship defined in the Group.js model
                    ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                    ->get();;
                return response([
                    'data' => $groups,
                    'error' => false,
                    'message' => 'Groups fetched successfully'
                ], 200);
            } else {
                $groups = Group::whereNull('parent_group_id')
                    ->with('leader') // Assuming there is a relationship defined in the Group.js model
                    ->select('group_id', 'group_name', 'color', 'leader_id', 'group_description')
                    ->get();
                $filteredGroups = $this->filterGroupsWithUser($groups, $user_id);
                $dataResponse = [];

                foreach ($filteredGroups as $group) {
                    $dataResponse[] = [
                        'group_id' => $group->group_id,
                        'group_name' => $group->group_name,
                        'group_description' => $group->group_description,
                        'parent_group_id' => $group->parent_group_id,
                        'color' => $group->color,
                        'leader' => $group->leader,
                        'created_at' => $group->created_at,
                        'updated_at' => $group->updated_at,
                    ];
                }

// Remove duplicate elements based on 'group_id'
                $dataResponse = array_map("unserialize", array_unique(array_map("serialize", $dataResponse)));
                $dataResponse = array_values($dataResponse);
                return response([
                    'data' => $dataResponse,
                    'error' => false,
                    'message' => 'Groups fetched successfully'
                ], 200);

            }

        } catch (\Exception $e) {
            return response([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }
    }

    private function filterGroupsWithUser($groups, $user_id)
    {
        $filteredGroups = [];

        foreach ($groups as $group) {
            if ($group->leader_id == $user_id) {
                $filteredGroups[] = $group;
            }
            if ($this->hasUserInProjects($group, $user_id)) {
                $filteredGroups[] = $group;
            }

            if ($group->children) {
                $childGroups = $this->filterGroupsWithUser($group->children, $user_id);
                if (!empty($childGroups)) {
                    $group->children = $childGroups;
                    $filteredGroups[] = $group;
                }
            }
        }

        return $filteredGroups;
    }

    private function hasUserInProjects($group, $user_id)
    {
        foreach ($group->projects as $project) {
            if ($project->projectMembers->contains('user_id', $user_id)) {
                return true;
            }

            foreach ($project->tasks as $task) {
                if ($task->taskMembers->contains('user_id', $user_id)) {
                    return true;
                }
            }

        }

        return false;
    }

    public function getAllProjectsAndTasksInGroups(): JsonResponse
    {
        try {
            $groups = Group::whereNull('parent_group_id')
                ->with('leader')
                ->get();
            $allGroupsProjectsAndTasks = [];

            foreach ($groups as $group) {
                $groupData = [
                    'group_id' => $group->group_id,
                    'group_name' => $group->group_name,
                    'color' => $group->color,
                    'leader' => $group->leader,
                    'taskDeadlineWeek' => [],
                    'total_projects' => 0,
                    'total_tasks' => 0,
                    'total_completed_tasks' => 0,
                    'total_doing_tasks' => 0,
                    'total_waiting_tasks' => 0,
                    'total_overdue_tasks' => 0,
                    'taskOverdueWeek' => []
                ];
                $this->getProjectsAndTasksFromGroup($group, $groupData['total_projects'], $groupData['total_tasks'], $groupData['total_completed_tasks'], $groupData['total_doing_tasks'], $groupData['total_waiting_tasks'], $groupData['total_overdue_tasks'], $groupData['taskDeadlineWeek'], $groupData['taskOverdueWeek']);
                $allGroupsProjectsAndTasks[] = $groupData;
            }

            return response()->json([
                'error' => false,
                'message' => 'Groups, projects, and tasks fetched successfully',
                'data' => $allGroupsProjectsAndTasks
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    private function getProjectsAndTasksFromGroup($group, &$totalProjects, &$totalTasks, &$totalCompletedTasks, &$totalDoingTasks, &$totalWaitingTasks, &$TotalOverdueTasks, &$taskDeadlineWeek = [], &$taskOverdueWeek = [])
    {
        $projects = Project::where('group_id', $group->group_id)
            ->with(['tasks'])
            ->get();

        foreach ($projects as $project) {
            $tasks = $project->tasks;
            $completedTasks = 0;
            $doingTasks = 0;
            $waitingTasks = 0;
            $overdueTasks = 0;
            $taskDeadline = [];
            $taskOverdue = [];

            foreach ($tasks as $task) {
                if (in_array($task->task_status, [2, 3])) {
                    $completedTasks++;
                } elseif ($task->task_status == 1) {
                    $doingTasks++;
                    if ($task->task_end_date > now()->startOfWeek()) {
                        $taskDeadline[] = $task;
                    }
                } elseif ($task->task_status == 0) {
                    $waitingTasks++;
                }

                if ($task->task_end_date < now() && !in_array($task->task_status, [3, 4]) && $task->task_date_update_status_completed === null) {
                    $overdueTasks++;
                    $taskOverdue[] = $task;
                }
            }

            $totalProjects++;
            $totalTasks += $tasks->count();
            $totalCompletedTasks += $completedTasks;
            $totalDoingTasks += $doingTasks;
            $totalWaitingTasks += $waitingTasks;
            $TotalOverdueTasks += $overdueTasks;
            $taskDeadlineWeek = array_merge($taskDeadlineWeek, $taskDeadline);
            $taskOverdueWeek = array_merge($taskOverdueWeek, $taskOverdue);
        }

        $childGroups = Group::where('parent_group_id', $group->group_id)->get();
        foreach ($childGroups as $childGroup) {
            $this->getProjectsAndTasksFromGroup($childGroup, $totalProjects, $totalTasks, $totalCompletedTasks, $totalDoingTasks, $totalWaitingTasks, $TotalOverdueTasks, $taskDeadlineWeek, $taskOverdueWeek);
        }
    }

    private function getReportFromGroup($group, &$totalProjects, &$totalTasks, &$totalCompletedTasks, &$totalDoingTasks,
                                        &$totalWaitingTasks, &$TotalOverdueTasks, &$listProjects = [], &$listTasks = [],
                                        &$listCompletedTasks = [], &$listDoingTasks = [], &$listWaitingTasks = [],
                                        &$listOverdueTasks = [])
    {
        $projects = Project::where('group_id', $group->group_id)
            ->with(['projectMembers.user', 'leader'])
            ->with(['tasks'])
            ->withCount(['tasks as total_tasks', 'tasks as completed_tasks' => function ($query) {
                $query->where('task_status', 2);
            }])
            ->get();

        foreach ($projects as $project) {
            $tasks = $project->tasks;
            $completedTasks = 0;
            $doingTasks = 0;
            $waitingTasks = 0;
            $overdueTasks = 0;

            foreach ($tasks as $task) {
                if (in_array($task->task_status, [2, 3])) {
                    $completedTasks++;
                    $listCompletedTasks[] = $task;
                } elseif ($task->task_status == 1) {
                    $doingTasks++;
                    $listDoingTasks[] = $task;
                } elseif ($task->task_status == 0) {
                    $waitingTasks++;
                    $listWaitingTasks[] = $task;
                }

                if ($task->task_end_date < now() && !in_array($task->task_status, [3, 4]) && $task->task_date_update_status_completed === null) {
                    $overdueTasks++;
                    $listOverdueTasks[] = $task;
                }

                $listTasks[] = $task;
            }

            $totalProjects++;
            $totalTasks += $tasks->count();
            $totalCompletedTasks += $completedTasks;
            $totalDoingTasks += $doingTasks;
            $totalWaitingTasks += $waitingTasks;
            $TotalOverdueTasks += $overdueTasks;
            $listProjects[] = $project;
        }

        $childGroups = Group::where('parent_group_id', $group->group_id)->get();
        foreach ($childGroups as $childGroup) {
            $this->getReportFromGroup($childGroup, $totalProjects, $totalTasks, $totalCompletedTasks,
                $totalDoingTasks, $totalWaitingTasks, $TotalOverdueTasks, $listProjects, $listTasks,
                $listCompletedTasks, $listDoingTasks, $listWaitingTasks, $listOverdueTasks);
        }
    }

    public function getReportsByGroupId($group_id)
    {
        try {
            $group = Group::where('group_id', $group_id)
                ->first();
            $department_id = $group->department_id;
            $employees = CrmEmployeeModel::where('department_id', $department_id)
                ->get();
            $taskByUsers = [];

            foreach ($employees as $employee) {
                $user_id = $employee->account_id;
                $user = User::find($user_id);

                $tasks = Task::join('work_task_members', 'work_tasks.task_id', '=', 'work_task_members.task_id')
                    ->where('work_task_members.user_id', $user_id)
                    ->get(['work_tasks.*']);

                $doingTasks = $tasks->where('task_status', 1); // đang làm
                $waitingTasks = $tasks->where('task_status', 0); // đang chờ
                $completedTasks = $tasks->whereIn('task_status', [2, 3]); // đã hoàn thành

                $tasksOverdueCompleted = $tasks->filter(function ($task) {
                    return $task->task_date_update_status_completed !== null &&
                        $task->task_date_update_status_completed > $task->task_end_date;
                });

                $tasksOverdueInProgress = $tasks->filter(function ($task) {
                    return $task->task_date_update_status_completed === null &&
                        $task->task_end_date < now();
                });

                $taskByUsers[] = [
                    'user' => $user,
                    'total_tasks' => $tasks->count(),
                    'total_doing_tasks' => $doingTasks->count(),
                    'total_waiting_tasks' => $waitingTasks->count(),
                    'total_completed_tasks' => $completedTasks->count(),
                    'totalTasksOverdueCompleted' => $tasksOverdueCompleted->count(),
                    'totalTasksOverdueInProgress' => $tasksOverdueInProgress->count(),
                ];
            }
            $groupData = [
                'group_id' => $group->group_id,
                'group_name' => $group->group_name,
                'color' => $group->color,
                'leader' => $group->leader,
                'total_projects' => 0,
                'list_projects' => [],
                'total_tasks' => 0,
                'list_tasks' => [],
                'total_completed_tasks' => 0,
                'list_completed_tasks' => [],
                'total_doing_tasks' => 0,
                'list_doing_tasks' => [],
                'total_waiting_tasks' => 0,
                'list_waiting_tasks' => [],
                'total_overdue_tasks' => 0,
                'list_overdue_tasks' => [],
                'taskByUsers' => $taskByUsers
            ];
            $this->getReportFromGroup($group, $groupData['total_projects'], $groupData['total_tasks'],
                $groupData['total_completed_tasks'], $groupData['total_doing_tasks'],
                $groupData['total_waiting_tasks'], $groupData['total_overdue_tasks'],
                $groupData['list_projects'], $groupData['list_tasks'],
                $groupData['list_completed_tasks'], $groupData['list_doing_tasks'], $groupData['list_waiting_tasks'],
                $groupData['list_overdue_tasks']);

            return response()->json([
                'error' => false,
                'message' => 'Group fetched successfully',
                'data' => $groupData
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
