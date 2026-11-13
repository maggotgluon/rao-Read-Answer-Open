import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Asset, type ThemeAsset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/lib/i18n';
import { organic } from '@/lib/organic';
import { cn } from '@/lib/utils';
import { seen } from '@/routes/spaces/achievements';
import type { AchievementInfo, AchievementSheet } from '@/types/space';
import { ShareCardDialog } from './share-card-dialog';

/** "7 days in a row", "First postcard"… / ชื่อแสตมป์ */
export function useAchievementLabel() {
    const { t } = useT();
    return (a: Pick<AchievementInfo, 'key' | 'group' | 'n'>) =>
        a.group === 'first'
            ? t(`achieve.${a.key}`)
            : t(`achieve.${a.group}`, { n: a.n ?? 0 });
}

/** One perforated stamp with the group picture and its number. / แสตมป์หนึ่งดวง */
function Stamp({
    a,
    size = 'md',
    fresh,
}: {
    a: AchievementInfo;
    size?: 'md' | 'lg';
    fresh?: boolean;
}) {
    const look = organic(a.key, { tilt: 5, shift: 1 });
    return (
        <span
            className={cn(
                'perforated inked relative inline-block',
                size === 'lg' ? 'size-24' : 'size-16',
                fresh && 'animate-seal',
            )}
            style={{
                ...look,
                ['--stamp-face' as string]: 'var(--stamp)',
                ['--hole' as string]: '2px',
                ['--gap' as string]: '6px',
                padding: '3px',
            }}
        >
            <span className="grid size-full place-items-center bg-stamp text-stamp-ink">
                <span className="flex flex-col items-center gap-0.5">
                    <Asset
                        name={`achievements.${a.group}`}
                        className={size === 'lg' ? 'size-9' : 'size-6'}
                    />
                    {a.n !== null && (
                        <span
                            className={cn(
                                'tabular leading-none font-semibold',
                                size === 'lg' ? 'text-lg' : 'text-xs',
                            )}
                        >
                            {a.n}
                        </span>
                    )}
                </span>
            </span>
        </span>
    );
}

/**
 * The stamp sheet on the Calendar tab: earned stamps, then the next step of each ladder as
 * a dashed outline with progress (never "missed" or "lost").
 * แผ่นแสตมป์: ที่ได้แล้ว และขั้นถัดไปพร้อมความคืบหน้า (ไม่มีคำว่าพลาด)
 */
