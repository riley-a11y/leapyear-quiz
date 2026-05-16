'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/data/stories';

const BATCH = 5;
const BLOCK_HEIGHT = 480;

export default function WorkList({ stories }: { stories: Story[] }) {
  const [visible, setVisible] = useState(Math.min(BATCH, stories.length));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible >= stories.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => Math.min(v + BATCH, stories.length));
        }
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, stories.length]);

  return (
    <div className="pt-14">
      {stories.slice(0, visible).map((story) => (
        <Link
          key={story.slug}
          href={`/stories/${story.slug}`}
          className="group block relative overflow-hidden"
          style={{ height: `${BLOCK_HEIGHT}px` }}
        >
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
            priority={false}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 pb-8 md:pb-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-cream">
            <h2 className="font-serif text-4xl md:text-5xl tracking-wide">{story.title}</h2>
            <p className="meta-caps mt-2 opacity-80">
              {story.location} · {story.date}
            </p>
          </div>
        </Link>
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
