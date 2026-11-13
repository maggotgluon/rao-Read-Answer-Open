import { router } from '@inertiajs/react';
import { useState } from 'react';
import { DaySheet } from '@/components/space/day-sheet';
import { DistanceCard } from '@/components/space/distance-card';
import { ManageEvents, UpcomingEvents } from '@/components/space/events-panel';
import { InviteCard } from '@/components/space/invite-card';
import { MonthCalendar, MoodMonth } from '@/components/space/month-calendar';
import { PlacesPanel } from '@/components/space/places-panel';
import { TogetherApart } from '@/components/space/together-apart';
import { SpaceSettings } from '@/components/space/space-settings';
import { SpaceShell } from '@/components/space/space-shell';
import { useT } from '@/lib/i18n';
import type {
    CalendarMonth,
    DayDetail,
    EventOccurrence,
    Invite,
    LocationInfo,
    PlacesData,
    SpaceStory,
    SpaceDetail,
    SpaceEvent,
} from '@/types/space';

type Props = {
    space: SpaceDetail;
    invite: Invite | null;
    calendar: CalendarMonth;
    upcoming: EventOccurrence[];
    events: SpaceEvent[];
    day?: DayDetail | null;
    location: LocationInfo | null;
    story: SpaceStory | null;
    places: PlacesData | null;
};

/** Tab 1 — Overview / ภาพรวม */
export default function SpaceOverview({
    space,
    invite,
    calendar,
    upcoming,
    events,
    day,
    location,
    story,
    places,
}: Props) {
    const { t } = useT();
    const [picked, setPicked] = useState<string | null>(null);
    const frozen = space.status === 'frozen';

    const pick = (date: string) => {
        setPicked(date);
        router.reload({ only: ['day'], data: { day: date } });
    };

    return (
        <SpaceShell space={space} tab="overview">
            {invite && <InviteCard invite={invite} spaceId={space.id} />}

            {location && (
                <DistanceCard
                    space={space}
                    location={location}
                    readOnly={frozen}
                />
            )}

            <MonthCalendar
                calendar={calendar}
                spaceId={space.id}
                partnerName={space.partner?.name}
                onPick={pick}
            />

            <p className="-mt-2 text-sm text-ink-soft">
                {t('overview.summary', {
                    wdone: calendar.stats.week_complete,
                    wall: calendar.stats.week_elapsed,
                    mdone: calendar.stats.month_complete,
                    mall: calendar.stats.month_elapsed,
                })}
            </p>

            <MoodMonth
                summary={calendar.mood_summary}
                partnerName={space.partner?.name}
            />

            {story && (
                <TogetherApart
                    story={story}
                    calendar={calendar}
                    spaceId={space.id}
                    readOnly={frozen}
                />
            )}

            {places && (
                <PlacesPanel
                    data={places}
                    spaceId={space.id}
                    location={location}
                    readOnly={frozen}
                />
            )}

            <UpcomingEvents upcoming={upcoming} />

            <div className="flex flex-col">
                <ManageEvents
                    spaceId={space.id}
                    events={events}
                    places={places?.items}
                    readOnly={frozen}
                />
                {!frozen && <SpaceSettings space={space} />}
            </div>

            <DaySheet
                date={picked}
                day={day}
                spaceId={space.id}
                partnerName={space.partner?.name ?? ''}
                onClose={() => setPicked(null)}
            />
        </SpaceShell>
    );
}
