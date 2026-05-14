<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CredentialShare extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'name',
        'url',
        'account_id',
        'password',
        'notes',
        'token',
        'status',
    ];

    protected $casts = [
        'password' => 'encrypted',
        'notes' => 'encrypted',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
