<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DocumentType;
use App\Models\Property;
use App\Models\PropertyUnit;
use App\Models\Tenancy;
use App\Models\TenancyPayment;
use App\Models\User;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenancyController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenancy::with(['property', 'tenant', 'unit'])->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reference', 'like', "%{$request->search}%")
                  ->orWhereHas('tenant', fn ($c) =>
                      $c->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%")
                  )
                  ->orWhereHas('property', fn ($p) =>
                      $p->where('reference', 'like', "%{$request->search}%")
                        ->orWhere('title', 'like', "%{$request->search}%")
                  );
            });
        }

        if ($request->filled('status'))   $query->where('status', $request->status);
        if ($request->filled('property')) $query->where('property_id', $request->property);

        $tenancies = $query->paginate(25)->withQueryString()
            ->through(fn ($t) => $this->cardData($t));

        return Inertia::render('Tenancies/Index', [
            'tenancies'  => $tenancies,
            'properties' => Property::orderBy('reference')->get(['id', 'reference', 'title'])
                ->map(fn ($p) => ['id' => $p->id, 'label' => "{$p->reference} — {$p->title}"]),
            'filters'    => $request->only(['search', 'status', 'property']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Tenancies/Create', $this->formData());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'property_id'         => 'required|exists:properties,id',
            'unit_id'             => 'nullable|exists:property_units,id',
            'tenant_id'           => 'required|exists:contacts,id',
            'deal_id'             => 'nullable|exists:deals,id',
            'start_date'          => 'required|date',
            'end_date'            => 'required|date|after:start_date',
            'rent_amount'         => 'required|numeric|min:0',
            'rent_frequency'      => 'required|in:monthly,quarterly,yearly',
            'deposit_amount'      => 'nullable|numeric|min:0',
            'auto_renew'          => 'boolean',
            'renewal_notice_days' => 'integer|min:0',
            'notes'               => 'nullable|string',
        ]);

        $data['status']     = 'pending';
        $data['created_by'] = auth()->id();

        $tenancy = Tenancy::create($data);

        $this->generatePaymentSchedule($tenancy);

        ActivityLogger::log('created', "Tenancy {$tenancy->reference} created", $tenancy);

        return redirect()->route('tenancies.show', $tenancy)
            ->with('success', "Tenancy {$tenancy->reference} created.");
    }

    public function show(Tenancy $tenancy)
    {
        $tenancy->load(['property', 'unit', 'tenant', 'deal', 'createdBy', 'payments.recordedBy']);

        // Auto-mark overdue payments
        $tenancy->payments()
            ->where('status', 'pending')
            ->whereDate('due_date', '<', now())
            ->update(['status' => 'overdue']);

        $tenancy->refresh()->load('payments.recordedBy');

        $documents = $tenancy->documents()->with(['documentType', 'uploadedBy'])->latest()->get();
        $docCtrl   = new \App\Http\Controllers\Crm\DocumentController();

        return Inertia::render('Tenancies/Show', [
            'tenancy'       => $this->detail($tenancy),
            'payments'      => $tenancy->payments->map(fn ($p) => $this->paymentData($p)),
            'documents'     => $documents->map(fn ($d) => $docCtrl->transform($d)),
            'documentTypes' => DocumentType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function edit(Tenancy $tenancy)
    {
        return Inertia::render('Tenancies/Edit', array_merge($this->formData(), [
            'tenancy' => [
                'id'                  => $tenancy->id,
                'property_id'         => $tenancy->property_id,
                'unit_id'             => $tenancy->unit_id,
                'tenant_id'           => $tenancy->tenant_id,
                'deal_id'             => $tenancy->deal_id,
                'start_date'          => $tenancy->start_date->toDateString(),
                'end_date'            => $tenancy->end_date->toDateString(),
                'rent_amount'         => $tenancy->rent_amount,
                'rent_frequency'      => $tenancy->rent_frequency,
                'deposit_amount'      => $tenancy->deposit_amount,
                'auto_renew'          => $tenancy->auto_renew,
                'renewal_notice_days' => $tenancy->renewal_notice_days,
                'notes'               => $tenancy->notes,
                'status'              => $tenancy->status,
            ],
        ]));
    }

    public function update(Request $request, Tenancy $tenancy)
    {
        $data = $request->validate([
            'property_id'         => 'required|exists:properties,id',
            'unit_id'             => 'nullable|exists:property_units,id',
            'tenant_id'           => 'required|exists:contacts,id',
            'deal_id'             => 'nullable|exists:deals,id',
            'start_date'          => 'required|date',
            'end_date'            => 'required|date|after:start_date',
            'rent_amount'         => 'required|numeric|min:0',
            'rent_frequency'      => 'required|in:monthly,quarterly,yearly',
            'deposit_amount'      => 'nullable|numeric|min:0',
            'auto_renew'          => 'boolean',
            'renewal_notice_days' => 'integer|min:0',
            'notes'               => 'nullable|string',
            'status'              => 'required|in:pending,active,expired,terminated',
        ]);

        $tenancy->update($data);

        ActivityLogger::log('updated', "Tenancy {$tenancy->reference} updated", $tenancy);

        return redirect()->route('tenancies.show', $tenancy)
            ->with('success', 'Tenancy updated.');
    }

    public function destroy(Tenancy $tenancy)
    {
        $ref = $tenancy->reference;
        $tenancy->delete();

        return redirect()->route('tenancies.index')
            ->with('success', "{$ref} deleted.");
    }

    public function recordPayment(Request $request, Tenancy $tenancy, TenancyPayment $payment)
    {
        $data = $request->validate([
            'paid_date'      => 'required|date',
            'payment_method' => 'required|in:bank_transfer,cheque,cash,card',
            'reference'      => 'nullable|string|max:100',
            'amount'         => 'required|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        $payment->update([
            'paid_date'      => $data['paid_date'],
            'payment_method' => $data['payment_method'],
            'reference'      => $data['reference'] ?? null,
            'amount'         => $data['amount'],
            'notes'          => $data['notes'] ?? null,
            'status'         => 'paid',
            'recorded_by'    => auth()->id(),
        ]);

        // Activate tenancy if first payment recorded and tenancy is still pending
        if ($tenancy->status === 'pending') {
            $tenancy->update(['status' => 'active']);
        }

        ActivityLogger::log('payment_recorded', "Payment of " . config('nexsit.default_currency', 'RWF') . " " . number_format($data['amount'], 0) . " recorded", $tenancy);

        return back()->with('success', 'Payment recorded.');
    }

    public function terminate(Request $request, Tenancy $tenancy)
    {
        $request->validate([
            'termination_date'   => 'required|date',
            'termination_reason' => 'nullable|string|max:1000',
        ]);

        $tenancy->update([
            'status'             => 'terminated',
            'termination_date'   => $request->termination_date,
            'termination_reason' => $request->termination_reason,
        ]);

        ActivityLogger::log('terminated', "Tenancy {$tenancy->reference} terminated", $tenancy);

        return back()->with('success', 'Tenancy terminated.');
    }

    public function returnDeposit(Tenancy $tenancy)
    {
        $tenancy->update(['deposit_returned_at' => now()]);

        ActivityLogger::log('deposit_returned', "Deposit returned for {$tenancy->reference}", $tenancy);

        return back()->with('success', 'Deposit marked as returned.');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function generatePaymentSchedule(Tenancy $tenancy): void
    {
        $start     = Carbon::parse($tenancy->start_date);
        $end       = Carbon::parse($tenancy->end_date);
        $amount    = $tenancy->rent_amount;
        $companyId = $tenancy->company_id;

        $payments = [];
        $due      = $start->copy();

        while ($due->lte($end)) {
            $payments[] = [
                'company_id' => $companyId,
                'tenancy_id' => $tenancy->id,
                'amount'     => $amount,
                'due_date'   => $due->toDateString(),
                'status'     => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            match ($tenancy->rent_frequency) {
                'monthly'   => $due->addMonth(),
                'quarterly' => $due->addMonths(3),
                'yearly'    => $due->addYear(),
            };
        }

        TenancyPayment::insert($payments);
    }

    private function cardData(Tenancy $t): array
    {
        return [
            'id'             => $t->id,
            'reference'      => $t->reference,
            'status'         => $t->status,
            'start_date'     => $t->start_date->toDateString(),
            'end_date'       => $t->end_date->toDateString(),
            'rent_amount'    => $t->rent_amount,
            'rent_frequency' => $t->rent_frequency,
            'property'       => $t->property ? ['id' => $t->property->id, 'reference' => $t->property->reference, 'title' => $t->property->title] : null,
            'unit'           => $t->unit ? ['id' => $t->unit->id, 'unit_number' => $t->unit->unit_number] : null,
            'tenant'         => $t->tenant ? ['id' => $t->tenant->id, 'name' => $t->tenant->name] : null,
        ];
    }

    private function detail(Tenancy $t): array
    {
        return [
            'id'                  => $t->id,
            'reference'           => $t->reference,
            'status'              => $t->status,
            'start_date'          => $t->start_date->toDateString(),
            'end_date'            => $t->end_date->toDateString(),
            'rent_amount'         => $t->rent_amount,
            'rent_frequency'      => $t->rent_frequency,
            'deposit_amount'      => $t->deposit_amount,
            'deposit_returned_at' => $t->deposit_returned_at?->toDateString(),
            'auto_renew'          => $t->auto_renew,
            'renewal_notice_days' => $t->renewal_notice_days,
            'termination_date'    => $t->termination_date?->toDateString(),
            'termination_reason'  => $t->termination_reason,
            'notes'               => $t->notes,
            'created_at'          => $t->created_at->toDateString(),
            'property'  => $t->property ? ['id' => $t->property->id, 'reference' => $t->property->reference, 'title' => $t->property->title] : null,
            'unit'      => $t->unit ? ['id' => $t->unit->id, 'unit_number' => $t->unit->unit_number] : null,
            'tenant'    => $t->tenant ? ['id' => $t->tenant->id, 'name' => $t->tenant->name, 'email' => $t->tenant->email, 'phone' => $t->tenant->phone] : null,
            'deal'      => $t->deal ? ['id' => $t->deal->id, 'reference' => $t->deal->reference, 'title' => $t->deal->title] : null,
            'created_by' => $t->createdBy?->only('id', 'name'),
        ];
    }

    private function paymentData(TenancyPayment $p): array
    {
        return [
            'id'             => $p->id,
            'amount'         => $p->amount,
            'due_date'       => $p->due_date->toDateString(),
            'paid_date'      => $p->paid_date?->toDateString(),
            'status'         => $p->status,
            'payment_method' => $p->payment_method,
            'reference'      => $p->reference,
            'notes'          => $p->notes,
            'recorded_by'    => $p->recordedBy?->only('id', 'name'),
        ];
    }

    private function formData(): array
    {
        return [
            'properties' => Property::orderBy('reference')
                ->get(['id', 'reference', 'title'])
                ->map(fn ($p) => ['id' => $p->id, 'label' => "{$p->reference} — {$p->title}"]),
            'contacts'   => Contact::orderBy('first_name')->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'phone'])
                ->map(fn ($c) => [
                    'id'    => $c->id,
                    'name'  => trim("{$c->first_name} {$c->last_name}"),
                    'phone' => $c->phone,
                ]),
            'deals'      => Deal::whereIn('status', ['open', 'won'])->orderBy('reference')
                ->get(['id', 'reference', 'title'])
                ->map(fn ($d) => ['id' => $d->id, 'label' => "{$d->reference} — {$d->title}"]),
        ];
    }
}
