<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskType;
use App\Models\User;
use App\Notifications\TaskAssigned;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $now    = now();

        $myTasks = Task::with(['taskType', 'assignedTo'])
            ->where('assigned_to', $userId)
            ->where('status', 'pending')
            ->orderByRaw('due_at IS NULL ASC')->orderBy('due_at')
            ->get()->map(fn ($t) => $this->transform($t));

        $teamTasks = Task::with(['taskType', 'assignedTo'])
            ->where('status', 'pending')
            ->where(fn ($q) => $q->whereNull('assigned_to')->orWhere('assigned_to', '!=', $userId))
            ->orderByRaw('due_at IS NULL ASC')->orderBy('due_at')
            ->get()->map(fn ($t) => $this->transform($t));

        $overdue = Task::with(['taskType', 'assignedTo'])
            ->where('status', 'pending')
            ->whereNotNull('due_at')
            ->where('due_at', '<', $now)
            ->orderBy('due_at')
            ->get()->map(fn ($t) => $this->transform($t));

        return Inertia::render('Tasks/Index', [
            'myTasks'   => $myTasks,
            'teamTasks' => $teamTasks,
            'overdue'   => $overdue,
            'taskTypes' => TaskType::where('is_active', true)->orderBy('position')->get(['id', 'name', 'icon']),
            'agents'    => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'task_type_id'  => 'nullable|exists:task_types,id',
            'description'   => 'nullable|string',
            'due_at'        => 'nullable|date',
            'priority'      => 'required|in:low,medium,high',
            'assigned_to'   => 'nullable|exists:users,id',
            'taskable_type' => 'nullable|string',
            'taskable_id'   => 'nullable|integer',
        ]);

        $data['created_by'] = auth()->id();
        $data['assigned_to'] ??= auth()->id();

        $task = Task::create($data);

        if ((int) $task->assigned_to !== auth()->id()) {
            $assignee = User::find($task->assigned_to);
            $assignee?->notify(new TaskAssigned($task, auth()->user()));
        }

        return back()->with('success', 'Task created.');
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'task_type_id' => 'nullable|exists:task_types,id',
            'description'  => 'nullable|string',
            'due_at'       => 'nullable|date',
            'priority'     => 'required|in:low,medium,high',
            'assigned_to'  => 'nullable|exists:users,id',
        ]);

        $task->update($data);

        return back()->with('success', 'Task updated.');
    }

    public function complete(Task $task)
    {
        $task->update([
            'status'       => 'done',
            'completed_at' => now(),
        ]);

        return back()->with('success', 'Task marked complete.');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return back()->with('success', 'Task deleted.');
    }

    public function transform(Task $task): array
    {
        return [
            'id'          => $task->id,
            'title'       => $task->title,
            'description' => $task->description,
            'due_at'      => $task->due_at?->toDateTimeString(),
            'due_at_human' => $task->due_at?->diffForHumans(),
            'priority'    => $task->priority,
            'status'      => $task->status,
            'is_overdue'  => $task->due_at && $task->due_at->isPast() && $task->status === 'pending',
            'task_type'   => $task->taskType ? ['id' => $task->taskType->id, 'name' => $task->taskType->name, 'icon' => $task->taskType->icon] : null,
            'assigned_to' => $task->assignedTo ? ['id' => $task->assignedTo->id, 'name' => $task->assignedTo->name] : null,
            'taskable_type' => $task->taskable_type,
            'taskable_id'   => $task->taskable_id,
            'completed_at'  => $task->completed_at?->toDateTimeString(),
            'created_at'    => $task->created_at->toDateTimeString(),
        ];
    }
}
