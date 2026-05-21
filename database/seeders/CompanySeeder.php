<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('companies')->insertOrIgnore([
            'name'       => 'Nexsit Properties',
            'slug'       => 'nexsit-properties',
            'settings'   => json_encode([
                'currency'    => 'RWF',
                'timezone'    => 'Africa/Kigali',
                'date_format' => 'DD/MM/YYYY',
                'country'     => 'Rwanda',
                'city'        => 'Kigali',
                'phone'       => '+250 78 000 0000',
                'email'       => 'info@nexsit.rw',
            ]),
            'is_active'  => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
