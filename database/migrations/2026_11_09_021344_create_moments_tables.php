<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Moments: text and/or up to 4 photos. Drafts are visible only to the author.
     * ช่วงเวลา: ข้อความและ/หรือรูปไม่เกิน 4 รูป ร่างเห็นได้เฉพาะเจ้าของ
     */
    public function up(): void
    {
        Schema::create('moments', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body')->nullable();
            $table->string('status', 10)->default('draft');   // draft | posted
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();

            $table->index(['space_id', 'status', 'posted_at']);
        });

        Schema::create('moment_media', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('moment_id')->constrained()->cascadeOnDelete();
            $table->string('path');                             // private disk, random name
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->unsignedInteger('size');
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('moment_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('emoji', 16);
            $table->timestamps();

            $table->unique(['moment_id', 'user_id']);           // 1 reaction per person
        });

        Schema::create('moment_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_comments');
        Schema::dropIfExists('moment_reactions');
        Schema::dropIfExists('moment_media');
        Schema::dropIfExists('moments');
    }
};
