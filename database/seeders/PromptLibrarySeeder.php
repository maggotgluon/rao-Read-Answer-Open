<?php

namespace Database\Seeders;

use App\Models\Prompt;
use Illuminate\Database\Seeder;

/**
 * Idempotent: safe to run on every deploy (upserts by key).
 * รันซ้ำได้ทุกครั้งที่ deploy (อัปเดตตาม key)
 *   php artisan db:seed --class=PromptLibrarySeeder --force
 */
class PromptLibrarySeeder extends Seeder
{
    public function run(): void
    {
        $rows = collect(require database_path('data/prompts.php'))->map(fn ($p) => [
            'key' => $p['key'],
            'kind' => $p['kind'],
            'tag' => $p['tag'],
            'text_en' => $p['en'],
            'text_th' => $p['th'],
            'active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Prompt::upsert($rows->all(), ['key'], ['kind', 'tag', 'text_en', 'text_th', 'updated_at']);
    }
}
