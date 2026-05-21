<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'document_type_id', 'name', 'disk', 'path',
        'size', 'mime_type', 'uploaded_by', 'documentable_id',
        'documentable_type', 'expires_at', 'notes',
    ];

    protected $casts = [
        'expires_at' => 'date',
        'size'       => 'integer',
    ];

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function documentable()
    {
        return $this->morphTo();
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expires_at &&
            !$this->expires_at->isPast() &&
            $this->expires_at->lte(now()->addDays($days));
    }

    public function humanSize(): string
    {
        $bytes = $this->size;
        if ($bytes < 1024)       return "{$bytes} B";
        if ($bytes < 1048576)    return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }
}
