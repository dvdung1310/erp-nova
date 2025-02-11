<?php

namespace App\Providers;

use App\Schedule\TaskScheduler;
use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        $this->app->singleton(TaskScheduler::class);

        $this->app->extend(Schedule::class, function (Schedule $schedule) {
            $this->app->make(TaskScheduler::class)($schedule);

            return $schedule;
        });
    }
}
