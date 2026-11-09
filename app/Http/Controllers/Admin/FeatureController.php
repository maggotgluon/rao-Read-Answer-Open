<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Support\Features;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Turn features on/off for everyone and tag them free or premium. / เปิด-ปิดฟีเจอร์ */
class FeatureController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/features', [
            'features' => collect(Features::settings())->map(fn ($s, $key) => [
                'key' => $key, 'scope' => Features::ALL[$key], ...$s,
            ])->values(),
        ]);
    }

    public function update(Request $request, string $key): RedirectResponse
    {
        abort_unless(array_key_exists($key, Features::ALL), 404);
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'tier' => ['required', Rule::in([Features::FREE, Features::PREMIUM])],
        ]);

        Feature::updateOrCreate(['key' => $key], $data);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.feature_saved')]);

        return back();
    }
}
