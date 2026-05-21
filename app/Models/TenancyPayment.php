<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class TenancyPayment extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'tenancy_id', 'amount', 'due_date', 'paid_date',
        'status', 'payment_method', 'reference', 'notes', 'recorded_by',
    ];

    protected $casts = [
        'due_date'  => 'date',
        'paid_date' => 'date',
        'amount'    => 'decimal:2',
    ];

    public function tenancy()
    {
        return $this->belongsTo(Tenancy::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->whereDate('due_date', '<', now());
    }
}
