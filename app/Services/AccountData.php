<?php

namespace App\Services;

use App\Models\Answer;
use App\Models\LetterReply;
use App\Models\Moment;
use App\Models\MomentComment;
use App\Models\MomentReaction;
use App\Models\CityVisit;
use App\Models\Mood;
use App\Models\Place;
use App\Models\Prompt;
use App\Models\SpaceEvent;
use App\Models\SurveyResponse;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

/**
 * "Export my data" and "delete my account" (PDPA rights).
 * Export = only what this person wrote/posted THEMSELVES (never other members' content).
 * ส่งออกข้อมูล (เฉพาะที่ตัวเองเขียน/โพสต์) และลบบัญชี
 */
class AccountData
{
    public function __construct(private MomentPhotos $photos) {}

    /** @return array<string, mixed> */
    public function collect(User $user): array
    {
        $spaceNames = $user->spaces()->get()->mapWithKeys(fn ($s) => [$s->id => $s->name ?: $s->ulid]);
        $space = fn (?int $id) => $id ? ($spaceNames[$id] ?? null) : null;

        return [
            'exported_at' => now()->toIso8601String(),
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'locale' => $user->locale,
                'birthday' => $user->birthday?->toDateString(),
                'show_age' => $user->show_age,
                'theme' => $user->theme,
                'notifications' => $user->notifyPrefs(),
                'morning_at' => $user->morning_at,
                'evening_at' => $user->evening_at,
                'share_location' => $user->share_location,
                'keep_city_history' => $user->keep_city_history,
                'analytics' => $user->analyticsOn(),
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'spaces' => $user->spaces()->get()->map(fn ($s) => [
                'name' => $s->name, 'joined_at' => $s->pivot->joined_at,
                // shared space data about the two of you / ข้อมูลร่วมของพื้นที่
                'long_distance_changes' => $s->modeChanges()->orderBy('changed_at')->get()
                    ->map(fn ($c) => ['long_distance' => $c->long_distance, 'at' => $c->changed_at?->toIso8601String()])->values(),
                'distance_km_by_day' => $s->distanceDays()->orderBy('date')->get()
                    ->mapWithKeys(fn ($d) => [$d->date->toDateString() => $d->km]),
            ])->values(),
            'letters' => Answer::where('user_id', $user->id)->with('dailyPrompt.prompt')->orderBy('created_at')->get()
                ->map(fn (Answer $a) => [
                    'date' => $a->dailyPrompt?->date?->toDateString(),
                    'space' => $space($a->dailyPrompt?->space_id),
                    'kind' => $a->dailyPrompt?->prompt?->kind,
                    'question' => $a->dailyPrompt?->prompt?->textFor($user->locale ?: 'th'),
                    'answer' => $a->body,
                    'written_at' => $a->created_at?->toIso8601String(),
                ])->values(),
            'replies' => LetterReply::where('user_id', $user->id)->with('dailyPrompt')->orderBy('created_at')->get()
                ->map(fn ($r) => ['date' => $r->dailyPrompt?->date?->toDateString(), 'space' => $space($r->dailyPrompt?->space_id), 'body' => $r->body, 'at' => $r->created_at?->toIso8601String()])->values(),
            'moments' => Moment::where('user_id', $user->id)->with('media')->orderBy('created_at')->get()
                ->map(fn (Moment $m) => [
                    'id' => $m->ulid,
                    'space' => $space($m->space_id),
                    'status' => $m->status,
                    'text' => $m->body,
                    'posted_at' => $m->posted_at?->toIso8601String(),
                    'photos' => $m->media->map(fn ($p, $i) => "photos/{$m->ulid}-".($i + 1).'.jpg')->values(),
                ])->values(),
            'comments' => MomentComment::where('user_id', $user->id)->orderBy('created_at')->get()
                ->map(fn ($c) => ['body' => $c->body, 'at' => $c->created_at?->toIso8601String()])->values(),
            'reactions' => MomentReaction::where('user_id', $user->id)->get()
                ->map(fn ($r) => ['emoji' => $r->emoji, 'at' => $r->created_at?->toIso8601String()])->values(),
            'places_added' => Place::where('created_by', $user->id)->orderBy('created_at')->get()
                ->map(fn ($p) => ['space' => $space($p->space_id), 'name' => $p->name, 'kind' => $p->kind, 'city' => $p->city, 'note' => $p->note, 'date' => $p->date?->toDateString()])->values(),
            'city_history' => CityVisit::where('user_id', $user->id)->orderBy('from_date')->get()
                ->map(fn ($v) => ['city' => $v->city, 'from' => $v->from_date->toDateString(), 'to' => $v->to_date?->toDateString()])->values(),
            'moods' => Mood::where('user_id', $user->id)->orderBy('date')->get()
                ->map(fn ($m) => ['date' => $m->date->toDateString(), 'mood' => $m->mood])->values(),
            'dates' => SpaceEvent::where('created_by', $user->id)->get()
                ->map(fn ($e) => ['space' => $space($e->space_id), 'kind' => $e->kind, 'title' => $e->title, 'date' => $e->date?->toDateString(), 'repeats_yearly' => $e->repeats_yearly])->values(),
            'own_questions' => Prompt::where('created_by', $user->id)->whereNotNull('space_id')->get()
                ->map(fn ($p) => ['kind' => $p->kind, 'th' => $p->text_th, 'en' => $p->text_en])->values(),
            'survey' => SurveyResponse::where('user_id', $user->id)->get(['survey', 'score', 'liked', 'change', 'created_at']),
        ];
    }

