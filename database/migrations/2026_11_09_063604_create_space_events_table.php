<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Couple events (birthdays, key dates…) per space, optionally yearly,
     * plus the space's own anniversary date.
     * วันสำคัญของคู่ (วันเกิด วันพิเศษ) ต่อ space และวันครบรอบของ space
     */
    public function up(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            $table->date('anniversary_on')->nullable()->after('timezone');
        });

        Schema::create('space_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('kind', 12)->default('other');      // birthday | special | other
            $table->string('title', 80);
            $table->date('date');
            $table->boolean('repeats_yearly')->default(false);
            $table->timestamps();

            $table->index(['space_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_events');
        Schema::table('spaces', function (Blueprint $table) {
            $table->dropColumn('anniversary_on');
        });
    }
};
