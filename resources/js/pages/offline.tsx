import { LetterPage } from '@/components/rao/letter-page';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

/** No connection: the letter couldn't be delivered. / ไม่มีอินเทอร์เน็ต */
export default function Offline() {
    const { t } = useT();

    return (
        <LetterPage
            head={t('offline.title')}
            title={t('offline.title')}
            description={t('offline.body')}
        >
            <Button size="lg" onClick={() => window.location.reload()}>
                {t('offline.retry')}
            </Button>
        </LetterPage>
    );
}
