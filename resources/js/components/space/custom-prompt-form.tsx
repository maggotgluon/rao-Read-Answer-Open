import { useForm } from '@inertiajs/react';
import { PenLine } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store } from '@/routes/spaces/prompts';

export function CustomPromptForm({ spaceId }: { spaceId: string }) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const form = useForm<{ kind: 'question' | 'quest'; text: string }>({
        kind: 'question',
        text: '',
    });

    if (!open) {
        return (
            <Button
                variant="ghost"
                className="self-start"
                onClick={() => setOpen(true)}
            >
                <PenLine /> {t('today.custom.title')}
            </Button>
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
            className="grid gap-3 rounded-2xl border border-dashed border-border p-4"
        >
            <div>
                <h3 className="font-medium">{t('today.custom.title')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('today.custom.body')}
                </p>
            </div>
            <div className="flex gap-2">
                {(['question', 'quest'] as const).map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => form.setData('kind', k)}
                        className={cn(
                            'rounded-full border px-3 py-1 text-sm',
                            form.data.kind === k
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border',
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
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-base"
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
