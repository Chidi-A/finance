import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import AppSidebar from '@/components/Sidebar/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { isLoggedIn } from '@/hooks/useAuth';

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: '/login',
      });
    }
  },
});

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-6 pb-24 md:p-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
