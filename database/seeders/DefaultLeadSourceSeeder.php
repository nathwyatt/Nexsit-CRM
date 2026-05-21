<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DefaultLeadSourceSeeder extends Seeder
{
    private function companyId(): int
    {
        return DB::table('companies')->orderBy('id')->value('id') ?? 1;
    }

    public function run(): void
    {
        $companyId = $this->companyId();

        $sources = [
            ['name' => 'Property Finder', 'icon' => 'building-2'],
            ['name' => 'Bayut',            'icon' => 'home'],
            ['name' => 'Dubizzle',         'icon' => 'tag'],
            ['name' => 'Walk-in',          'icon' => 'footprints'],
            ['name' => 'Referral',         'icon' => 'users'],
            ['name' => 'Website',          'icon' => 'globe'],
            ['name' => 'Social Media',     'icon' => 'share-2'],
            ['name' => 'Cold Call',        'icon' => 'phone'],
            ['name' => 'Email Campaign',   'icon' => 'mail'],
            ['name' => 'Event / Expo',     'icon' => 'calendar'],
        ];

        $rows = array_map(fn ($source, $i) => [
            'company_id' => $companyId,
            'name'       => $source['name'],
            'slug'       => Str::slug($source['name']),
            'icon'       => $source['icon'],
            'is_active'  => true,
            'position'   => $i + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ], $sources, array_keys($sources));

        DB::table('lead_sources')->insertOrIgnore($rows);
    }
}
