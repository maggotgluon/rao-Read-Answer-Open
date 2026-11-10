<?php

namespace App\Http\Controllers;

use App\Support\AppVersion;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

/**
 * Maintenance over HTTPS for hosts that cannot run artisan (no SSH). Off unless
 * RAO_OPS_TOKEN is set (32+ chars); a wrong or missing token gets a plain 404, and
 * repeated wrong tokens are rate-limited.
 *   /_ops/status    version, database, pending migrations
 *   /_ops/migrate   migrate --force + add new library prompts (after each deploy)
 *   /_ops/schedule  schedule:run (Plesk "Fetch a URL" task, every minute)
 *   /_ops/admin?email=…[&revoke=1]  make a registered person admin
 * Token: header "X-Ops-Token" or ?token=…
 * งานดูแลระบบผ่าน URL สำหรับโฮสต์ที่รัน artisan ไม่ได้ ปิดอยู่จนกว่าจะตั้ง RAO_OPS_TOKEN
 */
class OpsController extends Controller
{
    public function __invoke(Request $request, string $action): Response
    {
        $this->authorizeToken($request);
        @set_time_limit(120);

        try {
            $out = match ($action) {
                'status' => $this->status(),
                'migrate' => $this->run('migrate', ['--force' => true])
                    .$this->run('db:seed', ['--class' => 'PromptLibrarySeeder', '--force' => true]),
                'schedule' => $this->run('schedule:run'),
                'admin' => $this->run('rao:admin', array_filter([
                    'email' => (string) $request->query('email'),
                    '--revoke' => $request->boolean('revoke'),
                ])),
            };
        } catch (Throwable $e) {
            report($e);

            return response("FAILED: {$e->getMessage()}\n", 500)->header('Content-Type', 'text/plain; charset=utf-8');
        }

        return response($out, 200)
            ->header('Content-Type', 'text/plain; charset=utf-8')
            ->header('Cache-Control', 'no-store')
            ->header('X-Robots-Tag', 'noindex');
    }

    private function authorizeToken(Request $request): void
    {
        $expected = (string) config('rao.ops_token');
        $key = 'ops:'.$request->ip();
        abort_if(RateLimiter::tooManyAttempts($key, 5), 429);

        $given = (string) ($request->header('X-Ops-Token') ?: $request->query('token', ''));
        if (strlen($expected) < 32 || ! hash_equals($expected, $given)) {
            RateLimiter::hit($key, 600);
            abort(404);
        }
    }

    /** @param  array<string, mixed>  $args */
    private function run(string $command, array $args = []): string
    {
        $code = Artisan::call($command, $args);

        return "$ {$command}\n".trim(Artisan::output())."\n".($code === 0 ? '' : "exit {$code}\n")."\n";
    }

    private function status(): string
    {
        $v = AppVersion::info();
        $db = DB::connection();
        $version = $db->getDriverName() === 'sqlite' ? 'sqlite '.$db->selectOne('select sqlite_version() v')->v : $db->selectOne('select version() v')->v;
        $ran = DB::table('migrations')->pluck('migration')->all();
        $files = collect(glob(database_path('migrations/*.php')))->map(fn ($f) => basename($f, '.php'));
        $pending = $files->diff($ran)->values();

        return implode("\n", [
            "app      {$v['version']} (build {$v['build']})",
            'php      '.PHP_VERSION,
            "database {$version}",
            'pending  '.($pending->isEmpty() ? 'none' : $pending->implode(', ')),
            '',
        ]);
    }
}
