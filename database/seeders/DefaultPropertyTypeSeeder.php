<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DefaultPropertyTypeSeeder extends Seeder
{
    private function companyId(): int
    {
        return DB::table('companies')->orderBy('id')->value('id') ?? 1;
    }

    public function run(): void
    {
        $companyId = $this->companyId();

        $types = [
            ['name' => 'Apartment',       'icon' => 'building-2'],
            ['name' => 'Villa',           'icon' => 'home'],
            ['name' => 'Townhouse',       'icon' => 'house'],
            ['name' => 'Penthouse',       'icon' => 'building'],
            ['name' => 'Studio',          'icon' => 'square'],
            ['name' => 'Duplex',          'icon' => 'layers'],
            ['name' => 'Office',          'icon' => 'briefcase'],
            ['name' => 'Retail',          'icon' => 'shopping-bag'],
            ['name' => 'Warehouse',       'icon' => 'warehouse'],
            ['name' => 'Land / Plot',     'icon' => 'map'],
            ['name' => 'Hotel Apartment', 'icon' => 'hotel'],
        ];

        $rows = array_map(fn ($type, $i) => [
            'company_id' => $companyId,
            'name'       => $type['name'],
            'slug'       => Str::slug($type['name']),
            'icon'       => $type['icon'],
            'is_active'  => true,
            'position'   => $i + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ], $types, array_keys($types));

        DB::table('property_types')->insertOrIgnore($rows);
    }
}
