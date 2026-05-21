<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'task_type_id', 'title', 'description', 'due_at',
        'completed_at', 'priority', 'status', 'assigned_to', 'created_by',
        'taskable_id', 'taskable_type',
    ];

    protected $casts = [
        'due_at'       => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function taskType()
    {
        return $this->belongsTo(TaskType::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function taskable()
    {
        return $this->morphTo();
    }
}
