<?php

use App\Console\Commands\CheckTasksDeadline;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Http\Controllers\Api\Work\TaskController;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


//Artisan::command(CheckTasksDeadline::class, function () {
//    $this->comment('Check tasks deadline');
//})->purpose('Check tasks deadline');
