import { useFlashToast } from '@/hooks/use-flash-toast';
import { useEffect, useState } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    // Lives outside the Inertia page tree, so read the theme from <html>. / อ่านธีมจาก <html>
    const [dark, setDark] = useState(false);
    useEffect(() => {
        const html = document.documentElement;
        const read = () => setDark(html.dataset.theme === 'candle');
        read();
        const obs = new MutationObserver(read);
        obs.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
        return () => obs.disconnect();
    }, []);

    useFlashToast();

    return (
        <Sonner
            theme={dark ? 'dark' : 'light'}
            className="toaster group"
            position="top-center"
            offset={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
            mobileOffset={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
            toastOptions={{ className: '!rounded-full !shadow-[var(--lift-shadow)] !font-sans' }}
            style={
                {
                    '--normal-bg': 'var(--paper)',
                    '--normal-text': 'var(--ink)',
                    '--normal-border': 'var(--rule)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
