import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Asset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store } from '@/routes/survey';

/**
 * One short, voluntary question set ~14 days in. "Not now" also counts (never asked again).
 * แบบสอบถามสั้น ๆ ครั้งเดียว กด "ไว้ทีหลัง" ก็จะไม่ถามอีก
 */
export function SurveyCard() {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const form = useForm<{
        score: number | null;
        liked: string;
        change: string;
    }>({
        score: null,
        liked: '',
        change: '',
    });
    const send = (dismiss = false) => {
        if (dismiss)
            form.transform(() => ({ score: null, liked: '', change: '' }));
        form.post(store.url(), { preserveScroll: true });
    };

    return (
        <section className="paper animate-arrive flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
                <span className="text-xs text-kraft">
                    {t('survey.from_us')}
                </span>
                <h2 className="hand text-2xl leading-tight text-ink">
                    {t('survey.title')}
                </h2>
            </div>
            <div
                className="flex justify-between gap-1"
                role="radiogroup"
                aria-label={t('survey.title')}
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={form.data.score === n}
                        aria-label={t(`survey.score_${n}`)}
                        onClick={() => {
                            form.setData('score', n);
                            setOpen(true);
                        }}
                        className={cn(
                            'press grid size-12 place-items-center rounded-full',
                            form.data.score === n
                                ? 'bg-stamp-soft'
                                : 'opacity-70 grayscale-[0.4] hover:opacity-100',
                        )}
                    >
                        <Asset
                            name={`faces.${n}`}
                            className={cn(
                                'size-8',
                                form.data.score === n
                                    ? 'text-stamp'
                                    : 'text-ink',
                            )}
                        />
                    </button>
                ))}
            </div>
            {open && (
                <div className="animate-arrive flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm text-ink">
                        {t('survey.liked')}
                        <textarea
                            rows={2}
                            maxLength={500}
                            value={form.data.liked}
                            onChange={(e) =>
                                form.setData('liked', e.target.value)
                            }
                            className="lined hand resize-none bg-transparent px-1 text-lg outline-none"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-ink">
                        {t('survey.change')}
                        <textarea
                            rows={2}
                            maxLength={500}
                            value={form.data.change}
                            onChange={(e) =>
                                form.setData('change', e.target.value)
                            }
                            className="lined hand resize-none bg-transparent px-1 text-lg outline-none"
                        />
                    </label>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Button
                    disabled={!form.data.score || form.processing}
                    onClick={() => send()}
                >
                    {t('survey.send')}
                </Button>
                <Button
                    variant="ghost"
                    disabled={form.processing}
                    onClick={() => send(true)}
                >
                    {t('survey.not_now')}
                </Button>
            </div>
            <p className="text-xs text-ink-soft">{t('survey.note')}</p>
        </section>
    );
}
