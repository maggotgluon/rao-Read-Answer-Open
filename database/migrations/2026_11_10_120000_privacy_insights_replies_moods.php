<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Data rights (delete with grace period, analytics consent), first-party analytics,
 * letter replies, mood stamps, in-app survey.
 * สิทธิ์ข้อมูล (ลบบัญชีมีเวลา 7 วัน, ความยินยอม analytics), analytics ของเราเอง,
 * ตอบกลับจดหมาย, แสตมป์อารมณ์, แบบสอบถามในแอป
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('delete_at')->nullable()->index();          // scheduled deletion
            $table->timestamp('analytics_consent_at')->nullable();        // null = no analytics
        });

        // Actions only, never content. / บันทึกการกระทำ ไม่มีเนื้อหา
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('space_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 40);
            $table->json('props')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['name', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('letter_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_prompt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('body', 500);
            $table->timestamps();
        });

        Schema::create('moods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('mood', 16);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });

        Schema::create('survey_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('survey', 20);
            $table->unsignedTinyInteger('score')->nullable();   // 1..5, null = dismissed
            $table->string('liked', 500)->nullable();
            $table->string('change', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'survey']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_responses');
        Schema::dropIfExists('moods');
        Schema::dropIfExists('letter_replies');
        Schema::dropIfExists('analytics_events');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['delete_at', 'analytics_consent_at']));
    }
};
