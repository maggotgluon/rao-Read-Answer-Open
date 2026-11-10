<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Insights;
use Inertia\Inertia;
use Inertia\Response;

class InsightsController extends Controller
{
    public function __invoke(Insights $insights): Response
    {
        return Inertia::render('admin/insights', ['insights' => $insights->all()]);
    }
}
