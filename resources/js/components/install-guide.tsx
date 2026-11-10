import { Share, SquarePlus } from '@/components/rao/ui-icons';
import { useT } from '@/lib/i18n';

/** iPhone: push needs the app on the Home Screen first. / iPhone ต้องเพิ่มลงหน้าจอโฮมก่อน */
export function InstallGuide() {
    const { t } = useT();

    return (
        <div className="flex flex-col gap-2 rounded-[var(--radius)] bg-airmail-soft p-4 text-sm text-ink">
            <p className="font-medium">{t('notify.install.title')}</p>
            <ol className="grid gap-1.5">
                <li className="flex items-center gap-2">
                    1. {t('notify.install.step1')} <Share className="size-4" />
                </li>
                <li className="flex items-center gap-2">
                    2. {t('notify.install.step2')}{' '}
                    <SquarePlus className="size-4" />
                </li>
                <li>3. {t('notify.install.step3')}</li>
            </ol>
        </div>
    );
}
