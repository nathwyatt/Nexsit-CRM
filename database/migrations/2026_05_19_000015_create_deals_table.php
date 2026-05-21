<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('pipeline_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stage_id')->constrained('pipeline_stages')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->enum('type', ['sale', 'rental'])->default('sale');
            $table->enum('status', ['open', 'won', 'lost', 'on_hold'])->default('open');
            $table->decimal('value', 14, 2)->nullable();
            $table->decimal('commission_pct', 5, 2)->nullable();
            $table->decimal('commission', 14, 2)->nullable();
            $table->string('currency', 3)->default('AED');
            $table->date('expected_close_date')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('lost_reason')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Add the FK from leads → deals now that deals table exists
        Schema::table('leads', function (Blueprint $table) {
            $table->foreign('converted_to_deal')->references('id')->on('deals')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['converted_to_deal']);
        });
        Schema::dropIfExists('deals');
    }
};
