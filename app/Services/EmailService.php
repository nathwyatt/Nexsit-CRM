<?php

namespace App\Services;

use App\Models\EmailLog;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    public static function send(
        int    $companyId,
        string $toEmail,
        string $toName,
        string $subject,
        Mailable $mailable
    ): bool {
        try {
            Mail::to($toEmail, $toName)->send($mailable);

            EmailLog::create([
                'company_id' => $companyId,
                'to_email'   => $toEmail,
                'to_name'    => $toName,
                'subject'    => $subject,
                'status'     => 'sent',
            ]);

            return true;
        } catch (\Throwable $e) {
            EmailLog::create([
                'company_id' => $companyId,
                'to_email'   => $toEmail,
                'to_name'    => $toName,
                'subject'    => $subject,
                'status'     => 'failed',
                'error'      => substr($e->getMessage(), 0, 500),
            ]);

            Log::error("EmailService failed [{$subject}] to {$toEmail}: " . $e->getMessage());

            return false;
        }
    }

    public static function sendToAdmins(int $companyId, string $subject, Mailable $mailable): void
    {
        $admins = \App\Models\User::where('company_id', $companyId)
            ->where('role', 'admin')
            ->where('is_active', true)
            ->get();

        foreach ($admins as $admin) {
            static::send($companyId, $admin->email, $admin->name, $subject, clone $mailable);
        }
    }
}
