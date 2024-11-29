<?php

namespace App\Console\Commands;

use App\Models\Devices;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class CheckTasksDeadline extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:check-deadline';
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check tasks deadline';

    public function __construct()
    {
        parent::__construct();
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            $now = Carbon::now();
            $projects = Project::all();
            $this->info('Check tasks deadline');
            foreach ($projects as $project) {
                $projectBeforeEndTime = $project->notify_before_end_time; // in hours
                if ($projectBeforeEndTime > 0) {
                    $tasks = Task::where('project_id', $project->project_id)->get();
                    foreach ($tasks as $task) {
                        $task_id = $task->task_id;
                        $task_name = $task->task_name;
                        $task = Task::with('users')->find($task_id);
                        $members = $task->users->pluck('id');
                        //
                        $devices = Devices::whereIn('user_id', $members)
                            ->get();
                        $devices = $devices->map(function ($device) {
                            return json_decode($device->endpoint, true);
                        })->filter()->values()->toArray();
                        $pathname = '/admin/lam-viec/du-an/' . $project->project_id;
                        //
                        $deadlineThreshold = $now->copy()->addHours($projectBeforeEndTime);
                        $deadlineTimestamp = Carbon::parse($task->task_end_date)->timestamp;
                        $timeDifference = $deadlineTimestamp - $now->timestamp; // This will give you the difference in seconds as a float
                        $hours = floor($timeDifference / 3600);
                        $minutes = floor(($timeDifference % 3600) / 60);
                        $remainingTime = $hours . ' giờ ' . $minutes . ' phút';
                        $content = 'Công việc ' . $task_name . ' cần hoàn thành trong vòng ' . $remainingTime . ' nữa';
                        if ($task->task_status == 1 || $task->task_status == 2) {
                            if ($timeDifference > 0 && $timeDifference <= $deadlineThreshold->timestamp - $now->timestamp) {
                                foreach ($members as $user_id) {
                                    $notifications[] = [
                                        'user_id' => $user_id,
                                        'create_by_user_id' => $user_id,
                                        'notification_title' => $content,
                                        'notification_type' => 2,
                                        'notification_link' => $this->ClientUrl . $pathname,
                                        'created_at' => now(),
                                        'updated_at' => now(),
                                    ];
                                }
                                Notification::insert($notifications);
                                $notification = Notification::where('notification_title', $content)->first();
                                $members = $members->toArray();
                                foreach ($members as $user_id) {
                                    $devices = Devices::where('user_id', '=', $user_id)
                                        ->get();
                                    $devices = $devices->map(function ($device) {
                                        return json_decode($device->endpoint, true);
                                    })->filter()->values()->toArray();
                                    $payload = [
                                        'user_id' => $user_id,
                                        'devices' => $devices,
                                        'content' => $content,
                                        'notification' => $notification,
                                        'pathname' => $pathname,
                                    ];
                                    Http::post($this->nodeUrl . '/check-dateline-task', $payload);
                                }
                                $this->info('Công việc ' . $task_name . ' cần hoàn thành trong vòng ' . $remainingTime . ' tới');
                            }
                        }
                    }
                }
            }
            return 0; // success
        } catch (\Exception $e) {
            $this->error($e->getMessage());
            return 1; // error
        }
    }
}
