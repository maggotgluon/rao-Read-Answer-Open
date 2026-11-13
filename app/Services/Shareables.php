<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\DailyPrompt;
use App\Models\Moment;
use App\Models\ShareRequest;
use App\Models\Space;
use App\Models\User;
use App\Support\Features;
use Illuminate\Database\Eloquent\Model;

/**
 * What can be shared, and who must say OK first.
 *   moment (own posted postcard)       → owner, no OK needed
 *   moment (partner's postcard)        → needs the partner's OK
 *   letter (both letters of a day)     → needs the partner's OK
 *   achievement (a stamp of the space) → either member, no OK needed
 * แชร์อะไรได้บ้าง และต้องให้ใครอนุญาตก่อน
 */
class Shareables
{
    public const TYPES = ['moment', 'letter', 'achievement'];

    /** The item, only if it belongs to this space and is shareable at all. */
    public function find(Space $space, string $type, int|string $id): ?Model
    {
        return match ($type) {
            // The app knows postcards by their ulid; links store the row id.
            // แอปอ้างโปสการ์ดด้วย ulid ส่วนลิงก์เก็บ id
            'moment' => Moment::where('space_id', $space->id)->posted()
                ->where(is_int($id) ? 'id' : 'ulid', $id)->first(),
            'letter' => DailyPrompt::where('space_id', $space->id)->has('answers', '>=', Space::MAX_MEMBERS)->find((int) $id),
            'achievement' => Achievement::where('space_id', $space->id)->find((int) $id),
            default => null,
        };
    }

    /** Whose OK is needed (null = nobody's). / ต้องได้รับอนุญาตจากใคร */
    public function ownerFor(Model $item, User $viewer): ?int
    {
        if ($item instanceof Moment) {
            return $item->user_id === $viewer->id ? null : $item->user_id;
        }
        if ($item instanceof DailyPrompt) {
            return $item->answers()->where('user_id', '!=', $viewer->id)->value('user_id');
        }

        return null;
    }

    public function enabled(Space $space): bool
    {
        return Features::on('sharing', $space) && $space->isActive();
    }

    /**
     * 'own' (share freely), 'allowed' (partner said OK), 'ask', 'pending', 'not_now', or
     * null when sharing is off. / สถานะการแชร์ของชิ้นนี้
     */
    public function state(Space $space, Model $item, User $viewer): ?string
    {
        if (! $this->enabled($space)) {
            return null;
        }
        $owner = $this->ownerFor($item, $viewer);
        if ($owner === null) {
            return 'own';
        }
        $req = $this->latestRequest($item, $viewer);

        return match (true) {
            ! $req => 'ask',
            $req->status === ShareRequest::PENDING => 'pending',
            $req->status === ShareRequest::ALLOWED && $req->decided_at->gt(now()->subDays(ShareRequest::ALLOW_DAYS)) => 'allowed',
            $req->status === ShareRequest::DECLINED && $req->decided_at->gt(now()->subHours(ShareRequest::ASK_AGAIN_HOURS)) => 'not_now',
            default => 'ask',
        };
    }

    public function canShare(Space $space, Model $item, User $viewer): bool
    {
        return in_array($this->state($space, $item, $viewer), ['own', 'allowed'], true);
    }

    public function latestRequest(Model $item, User $viewer): ?ShareRequest
    {
        return ShareRequest::where(['item_type' => self::typeOf($item), 'item_id' => $item->getKey(), 'requester_id' => $viewer->id])
            ->latest('id')->first();
    }

    public static function typeOf(Model $item): string
    {
        return match (true) {
            $item instanceof Moment => 'moment',
            $item instanceof DailyPrompt => 'letter',
            default => 'achievement',
        };
    }
}
