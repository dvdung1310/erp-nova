<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
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
                    'message' => 'Group.js already exists',
                    'data' => null,
                    'error' => true
                ], 400);
            }
            $group->parent_group_id = isset($request->parent_group_id) ? $request->parent_group_id : null;
            $group->group_description = $request->group_description ?? '';
            $group->color = $request->color ?? '';
            $group->leader_id = $request->leader_id ?? null;
            $user_id = auth()->user()->id;
            $user_role = auth()->user()->role_id;

            $parent_group_id = $request->parent_group_id;
            $leaderIds = $this->getAllLeaderIds($parent_group_id);
            $groupResponse = $group->where('group_name', $request->group_name)->first();
            if (isset($parent_group_id)) {
                if ((string)$user_role == '1' || (string)$user_role == '2' || (string)$user_role == '3' || (string)$user_role == '4') {
                    $group->save();
                    $group_id = $group->group_id;
                    $dataResponse = Group::where('group_id', $group_id)
                        ->with('leader') // Assuming there is a relationship defined in the Group.js model
                        ->select('group_id', 'group_name', 'color', 'leader_id')
                        ->first();
                    if (!$group->parent_group_id) {
                        Http::post($this->nodeUrl . '/change-group');
                    }

                    return response([
                        'message' => 'Group.js created successfully',
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
                ->select('group_id', 'group_name', 'color', 'leader_id')
                ->first();
            if (!$group->parent_group_id) {
                Http::post($this->nodeUrl . '/change-group');
            }

            return response([
                'message' => 'Group.js created successfully',
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
                ->select('group_id', 'group_name', 'color', 'leader_id')
                ->get();
            $project = Project::where('group_id', $parent_group_id)
                ->with(['projectMembers.user'])
                ->withCount(['tasks as total_tasks', 'tasks as completed_tasks' => function ($query) {
                    $query->where('task_status', 2);
                }])
                ->get();
            return response([
                'data' => [
                    'groups' => $groups,
                    'projects' => $project
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
                    'message' => 'Group.js not found',
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
                    if (!$group->parent_group_id) {
                        Http::post($this->nodeUrl . '/change-group');
                    }

                    return response([
                        'message' => 'Group.js deleted successfully',
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
            if (!$group->parent_group_id) {
                Http::post($this->nodeUrl . '/change-group');
            }

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
                    'message' => 'Group.js not found',
                    'data' => null,
                    'error' => true
                ], 404);
            }
            $group->group_name = $request->group_name ?? $group->group_name;
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
                if ($user_role == 1) {
                    $group->save();
                    if (!$group->parent_group_id) {
                        Http::post($this->nodeUrl . '/change-group');
                    }
                    $dataResponse = Group::where('group_id', $group_id)
                        ->with('leader') // Assuming there is a relationship defined in the Group.js model
                        ->select('group_id', 'group_name', 'color', 'leader_id')
                        ->first();
                    return response([
                        'message' => 'Group.js created successfully',
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
                ->select('group_id', 'group_name', 'color', 'leader_id')
                ->first();
            return response([
                'message' => 'Group.js updated successfully',
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
                    ->select('group_id', 'group_name', 'color', 'leader_id')
                    ->get();;
                return response([
                    'data' => $groups,
                    'error' => false,
                    'message' => 'Groups fetched successfully'
                ], 200);
            } else {
                $groups = Group::whereNull('parent_group_id')
                    ->with('leader') // Assuming there is a relationship defined in the Group.js model
                    ->select('group_id', 'group_name', 'color', 'leader_id')
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

    public function getAllProjectsAndTasksInGroups()
    {
        try {
            $groups = Group::whereNull('parent_group_id')->get();
            $allGroupsProjectsAndTasks = [];

            foreach ($groups as $group) {
                $groupData = [
                    'group_id' => $group->group_id,
                    'group_name' => $group->group_name,
                    'group_color' => $group->color,
                    'total_projects' => 0,
                    'total_tasks' => 0,
                    'total_completed_tasks' => 0,
                    'total_doing_tasks' => 0,
                    'total_waiting_tasks' => 0,
                    'overdue_tasks' => 0
                ];
                $this->getProjectsAndTasksFromGroup($group, $groupData['total_projects'], $groupData['total_tasks'], $groupData['total_completed_tasks'], $groupData['total_doing_tasks'], $groupData['total_waiting_tasks'], $groupData['overdue_tasks']);
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

    private function getProjectsAndTasksFromGroup($group, &$totalProjects, &$totalTasks, &$totalCompletedTasks, &$totalDoingTasks, &$totalWaitingTasks, &$TotalOverdueTasks)
    {
        $projects = Project::where('group_id', $group->group_id)
            ->with(['tasks'])
            ->get();

        foreach ($projects as $project) {
            $tasks = $project->tasks;
            $completedTasks = $tasks->where('task_status', '2')->count();
            $doingTasks = $tasks->where('task_status', '1')->count();
            $waitingTasks = $tasks->where('task_status', '0')->count();
            $overdueTasks = $tasks->where('task_end_date', '<', now())
                ->where('task_status', '!=', '2')
                ->count();
            $totalProjects++;
            $totalTasks += $tasks->count();
            $totalCompletedTasks += $completedTasks;
            $totalDoingTasks += $doingTasks;
            $totalWaitingTasks += $waitingTasks;
            $TotalOverdueTasks += $overdueTasks;
        }

        $childGroups = Group::where('parent_group_id', $group->group_id)->get();
        foreach ($childGroups as $childGroup) {
            $this->getProjectsAndTasksFromGroup($childGroup, $totalProjects, $totalTasks, $totalCompletedTasks, $totalDoingTasks, $totalWaitingTasks, $TotalOverdueTasks);
        }
    }


}
