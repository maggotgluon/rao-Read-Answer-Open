import {
    EnvelopeIcon,
    PostcardIcon,
    PostmarkIcon,
    SealIcon,
} from '@/components/rao/icons';
import { useState } from 'react';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/types/space';

const ICON = {
    answered: EnvelopeIcon,
    quest_done: SealIcon,
    moment: PostcardIcon,
    event: PostmarkIcon,
} as const;

/** Recent post: who did what, newest first. / ความเคลื่อนไหวล่าสุด */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
    const { t, locale } = useT();
    const [showAll, setShowAll] = useState(false);
    const rtf = new Intl.RelativeTimeFormat(locale === 'th' ? 'th' : 'en', {
        numeric: 'auto',
    });
    const ago = (iso: string) => {
        const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
        if (mins < 60) return rtf.format(-mins, 'minute');
        if (mins < 60 * 24) return rtf.format(-Math.round(mins / 60), 'hour');
        return rtf.format(-Math.round(mins / 1440), 'day');
    };

    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-2xl text-ink">{t('activity.title')}</h2>
            {items.length === 0 ? (
                <p className="flex items-center gap-3 text-sm text-ink-soft">
                    <Asset
                        name="decor.activity-empty"
                        className="size-10 shrink-0 text-kraft"
                    />
                    {t('activity.empty')}
                </p>
            ) : (
                <ul className="flex flex-col">
                    {items
                        .slice(0, showAll ? items.length : 6)
                        .map((i, idx) => {
                            const Icon = ICON[i.type];
                            const name = i.mine ? t('activity.you') : i.actor;

                            return (
                                <li
                                    key={idx}
                                    className="flex items-center gap-3 border-b border-dashed border-rule py-2.5 text-sm last:border-0"
                                >
                                    <span
                                        className={cn(
                                            'grid size-8 shrink-0 place-items-center rounded-full',
                                            i.mine
                                                ? 'bg-stamp-soft text-stamp'
                                                : 'bg-airmail-soft text-airmail',
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="flex-1 text-ink">
                                        {t(`activity.${i.type}`, {
                                            name,
                                            title: i.title ?? '',
                                        })}
                                    </span>
                                    <time className="text-xs text-ink-soft">
                                        {ago(i.at)}
                                    </time>
                                </li>
                            );
                        })}
                </ul>
            )}
            {items.length > 6 && !showAll && (
                <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="press self-start rounded-full px-1 py-2 text-sm text-ink-soft hover:text-ink"
                >
                    {t('activity.more', { count: items.length - 6 })}
                </button>
            )}
        </section>
    );
}
