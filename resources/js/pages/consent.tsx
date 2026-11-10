import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { LetterPage } from '@/components/rao/letter-page';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { store } from '@/routes/consent';
import { show as legal } from '@/routes/legal';
import { edit as privacy } from '@/routes/privacy';

/**
 * Explicit consent for very personal topics, asked once (PDPA s.26).
 * ขอความยินยอมโดยชัดแจ้งเรื่องส่วนตัวที่อ่อนไหว (ถามครั้งเดียว)
 */
export default function Consent() {
    const { t } = useT();

    return (
        <LetterPage
            head={t('consent.title')}
            title={t('consent.title')}
            description={t('consent.body')}
        >
            <Form {...store.form()} className="flex flex-col gap-4">
                {({ errors, processing }) => (
                    <>
                        <SensitiveCheckbox />
                        <InputError message={errors.sensitive} />
                        <Button type="submit" size="lg" disabled={processing}>
                            {t('consent.continue')}
                        </Button>
                    </>
                )}
            </Form>
            <p className="text-xs text-ink-soft">
                {t('consent.no_hint')}{' '}
                <Link href={privacy()} className="underline">
                    {t('settings.privacy')}
                </Link>
                {' · '}
                <a href={legal.url('privacy')} className="underline">
                    {t('legal.privacy')}
                </a>
            </p>
        </LetterPage>
    );
}

/** Shared with sign-up. Never pre-ticked. / ใช้ร่วมกับหน้าสมัคร ไม่ติ๊กไว้ล่วงหน้า */
export function SensitiveCheckbox() {
    const { t } = useT();

    return (
        <label className="flex items-start gap-3 rounded-[calc(var(--radius)-2px)] bg-paper-2 p-3 text-sm text-ink">
            <input
                type="checkbox"
                name="sensitive"
                value="1"
                required
                className="mt-0.5 size-5 shrink-0 accent-[var(--stamp)]"
            />
            <span className="flex flex-col gap-0.5">
                <span className="font-medium">{t('consent.label')}</span>
                <span className="text-xs text-ink-soft">
                    {t('consent.help')}
                </span>
            </span>
        </label>
    );
}
