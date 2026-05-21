<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefaultAmenitySeeder extends Seeder
{
    private function companyId(): int
    {
        return DB::table('companies')->orderBy('id')->value('id') ?? 1;
    }

    public function run(): void
    {
        $companyId = $this->companyId();

        $amenities = [
            // building
            ['name' => 'Swimming Pool',        'category' => 'building', 'icon' => 'waves'],
            ['name' => 'Gym / Fitness Centre', 'category' => 'building', 'icon' => 'dumbbell'],
            ['name' => 'Concierge',            'category' => 'building', 'icon' => 'bell-ring'],
            ['name' => 'Security 24/7',        'category' => 'building', 'icon' => 'shield'],
            ['name' => 'CCTV',                 'category' => 'building', 'icon' => 'camera'],
            ['name' => 'Lobby',                'category' => 'building', 'icon' => 'door-open'],
            ['name' => 'Elevators',            'category' => 'building', 'icon' => 'arrow-up-down'],
            // unit
            ['name' => 'Covered Parking',      'category' => 'unit',     'icon' => 'car'],
            ['name' => 'Built-in Wardrobes',   'category' => 'unit',     'icon' => 'box'],
            ['name' => 'Central A/C',          'category' => 'unit',     'icon' => 'wind'],
            ['name' => 'Balcony',              'category' => 'unit',     'icon' => 'sunset'],
            ['name' => "Maid's Room",          'category' => 'unit',     'icon' => 'bed-single'],
            ['name' => 'Study Room',           'category' => 'unit',     'icon' => 'book-open'],
            // community
            ['name' => 'Kids Play Area',       'category' => 'community', 'icon' => 'smile'],
            ['name' => 'BBQ Area',             'category' => 'community', 'icon' => 'flame'],
            ['name' => 'Jogging Track',        'category' => 'community', 'icon' => 'footprints'],
            ['name' => 'Tennis Court',         'category' => 'community', 'icon' => 'circle-dot'],
            ['name' => 'Squash Court',         'category' => 'community', 'icon' => 'circle-dot'],
            ['name' => 'Retail / Shops',       'category' => 'community', 'icon' => 'shopping-bag'],
            ['name' => 'EV Charging',          'category' => 'community', 'icon' => 'zap'],
        ];

        $rows = array_map(fn ($amenity, $i) => [
            'company_id' => $companyId,
            'name'       => $amenity['name'],
            'icon'       => $amenity['icon'],
            'category'   => $amenity['category'],
            'is_active'  => true,
            'position'   => $i + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ], $amenities, array_keys($amenities));

        DB::table('amenities')->insertOrIgnore($rows);
    }
}
