import { Asset } from '@/components/rao/asset';

/**
 * Generic UI glyphs (Lucide, ISC) as files in the theme folder: icons/<name>.svg.
 * Same component names as lucide-react, so a theme can redraw any of them.
 * ไอคอนทั่วไปเป็นไฟล์ในโฟลเดอร์ธีม ธีมวาดใหม่ได้
 */
export type UiIconProps = {
    className?: string;
    strokeWidth?: number | string;
    size?: number | string;
    'aria-hidden'?: boolean | 'true' | 'false';
};
export type UiIcon = (p: UiIconProps) => React.JSX.Element;

const ui = (file: string): UiIcon => {
    const C = ({ className }: UiIconProps) => (
        <Asset name={`icons.${file}`} className={className ?? 'size-6'} />
    );
    C.displayName = file;

    return C;
};

export const AlertCircleIcon = ui('circle-alert');
export const BarChart3 = ui('chart-column');
export const BellOff = ui('bell-off');
export const BellRing = ui('bell-ring');
export const Cake = ui('cake');
export const CalendarDays = ui('calendar-days');
export const CalendarHeart = ui('calendar-heart');
export const Check = ui('check');
export const ChevronDown = ui('chevron-down');
export const ChevronLeft = ui('chevron-left');
export const ChevronRight = ui('chevron-right');
export const Copy = ui('copy');
export const Download = ui('download');
export const Eye = ui('eye');
export const EyeOff = ui('eye-off');
export const Gift = ui('gift');
export const Globe = ui('globe');
export const Heart = ui('heart');
export const ImagePlus = ui('image-plus');
export const KeyRound = ui('key-round');
export const Library = ui('library');
export const Lightbulb = ui('lightbulb');
export const LoaderCircle = ui('loader-circle');
export const Lock = ui('lock');
export const LockKeyhole = ui('lock-keyhole');
export const LogOut = ui('log-out');
export const Pencil = ui('pencil');
export const Plus = ui('plus');
export const RefreshCw = ui('refresh-cw');
export const ScanLine = ui('scan-line');
export const Search = ui('search');
export const Settings = ui('settings');
export const Share = ui('share');
export const Share2 = ui('share-2');
export const Shield = ui('shield');
export const ShieldCheck = ui('shield-check');
export const Sparkles = ui('sparkles');
export const SquarePlus = ui('square-plus');
export const Star = ui('star');
export const ToggleRight = ui('toggle-right');
export const Trash2 = ui('trash-2');
export const Users = ui('users');
export const X = ui('x');
export const ThumbsUp = ui('thumbs-up');
export const ThumbsDown = ui('thumbs-down');
export const XIcon = ui('x');
export const CheckIcon = ui('check');
export const ChevronDownIcon = ui('chevron-down');
export const ChevronRightIcon = ui('chevron-right');
export const CircleIcon = ui('circle');
export const Minus = ui('minus');
export const ChevronUpIcon = ui('chevron-up');
export const Loader2Icon = ui('loader-circle');
