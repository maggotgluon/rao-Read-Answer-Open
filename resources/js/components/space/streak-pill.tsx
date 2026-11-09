import { Flame } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { Streak } from '@/types/space';

export function StreakPill({ streak }: { streak: Streak }) {
    const { t } = useT();

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-primary/5 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 font-medium">
                <Flame className="size-4 text-orange-500" />
                {streak.count > 0
                    ? t('streak.days', { count: streak.count })
                    : t('streak.none')}
            </span>
            {streak.count > 0 && (
                <span className="text-muted-foreground">
                    {t('streak.freezes', { count: streak.freezes_left })}
                </span>
            )}
            <span className="text-muted-foreground">
                {t('streak.together', { count: streak.together_total })}
            </span>
        </div>
    );
}
