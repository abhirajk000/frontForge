import { FolderGit2 } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/molecules';

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Portfolio-worthy builds that prove what you can ship."
      />
      <EmptyState
        icon={FolderGit2}
        title="Projects catalogue arrives in Milestone 8"
        description="Project briefs, difficulty, and completion tracking, sourced from content JSON."
      />
    </>
  );
}
