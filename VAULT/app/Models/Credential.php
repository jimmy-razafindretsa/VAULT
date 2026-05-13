<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Credential extends Model
{
    protected $fillable = [
        'name',
        'url',
        'account_id',
        'password',
        'notes',
    ];

    protected $hidden = [
        'password',
        'notes', // Hide notes from basic serialization by default for security
    ];

    protected function casts(): array
    {
        return [
            'account_id' => 'encrypted',
            'password' => 'encrypted',
            'notes' => 'encrypted',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
