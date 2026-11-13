import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Asset, useAsset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useT } from '@/lib/i18n';
import {
    CARD_SIZE,
    type CardFormat,
    type CardSpec,
    drawCard,
    saveImage,
    shareOrSave,
} from '@/lib/share-card';
import { cn } from '@/lib/utils';

export type CardOptions = { photo: number | null; names: boolean };

type Props = {
    /** Builds what to draw from the chosen options. / สร้างข้อมูลการ์ดจากตัวเลือก */
    build: (o: CardOptions) => CardSpec;
    /** Photo URLs the owner can pick from (postcards). / รูปที่เลือกใส่ได้ */
    photos?: string[];
    fileName: string;
    trigger: React.ReactNode;
};

/**
 * "Share as a picture": preview of the card in your theme, pick feed/story, a photo (or
 * none) and whether to show first names (off by default). Made on this phone only.
 * แชร์เป็นรูป: ดูตัวอย่างในธีมของคุณ เลือกขนาด รูป และจะแสดงชื่อไหม (ปิดไว้ก่อน)
 */
export function ShareCardDialog({
    build,
    photos = [],
    fileName,
    trigger,
}: Props) {
    const { t } = useT();
    const logo = useAsset('logo.stamp');
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<CardFormat>('feed');
    const [photo, setPhoto] = useState<number | null>(photos.length ? 0 : null);
    const [names, setNames] = useState(false);
    const [blob, setBlob] = useState<Blob | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const buildRef = useRef(build);
    buildRef.current = build;

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setBusy(true);
        drawCard(buildRef.current({ photo, names }), format, logo)
            .then((b) => {
                if (cancelled) return;
                setBlob(b);
                setPreview((old) => {
                    if (old) URL.revokeObjectURL(old);
                    return URL.createObjectURL(b);
                });
            })
            .catch(() => !cancelled && toast.error(t('share.failed')))
            .finally(() => !cancelled && setBusy(false));
        return () => {
            cancelled = true;
        };
    }, [open, format, photo, names, logo, t]);

    const share = async () => {
        if (!blob) return;
        const r = await shareOrSave(blob, fileName);
        if (r === 'saved') toast.success(t('share.saved'));
    };

    const { w, h } = CARD_SIZE[format];

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                setOpen(o);
                if (!o && preview) {
                    URL.revokeObjectURL(preview);
                    setPreview(null);
                    setBlob(null);
                }
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-h-[92dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('share.title')}</DialogTitle>
                    <DialogDescription>{t('share.help')}</DialogDescription>
                </DialogHeader>

                <div
                    className="mx-auto w-full max-w-[260px] overflow-hidden rounded-md bg-paper-2 shadow-paper"
                    style={{ aspectRatio: `${w} / ${h}` }}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt={t('share.preview')}
                            className={cn(
                                'size-full object-contain',
                                busy && 'opacity-60',
                            )}
                        />
                    ) : (
                        <div className="grid size-full place-items-center text-sm text-ink-soft">
                            {t('share.drawing')}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 text-sm">
                    <div
                        className="flex gap-1"
                        role="radiogroup"
                        aria-label={t('share.size')}
                    >
                        {(['feed', 'story'] as const).map((f) => (
                            <button
                                key={f}
                                type="button"
                                role="radio"
                                aria-checked={format === f}
                                onClick={() => setFormat(f)}
                                className={cn(
                                    'rounded-full border px-3 py-1',
                                    format === f
                                        ? 'border-ink bg-ink text-paper'
                                        : 'border-border',
                                )}
                            >
                                {t(`share.${f}`)}
                            </button>
                        ))}
                    </div>

                    {photos.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-ink-soft">
                                {t('share.photo')}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPhoto(null)}
                                aria-pressed={photo === null}
                                className={cn(
                                    'h-12 rounded-md border px-3 text-xs',
                                    photo === null
                                        ? 'border-ink ring-2 ring-ink'
                                        : 'border-border',
                                )}
                            >
                                {t('share.no_photo')}
                            </button>
                            {photos.map((src, i) => (
                                <button
                                    key={src}
                                    type="button"
                                    onClick={() => setPhoto(i)}
                                    aria-pressed={photo === i}
                                    aria-label={t('share.photo_n', {
                                        n: i + 1,
                                    })}
                                    className={cn(
                                        'size-12 overflow-hidden rounded-md border',
                                        photo === i
                                            ? 'border-ink ring-2 ring-ink'
                                            : 'border-border',
                                    )}
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    <label className="flex items-center justify-between gap-3">
                        <span>{t('share.names')}</span>
                        <Switch checked={names} onCheckedChange={setNames} />
                    </label>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button onClick={share} disabled={!blob}>
                        <Asset name="icons.share" className="size-4" />{' '}
                        {t('share.share')}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => blob && saveImage(blob, fileName)}
                        disabled={!blob}
                    >
                        <Asset name="icons.download" className="size-4" />{' '}
                        {t('share.save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
