<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class FeedController extends Controller
{
    public function bayut()
    {
        return response('<?xml version="1.0"?><list/>', 200, ['Content-Type' => 'application/xml']);
    }

    public function propertyFinder()
    {
        return response('<?xml version="1.0"?><list/>', 200, ['Content-Type' => 'application/xml']);
    }

    public function json()
    {
        return response()->json(['data' => []]);
    }
}
