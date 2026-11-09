import { Images, MessageCircleHeart, Sparkles, Star } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { ActivityItem } from '@/types/space';

const ICON = {
    answered: MessageCircleHeart,
    quest_done: Sparkles,
    moment: Images,
    event: Star,
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
    const { t, locale } = useT();
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
        <section className="flex flex-col gap-2 rounded-2xl border border-border p-4">
            <h2 className="font-medium">{t('activity.title')}</h2>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('activity.empty')}
                </p>
            ) : (
                <ul className="grid gap-2 text-sm">
                    {items.map((i, idx) => {
                        const Icon = ICON[i.type];
                        const name = i.mine ? t('activity.you') : i.actor;

                        return (
                            <li key={idx} className="flex items-center gap-2">
                                <Icon className="size-4 shrink-0 text-primary" />
                                <span className="flex-1">
                                    {t(`activity.${i.type}`, {
                                        name,
                                        title: i.title ?? '',
                                    })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {ago(i.at)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
