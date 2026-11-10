import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { useT } from '@/lib/i18n';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const { t } = useT();

    // Pages may pass translation keys as title/description (unknown keys show as-is).
    return (
        <AuthLayoutTemplate title={t(title)} description={t(description)}>
            {children}
        </AuthLayoutTemplate>
    );
}
