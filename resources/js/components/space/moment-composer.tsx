import { useForm } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { compressImage } from '@/lib/compress-image';
import { useT } from '@/lib/i18n';
import { store } from '@/routes/spaces/moments';

const MAX_PHOTOS = 4;

type FormData = { body: string; photos: File[]; publish: boolean };

export function MomentComposer({
    spaceId,
    photos = true,
}: {
    spaceId: string;
    photos?: boolean;
}) {
    const { t } = useT();
    const input = useRef<HTMLInputElement>(null);
    const [preparing, setPreparing] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const form = useForm<FormData>({ body: '', photos: [], publish: true });

    useEffect(() => {
        const urls = form.data.photos.map((f) => URL.createObjectURL(f));
        setPreviews(urls);

        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [form.data.photos]);

    const addPhotos = async (files: FileList | null) => {
        if (!files?.length) {
            return;
        }
        setPreparing(true);
        try {
            const room = MAX_PHOTOS - form.data.photos.length;
            const picked = Array.from(files).slice(0, room);
            const compressed = await Promise.all(picked.map(compressImage));
            form.setData('photos', [...form.data.photos, ...compressed]);
        } finally {
            setPreparing(false);
            if (input.current) {
                input.current.value = '';
            }
        }
    };

    const send = (publish: boolean) => {
        form.transform((data) => ({ ...data, publish }));
        form.post(store.url(spaceId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const photoError = Object.entries(form.errors).find(([k]) =>
        k.startsWith('photos'),
    )?.[1];

    return (
        <section className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <textarea
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder={t('moment.placeholder')}
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-base"
            />
            <InputError message={form.errors.body} />

            {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                        <div key={src} className="relative aspect-square">
                            <img
                                src={src}
                                alt=""
                                className="size-full rounded-lg object-cover"
                            />
                            <button
                                type="button"
                                aria-label="remove"
                                onClick={() =>
                                    form.setData(
                                        'photos',
                                        form.data.photos.filter(
                                            (_, j) => j !== i,
                                        ),
                                    )
                                }
                                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <InputError message={photoError} />

            <div className="flex flex-wrap items-center gap-2">
                {photos && (
                    <>
                        <input
                            ref={input}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => void addPhotos(e.target.files)}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={
                                preparing ||
                                form.data.photos.length >= MAX_PHOTOS
                            }
                            onClick={() => input.current?.click()}
                        >
                            {preparing ? <Spinner /> : <ImagePlus />}
                            {preparing
                                ? t('moment.preparing')
                                : t('moment.add_photos')}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {t('moment.max_photos', { max: MAX_PHOTOS })}
                        </span>
                    </>
                )}
                <div className="ml-auto flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={form.processing || preparing}
                        onClick={() => send(false)}
                    >
                        {t('moment.save_draft')}
                    </Button>
                    <Button
                        type="button"
                        disabled={form.processing || preparing}
                        onClick={() => send(true)}
                    >
                        {form.processing && <Spinner />}
                        {t('moment.post')}
                    </Button>
                </div>
            </div>
        </section>
    );
}
