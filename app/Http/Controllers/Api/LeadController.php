<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\LeadSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    private function defaultCompanyId(): int
    {
        return DB::table('companies')->orderBy('id')->value('id') ?? 1;
    }

    public function store(Request $request)
    {
        $companyId = $this->defaultCompanyId();
        $data = $request->validate([
            'first_name'  => 'required|string|max:100',
            'last_name'   => 'required|string|max:100',
            'email'       => 'nullable|email|max:200',
            'phone'       => 'required|string|max:30',
            'purpose'     => 'required|in:buy,rent',
            'budget_min'  => 'nullable|numeric|min:0',
            'budget_max'  => 'nullable|numeric|min:0',
            'bedrooms'    => 'nullable|integer|min:0',
            'message'     => 'nullable|string|max:2000',
            'source'      => 'nullable|string|max:100',
            'property_id' => 'nullable|exists:properties,id',
        ]);

        // Find or create contact by email then phone
        $contact = null;
        if (!empty($data['email'])) {
            $contact = Contact::where('email', $data['email'])->first();
        }
        if (!$contact && !empty($data['phone'])) {
            $contact = Contact::where('phone', $data['phone'])->first();
        }
        if (!$contact) {
            $contact = Contact::create([
                'company_id' => $companyId,
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name'],
                'email'      => $data['email'] ?? null,
                'phone'      => $data['phone'],
            ]);
        }

        // Resolve source
        $source = LeadSource::where('name', 'Website')
            ->orWhere('slug', 'website')
            ->first();

        if (!empty($data['source'])) {
            $source = LeadSource::where('slug', \Illuminate\Support\Str::slug($data['source']))->first() ?? $source;
        }

        $lead = Lead::create([
            'company_id'      => $companyId,
            'contact_id'      => $contact->id,
            'lead_source_id'  => $source?->id,
            'source_detail'   => $data['source'] ?? null,
            'purpose'         => $data['purpose'],
            'property_id'     => $data['property_id'] ?? null,
            'budget_min'      => $data['budget_min'] ?? null,
            'budget_max'      => $data['budget_max'] ?? null,
            'bedrooms_wanted' => $data['bedrooms'] ?? null,
            'message'         => $data['message'] ?? null,
            'status'          => 'new',
        ]);

        return response()->json([
            'reference' => $lead->reference,
            'message'   => 'Your enquiry has been received. We will be in touch shortly.',
        ], 201);
    }

    public function valuation(Request $request)
    {
        $companyId = $this->defaultCompanyId();

        $data = $request->validate([
            'first_name'  => 'required|string|max:100',
            'last_name'   => 'required|string|max:100',
            'email'       => 'nullable|email|max:200',
            'phone'       => 'required|string|max:30',
            'property_id' => 'nullable|exists:properties,id',
            'message'     => 'nullable|string|max:2000',
        ]);

        $contact = null;
        if (!empty($data['email'])) {
            $contact = Contact::where('email', $data['email'])->first();
        }
        if (!$contact) {
            $contact = Contact::firstOrCreate(
                ['phone' => $data['phone']],
                ['company_id' => $companyId, 'first_name' => $data['first_name'], 'last_name' => $data['last_name'], 'email' => $data['email'] ?? null]
            );
        }

        $source = LeadSource::where('name', 'Website')->orWhere('slug', 'website')->first();

        $lead = Lead::create([
            'company_id'     => $companyId,
            'contact_id'     => $contact->id,
            'lead_source_id' => $source?->id,
            'source_detail'  => 'Valuation request',
            'purpose'        => 'buy',
            'property_id'    => $data['property_id'] ?? null,
            'message'        => $data['message'] ?? null,
            'status'         => 'new',
        ]);

        return response()->json([
            'reference' => $lead->reference,
            'message'   => 'Valuation request received.',
        ], 201);
    }
}
