<?php

return [
    'name' => env('APP_NAME', 'Nexsit CRM'),

    'reference_prefixes' => [
        'lead'     => 'LEAD-',
        'deal'     => 'DEAL-',
        'tenancy'  => 'TEN-',
        'property' => 'NST-',
    ],

    'default_currency' => env('APP_CURRENCY', 'RWF'),
    'default_country'  => env('APP_COUNTRY', 'RW'),

    'features' => [
        'portal_feeds'  => true,
        'whatsapp'      => false,
        'meilisearch'   => false,
    ],
];
