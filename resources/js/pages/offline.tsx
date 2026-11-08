import { Head } from '@inertiajs/react';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

export default function Offline() {
    const { t } = useT();

    return (
        <>
            <Head title={t('offline.title')} />
            <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
                <WifiOff className="size-10 text-muted-foreground" />
                <h1 className="text-xl font-semibold">{t('offline.title')}</h1>
                <p className="max-w-xs text-muted-foreground">
                    {t('offline.body')}
                </p>
                <Button onClick={() => window.location.reload()}>
                    {t('offline.retry')}
                </Button>
            </div>
        </>
    );
}
