<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    public function index()
    {
        $logs = EmailLog::latest()
            ->paginate(50);

        return Inertia::render('Settings/EmailLog', [
            'logs' => $logs,
        ]);
    }
}
