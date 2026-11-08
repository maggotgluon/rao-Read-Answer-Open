<?php

namespace Database\Factories;

use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Space>
 */
class SpaceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => null,
            'timezone' => 'Asia/Bangkok',
        ];
    }

    /** Space with the given users as members. */
    public function withMembers(User ...$users): static
    {
        return $this->afterCreating(function (Space $space) use ($users) {
            $space->members()->attach(collect($users)->pluck('id'));
            $space->update(['created_by' => $users[0]->id ?? null]);
        });
    }
}
