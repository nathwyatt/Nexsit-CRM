<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; background: #fff; }
    .page { padding: 32px 40px; }

    .header { border-bottom: 3px solid #16a34a; padding-bottom: 14px; margin-bottom: 22px; display: table; width: 100%; }
    .brand-name { font-size: 18px; font-weight: 700; color: #15803d; }
    .brand-sub  { font-size: 9px; color: #6b7280; letter-spacing: 1.5px; text-transform: uppercase; }
    .doc-title  { display: table-cell; vertical-align: middle; text-align: right; font-size: 15px; font-weight: 700; color: #111827; }

    h2 { font-size: 12px; font-weight: 700; color: #111827; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .detail-table td { padding: 6px 10px; border: 1px solid #e5e7eb; font-size: 10.5px; }
    .detail-table td:first-child { background: #f9fafb; color: #6b7280; width: 35%; }
    .detail-table td:last-child   { font-weight: 500; }

    .two-col { display: table; width: 100%; }
    .col { display: table-cell; width: 50%; vertical-align: top; }
    .col:first-child { padding-right: 10px; }
    .col:last-child  { padding-left: 10px; }

    .payments-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
    .payments-table th { background: #16a34a; color: #fff; padding: 6px 8px; text-align: left; font-weight: 600; }
    .payments-table td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; }
    .payments-table tr:nth-child(even) td { background: #f9fafb; }
    .status-paid { color: #15803d; font-weight: 600; }
    .status-pending { color: #92400e; }
    .status-overdue { color: #dc2626; font-weight: 600; }

    .terms { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 14px; margin: 14px 0; }
    .terms p { font-size: 10px; color: #374151; line-height: 1.7; margin-bottom: 6px; }
    .terms p:last-child { margin-bottom: 0; }

    .sig-area { margin-top: 28px; display: table; width: 100%; }
    .sig-block { display: table-cell; width: 50%; vertical-align: top; padding-right: 20px; }
    .sig-block:last-child { padding-right: 0; padding-left: 20px; }
    .sig-line { border-top: 1px solid #374151; margin-top: 36px; padding-top: 5px; font-size: 10px; color: #6b7280; }

    .footer { border-top: 1px solid #e5e7eb; margin-top: 22px; padding-top: 10px; font-size: 9px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
<div class="page">

    {{-- Header --}}
    <div class="header">
        <div style="display:table-cell;vertical-align:middle;">
            <div class="brand-name">Nexsit Properties</div>
            <div class="brand-sub">Kigali, Rwanda</div>
        </div>
        <div class="doc-title">Tenancy Agreement<br><span style="font-size:11px;font-weight:400;color:#6b7280;">{{ $tenancy->reference }}</span></div>
    </div>

    {{-- Parties --}}
    <div class="two-col">
        <div class="col">
            <h2>Landlord / Owner</h2>
            @php $owner = $tenancy->property?->owners?->first()?->contact; @endphp
            <table class="detail-table">
                <tr><td>Name</td><td>{{ $owner?->name ?? 'Nexsit Properties Ltd.' }}</td></tr>
                <tr><td>Phone</td><td>{{ $owner?->phone ?? '+250 78 000 0000' }}</td></tr>
                <tr><td>Email</td><td>{{ $owner?->email ?? 'info@nexsit.rw' }}</td></tr>
            </table>
        </div>
        <div class="col">
            <h2>Tenant</h2>
            <table class="detail-table">
                <tr><td>Name</td><td>{{ $tenancy->contact?->name ?? '—' }}</td></tr>
                <tr><td>Phone</td><td>{{ $tenancy->contact?->phone ?? '—' }}</td></tr>
                <tr><td>Email</td><td>{{ $tenancy->contact?->email ?? '—' }}</td></tr>
                @if($tenancy->contact?->nationality)
                    <tr><td>Nationality</td><td>{{ $tenancy->contact->nationality }}</td></tr>
                @endif
            </table>
        </div>
    </div>

    {{-- Property --}}
    <h2>Property Details</h2>
    <table class="detail-table">
        <tr><td>Property</td><td>{{ $tenancy->property?->title ?? '—' }}</td></tr>
        <tr><td>Reference</td><td>{{ $tenancy->property?->reference ?? '—' }}</td></tr>
        <tr><td>Location</td><td>{{ collect([$tenancy->property?->community, $tenancy->property?->city])->filter()->join(', ') ?: 'Kigali, Rwanda' }}</td></tr>
        @if($tenancy->property?->bedrooms !== null)
            <tr><td>Bedrooms</td><td>{{ $tenancy->property->bedrooms }}</td></tr>
        @endif
        @if($tenancy->property?->area_sqm)
            <tr><td>Area</td><td>{{ number_format((float)$tenancy->property->area_sqm) }} sqm</td></tr>
        @endif
    </table>

    {{-- Tenancy Terms --}}
    <h2>Tenancy Terms</h2>
    <table class="detail-table">
        <tr><td>Tenancy Ref.</td><td>{{ $tenancy->reference }}</td></tr>
        <tr><td>Start Date</td><td>{{ $tenancy->start_date?->format('d F Y') ?? '—' }}</td></tr>
        <tr><td>End Date</td><td>{{ $tenancy->end_date?->format('d F Y') ?? '—' }}</td></tr>
        @if($tenancy->start_date && $tenancy->end_date)
            <tr><td>Duration</td><td>{{ $tenancy->start_date->diffInMonths($tenancy->end_date) }} months</td></tr>
        @endif
        <tr><td>Annual Rent</td><td>RWF {{ number_format((int)$tenancy->rent_amount) }}</td></tr>
        <tr><td>Rent Frequency</td><td>{{ ucfirst($tenancy->rent_frequency ?? 'monthly') }}</td></tr>
        @if($tenancy->deposit_amount)
            <tr><td>Security Deposit</td><td>RWF {{ number_format((int)$tenancy->deposit_amount) }}</td></tr>
        @endif
        <tr><td>Status</td><td>{{ ucfirst($tenancy->status) }}</td></tr>
    </table>

    {{-- Payment Schedule --}}
    @if($tenancy->payments->isNotEmpty())
        <h2>Payment Schedule</h2>
        <table class="payments-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Due Date</th>
                    <th>Amount (RWF)</th>
                    <th>Status</th>
                    <th>Paid On</th>
                </tr>
            </thead>
            <tbody>
                @foreach($tenancy->payments->sortBy('due_date') as $i => $p)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $p->due_date?->format('d M Y') ?? '—' }}</td>
                        <td>{{ number_format((int)$p->amount) }}</td>
                        <td class="status-{{ $p->status }}">{{ ucfirst($p->status) }}</td>
                        <td>{{ $p->paid_at?->format('d M Y') ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    {{-- Terms --}}
    <h2>Terms &amp; Conditions</h2>
    <div class="terms">
        <p><strong>1. Payment.</strong> Rent is due on the dates specified in the payment schedule above. Late payments may incur a penalty as agreed between the parties.</p>
        <p><strong>2. Security Deposit.</strong> The security deposit is held against damages beyond normal wear and tear and will be returned within 30 days of the tenancy end date, less any deductions.</p>
        <p><strong>3. Maintenance.</strong> The tenant shall keep the property in good condition. Any damage caused by the tenant shall be repaired at the tenant's expense.</p>
        <p><strong>4. Sub-letting.</strong> The tenant may not sublet the property or any part thereof without the prior written consent of the landlord.</p>
        <p><strong>5. Termination.</strong> Either party may terminate this agreement with 30 days written notice, subject to the terms herein. Early termination may result in forfeiture of the security deposit.</p>
        <p><strong>6. Governing Law.</strong> This agreement shall be governed by the laws of the Republic of Rwanda.</p>
    </div>

    {{-- Signatures --}}
    <div class="sig-area">
        <div class="sig-block">
            <p style="font-size:10.5px;font-weight:700;margin-bottom:4px;">Landlord / Authorised Agent</p>
            <p style="font-size:10px;color:#374151;">{{ $owner?->name ?? 'Nexsit Properties Ltd.' }}</p>
            <div class="sig-line">Signature &amp; Date</div>
        </div>
        <div class="sig-block">
            <p style="font-size:10.5px;font-weight:700;margin-bottom:4px;">Tenant</p>
            <p style="font-size:10px;color:#374151;">{{ $tenancy->contact?->name ?? '—' }}</p>
            <div class="sig-line">Signature &amp; Date</div>
        </div>
    </div>

    <div class="footer">
        Nexsit Properties · Kigali, Rwanda · info@nexsit.rw · +250 78 000 0000 · Generated {{ now()->format('d M Y H:i') }}
    </div>

</div>
</body>
</html>
