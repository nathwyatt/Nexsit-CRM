<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\LeadSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadSourceController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/LeadSources/Index', [
            'sources' => LeadSource::orderBy('position')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:lead_sources,name',
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $data['position'] = LeadSource::max('position') + 1;

        LeadSource::create($data);

        return back()->with('success', 'Lead source created.');
    }

    public function update(Request $request, LeadSource $leadSource)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:lead_sources,name,' . $leadSource->id,
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $leadSource->update($data);

        return back()->with('success', 'Lead source updated.');
    }

    public function destroy(LeadSource $leadSource)
    {
        if ($leadSource->leads()->exists()) {
            return back()->withErrors(['lead_source' => 'Cannot delete a source that has leads.']);
        }

        $leadSource->delete();

        return back()->with('success', 'Lead source deleted.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items'   => 'required|array',
            'items.*' => 'integer|exists:lead_sources,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $position => $id) {
                LeadSource::where('id', $id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Order saved.');
    }
}
