<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'users',
        'lead_sources',
        'property_types',
        'amenities',
        'task_types',
        'document_types',
        'pipelines',
        'pipeline_stages',
        'contacts',
        'properties',
        'property_units',
        'property_owners',
        'leads',
        'deals',
        'tasks',
        'activities',
        'documents',
        'tenancies',
        'tenancy_payments',
        'custom_fields',
        'custom_field_values',
        'automation_rules',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'company_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->foreignId('company_id')
                      ->nullable()
                      ->after('id')
                      ->constrained()
                      ->cascadeOnDelete();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'company_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropForeign(['company_id']);
                    $t->dropColumn('company_id');
                });
            }
        }
    }
};
