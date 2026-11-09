import { Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { Memory } from '@/types/space';

/** "On this day" — moments from earlier years of today's dates. / ความทรงจำในวันนี้ของปีก่อน ๆ */
export function Memories({ memories }: { memories: Memory[] }) {
    const { t } = useT();
    if (!memories.length) return null;

    return (
        <section className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <h2 className="flex items-center gap-2 font-medium">
                <Sparkles className="size-4 text-primary" />{' '}
                {t('memories.title')}
            </h2>
            {memories.map((m) => (
                <article
                    key={m.id}
                    className="flex flex-col gap-1.5 rounded-xl bg-card p-3 text-sm"
                >
                    <span className="text-xs text-muted-foreground">
                        {m.event} ·{' '}
                        {t('memories.years_ago', {
                            count: Math.max(1, m.years_ago),
                        })}{' '}
                        · {m.author}
                    </span>
                    {m.photos.length > 0 && (
                        <div className="grid grid-cols-4 gap-1">
                            {m.photos.map((src) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt=""
                                    loading="lazy"
                                    className="aspect-square rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    )}
                    {m.body && <p className="whitespace-pre-line">{m.body}</p>}
                </article>
            ))}
        </section>
    );
}
