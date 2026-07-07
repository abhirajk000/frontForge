import { Spinner } from '@/components/atoms/Spinner';

/** Full-viewport fallback shown while a lazy-loaded route chunk downloads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}
