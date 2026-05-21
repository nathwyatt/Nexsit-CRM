<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskAssigned extends Notification
{
    use Queueable;

    public function __construct(
        private Task $task,
        private User $assignedBy,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $due = $this->task->due_at ? ' Due ' . $this->task->due_at->diffForHumans() . '.' : '';

        return [
            'icon'  => '✓',
            'title' => 'Task assigned to you',
            'body'  => "{$this->assignedBy->name} assigned \"{$this->task->title}\" to you.{$due}",
            'link'  => '/tasks',
        ];
    }
}
