<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);

        $query = Prompt::query()->whereNull('space_id')->withCount('dailyUses');

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
            'text_en' => ['nullable', 'string', 'max:300', 'required_without:text_th'],
            'text_th' => ['nullable', 'string', 'max:300', 'required_without:text_en'],
            'active' => ['boolean'],
        ]);

        return [...$data, 'active' => $request->boolean('active', true)];
    }
}
