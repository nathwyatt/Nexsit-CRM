<?php

namespace App\Http\Controllers;

use App\Mail\EnquiryConfirmation;
use App\Mail\NewEnquiryNotification;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\Property;
use App\Models\PropertyType;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PublicListingController extends Controller
{
    private function resolveCompany(?string $slug): ?object
    {
        if ($slug) {
            return DB::table('companies')->where('slug', $slug)->where('is_active', true)->first();
        }
        return null;
    }

    private function defaultCompanyId(): int
    {
        return DB::table('companies')->where('is_active', true)->orderBy('id')->value('id') ?? 1;
    }

    public function index(Request $request)
    {
        $company = $this->resolveCompany($request->company);
        $companyId = $company?->id;

        $query = Property::with(['propertyType', 'media'])
            ->where('is_published', true)
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->latest('published_at');

        if ($request->filled('q')) {
            $term = $request->q;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('reference', 'like', "%{$term}%")
                  ->orWhere('community', 'like', "%{$term}%")
                  ->orWhere('building', 'like', "%{$term}%");
            });
        }

        if ($request->filled('purpose') && in_array($request->purpose, ['sale', 'rent'])) {
            $query->where('purpose', $request->purpose);
        }

        if ($request->filled('type')) {
            $query->where('property_type_id', $request->type);
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', $request->bedrooms);
        }

        if ($request->filled('price_min')) {
            $query->where(fn ($q) => $q
                ->where('price', '>=', $request->price_min)
                ->orWhere('rent_price', '>=', $request->price_min)
            );
        }

        if ($request->filled('price_max')) {
            $query->where(fn ($q) => $q
                ->where('price', '<=', $request->price_max)
                ->orWhere('rent_price', '<=', $request->price_max)
            );
        }

        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'price_asc'  => $query->orderBy('price')->orderBy('rent_price'),
            'price_desc' => $query->orderByDesc('price')->orderByDesc('rent_price'),
            default      => $query->latest('published_at'),
        };

        $properties = $query->paginate(20)->withQueryString()
            ->through(fn ($p) => $this->cardData($p));

        return Inertia::render('Listings/Index', [
            'properties'    => $properties,
            'propertyTypes' => PropertyType::where('is_active', true)
                ->orderBy('position')
                ->get(['id', 'name', 'slug', 'icon']),
            'filters'  => $request->only(['q', 'purpose', 'type', 'bedrooms', 'price_min', 'price_max', 'sort', 'company']),
            'company'  => $company ? \App\Models\Company::publicProfile($company) : null,
        ]);
    }

    public function show(string $reference)
    {
        $property = Property::with(['propertyType', 'amenities', 'units', 'media'])
            ->where('is_published', true)
            ->where('reference', $reference)
            ->firstOrFail();

        $photos     = $property->getMedia('photos')->map(fn ($m) => [
            'id'    => $m->id,
            'url'   => $m->getUrl(),
            'thumb' => $m->getUrl('thumb'),
        ]);
        $floorPlans = $property->getMedia('floor_plans')->map(fn ($m) => [
            'id'  => $m->id,
            'url' => $m->getUrl(),
        ]);

        $company = DB::table('companies')->where('id', $property->company_id)->first();

        return Inertia::render('Listings/Show', [
            'company'  => \App\Models\Company::publicProfile($company),
            'property' => [
                'id'              => $property->id,
                'reference'       => $property->reference,
                'title'           => $property->title,
                'description'     => $property->description,
                'type'            => $property->propertyType?->name,
                'purpose'         => $property->purpose,
                'status'          => $property->status,
                'bedrooms'        => $property->bedrooms,
                'bathrooms'       => $property->bathrooms,
                'area_sqm'        => $property->area_sqm !== null ? (float) $property->area_sqm : null,
                'floor'           => $property->floor,
                'total_floors'    => $property->total_floors,
                'building'        => $property->building,
                'community'       => $property->community,
                'city'            => $property->city,
                'country'         => $property->country,
                'price'           => $property->price !== null ? (float) $property->price : null,
                'rent_price'      => $property->rent_price !== null ? (float) $property->rent_price : null,
                'rent_frequency'  => $property->rent_frequency,
                'is_furnished'    => $property->is_furnished,
                'permit_number'   => $property->permit_number,
                'meta_title'      => $property->meta_title,
                'meta_description' => $property->meta_description,
                'amenities' => $property->amenities->groupBy('category')->map(fn ($group, $cat) => [
                    'category' => $cat,
                    'items'    => $group->map(fn ($a) => ['name' => $a->name, 'icon' => $a->icon])->values(),
                ])->values(),
                'units' => $property->units->map(fn ($u) => [
                    'unit_number' => $u->unit_number,
                    'bedrooms'    => $u->bedrooms,
                    'bathrooms'   => $u->bathrooms,
                    'area_sqm'    => $u->area_sqm,
                    'status'      => $u->status,
                    'rent_price'  => $u->rent_price,
                ]),
                'photos'      => $photos->values(),
                'floor_plans' => $floorPlans->values(),
            ],
        ]);
    }

    public function enquire(Request $request, string $reference)
    {
        $property = Property::where('reference', $reference)->where('is_published', true)->firstOrFail();

        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'nullable|email|max:200',
            'phone'      => 'required|string|max:30',
            'purpose'    => 'required|in:buy,rent',
            'message'    => 'nullable|string|max:2000',
        ]);

        $companyId = $property->company_id ?? $this->defaultCompanyId();

        $contact = null;
        if (!empty($data['email'])) {
            $contact = Contact::withoutGlobalScopes()->where('email', $data['email'])->where('company_id', $companyId)->first();
        }
        if (!$contact && !empty($data['phone'])) {
            $contact = Contact::withoutGlobalScopes()->where('phone', $data['phone'])->where('company_id', $companyId)->first();
        }
        if (!$contact) {
            $contact = DB::table('contacts')->insertGetId([
                'company_id' => $companyId,
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name'],
                'email'      => $data['email'] ?? null,
                'phone'      => $data['phone'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $contact = Contact::withoutGlobalScopes()->find($contact);
        }

        $source = DB::table('lead_sources')->where('company_id', $companyId)
            ->where(fn ($q) => $q->where('name', 'Website')->orWhere('slug', 'website'))
            ->first();

        $lead = DB::table('leads')->insertGetId([
            'company_id'     => $companyId,
            'contact_id'     => $contact->id,
            'lead_source_id' => $source?->id,
            'source_detail'  => "Listing enquiry: {$reference}",
            'purpose'        => $data['purpose'],
            'property_id'    => $property->id,
            'message'        => $data['message'] ?? null,
            'status'         => 'new',
            'reference'      => 'LEAD-TMP-' . uniqid(),
            'assigned_to'    => DB::table('users')->where('company_id', $companyId)->where('role', 'admin')->value('id'),
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        // Email notifications wrapped in try-catch so a mail config issue never breaks the form
        try {
            // Notify all admins of the new enquiry
            EmailService::sendToAdmins(
                $companyId,
                "New Enquiry: {$property->title}",
                new NewEnquiryNotification((object)['contact' => $contact, 'id' => $lead], $property)
            );

            // Send confirmation to enquirer if they provided an email
            if ($contact->email) {
                EmailService::send(
                    $companyId,
                    $contact->email,
                    $contact->first_name,
                    'We received your enquiry',
                    new EnquiryConfirmation($contact->first_name, $property)
                );
            }
        } catch (\Throwable $e) {
            \Log::warning('Enquiry email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Thank you! Your enquiry has been received. We will be in touch shortly.');
    }

    private function cardData(Property $p): array
    {
        $firstPhoto = $p->getFirstMedia('photos');
        return [
            'id'          => $p->id,
            'reference'   => $p->reference,
            'title'       => $p->title,
            'type'        => $p->propertyType?->name,
            'purpose'     => $p->purpose,
            'status'      => $p->status,
            'bedrooms'    => $p->bedrooms,
            'bathrooms'   => $p->bathrooms,
            'area_sqm'    => $p->area_sqm !== null ? (float) $p->area_sqm : null,
            'community'   => $p->community,
            'city'        => $p->city,
            'price'       => $p->price !== null ? (float) $p->price : null,
            'rent_price'  => $p->rent_price !== null ? (float) $p->rent_price : null,
            'rent_frequency' => $p->rent_frequency,
            'photo_thumb' => $firstPhoto?->getUrl('thumb'),
            'photo_url'   => $firstPhoto?->getUrl(),
            'featured_until' => $p->featured_until?->toDateString(),
        ];
    }
}
