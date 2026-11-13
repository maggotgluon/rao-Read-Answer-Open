import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { maybeUpdateLocation } from '@/lib/location';

/** Runs once when the app opens (and when sharing gets switched on). / ทำงานตอนเปิดแอป */
export function useAutoLocation() {
    const { auth, features } = usePage().props;
    const on = Boolean(auth.user?.share_location && features?.location);

    useEffect(() => {
        if (on) void maybeUpdateLocation();
    }, [on]);
}
