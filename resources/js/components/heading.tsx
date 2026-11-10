export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header
            className={
                variant === 'small'
                    ? 'flex flex-col gap-0.5'
                    : 'mb-6 flex flex-col gap-1'
            }
        >
            <h2
                className={
                    variant === 'small'
                        ? 'text-2xl leading-tight text-ink'
                        : 'text-3xl leading-tight text-ink'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-sm text-ink-soft">{description}</p>
            )}
        </header>
    );
}
