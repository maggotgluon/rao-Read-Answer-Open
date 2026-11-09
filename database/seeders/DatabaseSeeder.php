<?php

namespace Database\Seeders;

use App\Models\Prompt;
use App\Models\ScheduledPrompt;
use App\Models\Space;
use App\Models\SpecialDay;
use App\Models\User;
use App\Support\DevTools;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Local demo data (verified users, password "password"):
     *   Mag ↔ Partner (3 weeks of history), Mag ↔ Third (poly, new), Solo has no space.
     * ข้อมูลเดโมสำหรับเครื่อง local เท่านั้น
     */
    public function run(): void
    {
        // Needed in every environment. / ต้องมีทุก environment
        $this->call(PromptLibrarySeeder::class);

        if (! app()->environment('local')) {
            return;
        }

        $users = [];
        foreach (DevTools::demoAccounts() as $a) {
            $users[$a['name']] = User::factory()->create([
                'name' => $a['name'],
                'email' => $a['email'],
                'locale' => $a['locale'],
            ]);
        }

        $mag = $users['Mag'];
        $partner = $users['Partner'];

        // Birthdays live on profiles now. Mag shows age, Partner doesn't.
        $mag->update(['birthday' => now()->addMonths(3)->subYears(31)->toDateString(), 'show_age' => true]);
        $partner->update(['birthday' => now()->addDays(4)->subYears(29)->toDateString(), 'show_age' => false]);
        $mag->forceFill(['is_admin' => true])->save();   // demo admin for the prompt library

        $ours = Space::factory()->create(['created_by' => $mag->id]);
        $pairedAt = now()->subDays(21);
        $ours->members()->attach([$mag->id => ['joined_at' => $pairedAt], $partner->id => ['joined_at' => $pairedAt]]);

        $this->history($ours, $mag, $partner);

        $ours->events()->createMany([
            ['title' => 'anniversary', 'kind' => 'anniversary', 'date' => now('Asia/Bangkok')->subYears(2)->addDays(9)->toDateString(), 'repeats_yearly' => true, 'created_by' => $mag->id],
            ['title' => 'Trip to Chiang Mai', 'kind' => 'special', 'date' => now()->addDays(16)->toDateString(), 'repeats_yearly' => false, 'created_by' => $partner->id],
            ['title' => 'First date', 'kind' => 'special', 'date' => now()->subYears(3)->toDateString(), 'repeats_yearly' => true, 'created_by' => $mag->id],
        ]);

        // A memory: last year's "First date" moment comes back today. / ความทรงจำจากปีก่อน
        $firstDate = $ours->events()->where('title', 'First date')->first();
        $lastYear = now()->subYear()->setTime(19, 0);
        $ours->moments()->create([
            'user_id' => $partner->id, 'space_event_id' => $firstDate->id, 'status' => 'posted',
            'body' => 'Same café as our first date, one year later ☕💛', 'posted_at' => $lastYear,
        ]);

        Space::factory()->withMembers($mag, $users['Third'])->create();

        // Location demo: Partner shares from Chiang Mai (rounded); Mag can switch on in the app.
        // ตัวอย่างตำแหน่ง: Partner แชร์จากเชียงใหม่ Mag ลองเปิดเองในแอป
        $partner->forceFill([
            'share_location' => true, 'loc_lat' => 18.8, 'loc_lng' => 99.0,
            'loc_city' => 'เชียงใหม่', 'loc_tz' => 'Asia/Bangkok', 'loc_at' => now(),
        ])->save();

        // Admin demo: a special day for everyone + a bonus question for today.
        SpecialDay::create(['date' => '2026-02-14', 'emoji' => '💘', 'title_th' => 'วันวาเลนไทน์', 'title_en' => "Valentine's Day", 'repeats_yearly' => true]);
        $bonus = Prompt::create([
            'kind' => 'question', 'fit' => 'any', 'created_by' => $mag->id,
            'text_th' => 'ถ้าวันนี้เป็นวันพิเศษของเรา อยากฉลองแบบไหน?',
            'text_en' => 'If today were our special day, how would you celebrate?',
        ]);
        ScheduledPrompt::create(['date' => now('Asia/Bangkok')->toDateString(), 'prompt_id' => $bonus->id, 'audience' => 'all', 'created_by' => $mag->id]);
    }

    /** 3 weeks: mostly both answered, a few one-sided, a few missed, some moments. */
    private function history(Space $space, User $a, User $b): void
    {
        $tz = $space->timezone;
        $used = [];
        // Day offsets (days ago) → who answered. Missing offsets = nobody.
        $lines = [
            'ตอนที่เราไปทะเลด้วยกันครั้งแรก 🌊', 'ชอบตอนเธอหัวเราะจนน้ำตาไหล', 'อยากไปเชียงใหม่หน้าหนาวด้วยกัน',
            'Coffee in bed on a rainy Sunday ☕', 'When you remembered my favourite snack', 'Learning to cook together!',
            'ข้าวผัดกระเพราของเธออร่อยที่สุด', 'A road trip with no plan', 'วันที่เราหลงทางแล้วเจอร้านอร่อย',
            'Your laugh when the cat fell off the sofa 😂', 'ขอบคุณที่อยู่ข้างกันตอนงานหนัก', 'Dancing badly in the kitchen',
        ];
        $plan = [
            20 => 'ab', 19 => 'ab', 18 => 'a', 17 => 'ab', 16 => 'ab', 14 => 'ab', 13 => 'b',
            12 => 'ab', 11 => 'ab', 10 => 'ab', 9 => 'ab', 7 => 'ab', 6 => 'ab', 5 => 'a',
            4 => 'ab', 3 => 'ab', 2 => 'b', 1 => 'ab',
        ];

        foreach ($plan as $ago => $who) {
            $date = Carbon::now($tz)->subDays($ago)->startOfDay();
            $kind = $date->isWeekend() ? 'quest' : 'question';
            $prompt = Prompt::library()->where('kind', $kind)->whereNotIn('id', $used)->inRandomOrder()->first();
            $used[] = $prompt->id;
            $daily = $space->dailyPrompts()->create(['prompt_id' => $prompt->id, 'date' => $date->toDateString()]);

            $at = $date->copy()->setTime(20, 0)->utc();
            if (str_contains($who, 'a')) {
                $daily->answers()->create(['user_id' => $a->id, 'body' => fake()->randomElement($lines), 'created_at' => $at, 'updated_at' => $at]);
            }
            if (str_contains($who, 'b')) {
                $daily->answers()->create(['user_id' => $b->id, 'body' => fake()->randomElement($lines), 'created_at' => $at->copy()->addHour(), 'updated_at' => $at->copy()->addHour()]);
            }
        }

        foreach ([[15, $a, 'Morning coffee on the balcony ☕'], [8, $b, 'That sunset though 🌅'], [3, $a, 'Found our old cinema ticket!'], [1, $b, 'Cooked your mom\'s recipe — 7/10, needs practice 😂']] as [$ago, $user, $body]) {
            $at = Carbon::now($tz)->subDays($ago)->setTime(18, 30)->utc();
            $space->moments()->create(['user_id' => $user->id, 'body' => $body, 'status' => 'posted', 'posted_at' => $at, 'created_at' => $at, 'updated_at' => $at]);
        }

    }
}
