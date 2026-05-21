<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, BelongsToCompany;

    protected $fillable = [
        'company_id', 'team_id', 'name', 'email', 'password',
        'avatar', 'phone', 'role', 'is_active', 'last_login_at', 'is_super_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'is_super_admin'    => 'boolean',
        ];
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
