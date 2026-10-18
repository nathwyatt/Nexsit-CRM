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

    // Nexsit Solutions contact details: shown on public pages, emails and PDFs
    // whenever an agency hasn't set its own phone or email.
    'brand' => [
        'name'     => env('BRAND_NAME', 'Nexsit Properties'),
        'phone'    => env('BRAND_PHONE', '+250 793 104 330'),
        'whatsapp' => env('BRAND_WHATSAPP', '250793104330'),
        'email'    => env('BRAND_EMAIL', 'snexsit@gmail.com'),
        'website'  => env('BRAND_WEBSITE', 'https://nexsitsolution.com'),
        'city'     => env('BRAND_CITY', 'Kigali, Rwanda'),
    ],

    'features' => [
        'portal_feeds'  => true,
        'whatsapp'      => false,
        'meilisearch'   => false,
    ],
];
