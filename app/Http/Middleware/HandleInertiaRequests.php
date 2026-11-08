<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => app()->getLocale(),
            'translations' => fn () => $this->translations(app()->getLocale()),
            // Only the signed-in user's own spaces (for the switcher). / เฉพาะ space ของตัวเอง
            'spaces' => fn () => $request->user()?->spaces()
                ->with('members:id,name')->get()
                ->map(fn ($s) => [
                    'id' => $s->ulid,
                    'name' => $s->name,
                    'status' => $s->status,
                    'partner' => $s->partnerOf($request->user())?->name,
                    'url' => route('spaces.show', $s),
                ]) ?? [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /** @return array<string, string> */
    private function translations(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        return is_file($path) ? json_decode((string) file_get_contents($path), true) : [];
    }
}
