<?php

namespace App\Mail;

use App\Models\Lead;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewEnquiryNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Lead     $lead,
        public Property $property
    ) {}

    public function envelope(): Envelope
    {
        $name = $this->lead->contact?->name ?? 'Someone';
        return new Envelope(subject: "New Enquiry: {$this->property->title} — {$name}");
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.new-enquiry');
    }
}
