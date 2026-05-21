<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AmenityController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Amenities/Index', [
            'amenities' => Amenity::orderBy('category')->orderBy('position')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:amenities,name',
            'icon'      => 'nullable|string|max:50',
            'category'  => 'required|in:building,unit,community',
            'is_active' => 'boolean',
        ]);

        $data['position'] = Amenity::where('category', $data['category'])->max('position') + 1;

        Amenity::create($data);

        return back()->with('success', 'Amenity created.');
    }

    public function update(Request $request, Amenity $amenity)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:amenities,name,' . $amenity->id,
            'icon'      => 'nullable|string|max:50',
            'category'  => 'required|in:building,unit,community',
            'is_active' => 'boolean',
        ]);

        $amenity->update($data);

        return back()->with('success', 'Amenity updated.');
    }

    public function destroy(Amenity $amenity)
    {
        $amenity->properties()->detach();
        $amenity->delete();

        return back()->with('success', 'Amenity deleted.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items'   => 'required|array',
            'items.*' => 'integer|exists:amenities,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $position => $id) {
                Amenity::where('id', $id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Order saved.');
    }
}
