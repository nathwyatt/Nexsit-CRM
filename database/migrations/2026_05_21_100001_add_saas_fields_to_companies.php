<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('email')->nullable()->after('slug');
            $table->string('phone')->nullable()->after('email');
            $table->string('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('country')->default('Rwanda')->after('city');
            $table->string('timezone')->default('Africa/Kigali')->after('country');
            $table->timestamp('trial_ends_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['email', 'phone', 'address', 'city', 'country', 'timezone', 'trial_ends_at']);
        });
    }
};
