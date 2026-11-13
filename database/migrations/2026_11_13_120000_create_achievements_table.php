<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Achievement stamps, kept once earned (a broken streak never takes one away).
 * seen_by = member ids who already saw the "new stamp" celebration.
 * แสตมป์ความสำเร็จ ได้แล้วได้เลย ไม่ถูกริบคืน
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->string('key', 32);
            $table->timestamp('earned_at');
            $table->json('seen_by')->nullable();
            $table->unique(['space_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
