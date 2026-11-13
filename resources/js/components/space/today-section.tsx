import { CustomPromptForm } from '@/components/space/custom-prompt-form';
import { Fold } from '@/components/rao/fold';
import { LettersIcon } from '@/components/rao/icons';
import { DayCard } from '@/components/space/day-card';
import { useT } from '@/lib/i18n';
import type { DayItem } from '@/types/space';

type Props = {
    days: DayItem[];
    spaceId: string;
    partnerName: string;
    readOnly: boolean;
    canWritePrompts?: boolean;
};

export function TodaySection({
    days,
    spaceId,
    partnerName,
    readOnly,
    canWritePrompts = true,
}: Props) {
    const { t } = useT();
    const todays = days.filter((d) => d.is_today);
    const earlier = days.filter((d) => !d.is_today);
    // Earlier days worth showing: still answerable, or someone answered.
    const relevant = earlier.filter(
        (d) => d.mine || d.partner_answered || d.open,
    );

    return (
        <section className="flex flex-col gap-4">
            {todays.length > 0 ? (
                todays.map((d) => (
                    <DayCard
                        key={d.id}
                        day={d}
                        spaceId={spaceId}
                        partnerName={partnerName}
                        readOnly={readOnly}
                    />
                ))
            ) : (
                <p className="text-sm text-muted-foreground">
                    {t('today.none')}
                </p>
            )}
            {!readOnly && canWritePrompts && (
                <CustomPromptForm spaceId={spaceId} />
            )}

            {relevant.length > 0 && (
                <Fold
                    title={t('today.earlier')}
                    count={relevant.length}
                    icon={<LettersIcon className="size-5" />}
                >
                    {relevant.map((d) => (
                        <DayCard
                            key={d.id}
                            day={d}
                            spaceId={spaceId}
                            partnerName={partnerName}
                            readOnly={readOnly}
                            compact
                        />
                    ))}
                </Fold>
            )}
        </section>
    );
}
