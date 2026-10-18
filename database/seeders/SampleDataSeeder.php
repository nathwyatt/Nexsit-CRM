<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = DB::table('companies')->orderBy('id')->value('id') ?? 1;
        $now       = now();

        // ── Users ────────────────────────────────────────────────────────────
        $adminId = DB::table('users')->insertGetId([
            'company_id' => $companyId,
            'name'       => 'Nathan Wyatt',
            'email'      => 'admin@nexsit.rw',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'phone'      => '+250 788 100 001',
            'is_active'  => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $agent1Id = DB::table('users')->insertGetId([
            'company_id' => $companyId,
            'name'       => 'Alice Uwera',
            'email'      => 'alice@nexsit.rw',
            'password'   => Hash::make('password'),
            'role'       => 'agent',
            'phone'      => '+250 788 100 002',
            'is_active'  => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $agent2Id = DB::table('users')->insertGetId([
            'company_id' => $companyId,
            'name'       => 'Eric Ndayisaba',
            'email'      => 'eric@nexsit.rw',
            'password'   => Hash::make('password'),
            'role'       => 'agent',
            'phone'      => '+250 788 100 003',
            'is_active'  => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Assign roles via Spatie permission model_has_roles
        foreach ([$adminId => 'admin', $agent1Id => 'agent', $agent2Id => 'agent'] as $userId => $roleName) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');
            if ($roleId) {
                DB::table('model_has_roles')->insertOrIgnore([
                    'role_id'    => $roleId,
                    'model_type' => 'App\\Models\\User',
                    'model_id'   => $userId,
                ]);
            }
        }

        // ── Lead Sources (query existing) ────────────────────────────────────
        $sources = DB::table('lead_sources')->where('company_id', $companyId)->pluck('id', 'name');
        $srcWebsite  = $sources['Website']      ?? null;
        $srcReferral = $sources['Referral']     ?? null;
        $srcWalkin   = $sources['Walk-in']      ?? null;
        $srcSocial   = $sources['Social Media'] ?? null;
        $srcPF       = $sources['WhatsApp'] ?? null;
        $srcCold     = $sources['Cold Call']    ?? null;

        // ── Property Types (query existing) ─────────────────────────────────
        $ptypes = DB::table('property_types')->where('company_id', $companyId)->pluck('id', 'name');
        $ptApt  = $ptypes['Apartment']   ?? null;
        $ptVilla = $ptypes['Villa']      ?? null;
        $ptTown  = $ptypes['Townhouse']  ?? null;
        $ptStudio = $ptypes['Studio']    ?? null;
        $ptOffice = $ptypes['Office']    ?? null;
        $ptLand   = $ptypes['Land / Plot'] ?? null;

        // ── Amenities (grab a few for attaching to properties) ───────────────
        $amenities = DB::table('amenities')->where('company_id', $companyId)->pluck('id', 'name');

        // ── Pipeline Stages ──────────────────────────────────────────────────
        $salesPipelineId  = DB::table('pipelines')->where('company_id', $companyId)->where('type', 'sale')->value('id');
        $rentalPipelineId = DB::table('pipelines')->where('company_id', $companyId)->where('type', 'rental')->value('id');

        $salesStages  = DB::table('pipeline_stages')->where('pipeline_id', $salesPipelineId)->pluck('id', 'name');
        $rentalStages = DB::table('pipeline_stages')->where('pipeline_id', $rentalPipelineId)->pluck('id', 'name');

        // ── Contacts ─────────────────────────────────────────────────────────
        $contactsData = [
            ['first_name' => 'Jean Baptiste', 'last_name' => 'Hakizimana', 'email' => 'jbaptiste@gmail.com',  'phone' => '+250788111001', 'nationality' => 'Rwandan', 'tags' => ['buyer', 'vip']],
            ['first_name' => 'Marie Claire',  'last_name' => 'Uwimana',    'email' => 'muwimana@gmail.com',   'phone' => '+250788111002', 'nationality' => 'Rwandan', 'tags' => ['tenant']],
            ['first_name' => 'Emmanuel',      'last_name' => 'Nshimiyimana','email' => 'enshi@gmail.com',     'phone' => '+250788111003', 'nationality' => 'Rwandan', 'tags' => ['buyer']],
            ['first_name' => 'Aline',         'last_name' => 'Mukamurenzi','email' => 'amukamurenzi@gmail.com','phone' => '+250788111004', 'nationality' => 'Rwandan', 'tags' => ['tenant']],
            ['first_name' => 'Patrick',       'last_name' => 'Habimana',   'email' => 'phabimana@gmail.com',  'phone' => '+250788111005', 'nationality' => 'Rwandan', 'tags' => ['buyer']],
            ['first_name' => 'Claudette',     'last_name' => 'Mukamugema', 'email' => 'cmukamugema@gmail.com','phone' => '+250788111006', 'nationality' => 'Rwandan', 'tags' => ['owner']],
            ['first_name' => 'Innocent',      'last_name' => 'Nzeyimana',  'email' => 'inzeyimana@gmail.com', 'phone' => '+250788111007', 'nationality' => 'Rwandan', 'tags' => ['tenant']],
            ['first_name' => 'Diane',         'last_name' => 'Ingabire',   'email' => 'dingabire@gmail.com',  'phone' => '+250788111008', 'nationality' => 'Rwandan', 'tags' => ['buyer']],
            ['first_name' => 'Celestin',      'last_name' => 'Ngarambe',   'email' => 'cngarambe@gmail.com',  'phone' => '+250788111009', 'nationality' => 'Rwandan', 'tags' => ['buyer', 'owner']],
            ['first_name' => 'Aimee',         'last_name' => 'Kayitesi',   'email' => 'akayitesi@gmail.com',  'phone' => '+250788111010', 'nationality' => 'Rwandan', 'tags' => ['tenant']],
            ['first_name' => 'Bruno',         'last_name' => 'Ndahimana',  'email' => 'bndahimana@gmail.com', 'phone' => '+250788111011', 'nationality' => 'Rwandan', 'tags' => ['owner']],
            ['first_name' => 'Rose',          'last_name' => 'Mutesi',     'email' => 'rmutesi@gmail.com',    'phone' => '+250788111012', 'nationality' => 'Rwandan', 'tags' => ['buyer']],
        ];

        $contactIds = [];
        foreach ($contactsData as $i => $c) {
            $id = DB::table('contacts')->insertGetId([
                'company_id'  => $companyId,
                'first_name'  => $c['first_name'],
                'last_name'   => $c['last_name'],
                'email'       => $c['email'],
                'phone'       => $c['phone'],
                'nationality' => $c['nationality'],
                'tags'        => json_encode($c['tags']),
                'assigned_to' => $i % 2 === 0 ? $agent1Id : $agent2Id,
                'created_by'  => $adminId,
                'created_at'  => $now->copy()->subDays(rand(30, 180)),
                'updated_at'  => $now,
            ]);
            $contactIds[] = $id;
        }

        // Contact roles
        $roleMap = [
            0 => ['buyer', 'owner'],
            1 => ['tenant'],
            2 => ['buyer'],
            3 => ['tenant'],
            4 => ['buyer'],
            5 => ['owner'],
            6 => ['tenant'],
            7 => ['buyer'],
            8 => ['buyer', 'owner'],
            9 => ['tenant'],
            10 => ['owner'],
            11 => ['buyer'],
        ];
        foreach ($roleMap as $idx => $roles) {
            foreach ($roles as $role) {
                DB::table('contact_roles')->insertOrIgnore([
                    'contact_id' => $contactIds[$idx],
                    'role'       => $role,
                    'created_at' => $now,
                ]);
            }
        }

        // ── Properties ───────────────────────────────────────────────────────
        $propertiesData = [
            [
                'reference'    => 'NST-000001',
                'title'        => 'Modern 3-Bedroom Apartment in Kiyovu',
                'description'  => 'A beautifully furnished 3-bedroom apartment in the heart of Kiyovu, one of Kigali\'s most prestigious neighbourhoods. Features panoramic city views, modern kitchen, and access to building amenities.',
                'type_id'      => $ptApt,
                'purpose'      => 'rent',
                'status'       => 'available',
                'bedrooms'     => 3,
                'bathrooms'    => 2,
                'area_sqm'     => 145,
                'floor'        => 4,
                'community'    => 'Kiyovu',
                'city'         => 'Kigali',
                'rent_price'   => 2400000,
                'is_published' => true,
                'owner_idx'    => 10, // Bruno
                'amenities'    => ['Swimming Pool', 'Gym / Fitness Centre', 'Security 24/7', 'Covered Parking', 'Balcony'],
            ],
            [
                'reference'    => 'NST-000002',
                'title'        => 'Luxury 4-Bedroom Villa in Nyarutarama',
                'description'  => 'Stunning villa set in a lush garden in Nyarutarama, Kigali\'s premium residential area. Featuring a private pool, double garage, and breathtaking views of the Nyarutarama Golf Course.',
                'type_id'      => $ptVilla,
                'purpose'      => 'sale',
                'status'       => 'available',
                'bedrooms'     => 4,
                'bathrooms'    => 4,
                'area_sqm'     => 320,
                'community'    => 'Nyarutarama',
                'city'         => 'Kigali',
                'price'        => 180000000,
                'is_published' => true,
                'owner_idx'    => 5, // Claudette
                'amenities'    => ['Swimming Pool', 'Security 24/7', 'Covered Parking', 'Kids Play Area', 'BBQ Area'],
            ],
            [
                'reference'    => 'NST-000003',
                'title'        => 'Spacious 2-Bedroom Apartment, Kimihurura',
                'description'  => 'Well-maintained 2-bedroom apartment in the sought-after Kimihurura district. Close to restaurants, shopping centres, and the Kigali Convention Centre.',
                'type_id'      => $ptApt,
                'purpose'      => 'rent',
                'status'       => 'rented',
                'bedrooms'     => 2,
                'bathrooms'    => 2,
                'area_sqm'     => 110,
                'floor'        => 2,
                'community'    => 'Kimihurura',
                'city'         => 'Kigali',
                'rent_price'   => 1800000,
                'is_published' => true,
                'owner_idx'    => 8, // Celestin
                'amenities'    => ['Security 24/7', 'Covered Parking', 'Balcony', 'Built-in Wardrobes'],
            ],
            [
                'reference'    => 'NST-000004',
                'title'        => '3-Bedroom Townhouse in Kacyiru',
                'description'  => 'Contemporary townhouse in the diplomatic quarter of Kacyiru. Perfect for families, with a private garden, secure compound, and proximity to international schools.',
                'type_id'      => $ptTown,
                'purpose'      => 'sale',
                'status'       => 'under_offer',
                'bedrooms'     => 3,
                'bathrooms'    => 3,
                'area_sqm'     => 200,
                'community'    => 'Kacyiru',
                'city'         => 'Kigali',
                'price'        => 120000000,
                'is_published' => true,
                'owner_idx'    => 5, // Claudette
                'amenities'    => ['Security 24/7', 'Kids Play Area', 'Covered Parking'],
            ],
            [
                'reference'    => 'NST-000005',
                'title'        => 'Studio Apartment in Remera',
                'description'  => 'Cosy and affordable studio apartment ideal for young professionals. Located in Remera, with easy access to public transport and Kigali\'s main business districts.',
                'type_id'      => $ptStudio,
                'purpose'      => 'rent',
                'status'       => 'rented',
                'bedrooms'     => 0,
                'bathrooms'    => 1,
                'area_sqm'     => 45,
                'floor'        => 1,
                'community'    => 'Remera',
                'city'         => 'Kigali',
                'rent_price'   => 900000,
                'is_published' => true,
                'owner_idx'    => 10, // Bruno
                'amenities'    => ['Security 24/7', 'Elevators'],
            ],
            [
                'reference'    => 'NST-000006',
                'title'        => 'Grand 5-Bedroom Villa with Pool, Gisozi',
                'description'  => 'Magnificent gated villa on a generous 1,200 sqm plot in the serene Gisozi hills. Featuring a 25m swimming pool, home theatre, and staff quarters. A rare opportunity.',
                'type_id'      => $ptVilla,
                'purpose'      => 'sale',
                'status'       => 'available',
                'bedrooms'     => 5,
                'bathrooms'    => 5,
                'area_sqm'     => 480,
                'community'    => 'Gisozi',
                'city'         => 'Kigali',
                'price'        => 250000000,
                'is_published' => true,
                'owner_idx'    => 8, // Celestin
                'amenities'    => ['Swimming Pool', 'Gym / Fitness Centre', 'Security 24/7', 'Covered Parking', 'BBQ Area', 'Tennis Court'],
            ],
            [
                'reference'    => 'NST-000007',
                'title'        => '2-Bedroom Apartment, Kibagabaga',
                'description'  => 'Bright and airy 2-bedroom apartment in quiet Kibagabaga neighbourhood. Close to schools, health centres, and Kigali\'s growing tech hub.',
                'type_id'      => $ptApt,
                'purpose'      => 'rent',
                'status'       => 'rented',
                'bedrooms'     => 2,
                'bathrooms'    => 1,
                'area_sqm'     => 95,
                'floor'        => 3,
                'community'    => 'Kibagabaga',
                'city'         => 'Kigali',
                'rent_price'   => 1500000,
                'is_published' => true,
                'owner_idx'    => 10, // Bruno
                'amenities'    => ['Security 24/7', 'Covered Parking'],
            ],
            [
                'reference'    => 'NST-000008',
                'title'        => 'Modern Office Space, CBD Kigali',
                'description'  => 'Premium Grade A office space on the 8th floor of a modern tower in Kigali\'s CBD. Open-plan layout, fibre internet, conference rooms, and 24/7 security.',
                'type_id'      => $ptOffice,
                'purpose'      => 'rent',
                'status'       => 'available',
                'bedrooms'     => null,
                'bathrooms'    => null,
                'area_sqm'     => 280,
                'floor'        => 8,
                'community'    => 'CBD',
                'city'         => 'Kigali',
                'rent_price'   => 3600000,
                'is_published' => true,
                'owner_idx'    => 5, // Claudette
                'amenities'    => ['Security 24/7', 'CCTV', 'Elevators', 'Covered Parking', 'Lobby'],
            ],
            [
                'reference'    => 'NST-000009',
                'title'        => 'Prime Land for Sale in Bugesera',
                'description'  => 'Flat, ready-to-build plot of 2,000 sqm in Bugesera Special Economic Zone. Excellent access roads, utilities connected. Ideal for commercial or residential development.',
                'type_id'      => $ptLand,
                'purpose'      => 'sale',
                'status'       => 'available',
                'bedrooms'     => null,
                'bathrooms'    => null,
                'area_sqm'     => 2000,
                'community'    => 'Bugesera',
                'city'         => 'Kigali',
                'price'        => 45000000,
                'is_published' => true,
                'owner_idx'    => 10, // Bruno
                'amenities'    => [],
            ],
            [
                'reference'    => 'NST-000010',
                'title'        => '2-Bedroom Apartment for Sale, Kiyovu',
                'description'  => 'Well-appointed 2-bedroom apartment in a sought-after Kiyovu block. Ideal as a primary residence or investment property. Tenant-ready condition.',
                'type_id'      => $ptApt,
                'purpose'      => 'sale',
                'status'       => 'reserved',
                'bedrooms'     => 2,
                'bathrooms'    => 2,
                'area_sqm'     => 105,
                'floor'        => 3,
                'community'    => 'Kiyovu',
                'city'         => 'Kigali',
                'price'        => 85000000,
                'is_published' => true,
                'owner_idx'    => 8, // Celestin
                'amenities'    => ['Security 24/7', 'Covered Parking', 'Balcony'],
            ],
        ];

        $propertyIds = [];
        foreach ($propertiesData as $p) {
            $pid = DB::table('properties')->insertGetId([
                'company_id'       => $companyId,
                'reference'        => $p['reference'],
                'title'            => $p['title'],
                'description'      => $p['description'],
                'property_type_id' => $p['type_id'],
                'purpose'          => $p['purpose'],
                'status'           => $p['status'],
                'bedrooms'         => $p['bedrooms'] ?? null,
                'bathrooms'        => $p['bathrooms'] ?? null,
                'area_sqm'         => $p['area_sqm'],
                'floor'            => $p['floor'] ?? null,
                'community'        => $p['community'],
                'city'             => $p['city'],
                'country'          => 'RW',
                'price'            => $p['price'] ?? null,
                'rent_price'       => $p['rent_price'] ?? null,
                'is_furnished'     => true,
                'is_published'     => $p['is_published'],
                'published_at'     => $p['is_published'] ? $now->copy()->subDays(rand(5, 60)) : null,
                'assigned_to'      => $agent1Id,
                'created_by'       => $adminId,
                'created_at'       => $now->copy()->subDays(rand(10, 90)),
                'updated_at'       => $now,
            ]);
            $propertyIds[] = $pid;

            // Owner
            DB::table('property_owners')->insert([
                'property_id'   => $pid,
                'contact_id'    => $contactIds[$p['owner_idx']],
                'ownership_pct' => 100,
                'is_primary'    => true,
                'created_at'    => $now,
            ]);

            // Amenities
            foreach ($p['amenities'] as $amenityName) {
                $amenityId = $amenities[$amenityName] ?? null;
                if ($amenityId) {
                    DB::table('property_amenity')->insertOrIgnore([
                        'property_id' => $pid,
                        'amenity_id'  => $amenityId,
                    ]);
                }
            }
        }

        // ── Leads ─────────────────────────────────────────────────────────────
        $leadsData = [
            ['contact' => 0, 'source' => $srcReferral, 'status' => 'qualified',  'purpose' => 'buy',  'budget_max' => 200000000, 'bedrooms' => 4, 'property' => null,            'msg' => 'Looking for a luxury villa in Nyarutarama or Kimihurura.',        'assigned' => $agent1Id],
            ['contact' => 1, 'source' => $srcWebsite,  'status' => 'converted',  'purpose' => 'rent', 'budget_max' => 2000000,   'bedrooms' => 2, 'property' => $propertyIds[2], 'msg' => 'Interested in a 2BR apartment close to Kigali Convention Centre.', 'assigned' => $agent1Id],
            ['contact' => 2, 'source' => $srcSocial,   'status' => 'contacted',  'purpose' => 'buy',  'budget_max' => 90000000,  'bedrooms' => 2, 'property' => null,            'msg' => 'Looking for a 2-bedroom apartment in Kiyovu or Kacyiru.',         'assigned' => $agent2Id],
            ['contact' => 3, 'source' => $srcWalkin,   'status' => 'converted',  'purpose' => 'rent', 'budget_max' => 1000000,   'bedrooms' => 0, 'property' => $propertyIds[4], 'msg' => 'Need a studio apartment near Remera, budget RWF 900,000/yr.',     'assigned' => $agent2Id],
            ['contact' => 4, 'source' => $srcWebsite,  'status' => 'new',        'purpose' => 'buy',  'budget_max' => 50000000,  'bedrooms' => null,'property' => null,           'msg' => 'Looking for land to build a residential home in Bugesera area.',  'assigned' => $agent1Id],
            ['contact' => 7, 'source' => $srcPF,       'status' => 'qualified',  'purpose' => 'buy',  'budget_max' => 130000000, 'bedrooms' => 3, 'property' => null,            'msg' => 'Interested in a townhouse or large apartment in Kacyiru.',        'assigned' => $agent2Id],
            ['contact' => 6, 'source' => $srcSocial,   'status' => 'contacted',  'purpose' => 'rent', 'budget_max' => 1600000,   'bedrooms' => 2, 'property' => $propertyIds[6], 'msg' => 'Looking for a 2-bedroom in Kibagabaga or Remera.',                'assigned' => $agent1Id],
            ['contact' => 11,'source' => $srcCold,     'status' => 'lost',       'purpose' => 'buy',  'budget_max' => 70000000,  'bedrooms' => 2, 'property' => null,            'msg' => 'Looking for a 2BR apartment. Budget flexible.',                  'assigned' => $agent2Id],
        ];

        $leadIds = [];
        foreach ($leadsData as $i => $l) {
            $createdDays = rand(15, 120);
            $id = DB::table('leads')->insertGetId([
                'company_id'     => $companyId,
                'reference'      => 'LEAD-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'contact_id'     => $contactIds[$l['contact']],
                'lead_source_id' => $l['source'],
                'status'         => $l['status'],
                'property_id'    => $l['property'],
                'purpose'        => $l['purpose'],
                'budget_max'     => $l['budget_max'],
                'bedrooms_wanted'=> $l['bedrooms'],
                'message'        => $l['msg'],
                'assigned_to'    => $l['assigned'],
                'converted_at'   => $l['status'] === 'converted' ? $now->copy()->subDays(rand(5, 30)) : null,
                'created_at'     => $now->copy()->subDays($createdDays),
                'updated_at'     => $now->copy()->subDays(rand(1, $createdDays)),
            ]);
            $leadIds[] = $id;
        }

        // ── Deals ─────────────────────────────────────────────────────────────
        $dealsData = [
            [
                'pipeline' => $salesPipelineId,  'stage' => $salesStages['Under Contract']  ?? null,
                'contact' => 0, 'property' => 1, 'lead' => 0,
                'title'  => 'Jean Baptiste — Villa Nyarutarama',
                'type'   => 'sale',   'status' => 'open',
                'value'  => 180000000, 'commission_pct' => 3,
                'close'  => now()->addDays(30), 'assigned' => $agent1Id,
            ],
            [
                'pipeline' => $salesPipelineId,  'stage' => $salesStages['Offer Made'] ?? null,
                'contact' => 2, 'property' => 9, 'lead' => 2,
                'title'  => 'Emmanuel — Kiyovu Apartment',
                'type'   => 'sale',   'status' => 'open',
                'value'  => 85000000, 'commission_pct' => 3,
                'close'  => now()->addDays(21), 'assigned' => $agent2Id,
            ],
            [
                'pipeline' => $rentalPipelineId, 'stage' => $rentalStages['Keys Handed Over'] ?? null,
                'contact' => 1, 'property' => 2, 'lead' => 1,
                'title'  => 'Marie Claire — Kimihurura 2BR',
                'type'   => 'rental', 'status' => 'won',
                'value'  => 1800000,  'commission_pct' => 8,
                'close'  => now()->subDays(180), 'assigned' => $agent1Id,
                'closed_at' => now()->subDays(180),
            ],
            [
                'pipeline' => $rentalPipelineId, 'stage' => $rentalStages['Agreement Signed'] ?? null,
                'contact' => 3, 'property' => 4, 'lead' => 3,
                'title'  => 'Aline — Remera Studio',
                'type'   => 'rental', 'status' => 'won',
                'value'  => 900000,   'commission_pct' => 8,
                'close'  => now()->subDays(90), 'assigned' => $agent2Id,
                'closed_at' => now()->subDays(90),
            ],
            [
                'pipeline' => $salesPipelineId,  'stage' => $salesStages['New Enquiry'] ?? null,
                'contact' => 4, 'property' => 8, 'lead' => 4,
                'title'  => 'Patrick — Bugesera Land',
                'type'   => 'sale',   'status' => 'open',
                'value'  => 45000000, 'commission_pct' => 5,
                'close'  => now()->addDays(60), 'assigned' => $agent1Id,
            ],
            [
                'pipeline' => $salesPipelineId,  'stage' => $salesStages['Viewing Done'] ?? null,
                'contact' => 7, 'property' => 3, 'lead' => 5,
                'title'  => 'Diane — Kacyiru Townhouse',
                'type'   => 'sale',   'status' => 'open',
                'value'  => 120000000,'commission_pct' => 3,
                'close'  => now()->addDays(45), 'assigned' => $agent2Id,
            ],
        ];

        $dealIds = [];
        foreach ($dealsData as $i => $d) {
            $id = DB::table('deals')->insertGetId([
                'company_id'           => $companyId,
                'reference'            => 'DEAL-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'pipeline_id'          => $d['pipeline'],
                'stage_id'             => $d['stage'],
                'contact_id'           => $contactIds[$d['contact']],
                'property_id'          => $propertyIds[$d['property']],
                'lead_id'              => $leadIds[$d['lead']] ?? null,
                'title'                => $d['title'],
                'type'                 => $d['type'],
                'status'               => $d['status'],
                'value'                => $d['value'],
                'commission_pct'       => $d['commission_pct'],
                'commission'           => $d['value'] * $d['commission_pct'] / 100,
                'currency'             => 'RWF',
                'expected_close_date'  => $d['close'],
                'closed_at'            => $d['closed_at'] ?? null,
                'assigned_to'          => $d['assigned'],
                'created_by'           => $adminId,
                'created_at'           => now()->subDays(rand(20, 90)),
                'updated_at'           => now(),
            ]);
            $dealIds[] = $id;
        }

        // Update converted leads with deal references
        DB::table('leads')->where('id', $leadIds[1])->update(['converted_to_deal' => $dealIds[2]]);
        DB::table('leads')->where('id', $leadIds[3])->update(['converted_to_deal' => $dealIds[3]]);

        // ── Tenancies + Payments ──────────────────────────────────────────────
        $tenanciesData = [
            [
                'property'   => 2,  // Kimihurura 2BR
                'tenant'     => 1,  // Marie Claire
                'deal'       => $dealIds[2],
                'start'      => now()->subMonths(6)->toDateString(),
                'end'        => now()->addMonths(6)->toDateString(),
                'rent'       => 150000,
                'freq'       => 'monthly',
                'deposit'    => 300000,
                'status'     => 'active',
            ],
            [
                'property'   => 4,  // Remera Studio
                'tenant'     => 3,  // Aline
                'deal'       => $dealIds[3],
                'start'      => now()->subMonths(3)->toDateString(),
                'end'        => now()->addMonths(9)->toDateString(),
                'rent'       => 75000,
                'freq'       => 'monthly',
                'deposit'    => 150000,
                'status'     => 'active',
            ],
            [
                'property'   => 6,  // Kibagabaga 2BR
                'tenant'     => 6,  // Innocent
                'deal'       => null,
                'start'      => now()->subMonths(12)->toDateString(),
                'end'        => now()->addDays(25)->toDateString(),
                'rent'       => 125000,
                'freq'       => 'monthly',
                'deposit'    => 250000,
                'status'     => 'active',
            ],
        ];

        foreach ($tenanciesData as $i => $t) {
            $tenancyId = DB::table('tenancies')->insertGetId([
                'company_id'          => $companyId,
                'reference'           => 'TEN-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'property_id'         => $propertyIds[$t['property']],
                'tenant_id'           => $contactIds[$t['tenant']],
                'deal_id'             => $t['deal'],
                'start_date'          => $t['start'],
                'end_date'            => $t['end'],
                'rent_amount'         => $t['rent'],
                'rent_frequency'      => $t['freq'],
                'deposit_amount'      => $t['deposit'],
                'status'              => $t['status'],
                'auto_renew'          => false,
                'renewal_notice_days' => 60,
                'created_by'          => $adminId,
                'created_at'          => Carbon::parse($t['start']),
                'updated_at'          => now(),
            ]);

            // Generate monthly payments
            $start = Carbon::parse($t['start']);
            $end   = Carbon::parse($t['end']);
            $month = $start->copy();
            $payNum = 0;
            while ($month->lt($end)) {
                $dueDate = $month->copy();
                $isPast  = $dueDate->lt(now());
                $isThisMonth = $dueDate->isSameMonth(now());

                if ($isPast) {
                    $status     = 'paid';
                    $paidDate   = $dueDate->copy()->addDays(rand(0, 5))->toDateString();
                    $method     = ['bank_transfer', 'cash', 'cheque'][rand(0, 2)];
                } elseif ($isThisMonth) {
                    $status   = rand(0, 1) ? 'paid' : 'pending';
                    $paidDate = $status === 'paid' ? now()->toDateString() : null;
                    $method   = $status === 'paid' ? 'bank_transfer' : null;
                } else {
                    $status   = 'pending';
                    $paidDate = null;
                    $method   = null;
                }

                DB::table('tenancy_payments')->insert([
                    'company_id'     => $companyId,
                    'tenancy_id'     => $tenancyId,
                    'amount'         => $t['rent'],
                    'due_date'       => $dueDate->toDateString(),
                    'paid_date'      => $paidDate,
                    'status'         => $status,
                    'payment_method' => $method,
                    'reference'      => $status === 'paid' ? 'TXN-' . strtoupper(substr(md5(rand()), 0, 8)) : null,
                    'recorded_by'    => $status === 'paid' ? $adminId : null,
                    'created_at'     => $dueDate,
                    'updated_at'     => now(),
                ]);
                $month->addMonth();
                $payNum++;
            }
        }

        // ── Tasks ─────────────────────────────────────────────────────────────
        $taskTypeId = DB::table('task_types')->where('company_id', $companyId)->value('id');

        $tasksData = [
            ['title' => 'Call Jean Baptiste to discuss mortgage financing',          'due' => now()->addDay(),    'priority' => 'high',   'type' => 'Lead',     'sub_id' => $leadIds[0], 'assigned' => $agent1Id, 'status' => 'pending'],
            ['title' => 'Schedule property viewing for Emmanuel in Kiyovu',          'due' => now()->addDays(2),  'priority' => 'medium', 'type' => 'Lead',     'sub_id' => $leadIds[2], 'assigned' => $agent2Id, 'status' => 'pending'],
            ['title' => 'Follow up with Diane on Kacyiru townhouse offer',           'due' => now(),              'priority' => 'high',   'type' => 'Deal',     'sub_id' => $dealIds[5], 'assigned' => $agent2Id, 'status' => 'pending'],
            ['title' => 'Send tenancy renewal notice to Innocent (expiring in 25d)', 'due' => now()->addDays(3),  'priority' => 'high',   'type' => 'Lead',     'sub_id' => $leadIds[6], 'assigned' => $agent1Id, 'status' => 'pending'],
            ['title' => 'Property inspection — Villa Nyarutarama (NST-000002)',      'due' => now()->addDays(5),  'priority' => 'medium', 'type' => 'Deal',     'sub_id' => $dealIds[0], 'assigned' => $agent1Id, 'status' => 'pending'],
            ['title' => 'Prepare sale contract for Jean Baptiste',                   'due' => now()->subDays(2),  'priority' => 'high',   'type' => 'Deal',     'sub_id' => $dealIds[0], 'assigned' => $adminId,  'status' => 'done', 'completed' => now()->subDay()],
            ['title' => 'Upload property photos for NST-000006',                     'due' => now()->addDays(7),  'priority' => 'low',    'type' => 'Lead',     'sub_id' => $leadIds[0], 'assigned' => $agent2Id, 'status' => 'pending'],
        ];

        foreach ($tasksData as $t) {
            DB::table('tasks')->insert([
                'company_id'    => $companyId,
                'task_type_id'  => $taskTypeId,
                'title'         => $t['title'],
                'due_at'        => $t['due'],
                'priority'      => $t['priority'],
                'status'        => $t['status'],
                'completed_at'  => $t['completed'] ?? null,
                'assigned_to'   => $t['assigned'],
                'created_by'    => $adminId,
                'taskable_type' => 'App\\Models\\' . $t['type'],
                'taskable_id'   => $t['sub_id'],
                'created_at'    => now()->subDays(rand(1, 10)),
                'updated_at'    => now(),
            ]);
        }

        // ── Activities ───────────────────────────────────────────────────────
        $activities = [
            ['desc' => 'Lead LEAD-000001 created for Jean Baptiste Hakizimana',        'type' => 'App\\Models\\Lead',     'id' => $leadIds[0], 'action' => 'created',       'days' => 30],
            ['desc' => 'Property NST-000002 published to listings',                     'type' => 'App\\Models\\Property', 'id' => $propertyIds[1], 'action' => 'published',  'days' => 25],
            ['desc' => 'Deal DEAL-000001 moved to Under Contract stage',               'type' => 'App\\Models\\Deal',     'id' => $dealIds[0], 'action' => 'stage_changed', 'days' => 20],
            ['desc' => 'Tenancy TEN-000001 activated for Marie Claire Uwimana',        'type' => 'App\\Models\\Tenancy',  'id' => 1,           'action' => 'created',       'days' => 18],
            ['desc' => 'Payment of RWF 150,000 received — Marie Claire (TEN-000001)',  'type' => 'App\\Models\\Tenancy',  'id' => 1,           'action' => 'payment_recorded','days' => 10],
            ['desc' => 'Lead LEAD-000006 qualified — Diane Ingabire (Townhouse)',      'type' => 'App\\Models\\Lead',     'id' => $leadIds[5], 'action' => 'status_changed', 'days' => 7],
            ['desc' => 'Deal DEAL-000003 won — Marie Claire rental agreement signed',  'type' => 'App\\Models\\Deal',     'id' => $dealIds[2], 'action' => 'deal_won',      'days' => 5],
            ['desc' => 'Enquiry received via website for NST-000001 (Kiyovu)',         'type' => 'App\\Models\\Lead',     'id' => $leadIds[0], 'action' => 'enquiry',       'days' => 3],
            ['desc' => 'New contact added: Patrick Habimana (buyer lead)',             'type' => 'App\\Models\\Contact',  'id' => $contactIds[4], 'action' => 'created',    'days' => 2],
            ['desc' => 'Lead LEAD-000007 assigned to Alice Uwera',                    'type' => 'App\\Models\\Lead',     'id' => $leadIds[6], 'action' => 'assigned',      'days' => 1],
        ];

        foreach ($activities as $a) {
            DB::table('activities')->insert([
                'company_id'   => $companyId,
                'user_id'      => $adminId,
                'action'       => $a['action'],
                'description'  => $a['desc'],
                'subject_type' => $a['type'],
                'subject_id'   => $a['id'],
                'created_at'   => now()->subDays($a['days']),
            ]);
        }

        // ── Property Viewings ─────────────────────────────────────────────────
        $viewingsData = [
            // Completed viewings (past)
            ['property' => $propertyIds[0], 'contact' => $contactIds[2], 'lead' => $leadIds[2], 'agent' => $agent1Id, 'days' => -14, 'status' => 'completed', 'duration' => 60,  'feedback' => 'Client was impressed with the finishing. Enquired about parking availability. Likely to make an offer.'],
            ['property' => $propertyIds[1], 'contact' => $contactIds[0], 'lead' => $leadIds[0], 'agent' => $agent1Id, 'days' => -10, 'status' => 'completed', 'duration' => 90,  'feedback' => 'Jean Baptiste loved the view from the terrace. Negotiating price — he wants 170M.'],
            ['property' => $propertyIds[3], 'contact' => $contactIds[5], 'lead' => null,         'agent' => $agent2Id, 'days' => -7,  'status' => 'no_show',   'duration' => 60,  'feedback' => 'Client did not arrive. Phone not reachable. Follow up required.'],
            ['property' => $propertyIds[4], 'contact' => $contactIds[3], 'lead' => $leadIds[3], 'agent' => $agent2Id, 'days' => -5,  'status' => 'completed', 'duration' => 45,  'feedback' => 'Aline liked the apartment. Studio is exactly what she needs. Ready to sign.'],
            ['property' => $propertyIds[6], 'contact' => $contactIds[6], 'lead' => $leadIds[6], 'agent' => $agent1Id, 'days' => -3,  'status' => 'completed', 'duration' => 60,  'feedback' => 'Showed 2BR in Kibagabaga. Client prefers a quiet floor — will re-show unit on 3rd floor.'],
            // Upcoming viewings (future)
            ['property' => $propertyIds[0], 'contact' => $contactIds[7], 'lead' => null,         'agent' => $agent2Id, 'days' => 1,   'status' => 'confirmed', 'duration' => 60,  'notes' => 'Client coming with her husband. Show parking and rooftop terrace.'],
            ['property' => $propertyIds[2], 'contact' => $contactIds[1], 'lead' => null,         'agent' => $agent1Id, 'days' => 2,   'status' => 'scheduled', 'duration' => 60,  'notes' => 'First viewing for this client. Be sure to highlight proximity to city centre.'],
            ['property' => $propertyIds[5], 'contact' => $contactIds[9], 'lead' => $leadIds[5],  'agent' => $agent2Id, 'days' => 3,   'status' => 'scheduled', 'duration' => 90,  'notes' => 'Aimee is interested in investment property. Bring rental yield analysis.'],
            ['property' => $propertyIds[8], 'contact' => $contactIds[4], 'lead' => $leadIds[4],  'agent' => $agent1Id, 'days' => 5,   'status' => 'scheduled', 'duration' => 120, 'notes' => 'Large land plot viewing. Bring site plan and infrastructure map.'],
            ['property' => $propertyIds[1], 'contact' => $contactIds[10],'lead' => null,          'agent' => $agent2Id, 'days' => 7,   'status' => 'scheduled', 'duration' => 60,  'notes' => 'Second showing — client wants to bring architect to assess renovation scope.'],
        ];

        foreach ($viewingsData as $v) {
            $scheduledAt = now()->addDays($v['days'])->setTime(rand(9, 17), [0, 30][rand(0, 1)]);
            DB::table('property_viewings')->insert([
                'company_id'       => $companyId,
                'property_id'      => $v['property'],
                'contact_id'       => $v['contact'],
                'lead_id'          => $v['lead'],
                'assigned_to'      => $v['agent'],
                'scheduled_at'     => $scheduledAt,
                'duration_minutes' => $v['duration'],
                'status'           => $v['status'],
                'notes'            => $v['notes'] ?? null,
                'feedback'         => $v['feedback'] ?? null,
                'created_at'       => now()->subDays(abs($v['days']) + 2),
                'updated_at'       => now(),
            ]);
        }

        // ── WhatsApp Templates ────────────────────────────────────────────────
        $wpTemplates = [
            ['name' => 'New Lead Welcome',      'module' => 'lead',     'body' => "Hi {{first_name}}! 👋\n\nThank you for your interest in Nexsit Properties. We received your enquiry and our team will contact you shortly.\n\nNeed immediate assistance? Call us at +250 78 000 0000.\n\nBest regards,\nNexsit Properties Team 🏡"],
            ['name' => 'Viewing Confirmation',  'module' => 'lead',     'body' => "Dear {{first_name}},\n\nYour property viewing is confirmed! 🏠\n\nProperty: {{reference}}\n📅 Our agent will contact you to finalise the time.\n\nPlease call +250 78 000 0000 to reschedule if needed.\n\nSee you soon!\nNexsit Properties"],
            ['name' => 'Offer Follow-up',       'module' => 'deal',     'body' => "Hi {{name}},\n\nJust following up on your offer for {{title}}. 📋\n\nHave you had a chance to review the details? We're happy to discuss any questions.\n\nCall us: +250 78 000 0000\n\nNexsit Properties"],
            ['name' => 'Rent Due Reminder',     'module' => 'tenancy',  'body' => "Dear Tenant,\n\nThis is a reminder that your rent for tenancy {{reference}} is due soon. 📅\n\nPlease ensure timely payment to avoid any late fees.\n\nFor payment details, contact us at +250 78 000 0000.\n\nThank you,\nNexsit Properties"],
            ['name' => 'Welcome Message',       'module' => 'general',  'body' => "Hello! 👋\n\nWelcome to Nexsit Properties — Rwanda's trusted real estate partner.\n\nWe're here to help you find your perfect property in Kigali and beyond. 🇷🇼🏡\n\nVisit us at: www.nexsit.rw\nCall us: +250 78 000 0000"],
            ['name' => 'New Property Alert',   'module' => 'contact',  'body' => "Hi {{first_name}}! 🏢\n\nWe have a new property that matches your criteria:\n\n📍 {{reference}}\n\nWould you like to schedule a viewing? Reply YES or call +250 78 000 0000.\n\nNexsit Properties"],
        ];

        foreach ($wpTemplates as $tpl) {
            DB::table('whatsapp_templates')->insertOrIgnore([
                'company_id' => $companyId,
                'name'       => $tpl['name'],
                'module'     => $tpl['module'],
                'body'       => $tpl['body'],
                'is_active'  => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $this->command->info('✅ Sample data seeded: 3 users, 12 contacts, 10 properties, 8 leads, 6 deals, 3 tenancies, 7 tasks, 10 viewings, 6 WhatsApp templates.');
    }
}
