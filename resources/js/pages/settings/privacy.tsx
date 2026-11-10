import { Form, Head, Link, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useT } from '@/lib/i18n';
import { withdraw as withdrawConsent } from '@/routes/consent';
import { show as legal } from '@/routes/legal';
import {
    analytics as analyticsRoute,
    edit,
    exportMethod,
} from '@/routes/privacy';
import { destroy } from '@/routes/profile';

/**
 * Your data: optional analytics, download your own letters, delete your account.
 * ข้อมูลของคุณ: analytics (ไม่บังคับ), ดาวน์โหลดข้อมูล, ลบบัญชี
 */
export default function Privacy({
    analytics,
    graceDays,
    sensitiveSince,
}: {
    analytics: boolean;
    graceDays: number;
    sensitiveSince: string | null;
}) {
    const { t } = useT();

    return (
        <>
            <Head title={t('privacy.title')} />

            <section className="flex flex-col gap-4">
                <Heading
                    variant="small"
                    title={t('privacy.analytics_title')}
                    description={t('privacy.analytics_body')}
                />
                <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] bg-paper-2 p-4">
                    <span className="text-sm font-medium text-ink">
                        {t('privacy.analytics_toggle')}
                    </span>
                    <Switch
                        checked={analytics}
                        onCheckedChange={(on: boolean) =>
                            router.put(
                                analyticsRoute.url(),
                                { on },
                                { preserveScroll: true },
                            )
                        }
                        aria-label={t('privacy.analytics_toggle')}
                    />
                </div>
                <p className="text-xs text-ink-soft">
                    {t('privacy.analytics_off_note')}
                </p>
            </section>

            <section className="flex flex-col gap-4 border-t border-rule pt-8">
                <Heading
                    variant="small"
                    title={t('consent.settings_title')}
                    description={t('consent.settings_body')}
                />
                {sensitiveSince ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] bg-paper-2 p-4 text-sm text-ink">
                        <span>
                            {t('consent.given_on', {
                                date: new Date(
                                    sensitiveSince,
                                ).toLocaleDateString(),
                            })}
                        </span>
                        <Button
                            variant="ghost"
                            onClick={() =>
                                window.confirm(t('consent.withdraw_confirm')) &&
                                router.delete(withdrawConsent.url())
                            }
                        >
                            {t('consent.withdraw')}
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-ink-soft">
                        {t('consent.not_given')}
                    </p>
                )}
            </section>

            <section className="flex flex-col gap-4 border-t border-rule pt-8">
                <Heading
                    variant="small"
                    title={t('privacy.export_title')}
                    description={t('privacy.export_body')}
                />
                <Button asChild variant="outline" className="self-start">
                    {/* plain link: it's a file download, not an Inertia visit */}
                    <a href={exportMethod.url()}>
                        <Download strokeWidth={1.75} />{' '}
                        {t('privacy.export_button')}
                    </a>
                </Button>
            </section>

            <section className="flex flex-col gap-4 border-t border-rule pt-8">
                <Heading
                    variant="small"
                    title={t('privacy.delete_title')}
                    description={t('privacy.delete_body', { days: graceDays })}
                />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="self-start"
                            data-test="delete-user-button"
                        >
                            {t('privacy.delete_button')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            {t('privacy.delete_confirm_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('privacy.delete_confirm_body', {
                                days: graceDays,
                            })}
                        </DialogDescription>
                        <Form
                            {...destroy.form()}
                            options={{ preserveScroll: true }}
                            resetOnError
                            className="flex flex-col gap-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            {t('auth.password')}
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="current-password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button variant="ghost">
                                                {t('today.cancel')}
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            data-test="confirm-delete-user-button"
                                        >
                                            {t(
                                                'privacy.delete_confirm_button',
                                                { days: graceDays },
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </section>

            <nav className="flex flex-wrap gap-x-4 gap-y-1 border-t border-rule pt-6 text-sm text-ink-soft">
                {(['privacy', 'terms', 'cookies', 'data-rights'] as const).map(
                    (d) => (
                        <Link
                            key={d}
                            href={legal.url(d)}
                            className="underline hover:text-ink"
                        >
                            {t(`legal.${d}`)}
                        </Link>
                    ),
                )}
            </nav>
        </>
    );
}

Privacy.layout = {
    breadcrumbs: [{ title: 'Privacy', href: edit() }],
};
