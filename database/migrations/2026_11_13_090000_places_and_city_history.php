<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Places (pinned by the couple) and the optional automatic city history.
 * สถานที่ที่คู่ปักไว้ และประวัติเมืองแบบอัตโนมัติ (เลือกเปิดเอง)
 *   places        name/kind/city/note/date, no coordinates (list only, no map)
 *   moments.place_id, space_events.place_id   optional link to a place
 *   users.keep_city_history   off by default
 *   city_visits   one row per city stay: city name + from/to dates only
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 80);
            $table->string('kind', 16)->default('other');
            $table->string('city', 100)->nullable();
            $table->string('note', 300)->nullable();
            $table->date('date')->nullable();
            $table->timestamps();
            $table->index(['space_id', 'kind']);
        });

        Schema::table('moments', function (Blueprint $table) {
            $table->foreignId('place_id')->nullable()->after('space_event_id')->constrained()->nullOnDelete();
        });
        Schema::table('space_events', function (Blueprint $table) {
            $table->foreignId('place_id')->nullable()->after('kind')->constrained()->nullOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('keep_city_history')->default(false)->after('share_location');
        });

        Schema::create('city_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('city', 100);
            $table->date('from_date');
            $table->date('to_date')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'from_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('city_visits');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('keep_city_history'));
        Schema::table('space_events', fn (Blueprint $t) => $t->dropConstrainedForeignId('place_id'));
        Schema::table('moments', fn (Blueprint $t) => $t->dropConstrainedForeignId('place_id'));
        Schema::dropIfExists('places');
    }
};
