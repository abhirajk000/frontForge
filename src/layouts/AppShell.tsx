import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/organisms/BottomNav';
import { PageLoader } from '@/components/organisms/PageLoader';
import { MissionBackground } from '@/components/organisms/MissionBackground';

/**
 * Full-screen app shell.
 * No sidebar, no top bar — the page content IS the UI.
 * Primary navigation lives in the floating BottomNav pill.
 */
export function AppShell() {
  return (
    <div className="relative min-h-screen bg-bg">
      <MissionBackground />
      <main className="min-h-screen pb-[100px]">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
