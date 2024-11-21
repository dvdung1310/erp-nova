<?php

namespace App\Schedule;

use Illuminate\Console\Scheduling\Schedule;

class TaskScheduler
{
    public function __invoke(Schedule $schedule): void
    {
        $schedule->command('tasks:check-deadline')->hourly();
    }
}
