import { Bookmark } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/molecules';

export default function BookmarksPage() {
  return (
    <>
      <PageHeader
        title="Bookmarks"
        description="Lessons and resources you saved for later."
      />
      <EmptyState
        icon={Bookmark}
        title="Bookmarks arrive in Milestone 8"
        description="Bookmark any lesson, quiz, resource or challenge and find it here instantly."
      />
    </>
  );
}
