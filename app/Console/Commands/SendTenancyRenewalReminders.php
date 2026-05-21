<?php

namespace App\Console\Commands;

use App\Mail\TenancyExpiringMail;
use App\Models\Tenancy;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Console\Command;

class SendTenancyRenewalReminders extends Command
{
    protected $signature   = 'tenancies:send-renewal-reminders';
    protected $description = 'Send renewal reminder emails for tenancies expiring in 30 or 7 days';

    public function handle(): void
    {
        $milestones = [30, 7];

        foreach ($milestones as $days) {
            $target = now()->addDays($days)->toDateString();

            $tenancies = Tenancy::with(['property', 'contact'])
                ->where('status', 'active')
                ->whereDate('end_date', $target)
                ->get();

            foreach ($tenancies as $tenancy) {
                $mailable  = new TenancyExpiringMail($tenancy, $days);
                $subject   = "Tenancy expiring in {$days} days — {$tenancy->reference}";
                $companyId = $tenancy->company_id;

                // Notify all admins
                $admins = User::where('company_id', $companyId)
                    ->where('role', 'admin')
                    ->where('is_active', true)
                    ->get();

                foreach ($admins as $admin) {
                    EmailService::send($companyId, $admin->email, $admin->name, $subject, clone $mailable);
                }

                // Notify assigned agent if different from admins
                if ($tenancy->assigned_to) {
                    $agent = User::find($tenancy->assigned_to);
                    if ($agent && $agent->role !== 'admin' && $agent->is_active) {
                        EmailService::send($companyId, $agent->email, $agent->name, $subject, clone $mailable);
                    }
                }

                $this->line("Sent {$days}-day reminder for {$tenancy->reference}");
            }
        }

        $this->info('Tenancy renewal reminders sent.');
    }
}
