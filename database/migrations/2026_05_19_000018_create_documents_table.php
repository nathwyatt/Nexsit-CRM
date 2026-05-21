<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('disk')->default('local');
            $table->string('path');
            $table->bigInteger('size');
            $table->string('mime_type');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('documentable_id');
            $table->string('documentable_type');
            $table->date('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['documentable_id', 'documentable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
