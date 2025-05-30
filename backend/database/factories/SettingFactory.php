<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['string', 'integer', 'boolean', 'json', 'text', 'email'];
        $categories = ['general', 'security', 'resort', 'system'];
        $type = fake()->randomElement($types);
        
        return [
            'key' => fake()->unique()->slug(2, '.'),
            'value' => $this->generateValueByType($type),
            'type' => $type,
            'category' => fake()->randomElement($categories),
            'group' => fake()->optional()->word(),
            'description' => fake()->sentence(),
            'is_public' => fake()->boolean(),
            'is_editable' => fake()->boolean(),
            'validation_rules' => fake()->optional()->passthrough(['required', 'min:1']),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Generate value based on type
     */
    private function generateValueByType(string $type): string
    {
        return match ($type) {
            'boolean' => fake()->boolean() ? 'true' : 'false',
            'integer' => (string) fake()->numberBetween(1, 1000),
            'json' => json_encode(['key' => fake()->word(), 'value' => fake()->word()]),
            'email' => fake()->email(),
            'text' => fake()->paragraph(),
            default => fake()->sentence(),
        };
    }
}
