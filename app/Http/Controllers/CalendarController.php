<?php

namespace App\Http\Controllers;

use App\Models\PropertyViewing;
use App\Models\Task;
use App\Models\Tenancy;
use App\Models\TenancyPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function __invoke(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));

        try {
            $from = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        } catch (\Throwable) {
            $from = now()->startOfMonth();
        }

        $to = $from->copy()->endOfMonth();

        $events = collect();

        // ── Tasks with due dates ─────────────────────────────────────────────
        Task::with(['assignedTo:id,name', 'taskType:id,name,icon'])
            ->where('status', 'pending')
            ->whereBetween('due_at', [$from->startOfDay(), $to->endOfDay()])
            ->get()
            ->each(function ($task) use (&$events) {
                $events->push([
                    'id'       => "task-{$task->id}",
                    'type'     => 'task',
                    'date'     => $task->due_at->toDateString(),
                    'time'     => null,
                    'title'    => $task->title,
                    'priority' => $task->priority,
                    'link'     => '/tasks',
                    'overdue'  => $task->due_at->isPast(),
                    'label'    => $task->title,
                ]);
            });

        // ── Tenancy payments due ─────────────────────────────────────────────
        TenancyPayment::with(['tenancy:id,reference'])
            ->whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [$from, $to])
            ->get()
            ->each(function ($payment) use (&$events) {
                $events->push([
                    'id'      => "payment-{$payment->id}",
                    'type'    => 'payment',
                    'date'    => $payment->due_date->toDateString(),
                    'time'    => null,
                    'title'   => "Payment — {$payment->tenancy->reference}",
                    'label'   => "RWF " . number_format($payment->amount, 0),
                    'link'    => "/tenancies/{$payment->tenancy_id}",
                    'overdue' => $payment->status === 'overdue',
                ]);
            });

        // ── Tenancy start / end dates ────────────────────────────────────────
        Tenancy::with(['property:id,title', 'tenant:id,first_name,last_name'])
            ->whereIn('status', ['active', 'pending'])
            ->where(function ($q) use ($from, $to) {
                $q->whereBetween('start_date', [$from, $to])
                  ->orWhereBetween('end_date', [$from, $to]);
            })
            ->get()
            ->each(function ($tenancy) use (&$events, $from, $to) {
                if ($tenancy->start_date->between($from, $to)) {
                    $events->push([
                        'id'    => "tenancy-start-{$tenancy->id}",
                        'type'  => 'tenancy_start',
                        'date'  => $tenancy->start_date->toDateString(),
                        'time'  => null,
                        'title' => "Tenancy starts — {$tenancy->reference}",
                        'label' => "Starts: {$tenancy->reference}",
                        'link'  => "/tenancies/{$tenancy->id}",
                    ]);
                }
                if ($tenancy->end_date->between($from, $to)) {
                    $events->push([
                        'id'    => "tenancy-end-{$tenancy->id}",
                        'type'  => 'tenancy_end',
                        'date'  => $tenancy->end_date->toDateString(),
                        'time'  => null,
                        'title' => "Tenancy ends — {$tenancy->reference}",
                        'label' => "Ends: {$tenancy->reference}",
                        'link'  => "/tenancies/{$tenancy->id}",
                    ]);
                }
            });

        // ── Property viewings ────────────────────────────────────────────────
        PropertyViewing::with([
            'property:id,title,reference',
            'contact:id,first_name,last_name',
            'assignedTo:id,name',
        ])
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('scheduled_at', [$from->startOfDay(), $to->endOfDay()])
            ->get()
            ->each(function ($viewing) use (&$events) {
                $contactName = $viewing->contact
                    ? trim($viewing->contact->first_name . ' ' . $viewing->contact->last_name)
                    : 'Unknown';

                $events->push([
                    'id'      => "viewing-{$viewing->id}",
                    'type'    => 'viewing',
                    'date'    => $viewing->scheduled_at->toDateString(),
                    'time'    => $viewing->scheduled_at->format('H:i'),
                    'title'   => "Viewing — {$viewing->property?->reference}: {$contactName}",
                    'label'   => "{$viewing->scheduled_at->format('H:i')} Viewing: {$viewing->property?->reference}",
                    'link'    => "/viewings/{$viewing->id}",
                    'status'  => $viewing->status,
                    'overdue' => false,
                ]);
            });

        return Inertia::render('Calendar/Index', [
            'events' => $events->sortBy('date')->values(),
            'month'  => $from->format('Y-m'),
        ]);
    }
}
