<?php

namespace App\Services;

use App\Models\AutomationRule;
use App\Models\Task;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class AutomationEngine
{
    public static function fire(string $trigger, Model $subject, array $context = []): void
    {
        try {
            $companyId = $subject->company_id ?? null;

            $rules = AutomationRule::where('is_active', true)
                ->where('trigger', $trigger)
                ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
                ->get();

            foreach ($rules as $rule) {
                if (self::checkConditions($rule->conditions ?? [], $subject, $context)) {
                    self::executeActions($rule->actions ?? [], $subject, $context);
                    $rule->increment('run_count');
                    $rule->updateQuietly(['last_run_at' => now()]);
                }
            }
        } catch (\Throwable $e) {
            Log::error("AutomationEngine error on trigger [{$trigger}]: " . $e->getMessage());
        }
    }

    private static function checkConditions(array $conditions, Model $subject, array $context): bool
    {
        foreach ($conditions as $condition) {
            $field    = $condition['field'] ?? '';
            $operator = $condition['operator'] ?? 'equals';
            $value    = $condition['value'] ?? '';

            $actual = data_get($subject, $field) ?? data_get($context, $field);

            $matches = match ($operator) {
                'equals'       => (string) $actual === (string) $value,
                'not_equals'   => (string) $actual !== (string) $value,
                'contains'     => str_contains((string) $actual, (string) $value),
                'greater_than' => is_numeric($actual) && $actual > $value,
                'less_than'    => is_numeric($actual) && $actual < $value,
                default        => true,
            };

            if (!$matches) return false;
        }

        return true;
    }

    private static function executeActions(array $actions, Model $subject, array $context): void
    {
        foreach ($actions as $action) {
            match ($action['type'] ?? '') {
                'create_task' => self::createTask($action, $subject),
                'assign_to'   => self::assignTo($action, $subject),
                default       => null,
            };
        }
    }

    private static function createTask(array $action, Model $subject): void
    {
        if (!method_exists($subject, 'tasks')) return;
        if (empty($subject->company_id)) return;

        Task::create([
            'company_id'    => $subject->company_id,
            'title'         => $action['title'] ?? 'Automated task',
            'priority'      => $action['priority'] ?? 'normal',
            'status'        => 'pending',
            'due_at'        => isset($action['due_days']) && is_numeric($action['due_days'])
                ? now()->addDays((int) $action['due_days'])
                : null,
            'taskable_id'   => $subject->getKey(),
            'taskable_type' => $subject->getMorphClass(),
            'assigned_to'   => $action['assigned_to'] ?? null,
        ]);
    }

    private static function assignTo(array $action, Model $subject): void
    {
        if (!empty($action['user_id']) && isset($subject->assigned_to)) {
            $subject->updateQuietly(['assigned_to' => $action['user_id']]);
        }
    }
}
