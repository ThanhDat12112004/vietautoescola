import { Car } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  withText?: boolean;
  textClassName?: string;
};

const BRAND_LOGO_SRC = '/brand/logo.png';

export default function BrandLogo({
  className,
  imageClassName,
  withText = false,
  textClassName,
}: BrandLogoProps) {
  const [logoError, setLogoError] = useState(false);

  const brandText = (
    <span
      className={cn('font-display text-xl font-extrabold tracking-tight text-foreground', textClassName)}
    >
      Việt <span className="text-primary">Autoescola</span>
    </span>
  );

  if (!logoError) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <img
          src={BRAND_LOGO_SRC}
          alt="Viet Autoescola"
          className={cn('h-10 w-auto object-contain', imageClassName)}
          onError={() => setLogoError(true)}
        />
        {withText && brandText}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
        <Car className="h-4 w-4 text-primary-foreground" />
      </div>
      {withText && brandText}
    </div>
  );
}
