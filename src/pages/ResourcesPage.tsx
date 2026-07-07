import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/molecules';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { useDayCatalog } from '@/hooks/useContent';
import { getDayBundle } from '@/repositories/content.repository';

export default function ResourcesPage() {
  const catalog = useDayCatalog();

  return (
    <>
      <PageHeader
        title="Resources"
        description="Curated docs, articles and tools from every available day in the curriculum."
      />

      <div className="space-y-8">
        {catalog.map((meta) => {
          const bundle = getDayBundle(meta.id);
          const { resources } = bundle;

          return (
            <section key={meta.id}>
              <h2 className="mb-1 text-lg font-semibold text-text">
                Day {meta.day}: {resources.title}
              </h2>
              <p className="mb-4 text-sm text-text-secondary">{resources.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {resources.resources.map((resource) => (
                  <Card key={resource.id} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-text">{resource.title}</h3>
                      {resource.recommended && <Badge variant="accent">Recommended</Badge>}
                    </div>
                    <p className="text-sm text-text-secondary">{resource.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Badge variant="neutral" className="capitalize">
                        {resource.type}
                      </Badge>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent-text hover:underline"
                      >
                        Open
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
