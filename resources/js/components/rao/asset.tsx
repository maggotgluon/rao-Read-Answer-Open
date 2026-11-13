import { usePage } from '@inertiajs/react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Every picture in the UI comes from the active theme folder, by name
 * (e.g. "icons.envelope", "moods.tired", "reactions.love", "logo.stamp").
 * Mono SVGs are drawn as a mask so they take the text colour; PNG/JPG (or *.color.svg)
 * show exactly as drawn. Swap a file in public/themes/<id>/ and the UI follows.
 * ทุกภาพมาจากโฟลเดอร์ธีมตามชื่อ เปลี่ยนไฟล์ในธีมแล้ว UI เปลี่ยนตาม
 */
export type ThemeAsset = { url: string; mono: boolean };

export function useAsset(name: string): ThemeAsset | undefined {
    const assets = usePage().props.themeAssets as
        | Record<string, ThemeAsset>
        | undefined;

    return assets?.[name];
}

export function Asset({
    name,
    className,
    alt,
    style,
    fallback = null,
}: {
    name: string;
    className?: string;
    /** Give a label when the picture means something on its own. / ใส่เมื่อภาพสื่อความหมาย */
    alt?: string;
    style?: CSSProperties;
    fallback?: ReactNode;
}) {
    const asset = useAsset(name);
    if (!asset) return <>{fallback}</>;

    const a11y = alt
        ? { role: 'img', 'aria-label': alt }
        : { 'aria-hidden': true };

    return asset.mono ? (
        <span
            {...a11y}
            data-asset={name}
            className={cn('asset-mono size-6', className)}
            style={{ ['--asset' as string]: `url("${asset.url}")`, ...style }}
        />
    ) : (
        <img
            src={asset.url}
            alt={alt ?? ''}
            aria-hidden={alt ? undefined : true}
            data-asset={name}
            draggable={false}
            className={cn('asset-img size-6', className)}
            style={style}
        />
    );
}
