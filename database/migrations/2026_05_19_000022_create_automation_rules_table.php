<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger', [
                'lead_created',
                'lead_assigned',
                'lead_status_changed',
                'deal_created',
                'deal_stage_changed',
                'deal_won',
                'deal_lost',
                'property_published',
                'tenancy_expiring_30d',
                'tenancy_expiring_7d',
                'task_overdue',
            ]);
            $table->json('conditions')->nullable();
            $table->json('actions');
            $table->boolean('is_active')->default(true);
            $table->bigInteger('run_count')->default(0);
            $table->timestamp('last_run_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_rules');
    }
};
