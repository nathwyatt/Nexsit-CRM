<?php

namespace App\Mail;

use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnquiryConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string   $firstName,
        public Property $property
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'We received your enquiry — Nexsit Properties');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.enquiry-confirmation');
    }
}
