<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class TaskType extends Model
{
    use BelongsToCompany;

    protected $fillable = ['company_id', 'name', 'icon', 'is_active', 'position'];

    protected $casts = ['is_active' => 'boolean'];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
