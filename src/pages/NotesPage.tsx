import { StickyNote } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/molecules';

export default function NotesPage() {
  return (
    <>
      <PageHeader
        title="Notes"
        description="Everything you've written while learning, searchable in one place."
      />
      <EmptyState
        icon={StickyNote}
        title="Notes workspace arrives in Milestone 7"
        description="Autosaving markdown notes per lesson, with search, pinning and export."
      />
    </>
  );
}
