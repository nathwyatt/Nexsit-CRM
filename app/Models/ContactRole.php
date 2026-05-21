<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactRole extends Model
{
    public $incrementing = false;
    public $timestamps   = false;

    protected $primaryKey = null;

    protected $fillable = ['contact_id', 'role', 'notes', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}
