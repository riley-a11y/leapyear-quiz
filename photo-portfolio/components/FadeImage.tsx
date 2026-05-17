'use client';

import { useState } from 'react';
import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
  fit?: 'cover' | 'contain';
};

export default function FadeImage({
  src,
  alt,
  sizes,
  priority = false,
  className = '',
  onClick,
  fit = 'cover',
}: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${onClick ? 'cursor-zoom-in' : ''}`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
