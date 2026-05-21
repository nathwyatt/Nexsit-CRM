<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('property_type_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('purpose', ['sale', 'rent', 'both'])->default('sale');
            $table->enum('status', ['available', 'under_offer', 'reserved', 'sold', 'rented', 'off_market'])->default('available');
            $table->tinyInteger('bedrooms')->nullable();
            $table->tinyInteger('bathrooms')->nullable();
            $table->decimal('area_sqm', 10, 2)->nullable();
            $table->smallInteger('floor')->nullable();
            $table->smallInteger('total_floors')->nullable();
            $table->string('building')->nullable();
            $table->string('community')->nullable();
            $table->string('city');
            $table->string('country', 2)->default('AE');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('price', 14, 2)->nullable();
            $table->decimal('rent_price', 14, 2)->nullable();
            $table->enum('rent_frequency', ['monthly', 'quarterly', 'yearly'])->nullable();
            $table->decimal('service_charge', 14, 2)->nullable();
            $table->boolean('is_furnished')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('featured_until')->nullable();
            $table->string('permit_number')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
