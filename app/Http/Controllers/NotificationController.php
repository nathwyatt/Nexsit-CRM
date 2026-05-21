<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->limit(30)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'icon'       => $n->data['icon']  ?? '🔔',
                'title'      => $n->data['title'] ?? '',
                'body'       => $n->data['body']  ?? '',
                'link'       => $n->data['link']  ?? null,
                'read'       => ! is_null($n->read_at),
                'created_at' => $n->created_at->diffForHumans(),
            ]);

        return response()->json($notifications);
    }

    public function markRead(DatabaseNotification $notification)
    {
        abort_unless($notification->notifiable_id === auth()->id(), 403);
        $notification->markAsRead();
        return response()->json(['ok' => true]);
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }
}
