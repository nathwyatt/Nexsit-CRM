<?php

namespace App\Mail;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Lead $lead,
        public User $agent
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Lead assigned to you: {$this->lead->reference}");
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.lead-assigned');
    }
}
