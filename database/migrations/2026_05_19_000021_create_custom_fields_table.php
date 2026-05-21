<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->enum('module', ['lead', 'deal', 'contact', 'property', 'tenancy']);
            $table->string('label');
            $table->string('key');
            $table->enum('type', ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'url', 'textarea']);
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_shown_in_list')->default(false);
            $table->tinyInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['module', 'key']);
        });

        Schema::create('custom_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_field_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('entity_id');
            $table->string('entity_type');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['custom_field_id', 'entity_id', 'entity_type']);
            $table->index(['entity_id', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_field_values');
        Schema::dropIfExists('custom_fields');
    }
};
