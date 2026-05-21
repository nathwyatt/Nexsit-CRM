<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('plan_id');
            $table->enum('status', ['trial', 'active', 'past_due', 'cancelled', 'expired'])->default('trial');
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly');
            $table->enum('payment_method', ['stripe', 'manual', 'free'])->default('manual');
            $table->date('starts_at');
            $table->date('ends_at');
            $table->timestamp('trial_ends_at')->nullable();
            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->string('stripe_customer_id')->nullable();
            $table->text('notes')->nullable()->comment('Internal admin notes');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->foreign('plan_id')->references('id')->on('plans');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
