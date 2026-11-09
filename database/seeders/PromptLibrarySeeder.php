<?php

namespace Database\Seeders;

use App\Models\Prompt;
use Illuminate\Database\Seeder;

/**
 * ADD-ONLY: inserts library prompts whose key doesn't exist yet and never changes the text of
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
            'fit' => $p['fit'] ?? null,
            'text_en' => $p['en'],
            'text_th' => $p['th'],
            'active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Prompt::insertOrIgnore($rows->all());

        // "fit" is new: fill it on existing rows only where it was never set (admin edits win).
        // เติมค่า fit เฉพาะแถวที่ยังไม่เคยตั้ง
        $rows->whereNotNull('fit')->each(fn ($r) => Prompt::where('key', $r['key'])->whereNull('fit')->update(['fit' => $r['fit']]));
    }
}
