<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\TaskType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TaskTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/TaskTypes/Index', [
            'types' => TaskType::orderBy('position')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:task_types,name',
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $data['position'] = TaskType::max('position') + 1;

        TaskType::create($data);

        return back()->with('success', 'Task type created.');
    }

    public function update(Request $request, TaskType $taskType)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:task_types,name,' . $taskType->id,
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $taskType->update($data);

        return back()->with('success', 'Task type updated.');
    }

    public function destroy(TaskType $taskType)
    {
        if ($taskType->tasks()->exists()) {
            return back()->withErrors(['task_type' => 'Cannot delete a type that has tasks.']);
        }

        $taskType->delete();

        return back()->with('success', 'Task type deleted.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items'   => 'required|array',
            'items.*' => 'integer|exists:task_types,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $position => $id) {
                TaskType::where('id', $id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Order saved.');
    }
}
