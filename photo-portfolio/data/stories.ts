export type Block =
  | { type: 'hero'; src: string; alt: string }
  | { type: 'intro'; title: string; meta: string; body?: string }
  | { type: 'full'; src: string; alt: string }
  | { type: 'pair'; left: string; right: string; alts: [string, string] }
  | {
      type: 'triplet';
      images: [string, string, string];
      alts: [string, string, string];
      orientation?: 'portrait' | 'landscape';
    }
  | { type: 'quote'; text: string };

export type Story = {
  slug: string;
  title: string;
  location: string;
  date: string;
  sortDate: string;
  coverImage: string;
  blocks: Block[];
};

const u = (id: string, w = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const stories: Story[] = [
  {
    slug: 'high-desert',
    title: 'High Desert',
    location: 'Marfa, Texas',
    date: 'March 2025',
    sortDate: '2025-03-01',
    coverImage: u('photo-1500382017468-9049fed747ef'),
    blocks: [
      { type: 'hero', src: u('photo-1500382017468-9049fed747ef'), alt: 'Open desert highway at dusk' },
      {
        type: 'intro',
        title: 'High Desert',
        meta: 'Marfa, Texas · March 2025',
        body: 'A week off the grid. Long drives, longer silences, and a sky that refused to stay still.',
      },
      { type: 'full', src: u('photo-1469854523086-cc02fe5d8800'), alt: 'Distant mountains and grass' },
      {
        type: 'pair',
        left: u('photo-1418065460487-3e41a6c84dc5'),
        right: u('photo-1470770841072-f978cf4d019e'),
        alts: ['Cracked earth', 'Cottonwood tree at golden hour'],
      },
      { type: 'quote', text: 'Out here the light does the talking. We just stopped to listen.' },
      {
        type: 'triplet',
        images: [
          u('photo-1469474968028-56623f02e42e'),
          u('photo-1472214103451-9374bd1c798e'),
          u('photo-1476610182048-b716b8518aae'),
        ],
        alts: ['Wide canyon', 'Sun through grass', 'Red rock formation'],
        orientation: 'landscape',
      },
      { type: 'full', src: u('photo-1447752875215-b2761acb3c5d'), alt: 'Forest road' },
    ],
  },
  {
    slug: 'coastal-quiet',
    title: 'Coastal Quiet',
    location: 'Big Sur, California',
    date: 'October 2024',
    sortDate: '2024-10-01',
    coverImage: u('photo-1505142468610-359e7d316be0'),
    blocks: [
      { type: 'hero', src: u('photo-1505142468610-359e7d316be0'), alt: 'Cliffs meeting fog' },
      {
        type: 'intro',
        title: 'Coastal Quiet',
        meta: 'Big Sur, California · October 2024',
        body: 'Three days where the marine layer never burned off. I stopped chasing the sun and started photographing the absence of it.',
      },
      {
        type: 'pair',
        left: u('photo-1507525428034-b723cf961d3e'),
        right: u('photo-1439066615861-d1af74d74000'),
        alts: ['Empty beach', 'Pier into fog'],
      },
      { type: 'full', src: u('photo-1518837695005-2083093ee35b'), alt: 'Waves against rock' },
      { type: 'quote', text: 'The ocean was loud. Everything else, finally, was not.' },
      {
        type: 'triplet',
        images: [
          u('photo-1494783367193-149034c05e8f'),
          u('photo-1502082553048-f009c37129b9'),
          u('photo-1501785888041-af3ef285b470'),
        ],
        alts: ['Coastal road', 'Driftwood', 'Foggy cliff'],
        orientation: 'portrait',
      },
    ],
  },
  {
    slug: 'first-snow',
    title: 'First Snow',
    location: 'Methow Valley, Washington',
    date: 'January 2024',
    sortDate: '2024-01-15',
    coverImage: u('photo-1483728642387-6c3bdd6c93e5'),
    blocks: [
      { type: 'hero', src: u('photo-1483728642387-6c3bdd6c93e5'), alt: 'Snow on pines' },
      {
        type: 'intro',
        title: 'First Snow',
        meta: 'Methow Valley, Washington · January 2024',
        body: 'A cabin, a wood stove, and the kind of quiet you can only photograph by holding still inside it.',
      },
      { type: 'full', src: u('photo-1418985991508-e47386d96a71'), alt: 'Snowfall in forest' },
      {
        type: 'pair',
        left: u('photo-1457269449834-928af64c684d'),
        right: u('photo-1455218873509-8097305ee378'),
        alts: ['Frozen creek', 'Tracks in snow'],
      },
      { type: 'quote', text: 'I thought I came here to rest. I came here to remember how.' },
      { type: 'full', src: u('photo-1454496522488-7a8e488e8606'), alt: 'Cabin window at dusk' },
    ],
  },
];

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}

export function getNextStory(slug: string) {
  const sorted = [...stories].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  const idx = sorted.findIndex((s) => s.slug === slug);
  if (idx === -1) return null;
  return sorted[(idx + 1) % sorted.length];
}

export function getAllImages() {
  const imgs: { src: string; alt: string; storySlug: string }[] = [];
  for (const story of stories) {
    for (const block of story.blocks) {
      switch (block.type) {
        case 'hero':
        case 'full':
          imgs.push({ src: block.src, alt: block.alt, storySlug: story.slug });
          break;
        case 'pair':
          imgs.push({ src: block.left, alt: block.alts[0], storySlug: story.slug });
          imgs.push({ src: block.right, alt: block.alts[1], storySlug: story.slug });
          break;
        case 'triplet':
          block.images.forEach((src, i) =>
            imgs.push({ src, alt: block.alts[i], storySlug: story.slug }),
          );
          break;
      }
    }
  }
  return imgs;
}

export function getStoryImages(slug: string) {
  const story = getStoryBySlug(slug);
  if (!story) return [];
  const imgs: { src: string; alt: string }[] = [];
  for (const block of story.blocks) {
    switch (block.type) {
      case 'hero':
      case 'full':
        imgs.push({ src: block.src, alt: block.alt });
        break;
      case 'pair':
        imgs.push({ src: block.left, alt: block.alts[0] });
        imgs.push({ src: block.right, alt: block.alts[1] });
        break;
      case 'triplet':
        block.images.forEach((src, i) => imgs.push({ src, alt: block.alts[i] }));
        break;
    }
  }
  return imgs;
}
