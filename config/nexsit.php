<?php

return [
    'name' => env('APP_NAME', 'Nexsit CRM'),

    'reference_prefixes' => [
        'lead'     => 'LEAD-',
        'deal'     => 'DEAL-',
        'tenancy'  => 'TEN-',
        'property' => 'NST-',
    ],

    'default_currency' => 'AED',
    'default_country'  => 'AE',

    'features' => [
        'portal_feeds'  => true,
        'whatsapp'      => false,
        'meilisearch'   => false,
    ],
];
