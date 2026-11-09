import type { Locale } from '@/lib/i18n';
import type { Auth } from '@/types/auth';
import type { SpaceNavItem } from '@/types/space';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: Locale;
            translations: Record<string, string>;
            spaces: SpaceNavItem[];
            theme: 'blush' | 'paper' | 'candle';
            isAdmin: boolean;
            vapidPublicKey: string | null;
            [key: string]: unknown;
        };
    }
}
