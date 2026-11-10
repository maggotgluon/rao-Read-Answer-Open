import { Form, router } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import InputError from '@/components/input-error';
import { Fold } from '@/components/rao/fold';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';
import { freeze, update } from '@/routes/spaces';
import type { SpaceDetail } from '@/types/space';

const TIMEZONES = [
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'UTC',
];

export function SpaceSettings({ space }: { space: SpaceDetail }) {
    const { t } = useT();

    return (
        <Fold
            title={t('space.settings.open')}
            icon={<Settings className="size-5" strokeWidth={1.75} />}
        >
            <Form
                {...update.form(space.id)}
                options={{ preserveScroll: true }}
                className="grid gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {t('space.settings.name')}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                maxLength={60}
                                defaultValue={space.name ?? ''}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="anniversary_on">
                                {t('space.settings.anniversary')}
                            </Label>
                            <Input
                                id="anniversary_on"
                                name="anniversary_on"
                                type="date"
                                max={space.today}
                                defaultValue={space.anniversary_on ?? ''}
                                className="w-auto"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('space.settings.anniversary_help')}
                            </p>
                            <InputError message={errors.anniversary_on} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timezone">
                                {t('space.settings.timezone')}
                            </Label>
                            <select
                                id="timezone"
                                name="timezone"
                                defaultValue={space.timezone}
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                                {[
                                    ...new Set([space.timezone, ...TIMEZONES]),
                                ].map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">
                                {t('space.settings.timezone_help')}
                            </p>
                        </div>
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={processing}
                            className="justify-self-start"
                        >
                            {t('space.settings.save')}
                        </Button>
                    </>
                )}
            </Form>
            <UnpairDialog spaceId={space.id} />
        </Fold>
    );
}

function UnpairDialog({ spaceId }: { spaceId: string }) {
    const { t } = useT();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-destructive">
                    {t('space.unpair.button')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('space.unpair.title')}</DialogTitle>
                    <DialogDescription>
                        {t('space.unpair.body')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('space.unpair.cancel')}
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            variant="destructive"
                            onClick={() => router.post(freeze.url(spaceId))}
                        >
                            {t('space.unpair.confirm')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
