<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Personal settings / ตั้งค่าส่วนตัว
        Schema::table('users', function (Blueprint $table) {
            $table->date('birthday')->nullable()->after('locale');
            $table->boolean('show_age')->default(false)->after('birthday');
            $table->string('theme', 10)->default('blush')->after('show_age');      // blush | paper | candle
            $table->json('notify')->nullable()->after('theme');                    // per-type on/off
            $table->string('morning_at', 5)->default('08:00')->after('notify');
            $table->string('evening_at', 5)->default('20:00')->after('morning_at');
            $table->boolean('is_admin')->default(false)->after('evening_at');
        });

        // Web push subscriptions (one per browser/device) / การสมัครรับแจ้งเตือนต่ออุปกรณ์
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->char('endpoint_hash', 64)->unique();
            $table->text('endpoint');
            $table->string('public_key');
            $table->string('auth_token');
            $table->string('content_encoding', 20)->default('aes128gcm');
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });

        // Prevents sending the same scheduled push twice / กันส่งซ้ำ
        Schema::create('push_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('space_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('kind', 20);
            $table->string('ref', 40);
            $table->timestamp('created_at')->nullable();

            $table->unique(['user_id', 'space_id', 'kind', 'ref']);
        });

        // A moment can belong to one of "our dates" / ช่วงเวลาผูกกับวันสำคัญได้
        Schema::table('moments', function (Blueprint $table) {
            $table->foreignId('space_event_id')->nullable()->after('user_id')
                ->constrained('space_events')->nullOnDelete();
        });

        // Anniversary becomes a normal event (kind=anniversary) so moments can attach to it.
        foreach (DB::table('spaces')->whereNotNull('anniversary_on')->get() as $space) {
            DB::table('space_events')->insert([
                'space_id' => $space->id, 'kind' => 'anniversary', 'title' => 'anniversary',
                'date' => $space->anniversary_on, 'repeats_yearly' => true,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        Schema::table('spaces', fn (Blueprint $table) => $table->dropColumn('anniversary_on'));

        // Birthdays are personal now; old space birthday events become "special".
        DB::table('space_events')->where('kind', 'birthday')->update(['kind' => 'special']);
    }

    public function down(): void
    {
        Schema::table('spaces', fn (Blueprint $table) => $table->date('anniversary_on')->nullable());
        Schema::table('moments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('space_event_id');
        });
        Schema::dropIfExists('push_logs');
        Schema::dropIfExists('push_subscriptions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['birthday', 'show_age', 'theme', 'notify', 'morning_at', 'evening_at', 'is_admin']);
        });
    }
};
