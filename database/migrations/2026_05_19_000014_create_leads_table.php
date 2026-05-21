<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lead_source_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source_detail')->nullable();
            $table->enum('status', ['new', 'contacted', 'qualified', 'converted', 'lost'])->default('new');
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('purpose', ['buy', 'rent'])->default('buy');
            $table->decimal('budget_min', 14, 2)->nullable();
            $table->decimal('budget_max', 14, 2)->nullable();
            $table->tinyInteger('bedrooms_wanted')->nullable();
            $table->text('message')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('converted_at')->nullable();
            $table->unsignedBigInteger('converted_to_deal')->nullable();
            $table->text('lost_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
