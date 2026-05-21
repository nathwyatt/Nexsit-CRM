<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->default(0);
            $table->unsignedSmallInteger('max_users')->nullable()->comment('null = unlimited');
            $table->unsignedSmallInteger('max_properties')->nullable();
            $table->unsignedSmallInteger('max_leads')->nullable();
            $table->json('features')->nullable()->comment('Array of feature strings');
            $table->string('badge_color')->default('emerald')->comment('Tailwind color name');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('stripe_price_id_monthly')->nullable();
            $table->string('stripe_price_id_yearly')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
