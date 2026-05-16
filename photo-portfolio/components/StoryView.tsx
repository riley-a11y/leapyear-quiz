'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Block, Story } from '@/data/stories';
import Lightbox, { type LightboxImage } from './Lightbox';

type Props = {
  story: Story;
  images: LightboxImage[];
  next: { slug: string; title: string } | null;
};

function indexOfImage(blocks: Block[], blockIdx: number, sub = 0): number {
  let count = 0;
  for (let i = 0; i < blockIdx; i++) {
    const b = blocks[i];
    if (b.type === 'hero' || b.type === 'full') count += 1;
    else if (b.type === 'pair') count += 2;
    else if (b.type === 'triplet') count += 3;
  }
  return count + sub;
}

export default function StoryView({ story, images, next }: Props) {
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const open = (i: number) => setLbIndex(i);

  return (
    <div>
      {story.blocks.map((block, i) => (
        <BlockView
          key={i}
          block={block}
          onOpen={(sub = 0) => open(indexOfImage(story.blocks, i, sub))}
        />
      ))}

      {next && (
        <div className="flex items-center justify-center py-32 md:py-40">
          <Link
            href={`/stories/${next.slug}`}
            className="font-serif text-4xl md:text-5xl tracking-wide text-ink/40 hover:text-ink transition-colors duration-500"
          >
            Next · {next.title}
          </Link>
        </div>
      )}

      <Lightbox
        images={images}
        index={lbIndex}
        onClose={() => setLbIndex(null)}
        onIndexChange={setLbIndex}
      />
    </div>
  );
}

function FadeImage({
  src,
  alt,
  sizes,
  onClick,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}) {
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
        className={`object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  );
}

function BlockView({ block, onOpen }: { block: Block; onOpen: (sub?: number) => void }) {
  switch (block.type) {
    case 'hero':
      return (
        <div className="relative w-full h-[80vh] md:h-[92vh]">
          <FadeImage
            src={block.src}
            alt={block.alt}
            sizes="100vw"
            priority
            onClick={() => onOpen()}
          />
        </div>
      );
    case 'intro':
      return (
        <section className="max-w-[640px] mx-auto px-6 py-20 md:py-28 text-center">
          <p className="meta-caps text-ink-muted">{block.meta}</p>
          <h1 className="font-serif text-5xl md:text-6xl mt-5 tracking-wide">{block.title}</h1>
          {block.body && (
            <p className="mt-7 text-[15px] leading-[1.75] text-ink/80">{block.body}</p>
          )}
        </section>
      );
    case 'full':
      return (
        <div className="relative w-full h-[70vh] md:h-[85vh] my-2 md:my-3">
          <FadeImage
            src={block.src}
            alt={block.alt}
            sizes="100vw"
            onClick={() => onOpen()}
          />
        </div>
      );
    case 'pair':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 my-2 md:my-3 px-2 md:px-3">
          <div className="relative aspect-[4/5]">
            <FadeImage
              src={block.left}
              alt={block.alts[0]}
              sizes="(min-width: 768px) 50vw, 100vw"
              onClick={() => onOpen(0)}
            />
          </div>
          <div className="relative aspect-[4/5]">
            <FadeImage
              src={block.right}
              alt={block.alts[1]}
              sizes="(min-width: 768px) 50vw, 100vw"
              onClick={() => onOpen(1)}
            />
          </div>
        </div>
      );
    case 'triplet': {
      const aspect = block.orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]';
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 my-2 md:my-3 px-2 md:px-3">
          {block.images.map((src, i) => (
            <div key={i} className={`relative ${aspect}`}>
              <FadeImage
                src={src}
                alt={block.alts[i]}
                sizes="(min-width: 768px) 33vw, 100vw"
                onClick={() => onOpen(i)}
              />
            </div>
          ))}
        </div>
      );
    }
    case 'quote':
      return (
        <blockquote className="max-w-[520px] mx-auto px-6 py-20 md:py-28 text-center font-serif italic text-2xl md:text-3xl leading-[1.4] text-ink/85">
          {block.text}
        </blockquote>
      );
  }
}
