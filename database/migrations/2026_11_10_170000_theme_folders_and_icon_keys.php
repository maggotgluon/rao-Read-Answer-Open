<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Themes become folders (dusk/daytime/night), reactions become icon keys, special days get an icon.
 * ธีมเป็นโฟลเดอร์ ปฏิกิริยาเป็นชื่อไอคอน วันพิเศษมีไอคอน
 */
return new class extends Migration
{
    private const THEMES = ['blush' => 'dusk', 'paper' => 'daytime', 'candle' => 'night'];

    private const REACTIONS = ['❤️' => 'love', '😂' => 'yay', '🥹' => 'aww', '😍' => 'crush', '🔥' => 'melting', '🫶' => 'sweet'];

    public function up(): void
    {
        Schema::create('theme_settings', function (Blueprint $table) {
            $table->string('theme', 40)->primary();
            $table->boolean('enabled')->default(true);
            $table->string('tier', 10)->default('free');   // free | premium
            $table->timestamps();
        });

        foreach (self::THEMES as $old => $new) {
            DB::table('users')->where('theme', $old)->update(['theme' => $new]);
        }
        Schema::table('users', fn (Blueprint $t) => $t->string('theme', 40)->default('dusk')->change());
        foreach (self::REACTIONS as $emoji => $key) {
            DB::table('moment_reactions')->where('emoji', $emoji)->update(['emoji' => $key]);
        }

        Schema::table('special_days', fn (Blueprint $t) => $t->string('icon', 40)->nullable()->after('emoji'));
    }

    public function down(): void
    {
        Schema::table('special_days', fn (Blueprint $t) => $t->dropColumn('icon'));
        foreach (self::REACTIONS as $emoji => $key) {
            DB::table('moment_reactions')->where('emoji', $key)->update(['emoji' => $emoji]);
        }
        foreach (self::THEMES as $old => $new) {
            DB::table('users')->where('theme', $new)->update(['theme' => $old]);
        }
        Schema::dropIfExists('theme_settings');
    }
};
