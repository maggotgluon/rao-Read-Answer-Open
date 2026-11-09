<?php

namespace Database\Seeders;

use App\Models\Prompt;
use Illuminate\Database\Seeder;

/**
 * ADD-ONLY: inserts library prompts whose key doesn't exist yet and never touches
 * existing rows — so edits made in the admin panel survive every deploy.
 * เพิ่มเฉพาะคำถามใหม่ ไม่แก้ของเดิม (ที่แก้ในหน้าแอดมินจะไม่ถูกเขียนทับตอน deploy)
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

        Prompt::insertOrIgnore($rows->all());
    }
}
