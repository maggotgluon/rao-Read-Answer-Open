import { StampLogo } from '@/components/rao/logo';
import { useT } from '@/lib/i18n';
import type { Streak } from '@/types/space';

/**
 * Streak as a count of stamps: one stamp for every day you both wrote in a row.
 * Gentle on purpose: free misses are shown as days you can rest, never as a warning.
 * สตรีค = จำนวนแสตมป์ติดกัน วันพักแสดงแบบอ่อนโยน
 */
export function StreakPill({ streak }: { streak: Streak }) {
    const { t } = useT();

    return (
        <div className="flex items-center gap-3">
            <StampLogo className="h-11 w-auto rotate-6" aria-hidden />
            <div className="flex flex-col">
                <span className="hand text-2xl leading-tight text-ink">
                    {streak.count > 0
                        ? t('streak.days', { count: streak.count })
                        : t('streak.none')}
                </span>
                <span className="text-sm text-ink-soft">
                    {streak.count > 0 && (
                        <>
                            {t('streak.freezes', {
                                count: streak.freezes_left,
                            })}{' '}
                            ·{' '}
                        </>
                    )}
                    {t('streak.together', { count: streak.together_total })}
                </span>
            </div>
        </div>
    );
}
