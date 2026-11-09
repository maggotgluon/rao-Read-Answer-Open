<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * prompts       = library (space_id null) + couple-written (space_id set)
     * daily_prompts = what a space got on a given local date (never repeats a prompt)
     * answers       = one per person per day; partner's is hidden until you answer
     * prompts = คลังคำถาม/ภารกิจ, daily_prompts = ของแต่ละวัน, answers = คำตอบ
     */
    public function up(): void
    {
        Schema::create('prompts', function (Blueprint $table) {
            $table->id();
            $table->string('key')->nullable()->unique();      // library items only (idempotent seeding)
            $table->foreignId('space_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('kind', 10);                        // question | quest
            $table->string('tag', 10)->nullable();             // fun | deep | memory | future
            $table->text('text_th')->nullable();
            $table->text('text_en')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['space_id', 'kind']);
        });

        Schema::create('daily_prompts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('prompt_id')->constrained()->cascadeOnDelete();
            $table->date('date');                              // in the space's timezone
            $table->timestamps();

            $table->unique(['space_id', 'date']);
            $table->unique(['space_id', 'prompt_id']);         // never repeat in a space
        });

        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_prompt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->unique(['daily_prompt_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('answers');
        Schema::dropIfExists('daily_prompts');
        Schema::dropIfExists('prompts');
    }
};
