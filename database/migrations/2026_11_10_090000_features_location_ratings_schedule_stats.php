<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * features          = on/off + free/premium per feature (admin)
     * spaces            = premium (given by admin), long-distance mode
     * users             = location (rounded ~5 km, city, timezone) + last seen
     * prompts.fit       = together | any | apart (long-distance)
     * daily_prompts     = slot main | bonus (admin-scheduled extra on the same day)
     * prompt_ratings    = private 👍/👎 per person per day
     * scheduled_prompts = admin sets a question/quest for a date
     * special_days      = admin adds a day shown in every space (e.g. Valentine's)
     * activity_days     = who was active on which day (counts only, for the dashboard)
     */
    public function up(): void
    {
        Schema::create('features', function (Blueprint $table) {
            $table->string('key', 30)->primary();
            $table->boolean('enabled')->default(true);
            $table->string('tier', 10)->default('free');   // free | premium
            $table->timestamps();
        });

        Schema::table('spaces', function (Blueprint $table) {
            $table->boolean('premium')->default(false);
            $table->boolean('long_distance')->default(false);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('share_location')->default(false);
            $table->decimal('loc_lat', 7, 4)->nullable();
            $table->decimal('loc_lng', 7, 4)->nullable();
            $table->string('loc_city', 100)->nullable();
            $table->string('loc_tz', 64)->nullable();
            $table->timestamp('loc_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
        });

        Schema::table('prompts', function (Blueprint $table) {
            $table->string('fit', 10)->nullable();   // null = default (question: any, quest: together)
        });

        Schema::table('daily_prompts', function (Blueprint $table) {
            $table->string('slot', 10)->default('main');
            // Add the new unique first (MySQL keeps an index for the space_id foreign key).
            $table->unique(['space_id', 'date', 'slot']);
        });
        Schema::table('daily_prompts', function (Blueprint $table) {
            $table->dropUnique(['space_id', 'date']);
        });

        Schema::create('prompt_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_prompt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('value');   // 1 | -1
            $table->timestamps();

            $table->unique(['daily_prompt_id', 'user_id']);
        });

        Schema::create('scheduled_prompts', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('prompt_id')->constrained()->cascadeOnDelete();
            $table->string('audience', 15)->default('all');   // all | long_distance | together
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['date', 'audience']);
        });

        Schema::create('special_days', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('title_th', 100)->nullable();
            $table->string('title_en', 100)->nullable();
            $table->string('emoji', 16)->nullable();
            $table->boolean('repeats_yearly')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('activity_days', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');

            $table->primary(['user_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_days');
        Schema::dropIfExists('special_days');
        Schema::dropIfExists('scheduled_prompts');
        Schema::dropIfExists('prompt_ratings');
        Schema::table('daily_prompts', function (Blueprint $table) {
            $table->unique(['space_id', 'date']);
        });
        Schema::table('daily_prompts', function (Blueprint $table) {
            $table->dropUnique(['space_id', 'date', 'slot']);
            $table->dropColumn('slot');
        });
        Schema::table('prompts', fn (Blueprint $t) => $t->dropColumn('fit'));
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['share_location', 'loc_lat', 'loc_lng', 'loc_city', 'loc_tz', 'loc_at', 'last_seen_at']));
        Schema::table('spaces', fn (Blueprint $t) => $t->dropColumn(['premium', 'long_distance']));
        Schema::dropIfExists('features');
    }
};
