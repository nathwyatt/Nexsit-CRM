<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'to_email', 'to_name', 'subject', 'status', 'error',
    ];
}
