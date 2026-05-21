<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_roles', function (Blueprint $table) {
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['buyer', 'tenant', 'owner']);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->primary(['contact_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_roles');
    }
};
