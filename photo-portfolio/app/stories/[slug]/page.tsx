import { notFound } from 'next/navigation';
import StoryView from '@/components/StoryView';
import { getStoryBySlug, getStoryImages, getNextStory, stories } from '@/data/stories';

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return {};
  return {
    title: `${story.title} · Riley Simpson`,
    description: `${story.location} · ${story.date}`,
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  const images = getStoryImages(slug);
  const next = getNextStory(slug);

  return (
    <StoryView
      story={story}
      images={images}
      next={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}
