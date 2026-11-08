import { Link, usePage } from '@inertiajs/react';
import { Heart, Snowflake } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitch } from '@/components/language-switch';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useT } from '@/lib/i18n';
import { dashboard } from '@/routes';

export function AppSidebar() {
    const { spaces } = usePage().props;
    const { t } = useT();
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={dashboard({ query: { all: 1 } })}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Only the signed-in user's own spaces are ever sent here. */}
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{t('nav.spaces')}</SidebarGroupLabel>
                    <SidebarMenu>
                        {spaces.map((s) => {
                            const label =
                                s.name ??
                                (s.partner
                                    ? t('spaces.with', { name: s.partner })
                                    : t('spaces.waiting'));

                            return (
                                <SidebarMenuItem key={s.id}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(s.url)}
                                        tooltip={{ children: label }}
                                    >
                                        <Link href={s.url} prefetch>
                                            {s.status === 'frozen' ? (
                                                <Snowflake />
                                            ) : (
                                                <Heart />
                                            )}
                                            <span>{label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <LanguageSwitch className="mx-2 self-start group-data-[collapsible=icon]:hidden" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
