<?php

namespace App\Services;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    public static function log(
        string $action,
        string $description,
        Model $subject,
        array $oldValues = [],
        array $newValues = []
    ): void {
        if (!auth()->hasUser()) {
            return;
        }

        Activity::create([
            'user_id'      => auth()->id(),
            'action'       => $action,
            'description'  => $description,
            'old_values'   => $oldValues ?: null,
            'new_values'   => $newValues ?: null,
            'subject_id'   => $subject->getKey(),
            'subject_type' => $subject->getMorphClass(),
            'ip_address'   => request()->ip(),
            'created_at'   => now(),
        ]);
    }
}
