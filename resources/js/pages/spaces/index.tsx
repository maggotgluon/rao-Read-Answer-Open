import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Plus } from '@/components/rao/ui-icons';
import InputError from '@/components/input-error';
import { Asset } from '@/components/rao/asset';
import { AirmailIcon } from '@/components/rao/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { lookup } from '@/routes/invites';
import { store } from '@/routes/spaces';
import type { SpaceSummary } from '@/types/space';

/**
 * All my spaces: each one an envelope addressed to the person it's with.
 * space ทั้งหมด: ซองจดหมายจ่าหน้าถึงคนที่อยู่ในนั้น
 */
export default function SpacesIndex({ spaces }: { spaces: SpaceSummary[] }) {
    const { t } = useT();
    const { features } = usePage().props;
    // One space per person while "multiple spaces" is off: hide the button. / ซ่อนปุ่มเมื่อปิดฟีเจอร์
    const canCreate =
        features?.poly !== false || !spaces.some((s) => s.status === 'active');

    return (
        <>
            <Head title={t('spaces.title')} />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                <h1 className="text-3xl text-ink">{t('spaces.title')}</h1>

                {spaces.length === 0 ? (
                    <section className="flex flex-col items-center gap-3 py-6 text-center">
                        <Asset
                            name="decor.spaces-empty"
                            className="size-16 text-kraft"
                        />
                        <p className="hand text-xl text-ink">
                            {t('spaces.empty')}
                        </p>
                    </section>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {spaces.map((s, i) => {
                            const to = s.partner?.name;

                            return (
                                <li key={s.id}>
                                    <Link
                                        href={s.url}
                                        prefetch
                                        className={cn(
                                            'paper press relative block overflow-hidden hover:shadow-lift',
                                            s.status === 'frozen' &&
                                                'opacity-70',
                                        )}
                                        style={{
                                            transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)`,
                                        }}
                                    >
                                        <div className="airmail-edge h-1.5" />
                                        <div className="flex items-center gap-4 p-5">
                                            <div className="flex flex-1 flex-col gap-1">
                                                <span className="text-xs text-ink-soft">
                                                    {t('spaces.to')}
                                                </span>
                                                <span className="hand text-2xl leading-tight text-ink">
                                                    {s.name ??
                                                        to ??
                                                        t('spaces.waiting')}
                                                </span>
                                                {s.name && to && (
                                                    <span className="text-sm text-ink-soft">
                                                        {t('spaces.with', {
                                                            name: to,
                                                        })}
                                                    </span>
                                                )}
                                                {s.status === 'frozen' && (
                                                    <span className="text-sm text-postmark">
                                                        {t(
                                                            'spaces.frozen_badge',
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                aria-hidden
                                                className="perforated rotate-6 rounded-[2px]"
                                                style={{
                                                    ['--stamp-face' as string]:
                                                        'var(--paper-2)',
                                                    ['--hole' as string]: '2px',
                                                    ['--gap' as string]: '7px',
                                                    padding: '4px',
                                                }}
                                            >
                                                <span
                                                    className={cn(
                                                        'hand grid h-14 w-12 place-items-center text-2xl',
                                                        to
                                                            ? 'bg-airmail text-airmail-ink'
                                                            : 'bg-postmark/30 text-ink-soft',
                                                    )}
                                                >
                                                    {to
                                                        ? to
                                                              .trim()
                                                              .charAt(0)
                                                              .toUpperCase()
                                                        : '?'}
                                                </span>
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="flex flex-col gap-3">
                    {canCreate && (
                        <Form {...store.form()}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    <Plus strokeWidth={1.75} />{' '}
                                    {t('spaces.create')}
                                </Button>
                            )}
                        </Form>
                    )}

                    <Form
                        {...lookup.form()}
                        className="flex flex-col gap-2 border-t border-rule pt-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <label
                                    htmlFor="code"
                                    className="flex items-center gap-2 text-sm font-medium text-ink"
                                >
                                    <AirmailIcon className="size-4 text-airmail" />
                                    {t('spaces.have_code')}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        id="code"
                                        name="code"
                                        required
                                        autoComplete="off"
                                        autoCapitalize="characters"
                                        enterKeyHint="go"
                                        placeholder={t(
                                            'spaces.code_placeholder',
                                        )}
                                        className="hand text-xl tracking-[0.1em] uppercase"
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        {t('spaces.join')}
                                    </Button>
                                </div>
                                <InputError message={errors.code} />
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}
