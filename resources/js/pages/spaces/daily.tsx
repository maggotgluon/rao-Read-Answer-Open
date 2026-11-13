import { ActivityFeed } from '@/components/space/activity-feed';
import { DistanceCard } from '@/components/space/distance-card';
import { EventLabel } from '@/components/space/events-panel';
import { Memories } from '@/components/space/memories';
import { MoodStamps } from '@/components/space/mood-stamps';
import { SurveyCard } from '@/components/space/survey-card';
import { Asset } from '@/components/rao/asset';
import { PostmarkIcon } from '@/components/rao/icons';
import { SpaceShell } from '@/components/space/space-shell';
import { StreakPill } from '@/components/space/streak-pill';
import { TodaySection } from '@/components/space/today-section';
import { useT } from '@/lib/i18n';
import type {
    ActivityItem,
    DayItem,
    EventOccurrence,
    LocationInfo,
    Memory,
    Moods,
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
    location: LocationInfo | null;
    moods: Moods;
    survey: boolean;
};

/** Tab 2 — Daily: today's question/quest, streak, today's events, activity. / รายวัน */
export default function SpaceDaily({
    space,
    days,
    streak,
    todayEvents,
    activity,
    memories,
    location,
    moods,
    survey,
}: Props) {
    const { t } = useT();
    const frozen = space.status === 'frozen';

    return (
        <SpaceShell space={space} tab="daily">
            {space.partner && (
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <StreakPill streak={streak} />
                </div>
            )}

            {todayEvents.length > 0 && (
                <section className="flex items-start gap-3 rounded-[var(--radius)] border-[1.5px] border-dashed border-stamp/50 px-4 py-3">
                    <PostmarkIcon className="inked mt-0.5 size-5 shrink-0 text-stamp" />
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg leading-tight text-stamp">
                            {t('daily.today_events')}
                        </h2>
                        {todayEvents.map((e, i) => (
                            <EventLabel key={i} event={e} />
                        ))}
                    </div>
                </section>
            )}

            {space.partner ? (
                <TodaySection
                    days={days}
                    spaceId={space.id}
                    partnerName={space.partner.name}
                    readOnly={frozen}
                    canWritePrompts={space.features.custom_prompts}
                />
            ) : (
                <section className="paper flex flex-col items-start gap-2 p-5">
                    <Asset
                        name="decor.waiting-partner"
                        className="size-12 text-airmail"
                    />
                    <p className="hand text-xl text-ink">
                        {t('today.waiting_partner')}
                    </p>
                </section>
            )}

            {space.partner && (
                <MoodStamps
                    moods={moods}
                    spaceId={space.id}
                    partnerName={space.partner.name}
                    readOnly={frozen}
                />
            )}

            {survey && !frozen && <SurveyCard />}

            {location && location.km !== null && (
                <DistanceCard
                    space={space}
                    location={location}
                    readOnly={frozen}
                    compact
                />
            )}

            <Memories memories={memories} />

            <ActivityFeed items={activity} />
        </SpaceShell>
    );
}
