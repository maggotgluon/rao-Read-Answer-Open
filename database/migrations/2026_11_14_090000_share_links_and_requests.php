<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Public share links (one card picture each, owner can turn off any time) and the
 * partner's OK for sharing their postcard or a letter pair.
 * ลิงก์แชร์สาธารณะ (รูปการ์ด 1 รูป ปิดได้ทุกเมื่อ) และการขออนุญาตจากคู่
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('share_links', function (Blueprint $table) {
            $table->id();
            $table->string('token', 48)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->string('item_type', 16);
            $table->unsignedBigInteger('item_id');
            $table->string('path', 120);
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('height');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->timestamps();
            $table->index(['item_type', 'item_id']);
        });

        Schema::create('share_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('item_type', 16);
            $table->unsignedBigInteger('item_id');
            $table->string('status', 12)->default('pending');
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
            $table->index(['item_type', 'item_id', 'requester_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('share_requests');
        Schema::dropIfExists('share_links');
    }
};
