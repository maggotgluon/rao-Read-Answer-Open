<?php

namespace Database\Seeders;

use App\Models\Space;
use App\Models\User;
use App\Support\DevTools;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Local demo data (verified users, password "password"):
     *   Mag ↔ Partner, Mag ↔ Third (poly), Solo has no space.
     * ข้อมูลเดโมสำหรับเครื่อง local เท่านั้น
     */
    public function run(): void
    {
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

        Space::factory()->withMembers($users['Mag'], $users['Partner'])->create();
        Space::factory()->withMembers($users['Mag'], $users['Third'])->create();
    }
}
