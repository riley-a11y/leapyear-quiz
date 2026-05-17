'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import FadeImage from './FadeImage';
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
      {stories.slice(0, visible).map((story, i) => (
        <Link
          key={story.slug}
          href={`/stories/${story.slug}`}
          className="group block relative overflow-hidden"
          style={{ height: `${BLOCK_HEIGHT}px` }}
        >
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]">
            <FadeImage
              src={story.coverImage}
              alt={story.title}
              sizes="100vw"
              priority={i === 0}
            />
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 pb-8 md:pb-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-cream pointer-events-none">
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
