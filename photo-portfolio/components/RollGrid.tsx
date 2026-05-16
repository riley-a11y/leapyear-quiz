'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox, { type LightboxImage } from './Lightbox';

export default function RollGrid({ images }: { images: LightboxImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <div className="pt-14">
      <div className="grid grid-cols-4 gap-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="relative aspect-square overflow-hidden cursor-zoom-in"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="25vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </div>
  );
}
