@php $agency = \App\Models\Company::publicProfile(auth()->user()?->company); @endphp
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; background: #fff; }
    .page { padding: 32px 36px; }

    /* Header */
    .header { border-bottom: 3px solid #16a34a; padding-bottom: 14px; margin-bottom: 20px; }
    .header-inner { display: table; width: 100%; }
    .header-logo { display: table-cell; vertical-align: middle; }
    .header-ref  { display: table-cell; vertical-align: middle; text-align: right; }
    .brand-name  { font-size: 20px; font-weight: 700; color: #15803d; letter-spacing: -0.5px; }
    .brand-sub   { font-size: 9px; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; }
    .ref-badge   { display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 6px; font-size: 10px; color: #166534; font-weight: 700; font-family: monospace; }

    /* Photo */
    .photo-wrap  { margin-bottom: 18px; border-radius: 8px; overflow: hidden; background: #f3f4f6; height: 220px; text-align: center; }
    .photo-wrap img { width: 100%; height: 220px; object-fit: cover; }
    .no-photo    { line-height: 220px; font-size: 48px; color: #d1d5db; }

    /* Badges */
    .badge-row   { margin-bottom: 14px; }
    .badge       { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 5px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue  { background: #dbeafe; color: #1e40af; }
    .badge-purple{ background: #f3e8ff; color: #6b21a8; }
    .badge-gray  { background: #f3f4f6; color: #374151; }

    /* Title */
    .prop-title  { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 3px; }
    .prop-loc    { font-size: 11px; color: #6b7280; margin-bottom: 10px; }
    .prop-price  { font-size: 22px; font-weight: 700; color: #16a34a; margin-bottom: 18px; }

    /* Specs grid */
    .specs-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .specs-table td { padding: 7px 10px; border: 1px solid #e5e7eb; font-size: 11px; }
    .specs-table td:first-child { color: #6b7280; width: 38%; background: #f9fafb; }
    .specs-table td:last-child  { font-weight: 600; color: #111827; }

    /* Two-column layout */
    .two-col { display: table; width: 100%; margin-bottom: 18px; }
    .col-left  { display: table-cell; width: 58%; padding-right: 14px; vertical-align: top; }
    .col-right { display: table-cell; width: 42%; vertical-align: top; }

    /* Description */
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #374151; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .description   { font-size: 10.5px; color: #374151; line-height: 1.7; }

    /* Amenities */
    .amenity-tag { display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2px 8px; font-size: 9.5px; color: #374151; margin: 2px; }

    /* Footer */
    .footer { border-top: 2px solid #e5e7eb; margin-top: 24px; padding-top: 12px; display: table; width: 100%; }
    .footer-left  { display: table-cell; vertical-align: middle; }
    .footer-right { display: table-cell; vertical-align: middle; text-align: right; }
    .footer-item  { font-size: 9.5px; color: #6b7280; margin-bottom: 2px; }
    .footer-disclaimer { font-size: 8.5px; color: #9ca3af; margin-top: 4px; }
    .watermark { font-size: 9px; color: #d1d5db; }
</style>
</head>
<body>
<div class="page">

    {{-- Header --}}
    <div class="header">
        <div class="header-inner">
            <div class="header-logo">
                <div class="brand-name">{{ $agency['name'] }}</div>
                <div class="brand-sub">{{ $agency['city'] }} · {{ $agency['email'] }} · {{ $agency['phone'] }}</div>
            </div>
            <div class="header-ref">
                <div class="ref-badge">{{ $property->reference }}</div>
                <div style="font-size:9px;color:#9ca3af;margin-top:4px;">{{ now()->format('d M Y') }}</div>
            </div>
        </div>
    </div>

    {{-- Photo --}}
    <div class="photo-wrap">
        @if($photo)
            <img src="{{ $photo }}" alt="{{ $property->title }}">
        @else
            <div class="no-photo">⌂</div>
        @endif
    </div>

    {{-- Badges --}}
    <div class="badge-row">
        @if($property->propertyType)
            <span class="badge badge-gray">{{ $property->propertyType->name }}</span>
        @endif
        <span class="badge badge-{{ $property->purpose === 'rent' ? 'purple' : 'blue' }}">
            For {{ $property->purpose === 'rent' ? 'Rent' : 'Sale' }}
        </span>
        <span class="badge badge-green">{{ ucwords(str_replace('_', ' ', $property->status)) }}</span>
    </div>

    {{-- Title & Price --}}
    <div class="prop-title">{{ $property->title }}</div>
    @if($property->community || $property->city)
        <div class="prop-loc">📍 {{ collect([$property->community, $property->city, $property->country])->filter()->join(', ') }}</div>
    @endif

    @php
        $price = $property->purpose === 'rent' ? $property->rent_price : $property->price;
        $priceLabel = $price
            ? 'RWF ' . number_format((int)$price) . ($property->purpose === 'rent' ? '/yr' : '')
            : 'Price on request';
    @endphp
    <div class="prop-price">{{ $priceLabel }}</div>

    {{-- Two-column: Specs + Description --}}
    <div class="two-col">
        <div class="col-left">
            <div class="section-title">Property Details</div>
            <table class="specs-table">
                <tr><td>Reference</td><td>{{ $property->reference }}</td></tr>
                @if($property->bedrooms !== null)
                    <tr><td>Bedrooms</td><td>{{ $property->bedrooms }}</td></tr>
                @endif
                @if($property->bathrooms !== null)
                    <tr><td>Bathrooms</td><td>{{ $property->bathrooms }}</td></tr>
                @endif
                @if($property->area_sqm)
                    <tr><td>Area</td><td>{{ number_format((float)$property->area_sqm, 0) }} sqm</td></tr>
                @endif
                @if($property->floor !== null)
                    <tr><td>Floor</td><td>{{ $property->floor }}{{ $property->total_floors ? ' of ' . $property->total_floors : '' }}</td></tr>
                @endif
                @if($property->building)
                    <tr><td>Building</td><td>{{ $property->building }}</td></tr>
                @endif
                @if($property->is_furnished !== null)
                    <tr><td>Furnishing</td><td>{{ $property->is_furnished ? 'Furnished' : 'Unfurnished' }}</td></tr>
                @endif
                @if($property->permit_number)
                    <tr><td>Permit No.</td><td>{{ $property->permit_number }}</td></tr>
                @endif
            </table>
        </div>

        <div class="col-right">
            @if($property->description)
                <div class="section-title">About this Property</div>
                <div class="description">{{ Str::limit($property->description, 600) }}</div>
            @endif
        </div>
    </div>

    {{-- Amenities --}}
    @if($property->amenities->isNotEmpty())
        <div style="margin-bottom:18px;">
            <div class="section-title">Amenities</div>
            @foreach($property->amenities->groupBy('category') as $cat => $items)
                @if($cat)
                    <div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:6px 0 3px;">{{ $cat }}</div>
                @endif
                @foreach($items as $a)
                    <span class="amenity-tag">{{ $a->name }}</span>
                @endforeach
            @endforeach
        </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        <div class="footer-left">
            <div class="footer-item">📍 Kigali, Rwanda</div>
            <div class="footer-item">📞 {{ $agency['phone'] }}</div>
            <div class="footer-item">✉ {{ $agency['email'] }}</div>
            <div class="footer-disclaimer">This document is for informational purposes only. All information is subject to change without notice.</div>
        </div>
        <div class="footer-right">
            <div style="font-size:11px;font-weight:700;color:#15803d;">{{ $agency['name'] }}</div>
            <div class="watermark">Generated {{ now()->format('d M Y H:i') }}</div>
        </div>
    </div>

</div>
</body>
</html>
