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
    anniversary_on: string | null;
    today: string;
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

export type DayItem = {
    id: number;
    date: string;
    is_today: boolean;
    kind: 'question' | 'quest';
    tag: string | null;
    text: string;
    written_by: string | null;
    open: boolean;
    mine: { body: string; updated_at: string | null } | null;
    partner_answered: boolean;
    partner: { body: string } | null;
    can_edit: boolean;
};

export type Streak = {
    count: number;
    freezes_left: number;
    together_total: number;
};

export type MomentItem = {
    id: string;
    author: string;
    mine: boolean;
    body: string | null;
    status: 'draft' | 'posted';
    posted_at: string | null;
    date: { id: number; kind: string; title: string } | null;
    photos: { url: string; width: number; height: number }[];
    reactions: { emoji: string; mine: boolean }[];
    comments: {
        id: number;
        author: string;
        mine: boolean;
        body: string;
        created_at: string | null;
    }[];
};

export type DayStatus =
    | 'complete'
    | 'partial'
    | 'forgiven'
    | 'missed'
    | 'today'
    | 'future'
    | 'before';

export type CalendarMonth = {
    month: string;
    prev: string;
    next: string;
    is_current: boolean;
    days: {
        date: string;
        status: DayStatus;
        is_today: boolean;
        moments: number;
        events: string[];
    }[];
    stats: {
        month_complete: number;
        month_elapsed: number;
        week_complete: number;
        week_elapsed: number;
    };
};

export type EventOccurrence = {
    event_id: number | null;
    user_id?: number | null;
    memories?: number;
    kind: 'birthday' | 'special' | 'other' | 'anniversary';
    title: string;
    date: string;
    years: number;
    in_days?: number;
};

export type SpaceEvent = {
    id: number;
    kind: 'special' | 'other' | 'anniversary';
    title: string;
    date: string;
    repeats_yearly: boolean;
    author: string | null;
    moments: number;
};

export type Memory = {
    id: string;
    author: string;
    body: string | null;
    posted_at: string | null;
    years_ago: number;
    event: string | null;
    photos: string[];
};

export type DayDetail = {
    date: string;
    prompt: DayItem | null;
    moments: {
        id: string;
        author: string;
        body: string | null;
        photos: string[];
    }[];
    events: EventOccurrence[];
    memories: Memory[];
};

export type ActivityItem = {
    type: 'answered' | 'quest_done' | 'moment' | 'event';
    actor: string;
    mine: boolean;
    title?: string;
    at: string;
};
