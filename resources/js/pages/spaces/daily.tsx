import { ActivityFeed } from '@/components/space/activity-feed';
import { EventLabel } from '@/components/space/events-panel';
import { Memories } from '@/components/space/memories';
import { SpaceShell } from '@/components/space/space-shell';
import { StreakPill } from '@/components/space/streak-pill';
import { TodaySection } from '@/components/space/today-section';
import { useT } from '@/lib/i18n';
import type {
    ActivityItem,
    DayItem,
    EventOccurrence,
    Memory,
    SpaceDetail,
    Streak,
} from '@/types/space';

type Props = {
    space: SpaceDetail;
    days: DayItem[];
    streak: Streak;
    todayEvents: EventOccurrence[];
    activity: ActivityItem[];
    memories: Memory[];
};

/** Tab 2 — Daily: today's question/quest, streak, today's events, activity. / รายวัน */
export default function SpaceDaily({
    space,
    days,
    streak,
    todayEvents,
    activity,
    memories,
}: Props) {
    const { t } = useT();
    const frozen = space.status === 'frozen';

    return (
        <SpaceShell space={space} tab="daily">
            {todayEvents.length > 0 && (
                <section className="flex flex-col gap-1 rounded-2xl border border-primary/30 bg-primary/10 p-4">
                    <h2 className="text-sm font-medium">
                        {t('daily.today_events')} 🎉
                    </h2>
                    {todayEvents.map((e, i) => (
                        <EventLabel key={i} event={e} />
                    ))}
                </section>
            )}

            <Memories memories={memories} />

            {space.partner ? (
                <>
                    <StreakPill streak={streak} />
                    <TodaySection
                        days={days}
                        spaceId={space.id}
                        partnerName={space.partner.name}
                        readOnly={frozen}
                    />
                </>
            ) : (
                <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {t('today.waiting_partner')}
                </p>
            )}

            <ActivityFeed items={activity} />
        </SpaceShell>
    );
}
