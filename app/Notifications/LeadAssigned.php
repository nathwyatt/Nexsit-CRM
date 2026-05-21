<?php

namespace App\Notifications;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeadAssigned extends Notification
{
    use Queueable;

    public function __construct(
        private Lead $lead,
        private User $assignedBy,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'icon'  => '◎',
            'title' => 'Lead assigned to you',
            'body'  => "{$this->assignedBy->name} assigned lead {$this->lead->reference} to you.",
            'link'  => "/leads/{$this->lead->id}",
        ];
    }
}