    /** Build the ZIP (JSON + readable HTML + own photos); returns a temp file path. */
    public function zip(User $user): string
    {
        $data = $this->collect($user);
        $path = tempnam(sys_get_temp_dir(), 'rao-export-');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('rao-data.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $zip->addFromString('rao-letters.html', view('export.letters', ['d' => $data, 'locale' => $user->locale ?: 'th'])->render());

        Moment::where('user_id', $user->id)->with('media')->get()->each(function (Moment $m) use ($zip) {
            foreach ($m->media as $i => $media) {
                $file = Storage::disk(MomentPhotos::DISK)->path($media->path);
                if (is_file($file)) {
                    $zip->addFile($file, "photos/{$m->ulid}-".($i + 1).'.jpg');
                }
            }
        });
        $zip->close();

        return $path;
    }

    /**
     * Permanently delete a person and everything they wrote/posted. Spaces they shared become
     * read-only for the others (who keep their own content); spaces with nobody left are deleted.
     * ลบถาวร: บัญชีและทุกอย่างที่เขียน/โพสต์ space ที่มีคนอื่นอยู่จะเป็นแบบอ่านอย่างเดียว
     */
    public function purge(User $user): void
    {
        $spaces = $user->spaces()->withCount('members')->get();
        $paths = Moment::where('user_id', $user->id)->with('media')->get()->flatMap(fn ($m) => $m->media->pluck('path'));

        DB::transaction(function () use ($user, $spaces) {
            foreach ($spaces as $space) {
                if ($space->members_count <= 1) {
                    $space->delete();
                } else {
                    // Read-only, kept for the other member(s), never auto-purged.
                    $space->forceFill([
                        'status' => $space::STATUS_FROZEN, 'frozen_by' => null,
                        'frozen_at' => now(), 'delete_after' => null,
                    ])->save();
                    $space->invites()->whereNull('accepted_at')->delete();
                }
            }
            // Rows they authored go via FK cascades (answers, moments, comments, reactions,
            // replies, moods, ratings, push, analytics, activity, survey).
            $user->delete();
        });

        $paths->each(fn ($p) => $this->photos->delete($p));
        $spaces->where('members_count', '<=', 1)
            ->each(fn ($s) => Storage::disk(MomentPhotos::DISK)->deleteDirectory(MomentPhotos::folder($s)));
    }
}
