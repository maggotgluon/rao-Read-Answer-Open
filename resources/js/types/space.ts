export type SpaceStatus = 'active' | 'frozen';

export type SpaceSummary = {
    id: string;
    name: string | null;
    status: SpaceStatus;
    partner: { name: string } | null;
    url: string;
};

export type SpaceDetail = SpaceSummary & {
    timezone: string;
    frozen_at: string | null;
    delete_after: string | null;
    can_restore: boolean;
};

export type SpaceNavItem = {
    id: string;
    name: string | null;
    status: SpaceStatus;
    partner: string | null;
    url: string;
};

export type Invite = {
    code: string;
    url: string;
    expires_at: string;
};
