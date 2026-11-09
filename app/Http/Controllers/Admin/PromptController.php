<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manage the shared prompt LIBRARY (space_id = null). Couple-written prompts are private
 * to their space and never shown here.
 * จัดการคลังคำถามกลาง (ไม่แสดงคำถามที่คู่เขียนเอง เพราะเป็นของส่วนตัว)
 */
class PromptController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'kind' => ['nullable', Rule::in(Prompt::KINDS)],
            'tag' => ['nullable', Rule::in(Prompt::TAGS)],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'missing' => ['nullable', Rule::in(['th', 'en'])],
            'fit' => ['nullable', Rule::in(Prompt::FITS)],
            'sort' => ['nullable', Rule::in(['worst', 'best'])],
        ]);

        // 👍/👎 totals per prompt (private ratings, counts only). / รวมคะแนนต่อคำถาม
        $ratings = DB::table('prompt_ratings')->join('daily_prompts', 'daily_prompts.id', '=', 'prompt_ratings.daily_prompt_id')
            ->selectRaw('daily_prompts.prompt_id, sum(case when value > 0 then 1 else 0 end) as up, sum(case when value < 0 then 1 else 0 end) as down')
            ->groupBy('daily_prompts.prompt_id');

        $query = Prompt::query()
            ->select('prompts.*', DB::raw('coalesce(r.up, 0) as up'), DB::raw('coalesce(r.down, 0) as down'))
            ->leftJoinSub($ratings, 'r', 'r.prompt_id', '=', 'prompts.id')
            ->whereNull('space_id')->withCount('dailyUses');

        if ($q = $filters['q'] ?? null) {
            $query->where(fn ($w) => $w->where('text_en', 'like', "%{$q}%")
                ->orWhere('text_th', 'like', "%{$q}%")->orWhere('key', 'like', "%{$q}%"));
        }
        foreach (['kind', 'tag'] as $f) {
            if ($v = $filters[$f] ?? null) {
                $query->where($f, $v);
            }
        }
        if ($s = $filters['status'] ?? null) {
            $query->where('active', $s === 'active');
        }
        if ($fit = $filters['fit'] ?? null) {
            $fit === 'any'
                ? $query->where(fn ($w) => $w->where('fit', 'any')->orWhere(fn ($n) => $n->whereNull('fit')->where('kind', Prompt::KIND_QUESTION)))
                : ($fit === 'together'
                    ? $query->where(fn ($w) => $w->where('fit', 'together')->orWhere(fn ($n) => $n->whereNull('fit')->where('kind', Prompt::KIND_QUEST)))
                    : $query->where('fit', 'apart'));
        }
        match ($filters['sort'] ?? null) {
            'worst' => $query->orderByRaw('coalesce(r.up, 0) - coalesce(r.down, 0)')->orderByDesc('down'),
            'best' => $query->orderByRaw('coalesce(r.up, 0) - coalesce(r.down, 0) desc'),
            default => null,
        };
        if ($m = $filters['missing'] ?? null) {
            $query->where(fn ($w) => $w->whereNull("text_{$m}")->orWhere("text_{$m}", ''));
        }

        $library = Prompt::query()->whereNull('space_id');

        return Inertia::render('admin/prompts', [
            'prompts' => $query->orderBy('kind')->orderBy('id')->paginate(50)->withQueryString()
                ->through(fn (Prompt $p) => [
                    'id' => $p->id, 'key' => $p->key, 'kind' => $p->kind, 'tag' => $p->tag,
                    'text_en' => $p->text_en, 'text_th' => $p->text_th, 'active' => $p->active,
                    'uses' => $p->daily_uses_count,
                    'fit' => $p->effectiveFit(),
                    'up' => (int) $p->up,
                    'down' => (int) $p->down,
                ]),
            'filters' => $filters,
            'stats' => [
                'total' => (clone $library)->count(),
                'active' => (clone $library)->where('active', true)->count(),
                'by_kind' => (clone $library)->where('active', true)->selectRaw('kind, count(*) as n')->groupBy('kind')->pluck('n', 'kind'),
                'by_tag' => (clone $library)->where('active', true)->selectRaw('tag, count(*) as n')->groupBy('tag')->pluck('n', 'tag'),
            ],
            'kinds' => Prompt::KINDS,
            'tags' => Prompt::TAGS,
            'fits' => Prompt::FITS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Prompt::create([...$this->validated($request), 'space_id' => null, 'created_by' => $request->user()->id]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.prompt_added')]);

        return back();
    }

    public function update(Request $request, Prompt $prompt): RedirectResponse
    {
        abort_unless($prompt->space_id === null, 404);

        $prompt->update($this->validated($request));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.prompt_saved')]);

        return back();
    }

    /** Used prompts can't be deleted (couples' history points at them) — deactivate instead. */
    public function destroy(Prompt $prompt): RedirectResponse
    {
        abort_unless($prompt->space_id === null, 404);

        if ($prompt->dailyUses()->exists()) {
            $prompt->update(['active' => false]);
            Inertia::flash('toast', ['type' => 'info', 'message' => __('admin.prompt_deactivated')]);
        } else {
            $prompt->delete();
        }

        return back();
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(Prompt::KINDS)],
            'tag' => ['required', Rule::in(Prompt::TAGS)],
            'fit' => ['nullable', Rule::in([...Prompt::FITS, ''])],
            'text_en' => ['nullable', 'string', 'max:300', 'required_without:text_th'],
            'text_th' => ['nullable', 'string', 'max:300', 'required_without:text_en'],
            'active' => ['boolean'],
        ]);

        return [...$data, 'fit' => ($data['fit'] ?? null) ?: null, 'active' => $request->boolean('active', true)];
    }
}
