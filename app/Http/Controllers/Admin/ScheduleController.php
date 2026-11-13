<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use App\Models\ScheduledPrompt;
use App\Models\SpecialDay;
use App\Support\Themes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin calendar: a question/quest for a date, and special days for everyone.
 * ปฏิทินแอดมิน: กำหนดคำถามให้วันที่ และเพิ่มวันพิเศษให้ทุก space
 */
class ScheduleController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('admin/schedule', [
            'dateIcons' => self::dateIcons(),
            'scheduled' => ScheduledPrompt::with('prompt')->whereDate('date', '>=', now()->subDays(30)->toDateString())
                ->orderBy('date')->get()->map(fn (ScheduledPrompt $s) => [
                    'id' => $s->id,
                    'date' => $s->date->toDateString(),
                    'audience' => $s->audience,
                    'past' => $s->date->lt(today()),
                    'prompt' => [
                        'id' => $s->prompt->id, 'key' => $s->prompt->key, 'kind' => $s->prompt->kind,
                        'text' => $s->prompt->textFor($locale), 'text_th' => $s->prompt->text_th, 'text_en' => $s->prompt->text_en,
                    ],
                    'uses' => $s->prompt->dailyUses()->count(),
                ]),
            'specialDays' => SpecialDay::orderByRaw('repeats_yearly desc')->orderBy('date')->get()->map(fn (SpecialDay $d) => [
                'id' => $d->id, 'date' => $d->date->toDateString(), 'title_th' => $d->title_th, 'title_en' => $d->title_en,
                'emoji' => $d->emoji, 'icon' => $d->icon, 'repeats_yearly' => $d->repeats_yearly, 'active' => $d->active,
            ]),
            'audiences' => ScheduledPrompt::AUDIENCES,
        ]);
    }

    /** Schedule an existing library prompt (prompt_id) or write a new one. */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'audience' => ['required', Rule::in(ScheduledPrompt::AUDIENCES)],
            'prompt_id' => ['nullable', 'integer', Rule::exists('prompts', 'id')->whereNull('space_id')],
            'kind' => ['required_without:prompt_id', 'nullable', Rule::in(Prompt::KINDS)],
            'text_th' => ['nullable', 'string', 'max:300'],
            'text_en' => ['nullable', 'string', 'max:300'],
        ]);
        if (empty($data['prompt_id']) && blank($data['text_th'] ?? null) && blank($data['text_en'] ?? null)) {
            return back()->withErrors(['text_th' => __('admin.need_text')]);
        }
        if (ScheduledPrompt::whereDate('date', $data['date'])->where('audience', $data['audience'])->exists()) {
            return back()->withErrors(['date' => __('admin.date_taken')]);
        }

        $promptId = $data['prompt_id'] ?? Prompt::create([
            'kind' => $data['kind'], 'tag' => null, 'fit' => 'any',
            'text_th' => $data['text_th'] ?? null, 'text_en' => $data['text_en'] ?? null,
            'created_by' => $request->user()->id,
        ])->id;

        ScheduledPrompt::create([
            'date' => $data['date'], 'audience' => $data['audience'],
            'prompt_id' => $promptId, 'created_by' => $request->user()->id,
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.scheduled')]);

        return back();
    }

    public function destroy(ScheduledPrompt $scheduled): RedirectResponse
    {
        $scheduled->delete();   // the prompt stays in the library / คำถามยังอยู่ในคลัง

        return back();
    }

    public function storeDay(Request $request): RedirectResponse
    {
        SpecialDay::create($this->day($request));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.day_added')]);

        return back();
    }

    public function updateDay(Request $request, SpecialDay $day): RedirectResponse
    {
        $day->update($this->day($request));

        return back();
    }

    public function destroyDay(SpecialDay $day): RedirectResponse
    {
        $day->delete();

        return back();
    }

    /** @return array<string, mixed> */
    private function day(Request $request): array
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'title_th' => ['nullable', 'string', 'max:100', 'required_without:title_en'],
            'title_en' => ['nullable', 'string', 'max:100', 'required_without:title_th'],
            'emoji' => ['nullable', 'string', 'max:16'],
            'icon' => ['nullable', Rule::in(self::dateIcons())],
            'repeats_yearly' => ['boolean'],
            'active' => ['boolean'],
        ]);

        return [...$data, 'repeats_yearly' => $request->boolean('repeats_yearly', true), 'active' => $request->boolean('active', true)];
    }

    /** Pictures in the default theme's dates/ folder. / ภาพวันสำคัญที่เลือกได้ */
    public static function dateIcons(): array
    {
        return collect(Themes::get(Themes::DEFAULT)['assets'])->keys()
            ->filter(fn ($k) => str_starts_with($k, 'dates.'))
            ->map(fn ($k) => substr($k, 6))->values()->all();
    }
}
