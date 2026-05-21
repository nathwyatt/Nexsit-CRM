@component('mail::message')
# New Property Enquiry

A new enquiry has been submitted on the Nexsit Properties website.

**Property:** {{ $property->title }} ({{ $property->reference }})
**Purpose:** {{ ucfirst($lead->purpose ?? 'N/A') }}

---

**Contact Details**

| Field | Value |
|-------|-------|
| Name | {{ $lead->contact?->name ?? '—' }} |
| Phone | {{ $lead->contact?->phone ?? '—' }} |
| Email | {{ $lead->contact?->email ?? 'Not provided' }} |

@if($lead->message)
**Message from enquirer:**

> {{ $lead->message }}
@endif

---

**Lead Reference:** `{{ $lead->reference }}`

@component('mail::button', ['url' => url('/leads/' . $lead->id), 'color' => 'green'])
View Lead in CRM
@endcomponent

This enquiry was automatically created from the public website.

Thanks,<br>
**Nexsit Properties CRM**
@endcomponent
