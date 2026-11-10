import type { SVGAttributes } from 'react';
import { StampLogo } from '@/components/rao/logo';

/** Kept for starter-kit imports; the brand mark lives in components/rao/logo. */
export default function AppLogoIcon(props: SVGAttributes<SVGSVGElement>) {
    return <StampLogo {...props} />;
}
