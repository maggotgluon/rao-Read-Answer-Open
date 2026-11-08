<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Local test accounts only (verified, password "password").
     * บัญชีทดสอบสำหรับเครื่อง local เท่านั้น
     */
    public function run(): void
    {
        if (! app()->environment('local')) {
            return;
        }

        foreach ([
            ['name' => 'Mag', 'email' => 'mag@rao.test', 'locale' => 'th'],
            ['name' => 'Partner', 'email' => 'partner@rao.test', 'locale' => 'th'],
            ['name' => 'Third', 'email' => 'third@rao.test', 'locale' => 'en'],
        ] as $u) {
            User::factory()->create($u);
        }
    }
}
