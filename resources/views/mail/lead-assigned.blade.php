@component('mail::message')
# Lead Assigned to You

Hi **{{ $agent->name }}**,

A lead has been assigned to you in Nexsit CRM.

**Lead Details**

| Field | Value |
|-------|-------|
| Reference | `{{ $lead->reference }}` |
| Contact | {{ $lead->contact?->name ?? '—' }} |
| Phone | {{ $lead->contact?->phone ?? '—' }} |
| Purpose | {{ ucfirst($lead->purpose ?? 'N/A') }} |
| Status | {{ ucfirst($lead->status) }} |
@if($lead->budget_max)
| Budget | RWF {{ number_format((int) $lead->budget_max) }} |
@endif

@if($lead->message)
**Message:**
> {{ $lead->message }}
@endif

@component('mail::button', ['url' => url('/leads/' . $lead->id), 'color' => 'green'])
Open Lead
@endcomponent

Please follow up with this lead as soon as possible.

Thanks,<br>
**Nexsit Properties CRM**
@endcomponent
