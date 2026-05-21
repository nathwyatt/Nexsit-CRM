<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefaultPipelineSeeder extends Seeder
{
    private function companyId(): int
    {
        return DB::table('companies')->orderBy('id')->value('id') ?? 1;
    }

    public function run(): void
    {
        $companyId = $this->companyId();

        $pipelines = [
            [
                'name'        => 'Sales Pipeline',
                'type'        => 'sale',
                'description' => 'Default pipeline for property sales',
                'is_default'  => true,
                'is_active'   => true,
                'position'    => 1,
                'stages'      => [
                    ['name' => 'New Enquiry',       'color' => '#94A3B8', 'position' => 1, 'probability' => 10],
                    ['name' => 'Viewing Scheduled', 'color' => '#60A5FA', 'position' => 2, 'probability' => 25],
                    ['name' => 'Viewing Done',       'color' => '#818CF8', 'position' => 3, 'probability' => 40],
                    ['name' => 'Offer Made',         'color' => '#F59E0B', 'position' => 4, 'probability' => 60],
                    ['name' => 'Under Contract',     'color' => '#F97316', 'position' => 5, 'probability' => 80],
                    ['name' => 'Sold',               'color' => '#22C55E', 'position' => 6, 'probability' => 100, 'is_won_stage' => true],
                    ['name' => 'Lost / Cancelled',  'color' => '#EF4444', 'position' => 7, 'probability' => 0,   'is_lost_stage' => true],
                ],
            ],
            [
                'name'        => 'Rental Pipeline',
                'type'        => 'rental',
                'description' => 'Default pipeline for property rentals',
                'is_default'  => false,
                'is_active'   => true,
                'position'    => 2,
                'stages'      => [
                    ['name' => 'New Enquiry',          'color' => '#94A3B8', 'position' => 1, 'probability' => 10],
                    ['name' => 'Viewing Scheduled',    'color' => '#60A5FA', 'position' => 2, 'probability' => 25],
                    ['name' => 'Viewing Done',          'color' => '#818CF8', 'position' => 3, 'probability' => 40],
                    ['name' => 'Application Received', 'color' => '#F59E0B', 'position' => 4, 'probability' => 60],
                    ['name' => 'Agreement Signed',     'color' => '#F97316', 'position' => 5, 'probability' => 85],
                    ['name' => 'Keys Handed Over',     'color' => '#22C55E', 'position' => 6, 'probability' => 100, 'is_won_stage' => true],
                    ['name' => 'Lost / Cancelled',     'color' => '#EF4444', 'position' => 7, 'probability' => 0,   'is_lost_stage' => true],
                ],
            ],
        ];

        foreach ($pipelines as $pipelineData) {
            $stages = $pipelineData['stages'];
            unset($pipelineData['stages']);

            $pipelineData['company_id']  = $companyId;
            $pipelineData['created_at']  = now();
            $pipelineData['updated_at']  = now();

            $pipelineId = DB::table('pipelines')->insertGetId($pipelineData);

            foreach ($stages as $stage) {
                DB::table('pipeline_stages')->insert(array_merge([
                    'company_id'    => $companyId,
                    'pipeline_id'   => $pipelineId,
                    'is_won_stage'  => false,
                    'is_lost_stage' => false,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ], $stage));
            }
        }
    }
}
