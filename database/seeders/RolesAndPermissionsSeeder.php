<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Leads
            'view all leads', 'create lead', 'edit lead', 'delete lead', 'convert lead',
            // Deals
            'view all deals', 'create deal', 'edit deal', 'delete deal', 'move deal stage', 'close deal',
            // Contacts
            'view all contacts', 'create contact', 'edit contact', 'delete contact',
            // Properties
            'view all properties', 'create property', 'edit property', 'delete property', 'publish property',
            // Tasks
            'view all tasks', 'create task', 'complete task',
            // Tenancies
            'view all tenancies', 'create tenancy', 'edit tenancy', 'record payment',
            // Reports
            'view reports',
            // Settings (admin only)
            'manage pipelines', 'manage lead sources', 'manage property types',
            'manage amenities', 'manage custom fields', 'manage automations', 'manage team',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions([
            'view all leads', 'create lead', 'edit lead', 'delete lead', 'convert lead',
            'view all deals', 'create deal', 'edit deal', 'delete deal', 'move deal stage', 'close deal',
            'view all contacts', 'create contact', 'edit contact', 'delete contact',
            'view all properties', 'create property', 'edit property', 'delete property',
            'view all tasks', 'create task', 'complete task',
            'view all tenancies', 'create tenancy', 'edit tenancy', 'record payment',
            'view reports',
        ]);

        $agent = Role::firstOrCreate(['name' => 'agent']);
        $agent->syncPermissions([
            'create lead', 'edit lead', 'convert lead',
            'create deal', 'edit deal', 'move deal stage', 'close deal',
            'create contact', 'edit contact',
            'create property', 'edit property',
            'create task', 'complete task',
            'record payment',
        ]);
    }
}
