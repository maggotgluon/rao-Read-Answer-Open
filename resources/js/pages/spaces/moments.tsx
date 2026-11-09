import { MomentCard } from '@/components/space/moment-card';
import { MomentComposer } from '@/components/space/moment-composer';
import { SpaceShell } from '@/components/space/space-shell';
import { useT } from '@/lib/i18n';
import type { MomentItem, SpaceDetail, SpaceEvent } from '@/types/space';

type Props = {
    space: SpaceDetail;
    moments: MomentItem[];
    drafts: MomentItem[];
    reactionEmojis: string[];
    dateOptions: SpaceEvent[];
};

/** Tab 3 — Moments: the couple's shared wall. / ช่วงเวลา */
export default function SpaceMoments({
    space,
    moments,
    drafts,
    reactionEmojis,
    dateOptions,
}: Props) {
    const { t } = useT();
    const frozen = space.status === 'frozen';
    const card = (m: MomentItem) => (
        <MomentCard
            key={m.id}
            moment={m}
            spaceId={space.id}
            emojis={reactionEmojis}
            readOnly={frozen}
            dateOptions={dateOptions}
        />
    );

    return (
        <SpaceShell space={space} tab="moments">
            {!frozen && <MomentComposer spaceId={space.id} />}

            {drafts.length > 0 && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        {t('moment.drafts')}
                    </h2>
                    {drafts.map(card)}
                </section>
            )}

            {moments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('moment.feed_empty')}
                </p>
            ) : (
                <section className="flex flex-col gap-3">
                    {moments.map(card)}
                </section>
            )}
        </SpaceShell>
    );
}
