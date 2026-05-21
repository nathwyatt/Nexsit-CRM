<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\PropertyType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PropertyTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/PropertyTypes/Index', [
            'types' => PropertyType::orderBy('position')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:property_types,name',
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $data['position'] = PropertyType::max('position') + 1;

        PropertyType::create($data);

        return back()->with('success', 'Property type created.');
    }

    public function update(Request $request, PropertyType $propertyType)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:property_types,name,' . $propertyType->id,
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $propertyType->update($data);

        return back()->with('success', 'Property type updated.');
    }

    public function destroy(PropertyType $propertyType)
    {
        if ($propertyType->properties()->exists()) {
            return back()->withErrors(['property_type' => 'Cannot delete a type that has properties.']);
        }

        $propertyType->delete();

        return back()->with('success', 'Property type deleted.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items'   => 'required|array',
            'items.*' => 'integer|exists:property_types,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $position => $id) {
                PropertyType::where('id', $id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Order saved.');
    }
}
