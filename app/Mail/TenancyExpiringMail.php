<?php

namespace App\Mail;

use App\Models\Tenancy;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TenancyExpiringMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tenancy $tenancy,
        public int     $daysLeft
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Tenancy expiring in {$this->daysLeft} days — {$this->tenancy->reference}"
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.tenancy-expiring');
    }
}
