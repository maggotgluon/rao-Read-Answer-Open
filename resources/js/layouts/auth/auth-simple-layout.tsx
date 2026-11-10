import { LetterPage } from '@/components/rao/letter-page';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <LetterPage title={title} description={description}>
            {children}
        </LetterPage>
    );
}