export function AchievementPanel({
    sheet,
    spaceId,
    canShare = false,
    names = null,
}: {
    sheet: AchievementSheet;
    spaceId: string;
    /** sharing feature on: tap a stamp to share it / แตะแสตมป์เพื่อแชร์ */
    canShare?: boolean;
    /** "Mag & Ann", shown only if the person switches names on */
    names?: string | null;
}) {
    const { t, locale } = useT();
    const assets = usePage().props.themeAssets as
        | Record<string, ThemeAsset>
        | undefined;
    const label = useAchievementLabel();
    const [all, setAll] = useState(false);
    const shown = all ? sheet.earned : sheet.earned.slice(0, 8);
    const day = (iso: string) =>
        new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

    return (
        <section className="paper flex flex-col gap-4 p-4">
            <header className="flex items-center gap-2">
                <Asset name="icons.stamps" className="size-5 text-stamp" />
                <h3 className="flex-1 font-medium text-ink">
                    {t('achieve.title')}
                </h3>
                <span className="text-sm text-ink-soft">
                    {sheet.earned.length}
                </span>
            </header>

            {sheet.earned.length === 0 ? (
                <p className="text-sm text-ink-soft">{t('achieve.empty')}</p>
            ) : (
                <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
                    {shown.map((a) => (
                        <li
                            key={a.key}
                            className="flex flex-col items-center gap-1.5 text-center"
                            title={day(a.earned_at)}
                        >
                            {canShare ? (
                                <ShareCardDialog
                                    link={{
                                        spaceId,
                                        type: 'achievement',
                                        id: a.id,
                                    }}
                                    fileName={`rao-stamp-${a.key}`}
                                    build={(o) => ({
                                        kind: 'stamp',
                                        label: label(a),
                                        number: a.n,
                                        icon: assets?.[
                                            `achievements.${a.group}`
                                        ],
                                        meta: day(a.earned_at),
                                        names: o.names ? names : null,
                                    })}
                                    trigger={
                                        <button
                                            type="button"
                                            aria-label={`${t('share.title')}: ${label(a)}`}
                                            className="press rounded-sm"
                                        >
                                            <Stamp a={a} />
                                        </button>
                                    }
                                />
                            ) : (
                                <Stamp a={a} />
                            )}
                            <span className="text-[11px] leading-tight text-ink">
                                {label(a)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {canShare && sheet.earned.length > 0 && (
                <p className="-mt-1 text-xs text-ink-soft">
                    {t('share.tap_stamp')}
                </p>
            )}
            {sheet.earned.length > 8 && (
                <button
                    type="button"
                    onClick={() => setAll(!all)}
                    className="press self-start text-sm text-airmail underline underline-offset-4"
                >
                    {all ? t('story.less') : t('story.more')}
                </button>
            )}

            {sheet.next.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-dashed border-rule-strong pt-3">
                    <h4 className="text-xs font-medium text-ink-soft">
                        {t('achieve.next')}
                    </h4>
                    <ul className="flex flex-col gap-2">
                        {sheet.next.map((n) => (
                            <li
                                key={n.key}
                                className="flex items-center gap-3 text-sm"
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border border-dashed border-postmark text-postmark">
                                    <Asset
                                        name={`achievements.${n.group}`}
                                        className="size-5"
                                    />
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col gap-1">
                                    <span className="text-ink">
                                        {label({ ...n, n: n.n })}
                                    </span>
                                    <span className="h-1.5 overflow-hidden rounded-full bg-rule">
                                        <span
                                            className="block h-full rounded-full bg-stamp/70"
                                            style={{
                                                width: `${Math.round((n.have / n.n) * 100)}%`,
                                            }}
                                        />
                                    </span>
                                </span>
                                <span className="tabular text-xs text-ink-soft">
                                    {n.have}/{n.n}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

/**
 * "New stamp!" — shown once per person on any space tab when stamps arrived.
 * ฉลองแสตมป์ใหม่ แสดงครั้งเดียวต่อคน
 */
export function NewAchievements({ spaceId }: { spaceId: string }) {
    const { t } = useT();
    const label = useAchievementLabel();
    const fresh =
        (usePage().props.newAchievements as
            | Omit<AchievementInfo, 'earned_at' | 'new'>[]
            | undefined) ?? [];
    const [open, setOpen] = useState(true);

    if (fresh.length === 0) {
        return null;
    }

    const close = () => {
        setOpen(false);
        router.post(
            seen.url(spaceId),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && close()}>
            <DialogContent className="max-w-sm text-center">
                <DialogHeader className="items-center text-center">
                    <DialogTitle className="text-2xl">
                        {t(
                            fresh.length > 1
                                ? 'achieve.new_many'
                                : 'achieve.new_one',
                            {
                                count: fresh.length,
                            },
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t('achieve.new_body')}
                    </DialogDescription>
                </DialogHeader>
                <ul className="flex flex-wrap justify-center gap-4 py-2">
                    {fresh.slice(-6).map((a) => (
                        <li
                            key={a.key}
                            className="flex w-24 flex-col items-center gap-2"
                        >
                            <Stamp
                                a={{ ...a, earned_at: '', new: true }}
                                size="lg"
                                fresh
                            />
                            <span className="text-sm leading-tight text-ink">
                                {label(a)}
                            </span>
                        </li>
                    ))}
                </ul>
                <Button onClick={close} className="self-center">
                    {t('achieve.yay')}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
