@component('mail::message')
# Tenancy Expiring in {{ $daysLeft }} {{ Str::plural('Day', $daysLeft) }}

@if($daysLeft <= 7)
@component('mail::panel')
⚠️ **Urgent:** This tenancy expires very soon. Please take action immediately.
@endcomponent
@endif

**Tenancy:** `{{ $tenancy->reference }}`
**Property:** {{ $tenancy->property?->title ?? '—' }}
**End Date:** {{ $tenancy->end_date?->format('d F Y') }}
**Days Remaining:** {{ $daysLeft }}

**Tenant:** {{ $tenancy->contact?->name ?? '—' }}
**Contact:** {{ $tenancy->contact?->phone ?? $tenancy->contact?->email ?? '—' }}

---

**Recommended Actions**

@component('mail::table')
| Action | When |
|--------|------|
| Contact tenant about renewal | Now |
| Prepare renewal agreement | 2 weeks before expiry |
| Schedule property inspection | 1 week before expiry |
@endcomponent

@component('mail::button', ['url' => url('/tenancies/' . $tenancy->id), 'color' => 'green'])
View Tenancy
@endcomponent

Thanks,<br>
**Nexsit Properties CRM**
@endcomponent
