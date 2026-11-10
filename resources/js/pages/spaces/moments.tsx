import { MomentCard } from '@/components/space/moment-card';
import { MomentComposer } from '@/components/space/moment-composer';
import { SpaceShell } from '@/components/space/space-shell';
import { PostcardIcon } from '@/components/rao/icons';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import type { MomentItem, SpaceDetail, SpaceEvent } from '@/types/space';

type Props = {
    space: SpaceDetail;
    moments: MomentItem[];
    drafts: MomentItem[];
    reactionKeys: string[];
    dateOptions: SpaceEvent[];
};

/** Tab 3 — Moments: the couple's shared wall. / ช่วงเวลา */
export default function SpaceMoments({
    space,
    moments,
    drafts,
    reactionKeys,
    dateOptions,
}: Props) {
    const { t } = useT();
    const frozen = space.status === 'frozen';
    const card = (m: MomentItem) => (
        <MomentCard
            key={m.id}
            moment={m}
            spaceId={space.id}
            emojis={reactionKeys}
            readOnly={frozen}
            dateOptions={dateOptions}
        />
    );

    return (
        <SpaceShell space={space} tab="moments">
            {!frozen && (
                <MomentComposer
                    spaceId={space.id}
                    photos={space.features.photos}
                />
            )}

            {drafts.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xl text-ink-soft">
                        {t('moment.drafts')}
                    </h2>
                    {drafts.map(card)}
                </section>
            )}

            {moments.length === 0 ? (
                <section className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                    <PostcardIcon className="size-12 -rotate-6 text-kraft" />
                    <p className="hand text-xl text-ink">
                        <Asset
                            name="decor.moments-empty"
                            className="mx-auto mb-3 block size-16 text-kraft"
                        />
                        {t('moment.feed_empty')}
                    </p>
                </section>
            ) : (
                <section className="columns-1 gap-4 sm:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
                    {moments.map(card)}
                </section>
            )}
        </SpaceShell>
    );
}
