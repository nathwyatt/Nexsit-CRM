<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class EnquiryConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public array $agency;

    public function __construct(
        public string   $firstName,
        public Property $property
    ) {
        $company = DB::table('companies')->where('id', $property->company_id)->first();
        $this->agency = Company::publicProfile($company);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'We received your enquiry — ' . $this->agency['name']);
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.enquiry-confirmation');
    }
}
