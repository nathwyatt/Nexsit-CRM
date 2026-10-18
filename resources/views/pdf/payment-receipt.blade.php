@php $agency = \App\Models\Company::publicProfile(auth()->user()?->company); @endphp
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; background: #fff; }
    .page { padding: 40px 44px; max-width: 540px; margin: 0 auto; }

    .header { display: table; width: 100%; margin-bottom: 30px; }
    .header-left { display: table-cell; vertical-align: top; }
    .header-right { display: table-cell; vertical-align: top; text-align: right; }
    .brand-name { font-size: 18px; font-weight: 700; color: #15803d; }
    .brand-sub  { font-size: 9px; color: #6b7280; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
    .receipt-title { font-size: 22px; font-weight: 700; color: #111827; }
    .receipt-num   { font-size: 11px; font-family: monospace; color: #6b7280; }
    .receipt-date  { font-size: 10px; color: #9ca3af; margin-top: 4px; }

    .divider { border: none; border-top: 2px solid #16a34a; margin: 18px 0; }

    .amount-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; border-radius: 10px; padding: 18px 20px; text-align: center; margin: 18px 0; }
    .amount-label { font-size: 11px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .amount-value { font-size: 28px; font-weight: 700; color: #15803d; margin-top: 4px; }

    .detail-table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    .detail-table tr td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 10.5px; }
    .detail-table tr td:first-child { color: #6b7280; width: 42%; }
    .detail-table tr td:last-child  { font-weight: 600; color: #111827; text-align: right; }
    .detail-table tr:last-child td  { border-bottom: none; }

    .status-badge { display: inline-block; background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }

    .footer { border-top: 1px solid #e5e7eb; margin-top: 28px; padding-top: 14px; text-align: center; }
    .footer-thanks { font-size: 13px; font-weight: 600; color: #15803d; margin-bottom: 6px; }
    .footer-contact { font-size: 9.5px; color: #9ca3af; }
    .footer-note { font-size: 8.5px; color: #d1d5db; margin-top: 8px; }
</style>
</head>
<body>
<div class="page">

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="brand-name">{{ $agency['name'] }}</div>
            <div class="brand-sub">Official Payment Receipt</div>
        </div>
        <div class="header-right">
            <div class="receipt-title">RECEIPT</div>
            <div class="receipt-num">#{{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }}</div>
            <div class="receipt-date">{{ $payment->paid_date?->format('d F Y') ?? now()->format('d F Y') }}</div>
        </div>
    </div>

    <hr class="divider">

    {{-- Amount --}}
    <div class="amount-box">
        <div class="amount-label">Amount Received</div>
        <div class="amount-value">RWF {{ number_format((int)$payment->amount) }}</div>
    </div>

    {{-- Payment Details --}}
    <table class="detail-table">
        <tr>
            <td>Received from</td>
            <td>{{ $payment->tenancy->tenant?->name ?? '—' }}</td>
        </tr>
        <tr>
            <td>Property</td>
            <td>{{ $payment->tenancy->property?->title ?? '—' }}</td>
        </tr>
        <tr>
            <td>Property Ref.</td>
            <td>{{ $payment->tenancy->property?->reference ?? '—' }}</td>
        </tr>
        <tr>
            <td>Tenancy Ref.</td>
            <td>{{ $payment->tenancy->reference }}</td>
        </tr>
        <tr>
            <td>Payment for</td>
            <td>{{ $payment->due_date?->format('F Y') ?? '—' }}</td>
        </tr>
        <tr>
            <td>Due date</td>
            <td>{{ $payment->due_date?->format('d F Y') ?? '—' }}</td>
        </tr>
        <tr>
            <td>Date received</td>
            <td>{{ $payment->paid_date?->format('d F Y') ?? now()->format('d F Y') }}</td>
        </tr>
        @if($payment->payment_method)
        <tr>
            <td>Payment method</td>
            <td>{{ ucfirst($payment->payment_method) }}</td>
        </tr>
        @endif
        @if($payment->reference)
        <tr>
            <td>Transaction ref.</td>
            <td>{{ $payment->reference }}</td>
        </tr>
        @endif
        <tr>
            <td>Status</td>
            <td><span class="status-badge">✓ Paid</span></td>
        </tr>
    </table>

    {{-- Footer --}}
    <div class="footer">
        <div class="footer-thanks">Thank you for your payment!</div>
        <div class="footer-contact">
            {{ $agency['name'] }} · {{ $agency['city'] }} · {{ $agency['phone'] }} · {{ $agency['email'] }}
        </div>
        <div class="footer-note">
            This is an official payment receipt. Please retain this document for your records.<br>
            Generated on {{ now()->format('d M Y H:i') }}
        </div>
    </div>

</div>
</body>
</html>
