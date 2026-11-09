import { router } from '@inertiajs/react';
import { useState } from 'react';
import { DaySheet } from '@/components/space/day-sheet';
import { ManageEvents, UpcomingEvents } from '@/components/space/events-panel';
import { InviteCard } from '@/components/space/invite-card';
import { MonthCalendar } from '@/components/space/month-calendar';
import { SpaceSettings } from '@/components/space/space-settings';
import { SpaceShell } from '@/components/space/space-shell';
import { useT } from '@/lib/i18n';
import type {
    CalendarMonth,
    DayDetail,
    EventOccurrence,
    Invite,
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
};

/** Tab 1 — Overview / ภาพรวม */
export default function SpaceOverview({
    space,
    invite,
    calendar,
    upcoming,
    events,
    day,
}: Props) {
    const { t } = useT();
    const [picked, setPicked] = useState<string | null>(null);
    const frozen = space.status === 'frozen';
    const todayEvents = upcoming.filter((e) => e.in_days === 0);
    const todayStatus = calendar.days.find((d) => d.is_today)?.status;
    const todayMark =
        todayStatus === 'complete'
            ? '🔥'
            : todayStatus === 'partial'
              ? '½'
              : '○';

    const pick = (date: string) => {
        setPicked(date);
        router.reload({ only: ['day'], data: { day: date } });
    };

    return (
        <SpaceShell space={space} tab="overview">
            {invite && <InviteCard invite={invite} spaceId={space.id} />}

            <div className="grid grid-cols-3 gap-2 text-center">
                <Stat
                    label={t('overview.today')}
                    value={todayMark}
                    hint={todayEvents.map((e) => e.title).join(', ')}
                />
                <Stat
                    label={t('overview.week')}
                    value={`${calendar.stats.week_complete}/${calendar.stats.week_elapsed}`}
                />
                <Stat
                    label={t('overview.month')}
                    value={`${calendar.stats.month_complete}/${calendar.stats.month_elapsed}`}
                />
            </div>

            <MonthCalendar
                calendar={calendar}
                spaceId={space.id}
                onPick={pick}
            />
            <UpcomingEvents upcoming={upcoming} />
            <ManageEvents
                spaceId={space.id}
                events={events}
                readOnly={frozen}
            />
            {!frozen && <SpaceSettings space={space} />}

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

function Stat({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div
            className="flex flex-col gap-0.5 rounded-2xl bg-primary/5 p-3"
            title={hint}
        >
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold">{value}</span>
            {hint && (
                <span className="truncate text-xs text-primary">{hint}</span>
            )}
        </div>
    );
}
