import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoader } from '@/components/organisms/PageLoader';

/**
 * Chrome-free layout for standalone screens (404, Developer Tools) that
 * shouldn't show the primary Sidebar/Navbar.
 */
export function MinimalLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
