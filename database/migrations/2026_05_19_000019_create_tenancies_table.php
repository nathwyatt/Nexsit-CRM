<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenancies', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('property_units')->nullOnDelete();
            $table->foreignId('tenant_id')->constrained('contacts')->cascadeOnDelete();
            $table->foreignId('deal_id')->nullable()->constrained()->nullOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('rent_amount', 14, 2);
            $table->enum('rent_frequency', ['monthly', 'quarterly', 'yearly'])->default('yearly');
            $table->decimal('deposit_amount', 14, 2)->nullable();
            $table->timestamp('deposit_returned_at')->nullable();
            $table->enum('status', ['pending', 'active', 'expired', 'terminated'])->default('pending');
            $table->boolean('auto_renew')->default(false);
            $table->smallInteger('renewal_notice_days')->default(90);
            $table->date('termination_date')->nullable();
            $table->text('termination_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenancies');
    }
};
