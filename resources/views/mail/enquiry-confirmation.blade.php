@component('mail::message')
# Thank you for your enquiry!

Hi **{{ $firstName }}**,

We have received your enquiry for **{{ $property->title }}** and one of our agents will be in touch with you shortly.

**What happens next?**

@component('mail::panel')
Our team typically responds within **24 hours**. In the meantime, feel free to browse more properties on our website.
@endcomponent

**Property you enquired about:**

- **Title:** {{ $property->title }}
- **Location:** {{ collect([$property->community, $property->city])->filter()->join(', ') ?: 'Kigali, Rwanda' }}
- **Reference:** {{ $property->reference }}

@component('mail::button', ['url' => url('/listings/' . $property->reference), 'color' => 'green'])
View Property Online
@endcomponent

If you have any urgent questions, please contact us:

📞 {{ $agency['phone'] }}
✉ {{ $agency['email'] }}
📍 {{ $agency['city'] }}

Thanks,<br>
**{{ $agency['name'] }}**
@endcomponent
