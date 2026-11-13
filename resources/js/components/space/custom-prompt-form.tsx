import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { PenIcon } from '@/components/rao/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store } from '@/routes/spaces/prompts';

/** Write a question/quest for the two of you; it jumps the queue. / เขียนคำถามถึงกัน */
export function CustomPromptForm({ spaceId }: { spaceId: string }) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const form = useForm<{ kind: 'question' | 'quest'; text: string }>({
        kind: 'question',
        text: '',
    });

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="press flex items-center gap-2 self-start rounded-full px-1 py-2 text-sm text-ink-soft hover:text-ink"
            >
                <PenIcon className="size-4" /> {t('today.custom.title')}
            </button>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.post(store.url(spaceId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        form.reset();
                        setOpen(false);
                    },
                });
            }}
            className="paper animate-arrive flex flex-col gap-3 p-4"
        >
            <div>
                <h3 className="font-medium text-ink">
                    {t('today.custom.title')}
                </h3>
                <p className="text-sm text-ink-soft">
                    {t('today.custom.body')}
                </p>
            </div>
            <div
                className="flex gap-1 self-start rounded-full bg-ink/[0.05] p-1"
                role="radiogroup"
            >
                {(['question', 'quest'] as const).map((k) => (
                    <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={form.data.kind === k}
                        onClick={() => form.setData('kind', k)}
                        className={cn(
                            'press rounded-full px-4 py-1.5 text-sm',
                            form.data.kind === k
                                ? 'bg-paper text-ink shadow-paper'
                                : 'text-ink-soft',
                        )}
                    >
                        {t(`today.custom.kind_${k}`)}
                    </button>
                ))}
            </div>
            <textarea
                value={form.data.text}
                onChange={(e) => form.setData('text', e.target.value)}
                rows={2}
                maxLength={300}
                required
                placeholder={t('today.custom.placeholder')}
                className="lined hand w-full resize-none bg-transparent px-1 text-xl text-ink outline-none placeholder:text-ink-soft/60"
            />
            <InputError message={form.errors.text} />
            <div className="flex gap-2">
                <Button type="submit" disabled={form.processing}>
                    {t('today.custom.add')}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                >
                    {t('today.cancel')}
                </Button>
            </div>
        </form>
    );
}
