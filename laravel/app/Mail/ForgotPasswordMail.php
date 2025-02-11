<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordMail extends Mailable
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
        return $this->view('sendMailForgotPassword')  // Blade template created earlier
        ->subject('Quên mật khẩu')
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
