import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-bg-subtle text-text-tertiary">
        <Compass className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-text">Page not found</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link
        to={ROUTES.dashboard}
        className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
