<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Together / apart log. / บันทึกช่วงอยู่ใกล้–ไกล
 *   space_mode_changes  each time long-distance mode is switched (first row = mode at install;
 *                       earlier switches were never recorded)
 *   space_distance_days one row per day both partners shared a fresh location: km only,
 *                       rounded to 10 km, never places or coordinates
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('space_mode_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->boolean('long_distance');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('changed_at')->useCurrent();
            $table->index(['space_id', 'changed_at']);
        });

        Schema::create('space_distance_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('km');
            $table->timestamps();
            $table->unique(['space_id', 'date']);
        });

        // Start every existing space's timeline today, in its current mode. / เริ่มบันทึกวันนี้
        $now = now();
        DB::table('spaces')->orderBy('id')->select(['id', 'long_distance'])->each(function ($s) use ($now) {
            DB::table('space_mode_changes')->insert([
                'space_id' => $s->id, 'long_distance' => (bool) $s->long_distance, 'changed_at' => $now,
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_distance_days');
        Schema::dropIfExists('space_mode_changes');
    }
};
