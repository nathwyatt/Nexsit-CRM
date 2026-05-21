<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CompanySeeder::class,
            RolesAndPermissionsSeeder::class,
            DefaultPipelineSeeder::class,
            DefaultLeadSourceSeeder::class,
            DefaultPropertyTypeSeeder::class,
            DefaultAmenitySeeder::class,
            SampleDataSeeder::class,
        ]);
    }
}
