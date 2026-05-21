<?php

namespace App\Notifications;

use App\Models\Deal;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DealStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        private Deal   $deal,
        private string $newStatus,
        private User   $changedBy,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $emoji = match ($this->newStatus) {
            'won'     => '🎉',
            'lost'    => '📉',
            'on_hold' => '⏸',
            default   => '◈',
        };

        $label = match ($this->newStatus) {
            'won'     => 'won',
            'lost'    => 'lost',
            'on_hold' => 'put on hold',
            default   => 'updated',
        };

        return [
            'icon'  => $emoji,
            'title' => "Deal {$label}: {$this->deal->reference}",
            'body'  => "{$this->changedBy->name} marked deal \"{$this->deal->title}\" as {$label}.",
            'link'  => "/deals/{$this->deal->id}",
        ];
    }
}
