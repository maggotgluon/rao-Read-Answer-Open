import { Head, useForm } from '@inertiajs/react';
import { BellOff, BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { InstallGuide } from '@/components/install-guide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import {
    disablePush,
    enablePush,
    pushState,
    sendTestPush,
    type PushState,
} from '@/lib/push';
import { edit, update } from '@/routes/notifications';

type Prefs = Record<
    | 'morning'
    | 'evening'
    | 'partner_answered'
    | 'nudges'
    | 'replies'
    | 'partner_moment'
    | 'moment_activity'
    | 'dates',
    boolean
>;

type Props = {
    prefs: Prefs;
    morning_at: string;
    evening_at: string;
    vapidPublicKey: string | null;
    configured: boolean;
    devices: number;
};

export default function Notifications({
    prefs,
    morning_at,
    evening_at,
    vapidPublicKey,
    configured,
    devices,
}: Props) {
    const { t } = useT();
    const [state, setState] = useState<PushState | null>(null);
    const [busy, setBusy] = useState(false);
    const form = useForm({ prefs, morning_at, evening_at });

    useEffect(() => {
        void pushState().then(setState);
    }, []);

    const toggleDevice = async () => {
        setBusy(true);
        try {
            setState(
                state === 'on'
                    ? await disablePush()
                    : await enablePush(vapidPublicKey ?? ''),
            );
        } catch {
            toast.error(t('notify.failed'));
        } finally {
            setBusy(false);
        }
    };

    const row = (key: keyof Prefs, time?: 'morning_at' | 'evening_at') => (
        <label
            key={key}
            className="flex items-center gap-3 rounded-xl px-1 py-2"
        >
            <input
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
                checked={form.data.prefs[key]}
                onChange={(e) =>
                    form.setData('prefs', {
                        ...form.data.prefs,
                        [key]: e.target.checked,
                    })
                }
            />
            <span className="flex-1">
                <span className="block text-sm font-medium">
                    {t(`notify.type.${key}`)}
                </span>
                <span className="block text-xs text-muted-foreground">
                    {t(`notify.type.${key}_help`)}
                </span>
            </span>
            {time && (
                <Input
                    type="time"
                    value={form.data[time]}
                    onChange={(e) => form.setData(time, e.target.value)}
                    disabled={!form.data.prefs[key]}
                    className="w-28"
                    aria-label={t(`notify.type.${key}`)}
                />
            )}
        </label>
    );

    return (
        <>
            <Head title={t('notify.title')} />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('notify.title')}
                    description={t('notify.description')}
                />

                {!configured && (
                    <p className="rounded-[calc(var(--radius)-2px)] border border-dashed border-postmark/60 p-3 text-sm">
                        {t('notify.not_configured')}
                    </p>
                )}

                {state === 'needs-install' ? (
                    <InstallGuide />
                ) : (
                    <section className="flex flex-wrap items-center gap-3 rounded-[var(--radius)] bg-paper-2 p-4">
                        {state === 'on' ? (
                            <BellRing
                                className="size-5 text-stamp"
                                strokeWidth={1.75}
                            />
                        ) : (
                            <BellOff className="size-5 text-muted-foreground" />
                        )}
                        <div className="flex-1 text-sm">
                            <p className="font-medium">
                                {t(`notify.device.${state ?? 'off'}`)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('notify.devices', { count: devices })}
                            </p>
                        </div>
                        {state !== 'unsupported' &&
                            state !== 'denied' &&
                            configured && (
                                <Button
                                    onClick={toggleDevice}
                                    disabled={busy}
                                    variant={
                                        state === 'on' ? 'secondary' : 'default'
                                    }
                                >
                                    {state === 'on'
                                        ? t('notify.disable')
                                        : t('notify.enable')}
                                </Button>
                            )}
                        {state === 'on' && (
                            <Button
                                variant="ghost"
                                onClick={async () => {
                                    const r = await sendTestPush();
                                    toast[r.ok ? 'success' : 'error'](
                                        t(
                                            r.ok
                                                ? 'notify.test_sent'
                                                : 'notify.failed',
                                        ),
                                    );
                                }}
                            >
                                {t('notify.test')}
                            </Button>
                        )}
                    </section>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.put(update.url(), { preserveScroll: true });
                    }}
                    className="flex flex-col gap-1"
                >
                    <h3 className="text-sm font-medium">{t('notify.daily')}</h3>
                    {row('morning', 'morning_at')}
                    {row('evening', 'evening_at')}
                    <h3 className="mt-3 text-sm font-medium">
                        {t('notify.events')}
                    </h3>
                    {row('partner_answered')}
                    {row('nudges')}
                    {row('replies')}
                    {row('partner_moment')}
                    {row('moment_activity')}
                    {row('dates')}
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="mt-3 self-start"
                    >
                        {t('notify.save')}
                    </Button>
                </form>
            </div>
        </>
    );
}

Notifications.layout = {
    breadcrumbs: [{ title: 'Notifications', href: edit() }],
};
