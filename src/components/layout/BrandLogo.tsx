import Image from 'next/image';
import { BRAND_LOGO } from '@/lib/brand';

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

// Logo PNG berwarna putih dengan latar transparan: hanya untuk permukaan gelap.
export function BrandLogo({ className = 'h-9 w-auto sm:h-10', priority = false }: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO.src}
      width={BRAND_LOGO.width}
      height={BRAND_LOGO.height}
      alt={BRAND_LOGO.alt}
      priority={priority}
      className={className}
    />
  );
}
