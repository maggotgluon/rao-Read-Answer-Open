import { CustomPromptForm } from '@/components/space/custom-prompt-form';
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
        <section className="flex flex-col gap-3">
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
                <details className="open:[&>*+*]:mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                        {t('today.earlier')} ({relevant.length})
                    </summary>
                    <div className="flex flex-col gap-2">
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
                    </div>
                </details>
            )}
        </section>
    );
}
