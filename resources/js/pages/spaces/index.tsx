import { Form, Head, Link } from '@inertiajs/react';
import { Heart, Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { lookup } from '@/routes/invites';
import { store } from '@/routes/spaces';
import type { SpaceSummary } from '@/types/space';

export default function SpacesIndex({ spaces }: { spaces: SpaceSummary[] }) {
    const { t } = useT();

    return (
        <>
            <Head title={t('spaces.title')} />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-4 md:p-8">
                <h1 className="text-2xl font-semibold">{t('spaces.title')}</h1>

                {spaces.length === 0 ? (
                    <p className="text-muted-foreground">{t('spaces.empty')}</p>
                ) : (
                    <ul className="grid gap-3">
                        {spaces.map((s) => (
                            <li key={s.id}>
                                <Link
                                    href={s.url}
                                    className="flex items-center gap-4 rounded-2xl border border-border p-4 transition-colors hover:bg-accent"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Heart className="size-5" />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block font-medium">
                                            {s.name ??
                                                (s.partner
                                                    ? t('spaces.with', {
                                                          name: s.partner.name,
                                                      })
                                                    : t('spaces.waiting'))}
                                        </span>
                                        {s.name && s.partner && (
                                            <span className="text-sm text-muted-foreground">
                                                {t('spaces.with', {
                                                    name: s.partner.name,
                                                })}
                                            </span>
                                        )}
                                    </span>
                                    {s.status === 'frozen' && (
                                        <Badge variant="secondary">
                                            {t('spaces.frozen_badge')}
                                        </Badge>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <Form {...store.form()}>
                    {({ processing }) => (
                        <Button type="submit" disabled={processing} size="lg">
                            <Plus /> {t('spaces.create')}
                        </Button>
                    )}
                </Form>

                <Form
                    {...lookup.form()}
                    className="grid gap-2 rounded-2xl border border-dashed border-border p-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <label
                                htmlFor="code"
                                className="text-sm font-medium"
                            >
                                {t('spaces.have_code')}
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    name="code"
                                    required
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    placeholder={t('spaces.code_placeholder')}
                                    className="uppercase"
                                />
                                <Button
                                    type="submit"
                                    variant="secondary"
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
        </>
    );
}
