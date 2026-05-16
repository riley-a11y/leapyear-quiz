import RollGrid from '@/components/RollGrid';
import { getAllImages } from '@/data/stories';

export const metadata = {
  title: 'Roll · Riley Simpson',
};

export default function RollPage() {
  const images = getAllImages().map(({ src, alt }) => ({ src, alt }));
  return <RollGrid images={images} />;
}
