<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InviteUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public $inviteData;

    /**
     * Create a new message instance.
     */
    public function __construct($inviteData)
    {
        $this->inviteData = $inviteData;
    }


    public function build()
    {
        return $this->view('sendMail')  // Blade template created earlier
        ->subject('Bạn có thông báo mới từ Novaedu')
            ->with('inviteData', $this->inviteData);
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
