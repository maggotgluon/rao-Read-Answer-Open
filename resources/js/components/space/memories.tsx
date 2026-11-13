import { LettersIcon } from '@/components/rao/icons';
import { useT } from '@/lib/i18n';
import type { Memory } from '@/types/space';

/**
 * "On this day": old letters from earlier years of today's dates, a little tilted,
 * each with the year as a postmark. / จดหมายเก่าจากปีก่อน ๆ ของวันนี้
 */
export function Memories({ memories }: { memories: Memory[] }) {
    const { t } = useT();
    if (!memories.length) return null;

    return (
        <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-2xl text-ink">
                <LettersIcon className="size-6 text-kraft" />
                {t('memories.title')}
            </h2>
            <div className="flex flex-col gap-4">
                {memories.map((m, i) => (
                    <article
                        key={m.id}
                        className="paper relative flex flex-col gap-2 p-4 pr-16 text-sm"
                        style={{
                            transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)`,
                        }}
                    >
                        <span
                            aria-hidden
                            className="absolute top-3 right-3 grid size-12 place-items-center rounded-full border-[1.5px] border-dashed border-kraft text-center text-[10px] leading-tight text-kraft"
                        >
                            {t('memories.years_ago', {
                                count: Math.max(1, m.years_ago),
                            })}
                        </span>
                        <span className="text-xs text-ink-soft">
                            {m.event} · {m.author}
                        </span>
                        {m.photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-1.5">
                                {m.photos.map((src) => (
                                    <img
                                        key={src}
                                        src={src}
                                        alt=""
                                        loading="lazy"
                                        className="aspect-square rounded-[4px] object-cover"
                                    />
                                ))}
                            </div>
                        )}
                        {m.body && (
                            <p className="hand text-lg whitespace-pre-line text-ink">
                                {m.body}
                            </p>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
