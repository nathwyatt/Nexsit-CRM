<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\TenancyPayment;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfController extends Controller
{
    public function propertySheet(Property $property)
    {
        $property->load(['propertyType', 'amenities', 'owners.contact', 'media']);

        $photo = $property->getFirstMediaUrl('photos');

        $pdf = Pdf::loadView('pdf.property-sheet', [
            'property' => $property,
            'photo'    => $photo,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("property-{$property->reference}.pdf");
    }

    public function tenancyAgreement(Tenancy $tenancy)
    {
        $tenancy->load(['property.owners.contact', 'contact', 'payments']);

        $pdf = Pdf::loadView('pdf.tenancy-agreement', [
            'tenancy' => $tenancy,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("tenancy-{$tenancy->reference}.pdf");
    }

    public function paymentReceipt(TenancyPayment $payment)
    {
        $payment->load(['tenancy.property', 'tenancy.tenant']);

        $pdf = Pdf::loadView('pdf.payment-receipt', [
            'payment' => $payment,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("receipt-{$payment->tenancy->reference}-{$payment->id}.pdf");
    }
}
