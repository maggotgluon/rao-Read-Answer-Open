import type { InertiaLinkProps } from '@inertiajs/react';
import type { UiIcon } from '@/components/rao/ui-icons';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: UiIcon | null;
    isActive?: boolean;
};
