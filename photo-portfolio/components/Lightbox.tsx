'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';

export type LightboxImage = { src: string; alt: string };

type Props = {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export default function Lightbox({ images, index, onClose, onIndexChange }: Props) {
  const isOpen = index !== null;

  const next = useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, next, prev, onClose]);

  if (!isOpen || index === null) return null;
  const img = images[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: '#0A0A0A' }}
      onClick={onClose}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-6 text-[26px] leading-none"
        style={{ color: '#F4EDE0' }}
      >
        ×
      </button>

      <button
        aria-label="Previous"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-3xl opacity-60 hover:opacity-100 transition-opacity px-2"
        style={{ color: '#F4EDE0' }}
      >
        ‹
      </button>

      <button
        aria-label="Next"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-3xl opacity-60 hover:opacity-100 transition-opacity px-2"
        style={{ color: '#F4EDE0' }}
      >
        ›
      </button>

      <div
        className="relative"
        style={{ width: '80vw', height: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          sizes="80vw"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  );
}
