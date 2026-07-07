import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/organisms/Toaster';
import { CommandPalette } from '@/components/organisms/CommandPalette';

/**
 * Router-level root. Global overlays (toasts, command palette) must live
 * inside the router tree to use hooks like `useNavigate`, so they're
 * mounted here rather than alongside `<RouterProvider>` in `App.tsx`.
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
      <CommandPalette />
    </>
  );
}
