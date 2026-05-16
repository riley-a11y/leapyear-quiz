import WorkList from '@/components/WorkList';
import { stories } from '@/data/stories';

export default function Home() {
  const sorted = [...stories].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  return <WorkList stories={sorted} />;
}
