<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function index()
    {
        $pipelines = Pipeline::with(['stages' => fn ($q) => $q->orderBy('position')])
            ->withCount('deals')
            ->orderBy('position')
            ->get();

        return Inertia::render('Settings/Pipelines/Index', [
            'pipelines' => $pipelines,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100|unique:pipelines,name',
            'is_active' => 'boolean',
        ]);

        $data['position'] = Pipeline::max('position') + 1;
        $data['created_by'] = auth()->id();

        Pipeline::create($data);

        return back()->with('success', 'Pipeline created.');
    }

    public function update(Request $request, Pipeline $pipeline)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:pipelines,name,' . $pipeline->id,
            'is_active' => 'boolean',
        ]);

        $pipeline->update($data);

        return back()->with('success', 'Pipeline updated.');
    }

    public function destroy(Pipeline $pipeline)
    {
        if ($pipeline->deals()->exists()) {
            return back()->withErrors(['pipeline' => 'Cannot delete a pipeline that has deals.']);
        }

        $pipeline->stages()->delete();
        $pipeline->delete();

        return back()->with('success', 'Pipeline deleted.');
    }
}
