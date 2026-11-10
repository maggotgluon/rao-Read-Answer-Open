import { Link, router, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { destroy, index, store, update } from '@/routes/admin/prompts';

type Row = {
    id: number;
    key: string | null;
    kind: 'question' | 'quest';
    tag: string;
    text_en: string | null;
    text_th: string | null;
    active: boolean;
    uses: number;
    fit: 'together' | 'any' | 'apart';
    up: number;
    down: number;
};

type Props = {
    prompts: {
        data: Row[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: Partial<
        Record<
            'q' | 'kind' | 'tag' | 'status' | 'missing' | 'fit' | 'sort',
            string
        >
    >;
    stats: {
        total: number;
        active: number;
        by_kind: Record<string, number>;
        by_tag: Record<string, number>;
    };
    kinds: string[];
    tags: string[];
    fits: string[];
};

/** Admin: the shared prompt library. / แอดมิน: คลังคำถามกลาง */
export default function AdminPrompts({
    prompts,
    filters,
    stats,
    kinds,
    tags,
    fits,
}: Props) {
    const { t } = useT();
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const [q, setQ] = useState(filters.q ?? '');
    const filter = (patch: Record<string, string | undefined>) =>
        router.get(
            index.url(),
            { ...filters, ...patch },
            { preserveState: true, preserveScroll: true },
        );

    return (
        <AdminShell
            tab="prompts"
            title={t('admin.title')}
            actions={
                <Button onClick={() => setEditing('new')}>
                    <Plus /> {t('admin.add')}
                </Button>
            }
        >
            <p className="text-sm text-muted-foreground">
                {t('admin.stats', {
                    active: stats.active,
                    total: stats.total,
                })}{' '}
                ·{' '}
                {kinds
                    .map(
                        (k) =>
                            `${t(`today.custom.kind_${k}`)} ${stats.by_kind[k] ?? 0}`,
                    )
                    .join(' · ')}{' '}
                ·{' '}
                {tags
                    .map(
                        (tg) =>
                            `${t(`today.tag.${tg}`)} ${stats.by_tag[tg] ?? 0}`,
                    )
                    .join(' · ')}
            </p>

            <div className="flex flex-wrap gap-2">
                <form
                    className="flex gap-1"
                    onSubmit={(e) => {
                        e.preventDefault();
                        filter({ q: q || undefined });
                    }}
                >
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={t('admin.search')}
                        className="w-56"
                    />
                    <Button
                        type="submit"
                        variant="secondary"
                        size="icon"
                        aria-label={t('admin.search')}
                    >
                        <Search />
                    </Button>
                </form>
                <Select
                    value={filters.kind}
                    onChange={(v) => filter({ kind: v })}
                    options={kinds}
                    label={(k) => t(`today.custom.kind_${k}`)}
                    all={t('admin.all_kinds')}
                />
                <Select
                    value={filters.tag}
                    onChange={(v) => filter({ tag: v })}
                    options={tags}
                    label={(k) => t(`today.tag.${k}`)}
                    all={t('admin.all_tags')}
                />
                <Select
                    value={filters.status}
                    onChange={(v) => filter({ status: v })}
                    options={['active', 'inactive']}
                    label={(k) => t(`admin.${k}`)}
                    all={t('admin.all_status')}
                />
                <Select
                    value={filters.missing}
                    onChange={(v) => filter({ missing: v })}
                    options={['th', 'en']}
                    label={(k) => t(`admin.missing_${k}`)}
                    all={t('admin.any_text')}
                />
                <Select
                    value={filters.fit}
                    onChange={(v) => filter({ fit: v })}
                    options={fits}
                    label={(k) => t(`fit.${k}`)}
                    all={t('admin.all_fits')}
                />
                <Select
                    value={filters.sort}
                    onChange={(v) => filter({ sort: v })}
                    options={['worst', 'best']}
                    label={(k) => t(`admin.sort_${k}`)}
                    all={t('admin.sort_default')}
                />
            </div>

            {editing === 'new' && (
                <PromptForm
                    kinds={kinds}
                    tags={tags}
                    onDone={() => setEditing(null)}
                />
            )}

            <p className="text-xs text-muted-foreground">
                {t('admin.showing', { count: prompts.total })}
            </p>
            <ul className="paper flex flex-col divide-y divide-rule">
                {prompts.data.map((p) =>
                    editing === p.id ? (
                        <li key={p.id} className="p-3">
                            <PromptForm
                                prompt={p}
                                kinds={kinds}
                                tags={tags}
                                onDone={() => setEditing(null)}
                            />
                        </li>
                    ) : (
                        <li
                            key={p.id}
                            className={cn(
                                'flex gap-3 p-3 text-sm',
                                !p.active && 'opacity-50',
                            )}
                        >
                            <div className="flex w-28 shrink-0 flex-col gap-1">
                                <Badge
                                    variant={
                                        p.kind === 'quest'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {t(`today.custom.kind_${p.kind}`)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {t(`today.tag.${p.tag}`)} ·{' '}
                                    {p.key ?? 'admin'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {t('admin.uses', { count: p.uses })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {t(`fit.${p.fit}`)}
                                </span>
                                {p.up + p.down > 0 && (
                                    <span className="text-xs">
                                        👍 {p.up} · 👎 {p.down}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1">
                                <p>
                                    {p.text_th || (
                                        <em className="text-destructive">
                                            {t('admin.missing_th')}
                                        </em>
                                    )}
                                </p>
                                <p className="text-muted-foreground">
                                    {p.text_en || (
                                        <em className="text-destructive">
                                            {t('admin.missing_en')}
                                        </em>
                                    )}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditing(p.id)}
                                >
                                    {t('event.edit')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                        router.patch(
                                            update.url(p.id),
                                            { ...p, active: !p.active },
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    {p.active
                                        ? t('admin.deactivate')
                                        : t('admin.activate')}
                                </Button>
                                {p.uses === 0 && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive"
                                        onClick={() =>
                                            window.confirm(
                                                t('admin.delete_confirm'),
                                            ) &&
                                            router.delete(destroy.url(p.id), {
                                                preserveScroll: true,
                                            })
                                        }
                                    >
                                        {t('event.delete')}
                                    </Button>
                                )}
                            </div>
                        </li>
                    ),
                )}
            </ul>

            <nav className="flex flex-wrap gap-1">
                {prompts.links.map((l, i) =>
                    l.url ? (
                        <Link
                            key={i}
                            href={l.url}
                            preserveScroll
                            className={cn(
                                'rounded-lg px-3 py-1 text-sm',
                                l.active
                                    ? 'bg-ink text-paper'
                                    : 'hover:bg-muted',
                            )}
                        >
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: l.label,
                                }}
                            />
                        </Link>
                    ) : null,
                )}
            </nav>
        </AdminShell>
    );
}

function Select({
    value,
    onChange,
    options,
    label,
    all,
}: {
    value?: string;
    onChange: (v?: string) => void;
    options: string[];
    label: (k: string) => string;
    all: string;
}) {
    return (
        <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
            <option value="">{all}</option>
            {options.map((o) => (
                <option key={o} value={o}>
                    {label(o)}
                </option>
            ))}
        </select>
    );
}

function PromptForm({
    prompt,
    kinds,
    tags,
    onDone,
}: {
    prompt?: Row;
    kinds: string[];
    tags: string[];
    onDone: () => void;
}) {
    const { t } = useT();
    const form = useForm({
        kind: prompt?.kind ?? 'question',
        tag: prompt?.tag ?? 'fun',
        fit: prompt?.fit ?? '',
        text_th: prompt?.text_th ?? '',
        text_en: prompt?.text_en ?? '',
        active: prompt?.active ?? true,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const opts = { preserveScroll: true, onSuccess: onDone };
                if (prompt) form.patch(update.url(prompt.id), opts);
                else form.post(store.url(), opts);
            }}
            className="grid gap-3 rounded-[var(--radius)] border-[1.5px] border-dashed border-rule-strong bg-paper p-4"
        >
            <div className="flex flex-wrap gap-2">
                <select
                    value={form.data.kind}
                    onChange={(e) =>
                        form.setData('kind', e.target.value as Row['kind'])
                    }
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                    {kinds.map((k) => (
                        <option key={k} value={k}>
                            {t(`today.custom.kind_${k}`)}
                        </option>
                    ))}
                </select>
                <select
                    value={form.data.tag}
                    onChange={(e) => form.setData('tag', e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                    {tags.map((k) => (
                        <option key={k} value={k}>
                            {t(`today.tag.${k}`)}
                        </option>
                    ))}
                </select>
                <select
                    value={form.data.fit}
                    onChange={(e) =>
                        form.setData('fit', e.target.value as Row['fit'])
                    }
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                    <option value="">{t('fit.default')}</option>
                    {(['together', 'any', 'apart'] as const).map((f) => (
                        <option key={f} value={f}>
                            {t(`fit.${f}`)}
                        </option>
                    ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.data.active}
                        onChange={(e) =>
                            form.setData('active', e.target.checked)
                        }
                    />{' '}
                    {t('admin.active')}
                </label>
            </div>
            <textarea
                value={form.data.text_th}
                onChange={(e) => form.setData('text_th', e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="ภาษาไทย"
                className="rounded-[calc(var(--radius)-2px)] border border-input bg-paper px-3 py-2 text-ink"
            />
            <textarea
                value={form.data.text_en}
                onChange={(e) => form.setData('text_en', e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="English"
                className="rounded-[calc(var(--radius)-2px)] border border-input bg-paper px-3 py-2 text-ink"
            />
            {(form.errors.text_th || form.errors.text_en) && (
                <p className="text-sm text-destructive">
                    {form.errors.text_th || form.errors.text_en}
                </p>
            )}
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {t('event.save')}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onDone}
                >
                    {t('event.cancel')}
                </Button>
            </div>
        </form>
    );
}
