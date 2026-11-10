import { Asset } from '@/components/rao/asset';

/**
 * Rao's own icons, now files in the theme folder (icons/<name>.svg). Names kept so
 * components don't change. / ไอคอนของเรา ตอนนี้เป็นไฟล์ในโฟลเดอร์ธีม
 */
type P = {
    className?: string;
    strokeWidth?: number;
    'aria-hidden'?: boolean | 'true' | 'false';
};

const icon = (file: string) => {
    const C = ({ className }: P) => (
        <Asset name={`icons.${file}`} className={cn5(className)} />
    );
    C.displayName = file;

    return C;
};
const cn5 = (c?: string) => c ?? 'size-5';

export const EnvelopeIcon = icon('envelope');
export const StampsIcon = icon('stamps');
export const PostcardIcon = icon('postcard');
export const SealIcon = icon('seal');
export const AirmailIcon = icon('airmail');
export const PostmarkIcon = icon('postmark');
export const PenIcon = icon('pen');
export const MailboxIcon = icon('mailbox');
export const LettersIcon = icon('letters');
