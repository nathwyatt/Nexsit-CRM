<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Send tenancy renewal reminders every morning at 8:00 AM
Schedule::command('tenancies:send-renewal-reminders')->dailyAt('08:00');
