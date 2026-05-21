<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Contact;
use App\Models\DocumentType;
use App\Models\Property;
use App\Models\PropertyOwner;
use App\Models\PropertyType;
use App\Models\PropertyUnit;
use App\Models\TaskType;
use App\Models\User;
use App\Services\AutomationEngine;
use App\Services\PlanLimitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with(['propertyType', 'assignedTo'])
            ->withCount(['units', 'owners'])
            ->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('reference', 'like', '%' . $request->search . '%')
                  ->orWhere('community', 'like', '%' . $request->search . '%')
                  ->orWhere('building', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('property_type_id', $request->type);
        }

        if ($request->filled('purpose')) {
            $query->where('purpose', $request->purpose);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('published')) {
            $query->where('is_published', $request->published === 'yes');
        }

        $properties = $query->paginate(20)->withQueryString()
            ->through(fn ($p) => [
                'id'            => $p->id,
                'reference'     => $p->reference,
                'title'         => $p->title,
                'purpose'       => $p->purpose,
                'status'        => $p->status,
                'is_published'  => $p->is_published,
                'bedrooms'      => $p->bedrooms,
                'bathrooms'     => $p->bathrooms,
                'area_sqm'      => $p->area_sqm,
                'price'         => $p->price,
                'rent_price'    => $p->rent_price,
                'city'          => $p->city,
                'community'     => $p->community,
                'units_count'   => $p->units_count,
                'property_type' => $p->propertyType?->only('id', 'name', 'icon'),
                'assigned_to'   => $p->assignedTo?->only('id', 'name'),
                'thumb'         => $p->getFirstMediaUrl('photos', 'thumb') ?: null,
            ]);

        return Inertia::render('Properties/Index', [
            'properties'    => $properties,
            'propertyTypes' => PropertyType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
            'filters'       => $request->only(['search', 'type', 'purpose', 'status', 'published']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Properties/Create', $this->formData());
    }

    public function store(Request $request)
    {
        if ($error = PlanLimitService::check('properties', auth()->user()->company_id)) {
            return back()->with('error', $error);
        }

        $data = $this->validateProperty($request);
        $amenityIds = $request->input('amenity_ids', []);

        $property = DB::transaction(function () use ($data, $amenityIds, $request) {
            $data['created_by'] = auth()->id();
            $property = Property::create($data);
            $property->amenities()->sync($amenityIds);
            return $property;
        });

        return redirect()->route('properties.show', $property)
            ->with('success', "Property {$property->reference} created.");
    }

    public function show(Property $property)
    {
        $property->load([
            'propertyType',
            'amenities',
            'owners.contact',
            'units',
            'assignedTo',
            'createdBy',
        ]);

        $photos    = $property->getMedia('photos')->map(fn ($m) => [
            'id'    => $m->id,
            'url'   => $m->getUrl(),
            'thumb' => $m->getUrl('thumb'),
            'name'  => $m->name,
            'size'  => $m->size,
        ]);

        $floorPlans = $property->getMedia('floor_plans')->map(fn ($m) => [
            'id'  => $m->id,
            'url' => $m->getUrl(),
            'name' => $m->name,
        ]);

        $contacts = Contact::orderBy('first_name')->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn ($c) => ['id' => $c->id, 'name' => trim("{$c->first_name} {$c->last_name}")]);

        $tasks      = $property->tasks()->with(['taskType', 'assignedTo'])->orderByRaw('status = "done" ASC')->orderByRaw('due_at IS NULL ASC')->orderBy('due_at')->get();
        $activities = $property->activities()->with('user')->latest('created_at')->limit(50)->get();
        $documents  = $property->documents()->with(['documentType', 'uploadedBy'])->latest()->get();
        $taskCtrl   = new \App\Http\Controllers\Crm\TaskController();
        $docCtrl    = new \App\Http\Controllers\Crm\DocumentController();

        return Inertia::render('Properties/Show', [
            'property' => array_merge($property->toArray(), [
                'photos'      => $photos,
                'floor_plans' => $floorPlans,
            ]),
            'contacts'   => $contacts,
            'taskTypes'  => TaskType::where('is_active', true)->orderBy('position')->get(['id', 'name', 'icon']),
            'tasks'      => $tasks->map(fn ($t) => $taskCtrl->transform($t)),
            'activities' => $activities->map(fn ($a) => [
                'id'          => $a->id,
                'action'      => $a->action,
                'description' => $a->description,
                'user'        => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                'created_at'  => $a->created_at->diffForHumans(),
            ]),
            'agents'        => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'subject'       => ['type' => 'property', 'id' => $property->id],
            'documents'     => $documents->map(fn ($d) => $docCtrl->transform($d)),
            'documentTypes' => DocumentType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function edit(Property $property)
    {
        $property->load(['amenities']);

        return Inertia::render('Properties/Edit', array_merge($this->formData(), [
            'property'   => array_merge($property->toArray(), [
                'amenity_ids' => $property->amenities->pluck('id'),
            ]),
        ]));
    }

    public function update(Request $request, Property $property)
    {
        $data = $this->validateProperty($request, $property->id);
        $amenityIds = $request->input('amenity_ids', []);

        DB::transaction(function () use ($property, $data, $amenityIds) {
            $property->update($data);
            $property->amenities()->sync($amenityIds);
        });

        return redirect()->route('properties.show', $property)
            ->with('success', 'Property updated.');
    }

    public function destroy(Property $property)
    {
        $property->clearMediaCollection('photos');
        $property->clearMediaCollection('floor_plans');
        $property->delete();

        return redirect()->route('properties.index')
            ->with('success', "Property {$property->reference} deleted.");
    }

    public function publish(Property $property)
    {
        $property->update([
            'is_published' => ! $property->is_published,
            'published_at' => $property->is_published ? null : now(),
        ]);

        $status = $property->is_published ? 'published' : 'unpublished';

        if ($property->is_published) {
            AutomationEngine::fire('property_published', $property);
        }

        return back()->with('success', "Property {$status}.");
    }

    // ── Media ────────────────────────────────────────────────────────────────

    public function storeMedia(Request $request, Property $property)
    {
        $request->validate([
            'photo' => 'required|image|max:8192',
        ]);

        $media = $property->addMediaFromRequest('photo')
            ->toMediaCollection('photos');

        return back()->with('success', 'Photo uploaded.');
    }

    public function storeFloorPlan(Request $request, Property $property)
    {
        $request->validate([
            'file' => 'required|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $property->addMediaFromRequest('file')
            ->toMediaCollection('floor_plans');

        return back()->with('success', 'Floor plan uploaded.');
    }

    public function destroyMedia(Property $property, int $mediaId)
    {
        $media = $property->media()->findOrFail($mediaId);
        $media->delete();

        return back()->with('success', 'File deleted.');
    }

    public function reorderMedia(Request $request, Property $property)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer',
        ]);

        foreach ($request->ids as $order => $id) {
            $property->media()->where('id', $id)->update(['order_column' => $order + 1]);
        }

        return back()->with('success', 'Photos reordered.');
    }

    // ── Owners ───────────────────────────────────────────────────────────────

    public function storeOwner(Request $request, Property $property)
    {
        $data = $request->validate([
            'contact_id'    => 'required|exists:contacts,id',
            'ownership_pct' => 'required|numeric|min:0.01|max:100',
            'is_primary'    => 'boolean',
            'notes'         => 'nullable|string|max:500',
        ]);

        $data['created_at'] = now();
        $property->owners()->create($data);

        return back()->with('success', 'Owner added.');
    }

    public function destroyOwner(Property $property, PropertyOwner $owner)
    {
        $owner->delete();
        return back()->with('success', 'Owner removed.');
    }

    // ── Units ────────────────────────────────────────────────────────────────

    public function storeUnit(Request $request, Property $property)
    {
        $data = $request->validate([
            'unit_number' => 'required|string|max:20',
            'floor'       => 'nullable|integer',
            'bedrooms'    => 'nullable|integer|min:0',
            'bathrooms'   => 'nullable|integer|min:0',
            'area_sqm'    => 'nullable|numeric|min:0',
            'status'      => 'required|in:available,occupied,reserved',
            'rent_price'  => 'nullable|numeric|min:0',
            'notes'       => 'nullable|string|max:500',
        ]);

        $property->units()->create($data);

        return back()->with('success', 'Unit added.');
    }

    public function updateUnit(Request $request, Property $property, PropertyUnit $unit)
    {
        $data = $request->validate([
            'unit_number' => 'required|string|max:20',
            'floor'       => 'nullable|integer',
            'bedrooms'    => 'nullable|integer|min:0',
            'bathrooms'   => 'nullable|integer|min:0',
            'area_sqm'    => 'nullable|numeric|min:0',
            'status'      => 'required|in:available,occupied,reserved',
            'rent_price'  => 'nullable|numeric|min:0',
            'notes'       => 'nullable|string|max:500',
        ]);

        $unit->update($data);

        return back()->with('success', 'Unit updated.');
    }

    public function destroyUnit(Property $property, PropertyUnit $unit)
    {
        $unit->delete();
        return back()->with('success', 'Unit deleted.');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function formData(): array
    {
        return [
            'propertyTypes' => PropertyType::where('is_active', true)->orderBy('position')->get(['id', 'name', 'icon']),
            'amenities'     => Amenity::where('is_active', true)->orderBy('category')->orderBy('position')
                ->get(['id', 'name', 'icon', 'category']),
            'agents'        => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ];
    }

    private function validateProperty(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title'           => 'required|string|max:200',
            'description'     => 'nullable|string',
            'property_type_id'=> 'nullable|exists:property_types,id',
            'purpose'         => 'required|in:sale,rent,both',
            'status'          => 'required|in:available,under_offer,reserved,sold,rented,off_market',
            'bedrooms'        => 'nullable|integer|min:0',
            'bathrooms'       => 'nullable|integer|min:0',
            'area_sqm'        => 'nullable|numeric|min:0',
            'floor'           => 'nullable|integer',
            'total_floors'    => 'nullable|integer|min:1',
            'building'        => 'nullable|string|max:200',
            'community'       => 'nullable|string|max:200',
            'city'            => 'required|string|max:100',
            'country'         => 'nullable|string|size:2',
            'latitude'        => 'nullable|numeric|between:-90,90',
            'longitude'       => 'nullable|numeric|between:-180,180',
            'price'           => 'nullable|numeric|min:0',
            'rent_price'      => 'nullable|numeric|min:0',
            'rent_frequency'  => 'nullable|in:monthly,quarterly,yearly',
            'service_charge'  => 'nullable|numeric|min:0',
            'is_furnished'    => 'nullable|boolean',
            'permit_number'   => 'nullable|string|max:100',
            'meta_title'      => 'nullable|string|max:200',
            'meta_description'=> 'nullable|string|max:500',
            'assigned_to'     => 'nullable|exists:users,id',
        ]);
    }
}
